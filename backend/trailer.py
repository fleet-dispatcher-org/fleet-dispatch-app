from datetime import datetime
from typing import Optional, Dict, Any
from pydantic import BaseModel
import logging

# Get logger
logger = logging.getLogger('dispatch_logger')


class Trailer(BaseModel):
    trailer_id: str
    attached_truck_id: str
    location: str
    is_working_condition: bool
    has_registration: bool
    bureaucratically_sound: bool
    is_currently_working: bool
    in_range_first_step: bool
    make: str
    model: str
    max_cargo_capacity: float
    current_cargo_weight: float
    year: int
    registration_expiry: Optional[datetime]
    last_inspection: Optional[datetime]
    next_inspection_due: Optional[datetime]
    insurance_carrier: str
    insurance_valid: bool
    
    def __init__(self, trailer_id: str, make: str, model: str, year: int):
        """
        Initialize a new Trailer instance.
        
        Args:
            trailer_id (str): Unique identifier for the trailer
            make (str): Manufacturer of the trailer
            model (str): Model of the trailer
            year (int): Year the trailer was manufactured
        """
        self.trailer_id = trailer_id
        self.attached_truck_id = ""  # Empty when not attached
        self.location = ""
        self.is_working_condition = True  # Default to True
        self.has_registration = False  # Default to False
        self.bureaucratically_sound = True  # Default to True
        self.is_currently_working = False  # Default to False
        self.in_range_first_step = False  # Default to False
        self.make = make
        self.model = model
        self.max_cargo_capacity = 0.0
        self.current_cargo_weight = 0.0
        self.year = year
        self.registration_expiry = None  # Will store date when implemented
        self.last_inspection = None
        self.next_inspection_due = None
        self.insurance_carrier = ""
        self.insurance_valid = False  # Default to False
        
        logger.info(f"Trailer {self.trailer_id} initialized: {self.year} {self.make} {self.model}")
    
    def attach_to_truck(self, truck_id: str) -> bool:
        """
        Attach this trailer to a truck.
        
        Args:
            truck_id (str): ID of the truck to attach to
            
        Returns:
            bool: True if successful, False otherwise
        """
        if self.attached_truck_id:
            print(f"Trailer {self.trailer_id} is already attached to truck {self.attached_truck_id}")
            return False
        
        if not self.is_working_condition:
            print(f"Trailer {self.trailer_id} is not in working condition")
            return False
        
        # TODO: Validate truck_id exists when Truck class integration is complete
        self.attached_truck_id = truck_id
        self.is_currently_working = True
        logger.info(f"Trailer {self.trailer_id} attached to truck {truck_id}")
        print(f"Trailer {self.trailer_id} attached to truck {truck_id}")
        return True
    
    def detach_from_truck(self) -> bool:
        """
        Detach this trailer from its current truck.
        
        Returns:
            bool: True if successful, False otherwise
        """
        if not self.attached_truck_id:
            print(f"Trailer {self.trailer_id} is not attached to any truck")
            return False
        
        old_truck = self.attached_truck_id
        self.attached_truck_id = ""
        self.is_currently_working = False
        logger.info(f"Trailer {self.trailer_id} detached from truck {old_truck}")
        print(f"Trailer {self.trailer_id} detached from truck {old_truck}")
        return True
    
    def set_working_condition(self, condition: bool) -> None:
        """
        Set the working condition status of the trailer.
        
        Args:
            condition (bool): True if in working condition, False otherwise
        """
        self.is_working_condition = condition
        condition_text = "working condition" if condition else "out of order"
        print(f"Trailer {self.trailer_id} is now in {condition_text}")
        
        # If trailer becomes non-working and is attached, detach it
        if not condition and self.attached_truck_id:
            print(f"Detaching trailer {self.trailer_id} due to working condition issues")
            self.detach_from_truck()
    
    def check_bureaucratic_status(self) -> bool:
        """
        Check if the trailer meets all bureaucratic requirements.
        
        Returns:
            bool: True if bureaucratically sound, False otherwise
        """
        # Check registration, insurance, and inspection status
        bureaucratic_checks = [
            self.has_registration,
            self.insurance_valid,
            # TODO: Add date-based checks when datetime handling is implemented
        ]
        
        self.bureaucratically_sound = all(bureaucratic_checks)
        return self.bureaucratically_sound
    
    def verify_equipment_condition(self) -> bool:
        """
        Verify the overall equipment condition of the trailer.
        
        Returns:
            bool: True if equipment is in good condition, False otherwise
        """
        # TODO: Implement detailed equipment checks
        # This would include brakes, lights, tires, structural integrity, etc.
        return self.is_working_condition
    
    def check_in_range_to_first_step(self, destination: str) -> bool:
        """
        Check if trailer is in range to reach the first step of a journey.
        
        Args:
            destination (str): The destination to check range for
            
        Returns:
            bool: True if in range, False otherwise
        """
        # TODO: Implement actual distance/range calculation logic
        # This would involve GPS coordinates, fuel capacity, etc.
        if not self.location:
            print(f"Cannot determine range - trailer {self.trailer_id} location unknown")
            return False
        
        # Placeholder logic
        self.in_range_first_step = True  # Assume in range for now
        print(f"Trailer {self.trailer_id} is in range to reach {destination}")
        return self.in_range_first_step
    
    def update_location(self, new_location: str) -> None:
        """
        Update the trailer's current location.
        
        Args:
            new_location (str): New location of the trailer
        """
        old_location = self.location
        self.location = new_location
        logger.info(f"Trailer {self.trailer_id} location updated from '{old_location}' to '{new_location}'")
        print(f"Trailer {self.trailer_id} location updated from '{old_location}' to '{new_location}'")
    
    def load_cargo(self, weight: float, cargo_type: str = "") -> bool:
        """
        Load cargo onto the trailer.
        
        Args:
            weight (float): Weight of cargo to load
            cargo_type (str): Type of cargo being loaded
            
        Returns:
            bool: True if successful, False if exceeds capacity
        """
        if weight <= 0:
            print("Invalid cargo weight")
            return False
        
        if self.current_cargo_weight + weight > self.max_cargo_capacity:
            available_capacity = self.max_cargo_capacity - self.current_cargo_weight
            print(f"Cannot load {weight} units. Available capacity: {available_capacity}")
            return False
        
        self.current_cargo_weight += weight
        logger.info(f"Loaded {weight} units of {cargo_type} onto trailer {self.trailer_id}. Current: {self.current_cargo_weight}/{self.max_cargo_capacity}")
        print(f"Loaded {weight} units of {cargo_type} onto trailer {self.trailer_id}")
        print(f"Current cargo weight: {self.current_cargo_weight}/{self.max_cargo_capacity}")
        return True
    
    def unload_cargo(self) -> None:
        """
        Unload all cargo from the trailer.
        """
        unloaded_weight = self.current_cargo_weight
        self.current_cargo_weight = 0.0
        print(f"Unloaded {unloaded_weight} units of cargo from trailer {self.trailer_id}")
    
    def renew_registration(self, expiry_date) -> None:
        """
        Renew the trailer's registration.
        
        Args:
            expiry_date: New expiry date for registration
        """
        # TODO: Implement proper date handling
        self.has_registration = True
        self.registration_expiry = expiry_date
        print(f"Registration renewed for trailer {self.trailer_id}")
        self.check_bureaucratic_status()
    
    def get_trailer_status(self) -> dict:
        """
        Get comprehensive status information about the trailer.
        
        Returns:
            dict: Dictionary containing trailer status information
        """
        return {
            'trailer_id': self.trailer_id,
            'attached_truck_id': self.attached_truck_id,
            'is_attached': bool(self.attached_truck_id),
            'location': self.location,
            'is_working_condition': self.is_working_condition,
            'bureaucratically_sound': self.bureaucratically_sound,
            'is_currently_working': self.is_currently_working,
            'cargo_utilization': f"{self.current_cargo_weight}/{self.max_cargo_capacity}",
            'cargo_percentage': (self.current_cargo_weight / self.max_cargo_capacity * 100) if self.max_cargo_capacity > 0 else 0
        }
    
    def schedule_maintenance(self) -> None:
        """
        Schedule maintenance for the trailer.
        """
        # TODO: Implement maintenance scheduling system
        print(f"Maintenance scheduled for trailer {self.trailer_id}")
    
    def calculate_distance_to(self, destination: str) -> float:
        """
        Calculate distance to a destination.
        
        Args:
            destination (str): Destination location
            
        Returns:
            float: Distance in miles (placeholder implementation)
        """
        # TODO: Implement actual GPS/mapping calculation
        # This is a placeholder that returns a dummy distance
        placeholder_distance = 100.0  # Default placeholder distance
        print(f"Distance from {self.location} to {destination}: {placeholder_distance} miles")
        return placeholder_distance
    
    def get_compliance_report(self) -> dict:
        """
        Generate a compliance report for the trailer.
        
        Returns:
            dict: Compliance status report
        """
        return {
            'trailer_id': self.trailer_id,
            'has_registration': self.has_registration,
            'registration_expiry': self.registration_expiry,
            'insurance_valid': self.insurance_valid,
            'insurance_carrier': self.insurance_carrier,
            'last_inspection': self.last_inspection,
            'next_inspection_due': self.next_inspection_due,
            'bureaucratically_sound': self.bureaucratically_sound,
            'overall_compliance': self.check_bureaucratic_status()
        }
    
    def __str__(self) -> str:
        """
        String representation of the trailer.
        
        Returns:
            str: Formatted string with trailer details
        """
        attachment_status = f"(Attached to {self.attached_truck_id})" if self.attached_truck_id else "(Not attached)"
        return f"Trailer {self.trailer_id}: {self.year} {self.make} {self.model} {attachment_status}"
    
    def __repr__(self) -> str:
        """
        Representation of the trailer object.
        
        Returns:
            str: Detailed representation of the trailer
        """
        return f"Trailer(trailer_id='{self.trailer_id}', make='{self.make}', model='{self.model}', year={self.year})"


# Example usage:
# if __name__ == "__main__":
#     # Create a new trailer
#     trailer1 = Trailer("TR001", "Great Dane", "Dry Van", 2021)
#     
#     # Set some properties
#     trailer1.max_cargo_capacity = 48000.0  # 48,000 lbs capacity
#     trailer1.location = "Depot A"
#     trailer1.insurance_carrier = "Fleet Insurance Co."
#     trailer1.insurance_valid = True
#     
#     # Test some methods
#     print(trailer1)
#     print(f"Trailer status: {trailer1.get_trailer_status()}")
#     
#     # Test cargo operations
#     trailer1.load_cargo(25000.0, "Electronics")
#     trailer1.load_cargo(15000.0, "Furniture")
#     
#     # Test attachment to truck
#     trailer1.attach_to_truck("T001")
#     
#     # Update location
#     trailer1.update_location("Customer Site B")
#     
#     # Check compliance
#     compliance_report = trailer1.get_compliance_report()
#     print(f"Compliance report: {compliance_report}")
#     
#     # Detach from truck
#     trailer1.detach_from_truck()
#     
#     # Unload cargo
#     trailer1.unload_cargo()