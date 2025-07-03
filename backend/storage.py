from typing import List, Dict, Any, Optional
import csv
import json
import logging
from datetime import datetime, date
from driver import Driver
from truck import Truck
from trailer import Trailer

# Get logger
logger = logging.getLogger('dispatch_logger')

# In-memory storage Some Stubs for now
_drivers: Dict[str, Driver] = {}
_trucks: Dict[str, Truck] = {}
_trailers: Dict[str, Trailer] = {}
_orders: List[Dict[str, Any]] = []

# Load initial data (stub implementation)
# TODO: Replace with actual database in the future 
def initialize_storage():
    """Initialize storage with sample data"""
    try:
        create_sample_data()
        logger.info("Storage initialized successfully")
    except Exception as e:
        logger.error(f"Error initializing storage: {e}")

# Sample Data for now
def create_sample_data():
    # Sample drivers
    sample_drivers = [
        ("D001", "John", "Smith", "DL123456789"),
        ("D002", "Jane", "Johnson", "DL987654321"),
        ("D003", "Mike", "Brown", "DL456789123")
    ]
    
    for driver_id, first_name, last_name, license_number in sample_drivers:
        driver = Driver(driver_id, first_name, last_name, license_number)
        driver.medical_cert_current = True
        driver.drug_test_current = True
        driver.background_check_valid = True
        driver.phone_number = f"555-{driver_id[-3:]}"
        driver.email = f"{first_name.lower()}.{last_name.lower()}@fleet.com"
        _drivers[driver_id] = driver
    
    # Sample trucks
    sample_trucks = [
        ("T001", "Volvo", "VNL 860", 2022),
        ("T002", "Freightliner", "Cascadia", 2021),
        ("T003", "Kenworth", "T680", 2023)
    ]
    
    for truck_id, make, model, year in sample_trucks:
        truck = Truck(truck_id, make, model, year)
        truck.has_registration = True
        truck.max_capacity = 80000.0
        truck.location = "Depot"
        _trucks[truck_id] = truck
    
    # Sample trailers
    sample_trailers = [
        ("TR001", "Great Dane", "Dry Van", 2021),
        ("TR002", "Wabash", "Reefer", 2022),
        ("TR003", "Utility", "Flatbed", 2020)
    ]
    
    for trailer_id, make, model, year in sample_trailers:
        trailer = Trailer(trailer_id, make, model, year)
        trailer.max_cargo_capacity = 48000.0
        trailer.has_registration = True
        trailer.insurance_valid = True
        trailer.location = "Depot"
        _trailers[trailer_id] = trailer

# Driver operations
def get_all_drivers() -> List[Dict[str, Any]]:
    return [driver.get_driver_status() for driver in _drivers.values()]

def get_driver_by_id(driver_id: str) -> Optional[Dict[str, Any]]:
    driver = _drivers.get(driver_id)
    return driver.get_driver_status() if driver else None

def get_available_drivers() -> List[Dict[str, Any]]:
    return [driver.get_driver_status() for driver in _drivers.values() if driver.is_available]

def get_drivers_by_location(location: str) -> List[Dict[str, Any]]:
    return [driver.get_driver_status() for driver in _drivers.values() 
            if driver.current_location.lower() == location.lower()]

def create_driver(driver_data: Dict[str, Any]) -> bool:
    try:
        driver_id = driver_data['driver_id']
        if driver_id in _drivers:
            return False
        
        driver = Driver(
            driver_id,
            driver_data['first_name'],
            driver_data['last_name'],
            driver_data['license_number']
        )
        
        # Set optional fields, or maybe this should be done in the driver class? 
        if 'email' in driver_data:
            driver.email = driver_data['email']
        if 'phone_number' in driver_data:
            driver.phone_number = driver_data['phone_number']
        if 'current_location' in driver_data:
            driver.current_location = driver_data['current_location']
        
        _drivers[driver_id] = driver
        logger.info(f"Created driver {driver_id}")
        return True
    except Exception as e:
        logger.error(f"Error creating driver: {e}")
        return False

def update_driver_availability(driver_id: str, available: bool) -> bool:
    driver = _drivers.get(driver_id)
    if driver:
        driver.set_availability(available)
        return True
    return False

def assign_driver_to_truck(driver_id: str, truck_id: str) -> bool:
    driver = _drivers.get(driver_id)
    truck = _trucks.get(truck_id)
    if driver and truck:
        return truck.assign_driver(driver)
    return False

# Truck Operations
def get_all_trucks() -> List[Dict[str, Any]]:
    return [truck.get_truck_info() for truck in _trucks.values()]

def get_truck_by_id(truck_id: str) -> Optional[Dict[str, Any]]:
    truck = _trucks.get(truck_id)
    return truck.get_truck_info() if truck else None

def get_available_trucks() -> List[Dict[str, Any]]:
    return [truck.get_truck_info() for truck in _trucks.values() 
            if truck.is_roadworthy() and not truck.driver_id]

def get_trucks_by_location(location: str) -> List[Dict[str, Any]]:
    return [truck.get_truck_info() for truck in _trucks.values() 
            if truck.location.lower() == location.lower()]

def create_truck(truck_data: Dict[str, Any]) -> bool:
    try:
        truck_id = truck_data['truck_id']
        if truck_id in _trucks:
            return False
        
        truck = Truck(
            truck_id,
            truck_data['make'],
            truck_data['model'],
            truck_data['year']
        )
        
        # I dont know if this is the best way to do this, but it works for now
        if 'license_plate' in truck_data:
            truck.license_plate = truck_data['license_plate']
        if 'max_capacity' in truck_data:
            truck.max_capacity = truck_data['max_capacity']
        if 'location' in truck_data:
            truck.location = truck_data['location']
        
        _trucks[truck_id] = truck
        logger.info(f"Created truck {truck_id}")
        return True
    except Exception as e:
        logger.error(f"Error creating truck: {e}")
        return False

def update_truck_location(truck_id: str, location: str) -> bool:
    truck = _trucks.get(truck_id)
    if truck:
        truck.update_location(location)
        return True
    return False

def update_truck_drivable_status(truck_id: str, drivable: bool) -> bool:
    truck = _trucks.get(truck_id)
    if truck:
        truck.set_drivable_status(drivable)
        return True
    return False

# Trailer operations
def get_all_trailers() -> List[Dict[str, Any]]:
    return [trailer.get_trailer_status() for trailer in _trailers.values()]

def get_trailer_by_id(trailer_id: str) -> Optional[Dict[str, Any]]:
    trailer = _trailers.get(trailer_id)
    return trailer.get_trailer_status() if trailer else None

def get_available_trailers() -> List[Dict[str, Any]]:
    return [trailer.get_trailer_status() for trailer in _trailers.values() 
            if trailer.is_working_condition and not trailer.attached_truck_id]

def get_trailers_by_location(location: str) -> List[Dict[str, Any]]:
    return [trailer.get_trailer_status() for trailer in _trailers.values() 
            if trailer.location.lower() == location.lower()]

def create_trailer(trailer_data: Dict[str, Any]) -> bool:
    try:
        trailer_id = trailer_data['trailer_id']
        if trailer_id in _trailers:
            return False
        
        trailer = Trailer(
            trailer_id,
            trailer_data['make'],
            trailer_data['model'],
            trailer_data['year']
        )
        
        # I dont know if this is the best way to do this, but it works for now
        if 'max_cargo_capacity' in trailer_data:
            trailer.max_cargo_capacity = trailer_data['max_cargo_capacity']
        if 'location' in trailer_data:
            trailer.location = trailer_data['location']
        
        _trailers[trailer_id] = trailer
        logger.info(f"Created trailer {trailer_id}")
        return True
    except Exception as e:
        logger.error(f"Error creating trailer: {e}")
        return False

def attach_trailer_to_truck(trailer_id: str, truck_id: str) -> bool:
    trailer = _trailers.get(trailer_id)
    truck = _trucks.get(truck_id)
    if trailer and truck:
        return truck.attach_trailer(trailer)
    return False

def update_trailer_location(trailer_id: str, location: str) -> bool:
    trailer = _trailers.get(trailer_id)
    if trailer:
        trailer.update_location(location)
        return True
    return False

# Order operations (This might change) This is also a stub
def get_all_orders() -> List[Dict[str, Any]]:
    return _orders.copy()

def get_order_by_id(order_id: str) -> Optional[Dict[str, Any]]:
    for order in _orders:
        if order.get('Order #') == order_id:
            return order
    return None

def get_orders_by_status(status: str) -> List[Dict[str, Any]]:
    return [order for order in _orders if order.get('Status', '').lower() == status.lower()]

def get_orders_by_driver(driver_id: str) -> List[Dict[str, Any]]:
    return [order for order in _orders if order.get('Driver1 ID') == driver_id]

def create_order(order_data: Dict[str, Any]) -> bool:
    try:
        # Add timestamp
        order_data['created_at'] = datetime.now().isoformat()
        _orders.append(order_data)
        logger.info(f"Created order {order_data.get('Order #', 'Unknown')}")
        return True
    except Exception as e:
        logger.error(f"Error creating order: {e}")
        return False

def update_order_status(order_id: str, status: str) -> bool:
    for order in _orders:
        if order.get('Order #') == order_id:
            order['Status'] = status
            order['updated_at'] = datetime.now().isoformat()
            logger.info(f"Updated order {order_id} status to {status}")
            return True
    return False

def assign_order_to_driver(order_id: str, driver_id: str) -> bool:
    for order in _orders:
        if order.get('Order #') == order_id:
            order['Driver1 ID'] = driver_id
            order['updated_at'] = datetime.now().isoformat()
            logger.info(f"Assigned order {order_id} to driver {driver_id}")
            return True
    return False


# Health check functions for debugging
def check_storage_health() -> Dict[str, Any]:
    return {
        'status': 'healthy',
        'drivers_loaded': len(_drivers),
        'trucks_loaded': len(_trucks),
        'trailers_loaded': len(_trailers),
        'orders_loaded': len(_orders),
        'timestamp': datetime.now().isoformat()
    }

# Initialize storage when module is imported
initialize_storage() 