from datetime import datetime
import json
from typing import Optional, Dict, Any
from pydantic import BaseModel
import os
import hmac
import httpx 
import asyncio
import logging
import generate_secret 
import requests

# Get logger
logger = logging.getLogger('dispatch_logger')

class WebhookSender:
    def __init__(self, base_url: str, secret_key: str):
        self.base_url = base_url
        self.secret_key = secret_key or os.getenv('WEBHOOK_SECRET_KEY')
    
    # Only do this if there's no current secret key. Otherwise ignore. 
    def _generate_secret(self, length=32):
        return generate_secret.generate_secret(length)
    
    def _get_signature(self, payload: Dict[str, Any]):
        return hmac.new(self.secret_key.encode(), payload.encode(), digestmod='sha256').hexdigest()
    
    async def send_webhook(self, 
                           event: str, 
                           data: Dict[str, Any], 
                           retry_count: Optional[int] = 3, 
                           timeout: Optional[float] = 10.0) -> bool:
        payload = {"event": event, "data": data, "timestamp": datetime.now().isoformat()}

        signature = self._get_signature(json.dumps(payload))
        headers = {
            "Content-Type": "application/json",
            "X-Webhook-Signature": signature, 
            "User-Agent": "Fleet Dispatch Assistant"
        }

        for attempt in range(retry_count):
            try: 
                async with httpx.AsyncClient() as client:
                    response = await client.post(self.base_url, json=payload, headers=headers, timeout=timeout)
                    response.raise_for_status()
                    if(response.status_code == 200):
                        logger.info(f"Webhook sent successfully. Status code: {response.status_code}")
                        return True
                    else:
                        logger.error(f"Failed to send webhook. Status code: {response.status_code}")
                        return False
            
            except httpx.HTTPError as e:
                
                if attempt < retry_count - 1:
                    logger.warning(f"Failed to send webhook. Retrying in 5 seconds. Error: {e}")
                    await asyncio.sleep(5)
                else:
                    logger.error(f"Failed to send webhook after {retry_count} attempts. Error: {e}")
                    return False

        return False

    async def query_webhook(self, data: Dict[Any, Any], retry_count: Optional[int] = 3, timeout: Optional[float] = 10.0) -> Dict[Any, Any]:
        url = os.getenv("NEXT_JS_API_URL", "http://localhost:3000/api/")
        
        headers = {
            "Content-Type": "application/json",
            "User-Agent": "Fleet Dispatch Assistant",
            "x-webhook-secret": os.getenv("WEBHOOK_SECRET_KEY")
        }
        
        payload = {
            "event": self.event,
            "data": data
        }

        response = requests.post(url, json=payload, headers=headers)
        if response.status_code == 200:
            return response.json()
        else:
            raise Exception(f"Failed to query webhook. Status code: {response.status_code}; Response: {response.text}")
