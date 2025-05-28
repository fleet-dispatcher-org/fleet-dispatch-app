import logging
import os
from datetime import datetime
from functools import wraps

# Create logs directory if it doesn't exist
if not os.path.exists('logs'):
    os.makedirs('logs')

# Configure logging
def setup_logger():
    """Set up logging configuration with both file and console output."""
    
    # Create a unique log file name with timestamp
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    log_filename = f"logs/dispatch_session_{timestamp}.log"
    
    # Create formatter
    formatter = logging.Formatter(
        '%(asctime)s | %(levelname)s | %(funcName)s | %(message)s',
        datefmt='%Y-%m-%d %H:%M:%S'
    )
    
    # Create file handler
    file_handler = logging.FileHandler(log_filename, encoding='utf-8')
    file_handler.setLevel(logging.DEBUG)
    file_handler.setFormatter(formatter)
    
    # Create console handler (optional - shows logs in console too)
    console_handler = logging.StreamHandler()
    console_handler.setLevel(logging.INFO)
    console_handler.setFormatter(logging.Formatter('%(levelname)s: %(message)s'))
    
    # Get logger
    logger = logging.getLogger('dispatch_logger')
    logger.setLevel(logging.DEBUG)
    
    # Clear any existing handlers
    logger.handlers.clear()
    
    # Add handlers
    logger.addHandler(file_handler)
    logger.addHandler(console_handler)
    
    logger.info(f"Logging session started - Log file: {log_filename}")
    return logger

# Initialize logger
logger = setup_logger()

def log_user_input(user_input: str):
    """Log user input."""
    logger.info(f"USER INPUT: {user_input}")

def log_agent_response(response: str):
    """Log agent response."""
    logger.info(f"AGENT RESPONSE: {response}")

def log_tool_call(tool_name: str, args: dict = None):
    """Log tool calls."""
    args_str = f" with args: {args}" if args else ""
    logger.info(f"TOOL CALL: {tool_name}{args_str}")

def log_tool_result(tool_name: str, result: any):
    """Log tool results."""
    logger.info(f"TOOL RESULT [{tool_name}]: {result}")

def log_error(error: Exception, context: str = ""):
    """Log errors with context."""
    context_str = f" [{context}]" if context else ""
    logger.error(f"ERROR{context_str}: {str(error)}", exc_info=True)

def log_function_call(func):
    """Decorator to log function calls."""
    @wraps(func)
    def wrapper(*args, **kwargs):
        logger.debug(f"FUNCTION CALL: {func.__name__} with args: {args}, kwargs: {kwargs}")
        try:
            result = func(*args, **kwargs)
            logger.debug(f"FUNCTION RESULT [{func.__name__}]: {result}")
            return result
        except Exception as e:
            logger.error(f"FUNCTION ERROR [{func.__name__}]: {str(e)}", exc_info=True)
            raise
    return wrapper 