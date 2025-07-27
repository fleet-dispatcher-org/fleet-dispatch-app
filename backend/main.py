import asyncio
import json
from my_agents import summary_agent, Runner
from dotenv import load_dotenv
from logger import (
    log_user_input, log_agent_response
)

load_dotenv()

def load_test_data():
    """Load the example driver data from JSON file."""
    with open('backend/example.json', 'r') as f:
        data = json.load(f)
    return data

async def analyze_drivers_for_destination(destination: str):
    """Analyze drivers and recommend the best 5 for a specific destination."""
    
    # Load test data
    test_data = load_test_data()
    if not test_data:
        print(" Failed to load test data")
        return None
    
    # Create the request for the agent - be explicit about using context data
    user_request = f"Using the driver data provided in the context, analyze and recommend the top 5 best drivers for a pickup/delivery to {destination}. The driver data is already available to you - do not ask for it. Consider location efficiency, availability, certifications, and DOT compliance."
    
    # Log the request
    log_user_input(user_request)
    
    # Run the agent 
    response = await Runner.run(summary_agent, user_request, context=test_data)
    
    # Log and print the agent's response
    log_agent_response(response)
    
    # Return the response for use by other modules
    return response

async def main():
    """Main application entry point."""
    
    # Example destination - 
    destination = "Dallas, TX"
    
    await analyze_drivers_for_destination(destination)

if __name__ == "__main__":
    asyncio.run(main())