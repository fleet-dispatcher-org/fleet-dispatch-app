import csv
import os
from agents import function_tool
from logger import log_tool_call, log_tool_result, log_error
import webhook_sender
from typing import Optional, Dict, Any

orders = []
CSV_FILE_PATH = "backend/orders.csv"  # Centralized file path

def save_orders_to_csv(file_path: str = CSV_FILE_PATH):
    """Save the current orders list to CSV file."""
    global orders
    try:
        if not orders:
            log_tool_result("save_orders_to_csv", "No orders to save")
            return
            
        # Get the fieldnames from the first order
        fieldnames = list(orders[0].keys()) if orders else []
        
        with open(file_path, 'w', newline='', encoding='utf-8') as csvfile:
            writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
            writer.writeheader()
            writer.writerows(orders)
            
        log_tool_result("save_orders_to_csv", f"Saved {len(orders)} orders to {file_path}")
        
    except Exception as e:
        log_error(e, "save_orders_to_csv")
        raise

# Read CSV and parse orders
@function_tool
def read_orders_from_csv(file_path: str = CSV_FILE_PATH):
    """Reads orders from a CSV file and stores them in the global orders list."""
    global orders
    log_tool_call("read_orders_from_csv", {"file_path": file_path})
    
    orders = []  # Reset orders to avoid duplicates
    
    try:
        with open(file_path, newline='', encoding='utf-8') as csvfile:
            reader = csv.DictReader(csvfile)
            for row in reader:
                orders.append(row)
        
        result = f"Successfully loaded {len(orders)} orders from {file_path}"
        log_tool_result("read_orders_from_csv", result)
        return orders
        
    except FileNotFoundError:
        error_msg = f"Error: Could not find orders file at {file_path}"
        log_tool_result("read_orders_from_csv", error_msg)
        return error_msg
    except Exception as e:
        error_msg = f"Error reading orders: {str(e)}"
        log_error(e, "read_orders_from_csv")
        return error_msg

@function_tool
def delete_order(order_id: str) -> str:
    """Deletes an order by its number order from both memory and the CSV file."""
    global orders
    log_tool_call("delete_order", {"order_id": order_id})
    
    # If orders list is empty, try to load from CSV first
    if not orders:
        read_orders_from_csv()
    
    initial_len = len(orders)
    orders = [order for order in orders if order.get("Order #") != order_id]
    
    if len(orders) < initial_len:
        # Save the updated orders back to CSV file
        try:
            save_orders_to_csv()
            result = f"Order {order_id} deleted successfully and saved to file."
        except Exception as e:
            result = f"Order {order_id} deleted from memory but failed to save to file: {str(e)}"
    else:
        result = f"Order {order_id} not found."
    
    log_tool_result("delete_order", result)
    return result
@function_tool
def send_webhook(event: str, data: Dict[str, Any]):
    return webhook_sender.send_webhook(event, data)
    

@function_tool
def query_webhook(data: Dict[str, Any]):
    return webhook_sender.query_webhook(data)
