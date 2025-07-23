import secrets
import string
import logging

# Get Logger
logger = logging.getLogger('dispatch_logger')
def generate_secret(length=32):
    webhook_secret = secrets.token_urlsafe(length)
    return webhook_secret
