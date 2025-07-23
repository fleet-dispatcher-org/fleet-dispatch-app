import crypto from 'crypto';
import generateSecret from './generateSecret';

interface WebhookPayload {
    event: string;
    data: any;
    timestamp?: string;
}

interface WebhookResponse {
    success: boolean;
    response?: any;
    error?: string;
}

class WebhookSender {
    private baseUrl: string;
    private secretKey: string;

    constructor(baseUrl?: string, secretKey?: string) {
        this.baseUrl = baseUrl || process.env.FASTAPI_BASE_URL || 'http://localhost:8000/api/ai/receive-webhook';
        this.secretKey = secretKey || process.env.WEBHOOK_SECRET_KEY || '';
    }

    /**
     * Generate a secret if one doesn't exist
     */
    generateSecret(length: number = 32): string {
        return generateSecret(length);
    }

    /**
     * Create HMAC signature for webhook payload
     */
    getSignature(payload: WebhookPayload | string): string {
        const payloadString = typeof payload === 'string' ? payload : JSON.stringify(payload);
        return crypto
            .createHmac('sha256', this.secretKey)
            .update(payloadString)
            .digest('hex');
    }

    /**
     * Send webhook to FastAPI server Might not be needed or YES? lol 
     */
    async sendWebhook(
        event: string, 
        data: any, 
        retryCount: number = 3, 
        timeout: number = 10000
    ): Promise<WebhookResponse> {
        const payload: WebhookPayload = {
            event,
            data,
            timestamp: new Date().toISOString()
        };

        const signature = this.getSignature(payload);
        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
            'X-Webhook-Signature': signature,
            'User-Agent': 'Fleet Dispatch Assistant'
        };

        for (let attempt = 0; attempt < retryCount; attempt++) {
            try {
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), timeout);

                const response = await fetch(this.baseUrl, {
                    method: 'POST',
                    headers,
                    body: JSON.stringify(payload),
                    signal: controller.signal
                });

                clearTimeout(timeoutId);

                if (response.ok) {
                    console.log(`Webhook sent successfully. Status: ${response.status}`);
                    return { success: true, response: await response.json() };
                } else {
                    console.error(`Failed to send webhook. Status: ${response.status}`);
                    return { success: false, error: `HTTP ${response.status}` };
                }
            } catch (error: any) {
                if (attempt < retryCount - 1) {
                    console.warn(`Failed to send webhook. Retrying in 5 seconds. Error: ${error.message}`);
                    await new Promise(resolve => setTimeout(resolve, 5000));
                } else {
                    console.error(`Failed to send webhook after ${retryCount} attempts. Error: ${error.message}`);
                    return { success: false, error: error.message };
                }
            }
        }

        return { success: false, error: 'Max retries exceeded' };
    }

    /**
     * Query webhook (expects response)
     */
    async queryWebhook(
        data: any, 
        retryCount: number = 3, 
        timeout: number = 10000
    ): Promise<any> {
        const url = process.env.FASTAPI_API_URL || 'http://localhost:8000/api/ai/receive-webhook';
        
        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
            'User-Agent': 'Fleet Dispatch Assistant',
            'x-webhook-secret': this.secretKey
        };
        
        const payload: WebhookPayload = {
            event: 'query',
            data
        };

        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), timeout);

            const response = await fetch(url, {
                method: 'POST',
                headers,
                body: JSON.stringify(payload),
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            if (response.ok) {
                return await response.json();
            } else {
                throw new Error(`Failed to query webhook. Status: ${response.status}; Response: ${await response.text()}`);
            }
        } catch (error: any) {
            throw new Error(`Failed to query webhook. Error: ${error.message}`);
        }
    }
}

export { WebhookSender };