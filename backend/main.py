import asyncio
from tools import read_orders_from_csv, delete_order
from my_agents import summary_agent, Runner
from dotenv import load_dotenv
from logger import (
    log_user_input, log_agent_response, log_error, 
)

load_dotenv()

async def main():
    try:
        while True:
            user_input = input("What would you like me to do? ").strip()
            log_user_input(user_input)
            
            if user_input.lower() in ['exit', 'quit', 'bye']:
                print("Goodbye! Thanks for using Fleet Dispatch Assistant.")
                break
            
            if not user_input:
                print("Please enter a request.")
                continue
            
            try:
                # Let the agent decide which tools to use based on user input
                result = await Runner.run(summary_agent, user_input)
                
                print("\nResponse:")
                print("-" * 20)
                print(result.final_output)
                
                # Log the agent response
                log_agent_response(result.final_output)
                
            except Exception as e:
                error_msg = f"An error occurred: {str(e)}"
                print(error_msg)
                log_error(e, "Agent execution")
                
    except KeyboardInterrupt:
        print("\nSession interrupted by user")
    except Exception as e:
        log_error(e, "Main application")
        print(f"Fatal error: {str(e)}")

if __name__ == "__main__":
    asyncio.run(main())