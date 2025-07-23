from datetime import datetime, date
from typing import Optional, List, Dict, Any
from pydantic import BaseModel
import logging

# Get logger
logger = logging.getLogger('dispatch_logger')


class Driver(BaseModel):
    driver_id: str
    first_name: str
    last_name: str
    license_number: str
    license_expiry: Optional[str] = None
    email: str
    current_location: str
    is_available: bool
    driver_reports_ready: bool
    assigned_truck_id: str
    has_personal_needs: bool
    assigned_truck_id_string: str
    phone_number: str
    emergency_contact: str
    hire_date: Optional[str] = None
    background_check_valid: bool
    hours_worked_today: float
    certifications: List[str]
    last_rest_period: Optional[str] = None
    certifications_list_strings: List[str]
    drug_test_current: bool
    employment_status: str
    hire_date_string: Optional[str] = None

    def __init__(self, driver_id: str, first_name: str, last_name: str, license_number: str):
        """
        Initialize a new Driver instance.
        
        Args:
            driver_id (str): Unique identifier for the driver
            first_name (str): Driver's first name
            last_name (str): Driver's last name
            license_number (str): Driver's license number
        """
        self.driver_id = driver_id
        self.first_name = first_name
        self.last_name = last_name
        self.license_number = license_number
        self.license_expiry = None  # Will store date when implemented
        self.email = ""
        self.current_location = ""
        self.is_available = True  # Default to available
        self.driver_reports_ready = False  # Default to False
        self.assigned_truck_id = ""  # Empty when not assigned
        self.has_personal_needs = False  # Default to False
        self.assigned_truck_id_string = ""  # Alternative truck ID field
        self.phone_number = ""
        self.emergency_contact = ""
        self.hire_date = None
        self.background_check_valid = False  # Default to False
        self.hours_worked_today = 0.0
        self.certifications = []  # List of certifications
        self.last_rest_period = None  # Date of last rest period
        self.certifications_list_strings = []  # Alternative certifications list
        self.drug_test_current = False  # Default to False
        self.medical_cert_current = False  # Default to False
        
        logger.info(f"Driver {self.driver_id} initialized: {self.first_name} {self.last_name} (License: {self.license_number})")
    
    def assign_to_truck(self, truck_id: str) -> bool:
        """
        Assign this driver to a truck.
        
        Args:
            truck_id (str): ID of the truck to assign to
            
        Returns:
            bool: True if successful, False otherwise
        """
        if self.assigned_truck_id:
            print(f"Driver {self.driver_id} is already assigned to truck {self.assigned_truck_id}")
            return False
        
        if not self.is_available:
            print(f"Driver {self.driver_id} is not available for assignment")
            return False
        
        if not self.check_driving_eligibility():
            print(f"Driver {self.driver_id} is not eligible to drive")
            return False
        
        # TODO: Validate truck_id exists when Truck class integration is complete
        self.assigned_truck_id = truck_id
        self.assigned_truck_id_string = truck_id  # Keep both fields in sync
        self.is_available = False
        logger.info(f"Driver {self.driver_id} ({self.first_name} {self.last_name}) assigned to truck {truck_id}")
        print(f"Driver {self.driver_id} assigned to truck {truck_id}")
        return True
    
    def unassign_from_truck(self) -> bool:
        """
        Unassign this driver from their current truck.
        
        Returns:
            bool: True if successful, False otherwise
        """
        if not self.assigned_truck_id:
            print(f"Driver {self.driver_id} is not assigned to any truck")
            return False
        
        old_truck = self.assigned_truck_id
        self.assigned_truck_id = ""
        self.assigned_truck_id_string = ""
        self.is_available = True
        logger.info(f"Driver {self.driver_id} ({self.first_name} {self.last_name}) unassigned from truck {old_truck}")
        print(f"Driver {self.driver_id} unassigned from truck {old_truck}")
        return True
    
    def check_license_validity(self) -> bool:
        """
        Check if the driver's license is valid and not expired.
        
        Returns:
            bool: True if license is valid, False otherwise
        """
        # TODO: Implement actual date checking when license_expiry is properly set
        if not self.license_expiry:
            print(f"License expiry date not set for driver {self.driver_id}")
            return False
        
        # Placeholder implementation - would check against current date
        print(f"License validity checked for driver {self.driver_id}")
        return True
    
    def check_medical_certification(self) -> bool:
        """
        Check if the driver's medical certification is current.
        
        Returns:
            bool: True if medical certification is current, False otherwise
        """
        return self.medical_cert_current
    
    def set_availability(self, available: bool) -> None:
        """
        Set the driver's availability status.
        
        Args:
            available (bool): True if available, False otherwise
        """
        # Cannot set available if assigned to truck
        if available and self.assigned_truck_id:
            print(f"Cannot set driver {self.driver_id} as available while assigned to truck {self.assigned_truck_id}")
            return
        
        self.is_available = available
        status_text = "available" if available else "unavailable"
        print(f"Driver {self.driver_id} is now {status_text}")
    
    def check_drug_test_status(self) -> bool:
        """
        Check if the driver's drug test is current.
        
        Returns:
            bool: True if drug test is current, False otherwise
        """
        return self.drug_test_current
    
    def check_certifications(self) -> bool:
        """
        Check if all required certifications are valid.
        
        Returns:
            bool: True if all certifications are valid, False otherwise
        """
        # TODO: Implement certification validation logic
        # This would check expiry dates for each certification
        if not self.certifications and not self.certifications_list_strings:
            print(f"No certifications found for driver {self.driver_id}")
            return False
        
        print(f"Certifications checked for driver {self.driver_id}")
        return True
    
    def check_driving_eligibility(self) -> bool:
        """
        Comprehensive check if driver is eligible to drive.
        
        Returns:
            bool: True if eligible, False otherwise
        """
        eligibility_checks = [
            self.check_license_validity(),
            self.check_medical_certification(),
            self.check_drug_test_status(),
            self.background_check_valid,
            self.is_available
        ]
        
        is_eligible = all(eligibility_checks)
        eligibility_text = "eligible" if is_eligible else "not eligible"
        logger.info(f"Driver {self.driver_id} driving eligibility check: {eligibility_text}")
        print(f"Driver {self.driver_id} is {eligibility_text} to drive")
        return is_eligible
    
    def log_driving_hours(self, hours: float) -> bool:
        """
        Log driving hours for the day and check compliance.
        
        Args:
            hours (float): Number of hours driven
            
        Returns:
            bool: True if within legal limits, False otherwise
        """
        if hours < 0:
            print("Invalid hours value")
            return False
        
        self.hours_worked_today += hours
        
        # DOT regulations: 11 hours driving, 14 hours on-duty
        if self.hours_worked_today > 11.0:
            logger.warning(f"Driver {self.driver_id} has exceeded 11-hour driving limit. Total: {self.hours_worked_today} hours")
            print(f"WARNING: Driver {self.driver_id} has exceeded 11-hour driving limit")
            return False
        
        logger.info(f"Logged {hours} hours for driver {self.driver_id}. Total today: {self.hours_worked_today}")
        print(f"Logged {hours} hours for driver {self.driver_id}. Total today: {self.hours_worked_today}")
        return True
    
    def take_rest_period(self) -> None:
        """
        Record that the driver has taken a mandatory rest period.
        """
        # TODO: Implement proper date handling
        self.last_rest_period = datetime.now().date()
        self.hours_worked_today = 0.0  # Reset daily hours after rest
        print(f"Rest period recorded for driver {self.driver_id}. Daily hours reset.")
    
    def submit_driver_reports(self) -> bool:
        """
        Submit required driver reports and update status.
        
        Returns:
            bool: True if reports submitted successfully, False otherwise
        """
        # TODO: Implement actual report submission logic
        self.driver_reports_ready = True
        print(f"Driver reports submitted for driver {self.driver_id}")
        return True
    
    def check_personal_needs(self) -> bool:
        """
        Check if driver has any personal needs that affect availability.
        
        Returns:
            bool: True if personal needs are addressed, False otherwise
        """
        return not self.has_personal_needs
    
    def address_personal_needs(self) -> None:
        """
        Mark that driver's personal needs have been addressed.
        """
        self.has_personal_needs = False
        print(f"Personal needs addressed for driver {self.driver_id}")
    
    def resolve_personal_needs(self) -> None:
        """
        Alternative method to resolve personal needs.
        """
        self.address_personal_needs()
    
    def update_location(self, new_location: str) -> None:
        """
        Update the driver's current location.
        
        Args:
            new_location (str): New location of the driver
        """
        old_location = self.current_location
        self.current_location = new_location
        logger.info(f"Driver {self.driver_id} location updated from '{old_location}' to '{new_location}'")
        print(f"Driver {self.driver_id} location updated from '{old_location}' to '{new_location}'")
    
    def renew_medical_certificate(self, expiry_date=None) -> None:
        """
        Renew the driver's medical certificate.
        
        Args:
            expiry_date: New expiry date for medical certificate
        """
        # TODO: Implement proper date handling
        self.medical_cert_current = True
        print(f"Medical certificate renewed for driver {self.driver_id}")
    
    def update_certifications(self, cert_list: List[str]) -> None:
        """
        Update the driver's certification list.
        
        Args:
            cert_list (List[str]): List of certifications
        """
        self.certifications = cert_list.copy()
        self.certifications_list_strings = cert_list.copy()  # Keep both in sync
        print(f"Certifications updated for driver {self.driver_id}: {cert_list}")
    
    def add_certification(self, certification: str) -> None:
        """
        Add a new certification to the driver's record.
        
        Args:
            certification (str): Certification to add
        """
        if certification not in self.certifications:
            self.certifications.append(certification)
            self.certifications_list_strings.append(certification)
            print(f"Added certification '{certification}' for driver {self.driver_id}")
    
    def calculate_distance_to(self, destination: str) -> float:
        """
        Calculate distance from current location to destination.
        
        Args:
            destination (str): Destination location
            
        Returns:
            float: Distance in miles (placeholder implementation)
        """
        # TODO: Implement actual GPS/mapping calculation
        if not self.current_location:
            print(f"Cannot calculate distance - driver {self.driver_id} location unknown")
            return 0.0
        
        placeholder_distance = 50.0  # Default placeholder distance
        print(f"Distance from {self.current_location} to {destination}: {placeholder_distance} miles")
        return placeholder_distance
    
    def check_work_eligibility(self) -> bool:
        """
        Alternative method name for checking driving eligibility.
        
        Returns:
            bool: True if eligible to work, False otherwise
        """
        return self.check_driving_eligibility()
    
    def get_driver_status(self) -> Dict[str, Any]:
        """
        Get comprehensive status information about the driver.
        
        Returns:
            dict: Dictionary containing driver status information
        """
        return {
            'driver_id': self.driver_id,
            'full_name': f"{self.first_name} {self.last_name}",
            'assigned_truck_id': self.assigned_truck_id,
            'is_available': self.is_available,
            'current_location': self.current_location,
            'hours_worked_today': self.hours_worked_today,
            'license_valid': self.check_license_validity(),
            'medical_cert_current': self.medical_cert_current,
            'drug_test_current': self.drug_test_current,
            'background_check_valid': self.background_check_valid,
            'driving_eligible': self.check_driving_eligibility(),
            'reports_ready': self.driver_reports_ready,
            'personal_needs_addressed': not self.has_personal_needs
        }
    
    def get_compliance_report(self) -> Dict[str, Any]:
        """
        Generate a compliance report for the driver.
        
        Returns:
            dict: Compliance status report
        """
        return {
            'driver_id': self.driver_id,
            'license_number': self.license_number,
            'license_expiry': self.license_expiry,
            'medical_cert_current': self.medical_cert_current,
            'drug_test_current': self.drug_test_current,
            'background_check_valid': self.background_check_valid,
            'certifications': self.certifications,
            'hours_compliance': self.hours_worked_today <= 11.0,
            'overall_compliance': self.check_driving_eligibility()
        }
    
    def __str__(self) -> str:
        """
        String representation of the driver.
        
        Returns:
            str: Formatted string with driver details
        """
        assignment_status = f"(Assigned to {self.assigned_truck_id})" if self.assigned_truck_id else "(Unassigned)"
        availability = "Available" if self.is_available else "Unavailable"
        return f"Driver {self.driver_id}: {self.first_name} {self.last_name} - {availability} {assignment_status}"
    
    def __repr__(self) -> str:
        """
        Representation of the driver object.
        
        Returns:
            str: Detailed representation of the driver
        """
        return f"Driver(driver_id='{self.driver_id}', name='{self.first_name} {self.last_name}', license='{self.license_number}')"


# Example usage:
# if __name__ == "__main__":
#     # Create a new driver
#     driver1 = Driver("D001", "John", "Smith", "DL123456789")
#     
#     # Set some properties
#     driver1.email = "john.smith@company.com"
#     driver1.phone_number = "555-0123"
#     driver1.current_location = "Home Base"
#     driver1.medical_cert_current = True
#     driver1.drug_test_current = True
#     driver1.background_check_valid = True
#     
#     # Add certifications
#     driver1.update_certifications(["CDL Class A", "Hazmat", "Defensive Driving"])
#     
#     # Test some methods
#     print(driver1)
#     print(f"Driver status: {driver1.get_driver_status()}")
#     
#     # Check eligibility and assign to truck
#     if driver1.check_driving_eligibility():
#         driver1.assign_to_truck("T001")
#     
#     # Log some driving hours
#     driver1.log_driving_hours(8.5)
#     
#     # Update location
#     driver1.update_location("Customer Site A")
#     
#     # Submit reports
#     driver1.submit_driver_reports()
#     
#     # Check compliance
#     compliance_report = driver1.get_compliance_report()
#     print(f"Compliance report: {compliance_report}")
#     
#     # Take rest period
#     driver1.take_rest_period()
#     
#     # Unassign from truck
#     driver1.unassign_from_truck()