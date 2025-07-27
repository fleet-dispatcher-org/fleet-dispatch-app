from fastapi import FastAPI, HTTPException, status, Query, BackgroundTasks, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Dict, Any, Optional
import httpx 
import hmac
import hashlib
import json
from pydantic import BaseModel
import logging
from datetime import datetime
import os
import driver
import truck
import trailer
import load

# Import storage functions
import storage
import uvicorn
import asyncio
from main import analyze_drivers_for_destination

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger('dispatch_server')

# FastAPI app initialization
app = FastAPI(
    title="Fleet Dispatch API",
)

# Add CORS middleware to allow frontend requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allow_headers=["*"],
)

# Webhook endpoint # This does not have the signature verification yet and I dont know if it will be needed
# This grabs the destination from the webhook payload and then calls the agent to analyze the drivers for that destination
# The agent will return a list of the top 5 drivers for the destination
# The response is then returned to the frontend
# This is using main.py. This has to change eventually and make it more understanable for the agent.
# TODO: Change this to actually grab data from frontend instead of using main.py
@app.post("/api/ai/receive-webhook")
async def receive_webhook(request: Request):
    """This is the webhook endpoint that will be used to receive webhooks from the Next.js frontend."""
    try:
        payload = await request.json()
        logger.info(f"Webhook received: {payload.get('event', 'unknown')} at {datetime.now().isoformat()}")
        
        # Extract information from webhook payload
        event_type = payload.get('event', 'driver_recommendation')
        destination = payload.get('destination', 'Dallas, TX')  # Default destination added in case there is no destination
        
        logger.info(f"Processing request for destination: {destination}")
        
        # Use the function from main.py to analyze drivers
        agent_response = await analyze_drivers_for_destination(destination)
        
        if not agent_response:
            logger.error("Failed to get agent response")
            raise HTTPException(status_code=500, detail="Failed to process driver analysis")
        
        logger.info("Agent processing completed successfully")
        
        # Return the agent's response
        return {
            "status": "success", 
            "message": "Communication processed successfully",
            "agent_response": agent_response,
            "processed_at": datetime.now().isoformat(),
            "event": event_type,
            "destination": destination
        }
        
    except Exception as e:
        logger.error(f"Error processing webhook: {e}")
        raise HTTPException(status_code=400, detail=f"Error processing webhook: {str(e)}")
    
# Health check endpoint
@app.get("/health", tags=["Health"])
async def health_check():
    """Health check endpoint"""
    storage_health = storage.check_storage_health()
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "storage": storage_health
    }

# Root endpoint
@app.get("/", tags=["Root"])
async def root():
    """Root endpoint with API information"""
    return {
        "message": "Fleet Dispatch API",
        "version": "1.0.0",
        "docs": "/docs",
        "health": "/health",
        "timestamp": datetime.now().isoformat()
    }


if __name__ == "__main__":
    port = int(os.getenv("PORT", 8000))
    logger.info("API Documentation available at: http://127.0.0.1:8000/docs")
    
    uvicorn.run(
        "server:app", 
        port=port, 
        reload=True,
        log_level="info"
    ) 