from fastapi import FastAPI, HTTPException, status, Query
from typing import List, Dict, Any, Optional
import httpx 
import hmac
import hashlib
import json
from pydantic import BaseModel
import logging
from datetime import datetime
import os
import webhook_sender

# Import storage functions
import storage
import uvicorn

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger('dispatch_server')

# FastAPI app initialization
app = FastAPI(
    title="Fleet Dispatch API",
)

# Webhook sender initialization
webhook_sender = webhook_sender.WebhookSender(
    base_url=os.getenv('NEXTJS_BASE_URL') or 'http://localhost:3000/api', 
    secret_key=os.getenv('WEBHOOK_SECRET_KEY')
)

async def send_webhook_background(event: str, data: Dict[str, Any]):
    await webhook_sender.send_webhook(event, data)

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

# Driver endpoints
@app.get("/api/drivers", tags=["Drivers"], response_model=List[Dict[str, Any]])
async def get_drivers():
    try:
        drivers = storage.get_all_drivers()
        logger.info(f"Retrieved {len(drivers)} drivers")
        return drivers
    except Exception as e:
        logger.error(f"Error retrieving drivers: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@app.get("/api/drivers/{driver_id}", tags=["Drivers"])
async def get_driver(driver_id: str):
    driver = storage.get_driver_by_id(driver_id)
    if not driver:
        raise HTTPException(status_code=404, detail="Driver not found")
    return driver

@app.get("/api/drivers/available", tags=["Drivers"])
async def get_available_drivers():
    return storage.get_available_drivers()

@app.get("/api/drivers/location/{location}", tags=["Drivers"])
async def get_drivers_by_location(location: str):
    return storage.get_drivers_by_location(location)

@app.post("/api/drivers", tags=["Drivers"])
async def create_driver(driver_data: Dict[str, Any]):
    required_fields = ['driver_id', 'first_name', 'last_name', 'license_number']
    
    # Validate required fields
    for field in required_fields:
        if field not in driver_data:
            raise HTTPException(status_code=400, detail=f"Missing required field: {field}")
    
    success = storage.create_driver(driver_data)
    if not success:
        raise HTTPException(status_code=400, detail="Driver already exists or invalid data")
    
    return {"message": f"Driver {driver_data['driver_id']} created successfully"}

@app.put("/api/drivers/{driver_id}/availability", tags=["Drivers"])
async def update_driver_availability(driver_id: str, available: bool):
    success = storage.update_driver_availability(driver_id, available)
    if not success:
        raise HTTPException(status_code=404, detail="Driver not found")
    
    return {"message": f"Driver {driver_id} availability updated to {available}"}

@app.post("/api/drivers/{driver_id}/assign/{truck_id}", tags=["Drivers"])
async def assign_driver_to_truck(driver_id: str, truck_id: str):
    success = storage.assign_driver_to_truck(driver_id, truck_id)
    if not success:
        raise HTTPException(status_code=400, detail="Assignment failed - check driver/truck availability and eligibility")
    
    return {"message": f"Driver {driver_id} assigned to truck {truck_id}"}

# Truck endpoints
@app.get("/api/trucks", tags=["Trucks"])
async def get_trucks():
    try:
        trucks = storage.get_all_trucks()
        logger.info(f"Retrieved {len(trucks)} trucks")
        return trucks
    except Exception as e:
        logger.error(f"Error retrieving trucks: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@app.get("/api/trucks/{truck_id}", tags=["Trucks"])
async def get_truck(truck_id: str):
    truck = storage.get_truck_by_id(truck_id)
    if not truck:
        raise HTTPException(status_code=404, detail="Truck not found")
    return truck

@app.get("/api/trucks/available", tags=["Trucks"])
async def get_available_trucks():
    return storage.get_available_trucks()

@app.get("/api/trucks/location/{location}", tags=["Trucks"])
async def get_trucks_by_location(location: str):
    return storage.get_trucks_by_location(location)

@app.post("/api/trucks", tags=["Trucks"])
async def create_truck(truck_data: Dict[str, Any]):
    required_fields = ['truck_id', 'make', 'model', 'year']
    
    # Validate required fields
    for field in required_fields:
        if field not in truck_data:
            raise HTTPException(status_code=400, detail=f"Missing required field: {field}")
    
    success = storage.create_truck(truck_data)
    if not success:
        raise HTTPException(status_code=400, detail="Truck already exists or invalid data")
    
    return {"message": f"Truck {truck_data['truck_id']} created successfully"}

#This might have to be changed
@app.put("/api/trucks/{truck_id}/location", tags=["Trucks"])
async def update_truck_location(
    truck_id: str, 
    location: str = Query(..., description="New location for the truck")
):
    success = storage.update_truck_location(truck_id, location)
    if not success:
        raise HTTPException(status_code=404, detail="Truck not found")
    
    return {"message": f"Truck {truck_id} location updated to {location}"}

@app.put("/api/trucks/{truck_id}/drivable", tags=["Trucks"])
async def update_truck_drivable_status(truck_id: str, drivable: bool):
    success = storage.update_truck_drivable_status(truck_id, drivable)
    if not success:
        raise HTTPException(status_code=404, detail="Truck not found")
    
    return {"message": f"Truck {truck_id} drivable status updated to {drivable}"}

# Trailer endpoints
@app.get("/api/trailers", tags=["Trailers"])
async def get_trailers():
    try:
        trailers = storage.get_all_trailers()
        logger.info(f"Retrieved {len(trailers)} trailers")
        return trailers
    except Exception as e:
        logger.error(f"Error retrieving trailers: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@app.get("/api/trailers/{trailer_id}", tags=["Trailers"])
async def get_trailer(trailer_id: str):
    trailer = storage.get_trailer_by_id(trailer_id)
    if not trailer:
        raise HTTPException(status_code=404, detail="Trailer not found")
    return trailer

@app.get("/api/trailers/available", tags=["Trailers"])
async def get_available_trailers():
    return storage.get_available_trailers()

@app.get("/api/trailers/location/{location}", tags=["Trailers"])
async def get_trailers_by_location(location: str):
    """Get trailers by location"""
    return storage.get_trailers_by_location(location)

@app.post("/api/trailers", tags=["Trailers"])
async def create_trailer(trailer_data: Dict[str, Any]):
    required_fields = ['trailer_id', 'make', 'model', 'year']
    
    # Validate required fields
    for field in required_fields:
        if field not in trailer_data:
            raise HTTPException(status_code=400, detail=f"Missing required field: {field}")
    
    success = storage.create_trailer(trailer_data)
    if not success:
        raise HTTPException(status_code=400, detail="Trailer already exists or invalid data")
    
    return {"message": f"Trailer {trailer_data['trailer_id']} created successfully"}

@app.post("/api/trailers/{trailer_id}/attach/{truck_id}", tags=["Trailers"])
async def attach_trailer_to_truck(trailer_id: str, truck_id: str):
    success = storage.attach_trailer_to_truck(trailer_id, truck_id)
    if not success:
        raise HTTPException(status_code=400, detail="Attachment failed - check trailer/truck availability and condition")
    
    return {"message": f"Trailer {trailer_id} attached to truck {truck_id}"}

@app.put("/api/trailers/{trailer_id}/location", tags=["Trailers"])
async def update_trailer_location(
    trailer_id: str, 
    location: str = Query(..., description="New location for the trailer")
):
    success = storage.update_trailer_location(trailer_id, location)
    if not success:
        raise HTTPException(status_code=404, detail="Trailer not found")
    
    return {"message": f"Trailer {trailer_id} location updated to {location}"}

# Order endpoints
@app.get("/api/orders", tags=["Orders"])
async def get_orders():
    try:
        orders = storage.get_all_orders()
        logger.info(f"Retrieved {len(orders)} orders")
        return orders
    except Exception as e:
        logger.error(f"Error retrieving orders: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@app.get("/api/orders/{order_id}", tags=["Orders"])
async def get_order(order_id: str):
    order = storage.get_order_by_id(order_id)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return order

@app.get("/api/orders/status/{status}", tags=["Orders"])
async def get_orders_by_status(status: str):
    return storage.get_orders_by_status(status)

@app.get("/api/orders/driver/{driver_id}", tags=["Orders"])
async def get_orders_by_driver(driver_id: str):
    return storage.get_orders_by_driver(driver_id)

@app.post("/api/orders", tags=["Orders"])
async def create_order(order_data: Dict[str, Any]):
    success = storage.create_order(order_data)
    if not success:
        raise HTTPException(status_code=400, detail="Failed to create order")
    
    return {"message": f"Order {order_data.get('Order #', 'Unknown')} created successfully"}

@app.put("/api/orders/{order_id}/status", tags=["Orders"])
async def update_order_status(
    order_id: str, 
    status: str = Query(..., description="New status for the order")
):
    success = storage.update_order_status(order_id, status)
    if not success:
        raise HTTPException(status_code=404, detail="Order not found")
    
    return {"message": f"Order {order_id} status updated to {status}"}

@app.post("/api/orders/{order_id}/assign/{driver_id}", tags=["Orders"])
async def assign_order_to_driver(order_id: str, driver_id: str):
    success = storage.assign_order_to_driver(order_id, driver_id)
    if not success:
        raise HTTPException(status_code=404, detail="Order not found")
    
    return {"message": f"Order {order_id} assigned to driver {driver_id}"}


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
    # Get port from environment or use default
    port = int(os.getenv("PORT", 3000))
    logger.info("API Documentation available at: http://127.0.0.1:8000/docs")
    
    uvicorn.run(
        "server:app", 
        port=port, 
        reload=True,
        log_level="info"
    ) 