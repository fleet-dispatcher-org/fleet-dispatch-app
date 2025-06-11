from datetime import datetime, date
from typing import Optional
import logging

# Get logger
logger = logging.getLogger('dispatch_logger')


class Truck:
    def __init__(self, truck_id: str, make: str, model: str, year: int):
        """
        Initialize a new Truck instance.
        
        Args:
            truck_id (str): Unique identifier for the truck
            make (str): Manufacturer of the truck
            model (str): Model of the truck
            year (int): Year the truck was manufactured
        """
        self.truck_id = truck_id
        self.is_drivable = True  # Default to True
        self.has_registration = False  # Default to False
        self.location = ""
        self.mileage = 0
        self.has_container = False  # Default to False
        self.make = make
        self.model = model
        self.year = year
        self.license_plate = ""
        self.registration_expiry = None  # Will store date when implemented
        self.driver_id = ""
        self.max_capacity = 0.0
        self.attached_trailer_id = ""
        
        # Object associations - store actual objects for better integration
        self.assigned_driver = None  # Will store Driver object
        self.attached_trailer = None  # Will store Trailer object
        
        logger.info(f"Truck {self.truck_id} initialized: {self.year} {self.make} {self.model}")
    
    def drive_to(self, destination: str) -> bool:
        """
        Drive the truck to a specified destination.
        
        Args:
            destination (str): The destination location
            
        Returns:
            bool: True if successful, False otherwise
        """
        logger.debug(f"Truck {self.truck_id} attempting to drive to {destination}")
        
        if not self.is_drivable:
            logger.warning(f"Truck {self.truck_id} is not drivable")
            print(f"Truck {self.truck_id} is not drivable")
            return False
        
        if not self.driver_id:
            logger.warning(f"No driver assigned to truck {self.truck_id}")
            print(f"No driver assigned to truck {self.truck_id}")
            return False
        
        # Update location if drive is successful
        old_location = self.location
        self.location = destination
        logger.info(f"Truck {self.truck_id} drove from '{old_location}' to '{destination}'")
        print(f"Truck {self.truck_id} drove from {old_location} to {destination}")
        return True
    
    def add_mileage(self, miles: int) -> None:
        """
        Add miles to the truck's mileage.
        
        Args:
            miles (int): Number of miles to add
        """
        if miles > 0:
            self.mileage += miles
            logger.info(f"Added {miles} miles to truck {self.truck_id}. Total mileage: {self.mileage}")
            print(f"Added {miles} miles to truck {self.truck_id}. Total mileage: {self.mileage}")
    
    def set_drivable_status(self, status: bool) -> None:
        """
        Set whether the truck is drivable or not.
        
        Args:
            status (bool): True if drivable, False otherwise
        """
        self.is_drivable = status
        status_text = "drivable" if status else "not drivable"
        logger.info(f"Truck {self.truck_id} drivable status changed to: {status_text}")
        print(f"Truck {self.truck_id} is now {status_text}")
    
    def check_registration(self) -> bool:
        """
        Check if the truck's registration is valid and not expired.
        
        Returns:
            bool: True if registration is valid and current, False otherwise
        """
        # First check if truck has registration at all
        if not self.has_registration:
            return False
        
        # If no expiry date is set, assume registration is valid
        if not self.registration_expiry:
            print(f"Warning: No registration expiry date set for truck {self.truck_id}")
            return self.has_registration
        
        # Check if registration is still valid (not expired)
        try:
            current_date = date.today()
            
            # Handle different date formats that might be stored
            if isinstance(self.registration_expiry, str):
                # Try parsing common date formats
                try:
                    expiry_date = datetime.strptime(self.registration_expiry, "%Y-%m-%d").date()
                except ValueError:
                    try:
                        expiry_date = datetime.strptime(self.registration_expiry, "%m/%d/%Y").date()
                    except ValueError:
                        print(f"Error: Invalid date format for truck {self.truck_id} registration expiry")
                        return False
            elif isinstance(self.registration_expiry, (date, datetime)):
                expiry_date = self.registration_expiry.date() if isinstance(self.registration_expiry, datetime) else self.registration_expiry
            else:
                print(f"Error: Unsupported registration expiry date type for truck {self.truck_id}")
                return False
            
            # Check if registration is still valid
            is_valid = current_date <= expiry_date
            if not is_valid:
                logger.warning(f"Registration expired for truck {self.truck_id}. Expired on: {expiry_date}")
                print(f"Registration expired for truck {self.truck_id}. Expired on: {expiry_date}")
            else:
                logger.debug(f"Registration valid for truck {self.truck_id}. Expires on: {expiry_date}")
            
            return is_valid
            
        except Exception as e:
            print(f"Error checking registration for truck {self.truck_id}: {e}")
            return False
    
    def renew_registration(self, expiry_date) -> None:
        """
        Renew the truck's registration.
        
        Args:
            expiry_date: New expiry date for registration
        """
        # TODO: Implement proper date handling
        self.has_registration = True
        self.registration_expiry = expiry_date
        print(f"Registration renewed for truck {self.truck_id}")
    
    def assign_driver(self, driver) -> bool:
        """
        Assign a driver to the truck.
        
        Args:
            driver: Driver object or driver_id string to assign
            
        Returns:
            bool: True if successful, False otherwise
        """
        # Handle both Driver object and string ID for backward compatibility
        if isinstance(driver, str):
            # Legacy support - just store the driver_id
            if self.driver_id:
                print(f"Truck {self.truck_id} already has driver {self.driver_id} assigned")
                return False
            self.driver_id = driver
            print(f"Driver {driver} assigned to truck {self.truck_id}")
            return True
        
        # Handle Driver object
        if self.assigned_driver:
            print(f"Truck {self.truck_id} already has driver {self.assigned_driver.driver_id} assigned")
            return False
        
        # Check if driver is eligible and available
        if not driver.check_driving_eligibility():
            print(f"Driver {driver.driver_id} is not eligible to drive")
            return False
        
        if not driver.is_available:
            print(f"Driver {driver.driver_id} is not available")
            return False
        
        # Assign driver to truck and truck to driver
        self.assigned_driver = driver
        self.driver_id = driver.driver_id  # Keep string ID for backward compatibility
        
        # Update driver's assignment
        success = driver.assign_to_truck(self.truck_id)
        if not success:
            # If driver assignment failed, rollback truck assignment
            self.assigned_driver = None
            self.driver_id = ""
            return False
        
        logger.info(f"Driver {driver.driver_id} ({driver.first_name} {driver.last_name}) assigned to truck {self.truck_id}")
        print(f"Driver {driver.driver_id} ({driver.first_name} {driver.last_name}) assigned to truck {self.truck_id}")
        return True
    
    def remove_driver(self) -> bool:
        """
        Remove the currently assigned driver from the truck.
        
        Returns:
            bool: True if successful, False otherwise
        """
        if not self.driver_id and not self.assigned_driver:
            print(f"No driver assigned to truck {self.truck_id}")
            return False
        
        old_driver_id = self.driver_id
        old_driver_name = ""
        
        # If we have a Driver object, unassign from their side too
        if self.assigned_driver:
            old_driver_name = f" ({self.assigned_driver.first_name} {self.assigned_driver.last_name})"
            self.assigned_driver.unassign_from_truck()
            self.assigned_driver = None
        
        # Clear truck-side assignment
        self.driver_id = ""
        
        logger.info(f"Driver {old_driver_id}{old_driver_name} removed from truck {self.truck_id}")
        print(f"Driver {old_driver_id}{old_driver_name} removed from truck {self.truck_id}")
        return True
    
    def attach_trailer(self, trailer) -> bool:
        """
        Attach a trailer to the truck.
        
        Args:
            trailer: Trailer object or trailer_id string to attach
            
        Returns:
            bool: True if successful, False otherwise
        """
        # Handle both Trailer object and string ID for backward compatibility
        if isinstance(trailer, str):
            # Legacy support - just store the trailer_id
            if self.attached_trailer_id:
                print(f"Truck {self.truck_id} already has trailer {self.attached_trailer_id} attached")
                return False
            self.attached_trailer_id = trailer
            print(f"Trailer {trailer} attached to truck {self.truck_id}")
            return True
        
        # Handle Trailer object
        if self.attached_trailer:
            print(f"Truck {self.truck_id} already has trailer {self.attached_trailer.trailer_id} attached")
            return False
        
        # Check if trailer is in working condition
        if not trailer.is_working_condition:
            print(f"Trailer {trailer.trailer_id} is not in working condition")
            return False
        
        # Check if trailer is already attached to another truck
        if trailer.attached_truck_id:
            print(f"Trailer {trailer.trailer_id} is already attached to truck {trailer.attached_truck_id}")
            return False
        
        # Attach trailer to truck and truck to trailer
        self.attached_trailer = trailer
        self.attached_trailer_id = trailer.trailer_id  # Keep string ID for backward compatibility
        
        # Update trailer's attachment
        success = trailer.attach_to_truck(self.truck_id)
        if not success:
            # If trailer attachment failed, rollback truck attachment
            self.attached_trailer = None
            self.attached_trailer_id = ""
            return False
        
        logger.info(f"Trailer {trailer.trailer_id} ({trailer.year} {trailer.make} {trailer.model}) attached to truck {self.truck_id}")
        print(f"Trailer {trailer.trailer_id} ({trailer.year} {trailer.make} {trailer.model}) attached to truck {self.truck_id}")
        return True
    
    def attach_container(self) -> bool:
        """
        Attach a container to the truck via trailer.
        
        Returns:
            bool: True if successful, False otherwise
        """
        if not self.attached_trailer:
            print(f"Cannot attach container - no trailer attached to truck {self.truck_id}")
            return False
        
        if self.has_container:
            print(f"Truck {self.truck_id} already has a container attached")
            return False
        
        self.has_container = True
        logger.info(f"Container attached to truck {self.truck_id} via trailer {self.attached_trailer.trailer_id}")
        print(f"Container attached to truck {self.truck_id} via trailer {self.attached_trailer.trailer_id}")
        return True
    
    def detach_trailer(self) -> bool:
        """
        Detach the trailer from the truck.
        
        Returns:
            bool: True if successful, False otherwise
        """
        if not self.attached_trailer_id and not self.attached_trailer:
            print(f"No trailer attached to truck {self.truck_id}")
            return False
        
        old_trailer_id = self.attached_trailer_id
        old_trailer_name = ""
        
        # If we have a Trailer object, detach from their side too
        if self.attached_trailer:
            old_trailer_name = f" ({self.attached_trailer.year} {self.attached_trailer.make} {self.attached_trailer.model})"
            self.attached_trailer.detach_from_truck()
            self.attached_trailer = None
        
        # Clear truck-side attachment
        self.attached_trailer_id = ""
        
        # Remove container if one was attached
        if self.has_container:
            self.has_container = False
            print(f"Container removed due to trailer detachment")
        
        print(f"Trailer {old_trailer_id}{old_trailer_name} detached from truck {self.truck_id}")
        return True
    
    def remove_container(self) -> bool:
        """
        Remove the container from the truck.
        
        Returns:
            bool: True if successful, False otherwise
        """
        if not self.has_container:
            print(f"Truck {self.truck_id} has no container to remove")
            return False
        
        self.has_container = False
        trailer_info = f" from trailer {self.attached_trailer.trailer_id}" if self.attached_trailer else ""
        print(f"Container removed from truck {self.truck_id}{trailer_info}")
        return True
    
    def load_cargo(self, weight: float) -> bool:
        """
        Load cargo onto the truck.
        
        Args:
            weight (float): Weight of cargo to load
            
        Returns:
            bool: True if successful, False if exceeds capacity
        """
        if weight < 0:
            print(f"Cannot load {weight} units. Weight cannot be negative")
            return False
        
        if weight > self.max_capacity:
            print(f"Cannot load {weight} units. Exceeds max capacity of {self.max_capacity}")
            return False
        
        # TODO: Implement current cargo tracking
        print(f"Loaded {weight} units of cargo onto truck {self.truck_id}")
        return True
    
    def unload_cargo(self) -> None:
        """
        Unload all cargo from the truck.
        """
        # TODO: Implement current cargo tracking
        print(f"All cargo unloaded from truck {self.truck_id}")
    
    def get_truck_info(self) -> dict:
        """
        Get comprehensive information about the truck.
        
        Returns:
            dict: Dictionary containing all truck information
        """
        # Get driver info
        driver_info = {}
        if self.assigned_driver:
            driver_info = {
                'driver_name': f"{self.assigned_driver.first_name} {self.assigned_driver.last_name}",
                'driver_available': self.assigned_driver.is_available,
                'driver_eligible': self.assigned_driver.check_driving_eligibility()
            }
        
        # Get trailer info
        trailer_info = {}
        if self.attached_trailer:
            trailer_info = {
                'trailer_make_model': f"{self.attached_trailer.year} {self.attached_trailer.make} {self.attached_trailer.model}",
                'trailer_working_condition': self.attached_trailer.is_working_condition,
                'trailer_cargo_capacity': self.attached_trailer.max_cargo_capacity,
                'trailer_current_cargo': self.attached_trailer.current_cargo_weight
            }
        
        return {
            'truck_id': self.truck_id,
            'make': self.make,
            'model': self.model,
            'year': self.year,
            'mileage': self.mileage,
            'location': self.location,
            'is_drivable': self.is_drivable,
            'has_registration': self.has_registration,
            'registration_valid': self.check_registration(),
            'license_plate': self.license_plate,
            'driver_id': self.driver_id,
            'has_container': self.has_container,
            'max_capacity': self.max_capacity,
            'attached_trailer_id': self.attached_trailer_id,
            'is_roadworthy': self.is_roadworthy(),
            **driver_info,
            **trailer_info
        }
    
    def is_roadworthy(self) -> bool:
        """
        Check if the truck is roadworthy (drivable and registered).
        
        Returns:
            bool: True if roadworthy, False otherwise
        """
        return self.is_drivable and self.check_registration()
    
    def schedule_maintenance(self) -> None:
        """
        Schedule maintenance for the truck.
        """
        # TODO: Implement maintenance scheduling system
        print(f"Maintenance scheduled for truck {self.truck_id}")
    
    def update_location(self, new_location: str) -> None:
        """
        Update the truck's current location.
        
        Args:
            new_location (str): New location of the truck
        """
        old_location = self.location
        self.location = new_location
        logger.info(f"Truck {self.truck_id} location updated from '{old_location}' to '{new_location}'")
        print(f"Truck {self.truck_id} location updated from '{old_location}' to '{new_location}'")
    
    def __str__(self) -> str:
        """
        String representation of the truck.
        
        Returns:
            str: Formatted string with truck details
        """
        return f"Truck {self.truck_id}: {self.year} {self.make} {self.model} (Mileage: {self.mileage})"
    
    def __repr__(self) -> str:
        """
        Representation of the truck object.
        
        Returns:
            str: Detailed representation of the truck
        """
        return f"Truck(truck_id='{self.truck_id}', make='{self.make}', model='{self.model}', year={self.year})"


# Example usage:
# if __name__ == "__main__":
#     # Import classes for demonstration (in real usage, these would be in separate modules)
#     # from driver import Driver
#     # from trailer import Trailer
#     
#     # Create a new truck
#     truck1 = Truck("T001", "Ford", "F-150", 2022)
#     
#     # Set some properties
#     truck1.license_plate = "ABC123"
#     truck1.max_capacity = 2000.0
#     truck1.location = "Warehouse A"
#     truck1.has_registration = True
#     truck1.registration_expiry = "2024-12-31"  # Set registration expiry
#     
#     # Test some methods
#     print(truck1)
#     print(f"Registration valid: {truck1.check_registration()}")
#     print(f"Is roadworthy: {truck1.is_roadworthy()}")
#     
#     # Example with Driver object (commented out since driver.py import is not available in this demo)
#     # driver1 = Driver("D001", "John", "Doe", "DL123456")
#     # driver1.background_check_valid = True
#     # driver1.medical_cert_current = True
#     # driver1.drug_test_current = True
#     # truck1.assign_driver(driver1)
#     
#     # Legacy string-based driver assignment for backward compatibility
#     truck1.assign_driver("D001")
#     
#     # Example with Trailer object (commented out since trailer.py import is not available in this demo)
#     # trailer1 = Trailer("TR001", "Great Dane", "Dry Van", 2021)
#     # trailer1.max_cargo_capacity = 25000.0
#     # truck1.attach_trailer(trailer1)
#     
#     # Legacy string-based trailer attachment for backward compatibility
#     truck1.attached_trailer_id = "TR001"
#     
#     # Attach container (now requires trailer)
#     # truck1.attach_container()  # This would fail without a trailer object
#     
#     # Drive to a location
#     truck1.drive_to("Warehouse B")
#     
#     # Add mileage
#     truck1.add_mileage(50)
#     
#     # Get comprehensive truck info
#     info = truck1.get_truck_info()
#     print(f"Truck info: {info}")
#     
#     # Test driver and trailer removal
#     truck1.remove_driver()
#     # truck1.detach_trailer()  # Would also remove container if attached