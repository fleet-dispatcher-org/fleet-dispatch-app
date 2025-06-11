import unittest
import sys
import os
from unittest.mock import Mock, patch
from datetime import datetime, date


# Add the project root directory to the Python path
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))  # Relative path

from driver import Driver

def create_mock_truck():
    """Helper function to create a mock truck object."""
    mock_truck = Mock()
    mock_truck.truck_id = "T001"
    mock_truck.make = "Volvo"
    mock_truck.model = "VNL"
    mock_truck.year = 2023
    mock_truck.is_drivable = True
    mock_truck.driver_id = ""
    mock_truck.assign_driver.return_value = True
    mock_truck.remove_driver.return_value = True
    return mock_truck


# ============================================================================
# DRIVER INITIALIZATION TESTS
# ============================================================================

def test_driver_initialization_valid_parameters():
    """Test driver initialization with valid parameters."""
    # Setup
    driver_id = "D123"
    first_name = "John"
    last_name = "Doe"
    license_number = "DL123456789"
    
    # Exercise
    driver = Driver(driver_id, first_name, last_name, license_number)
    
    # Verify
    assert driver.driver_id == driver_id
    assert driver.first_name == first_name
    assert driver.last_name == last_name
    assert driver.license_number == license_number
    assert driver.license_expiry is None
    assert driver.email == ""
    assert driver.current_location == ""
    assert driver.is_available == True
    assert driver.driver_reports_ready == False
    assert driver.assigned_truck_id == ""
    assert driver.has_personal_needs == False
    assert driver.assigned_truck_id_string == ""
    assert driver.phone_number == ""
    assert driver.emergency_contact == ""
    assert driver.hire_date is None
    assert driver.background_check_valid == False
    assert driver.hours_worked_today == 0.0
    assert driver.certifications == []
    assert driver.last_rest_period is None
    assert driver.certifications_list_strings == []
    assert driver.drug_test_current == False
    assert driver.medical_cert_current == False
    
    # Teardown
    driver = None


def test_driver_initialization_empty_strings():
    """Test driver initialization with empty strings."""
    # Setup & Exercise
    driver = Driver("", "", "", "")
    
    # Verify
    assert driver.driver_id == ""
    assert driver.first_name == ""
    assert driver.last_name == ""
    assert driver.license_number == ""
    
    # Teardown
    driver = None


# ============================================================================
# DRIVER TRUCK ASSIGNMENT TESTS
# ============================================================================

def test_assign_to_truck_success():
    """Test successful truck assignment."""
    # Setup
    driver = Driver("D001", "John", "Doe", "DL123456789")
    driver.medical_cert_current = True
    driver.drug_test_current = True
    driver.background_check_valid = True
    driver.license_expiry = date(2025, 12, 31)  # Valid license
    truck_id = "T001"
    
    # Exercise
    result = driver.assign_to_truck(truck_id)
    
    # Verify
    assert result == True
    assert driver.assigned_truck_id == truck_id
    assert driver.assigned_truck_id_string == truck_id
    assert driver.is_available == False
    
    # Teardown
    driver = None


def test_assign_to_truck_already_assigned():
    """Test truck assignment when driver already assigned."""
    # Setup
    driver = Driver("D001", "John", "Doe", "DL123456789")
    driver.assigned_truck_id = "T999"
    
    # Exercise
    result = driver.assign_to_truck("T001")
    
    # Verify
    assert result == False
    assert driver.assigned_truck_id == "T999"  # Should remain unchanged
    
    # Teardown
    driver = None


def test_assign_to_truck_not_available():
    """Test truck assignment when driver is not available."""
    # Setup
    driver = Driver("D001", "John", "Doe", "DL123456789")
    driver.is_available = False
    
    # Exercise
    result = driver.assign_to_truck("T001")
    
    # Verify
    assert result == False
    assert driver.assigned_truck_id == ""
    
    # Teardown
    driver = None


def test_assign_to_truck_not_eligible():
    """Test truck assignment when driver is not eligible."""
    # Setup
    driver = Driver("D001", "John", "Doe", "DL123456789")
    driver.medical_cert_current = False  # Not eligible
    
    # Exercise
    result = driver.assign_to_truck("T001")
    
    # Verify
    assert result == False
    assert driver.assigned_truck_id == ""
    
    # Teardown
    driver = None


def test_unassign_from_truck_success():
    """Test successful truck unassignment."""
    # Setup
    driver = Driver("D001", "John", "Doe", "DL123456789")
    driver.assigned_truck_id = "T001"
    driver.assigned_truck_id_string = "T001"
    driver.is_available = False
    
    # Exercise
    result = driver.unassign_from_truck()
    
    # Verify
    assert result == True
    assert driver.assigned_truck_id == ""
    assert driver.assigned_truck_id_string == ""
    assert driver.is_available == True
    
    # Teardown
    driver = None


def test_unassign_from_truck_not_assigned():
    """Test truck unassignment when driver is not assigned."""
    # Setup
    driver = Driver("D001", "John", "Doe", "DL123456789")
    
    # Exercise
    result = driver.unassign_from_truck()
    
    # Verify
    assert result == False
    assert driver.assigned_truck_id == ""
    
    # Teardown
    driver = None


# ============================================================================
# DRIVER LICENSE VALIDITY TESTS
# ============================================================================

def test_check_license_validity_no_expiry():
    """Test license validity check when no expiry date is set."""
    # Setup
    driver = Driver("D001", "John", "Doe", "DL123456789")
    driver.license_expiry = None
    
    # Exercise
    result = driver.check_license_validity()
    
    # Verify
    assert result == False
    
    # Teardown
    driver = None


def test_check_license_validity_with_expiry():
    """Test license validity check when expiry date is set."""
    # Setup
    driver = Driver("D001", "John", "Doe", "DL123456789")
    driver.license_expiry = date(2025, 12, 31)
    
    # Exercise
    result = driver.check_license_validity()
    
    # Verify
    assert result == True  # Placeholder implementation returns True when expiry is set
    
    # Teardown
    driver = None


# ============================================================================
# DRIVER MEDICAL CERTIFICATION TESTS
# ============================================================================

def test_check_medical_certification_current():
    """Test medical certification check when current."""
    # Setup
    driver = Driver("D001", "John", "Doe", "DL123456789")
    driver.medical_cert_current = True
    
    # Exercise
    result = driver.check_medical_certification()
    
    # Verify
    assert result == True
    
    # Teardown
    driver = None


def test_check_medical_certification_not_current():
    """Test medical certification check when not current."""
    # Setup
    driver = Driver("D001", "John", "Doe", "DL123456789")
    driver.medical_cert_current = False
    
    # Exercise
    result = driver.check_medical_certification()
    
    # Verify
    assert result == False
    
    # Teardown
    driver = None


def test_renew_medical_certificate():
    """Test medical certificate renewal."""
    # Setup
    driver = Driver("D001", "John", "Doe", "DL123456789")
    driver.medical_cert_current = False
    new_expiry = date(2025, 12, 31)
    
    # Exercise
    driver.renew_medical_certificate(new_expiry)
    
    # Verify
    assert driver.medical_cert_current == True
    
    # Teardown
    driver = None


# ============================================================================
# DRIVER AVAILABILITY TESTS
# ============================================================================

def test_set_availability_true():
    """Test setting availability to True."""
    # Setup
    driver = Driver("D001", "John", "Doe", "DL123456789")
    driver.is_available = False
    
    # Exercise
    driver.set_availability(True)
    
    # Verify
    assert driver.is_available == True
    
    # Teardown
    driver = None


def test_set_availability_false():
    """Test setting availability to False."""
    # Setup
    driver = Driver("D001", "John", "Doe", "DL123456789")
    driver.is_available = True
    
    # Exercise
    driver.set_availability(False)
    
    # Verify
    assert driver.is_available == False
    
    # Teardown
    driver = None


def test_set_availability_true_while_assigned():
    """Test setting availability to True while assigned to truck."""
    # Setup
    driver = Driver("D001", "John", "Doe", "DL123456789")
    driver.assigned_truck_id = "T001"
    driver.is_available = False
    
    # Exercise
    driver.set_availability(True)
    
    # Verify
    assert driver.is_available == False  # Should remain False due to truck assignment
    
    # Teardown
    driver = None


# ============================================================================
# DRIVER DRUG TEST TESTS
# ============================================================================

def test_check_drug_test_status_current():
    """Test drug test status check when current."""
    # Setup
    driver = Driver("D001", "John", "Doe", "DL123456789")
    driver.drug_test_current = True
    
    # Exercise
    result = driver.check_drug_test_status()
    
    # Verify
    assert result == True
    
    # Teardown
    driver = None


def test_check_drug_test_status_not_current():
    """Test drug test status check when not current."""
    # Setup
    driver = Driver("D001", "John", "Doe", "DL123456789")
    driver.drug_test_current = False
    
    # Exercise
    result = driver.check_drug_test_status()
    
    # Verify
    assert result == False
    
    # Teardown
    driver = None


# ============================================================================
# DRIVER CERTIFICATIONS TESTS
# ============================================================================

def test_check_certifications_with_certifications():
    """Test certification check when certifications exist."""
    # Setup
    driver = Driver("D001", "John", "Doe", "DL123456789")
    driver.certifications = ["CDL Class A", "Hazmat"]
    
    # Exercise
    result = driver.check_certifications()
    
    # Verify
    assert result == True
    
    # Teardown
    driver = None


def test_check_certifications_no_certifications():
    """Test certification check when no certifications exist."""
    # Setup
    driver = Driver("D001", "John", "Doe", "DL123456789")
    driver.certifications = []
    driver.certifications_list_strings = []
    
    # Exercise
    result = driver.check_certifications()
    
    # Verify
    assert result == False
    
    # Teardown
    driver = None


def test_update_certifications():
    """Test updating certifications list."""
    # Setup
    driver = Driver("D001", "John", "Doe", "DL123456789")
    cert_list = ["CDL Class A", "Hazmat", "Defensive Driving"]
    
    # Exercise
    driver.update_certifications(cert_list)
    
    # Verify
    assert driver.certifications == cert_list
    assert driver.certifications_list_strings == cert_list
    
    # Teardown
    driver = None


def test_add_certification_new():
    """Test adding a new certification."""
    # Setup
    driver = Driver("D001", "John", "Doe", "DL123456789")
    driver.certifications = ["CDL Class A"]
    driver.certifications_list_strings = ["CDL Class A"]
    new_cert = "Hazmat"
    
    # Exercise
    driver.add_certification(new_cert)
    
    # Verify
    assert new_cert in driver.certifications
    assert new_cert in driver.certifications_list_strings
    
    # Teardown
    driver = None


def test_add_certification_duplicate():
    """Test adding a duplicate certification."""
    # Setup
    driver = Driver("D001", "John", "Doe", "DL123456789")
    existing_cert = "CDL Class A"
    driver.certifications = [existing_cert]
    driver.certifications_list_strings = [existing_cert]
    initial_count = len(driver.certifications)
    
    # Exercise
    driver.add_certification(existing_cert)
    
    # Verify
    assert len(driver.certifications) == initial_count  # Should not add duplicate
    
    # Teardown
    driver = None


# ============================================================================
# DRIVER ELIGIBILITY TESTS
# ============================================================================

def test_check_driving_eligibility_all_valid():
    """Test driving eligibility when all requirements are met."""
    # Setup
    driver = Driver("D001", "John", "Doe", "DL123456789")
    driver.license_expiry = date(2025, 12, 31)
    driver.medical_cert_current = True
    driver.drug_test_current = True
    driver.background_check_valid = True
    driver.is_available = True
    
    # Exercise
    result = driver.check_driving_eligibility()
    
    # Verify
    assert result == True
    
    # Teardown
    driver = None


def test_check_driving_eligibility_missing_license():
    """Test driving eligibility when license is invalid."""
    # Setup
    driver = Driver("D001", "John", "Doe", "DL123456789")
    driver.license_expiry = None  # Invalid license
    driver.medical_cert_current = True
    driver.drug_test_current = True
    driver.background_check_valid = True
    driver.is_available = True
    
    # Exercise
    result = driver.check_driving_eligibility()
    
    # Verify
    assert result == False
    
    # Teardown
    driver = None


def test_check_driving_eligibility_not_available():
    """Test driving eligibility when driver is not available."""
    # Setup
    driver = Driver("D001", "John", "Doe", "DL123456789")
    driver.license_expiry = date(2025, 12, 31)
    driver.medical_cert_current = True
    driver.drug_test_current = True
    driver.background_check_valid = True
    driver.is_available = False
    
    # Exercise
    result = driver.check_driving_eligibility()
    
    # Verify
    assert result == False
    
    # Teardown
    driver = None


def test_check_work_eligibility():
    """Test work eligibility (alternative method)."""
    # Setup
    driver = Driver("D001", "John", "Doe", "DL123456789")
    driver.license_expiry = date(2025, 12, 31)
    driver.medical_cert_current = True
    driver.drug_test_current = True
    driver.background_check_valid = True
    driver.is_available = True
    
    # Exercise
    result = driver.check_work_eligibility()
    
    # Verify
    assert result == True  # Should be same as check_driving_eligibility
    
    # Teardown
    driver = None


# ============================================================================
# DRIVER HOURS LOGGING TESTS
# ============================================================================

def test_log_driving_hours_valid():
    """Test logging valid driving hours."""
    # Setup
    driver = Driver("D001", "John", "Doe", "DL123456789")
    hours = 8.5
    
    # Exercise
    result = driver.log_driving_hours(hours)
    
    # Verify
    assert result == True
    assert driver.hours_worked_today == hours
    
    # Teardown
    driver = None


def test_log_driving_hours_exceeds_limit():
    """Test logging hours that exceed daily limit."""
    # Setup
    driver = Driver("D001", "John", "Doe", "DL123456789")
    driver.hours_worked_today = 10.0
    additional_hours = 2.0  # Would total 12 hours, exceeding 11-hour limit
    
    # Exercise
    result = driver.log_driving_hours(additional_hours)
    
    # Verify
    assert result == False
    assert driver.hours_worked_today == 12.0  # Hours still logged
    
    # Teardown
    driver = None


def test_log_driving_hours_zero():
    """Test logging zero hours."""
    # Setup
    driver = Driver("D001", "John", "Doe", "DL123456789")
    hours = 0.0
    
    # Exercise
    result = driver.log_driving_hours(hours)
    
    # Verify
    assert result == True
    assert driver.hours_worked_today == hours
    
    # Teardown
    driver = None


def test_log_driving_hours_negative():
    """Test logging negative hours."""
    # Setup
    driver = Driver("D001", "John", "Doe", "DL123456789")
    hours = -2.0
    
    # Exercise
    result = driver.log_driving_hours(hours)
    
    # Verify
    assert result == False
    assert driver.hours_worked_today == 0.0  # Should remain unchanged
    
    # Teardown
    driver = None


def test_log_driving_hours_multiple_entries():
    """Test logging multiple hour entries."""
    # Setup
    driver = Driver("D001", "John", "Doe", "DL123456789")
    
    # Exercise
    result1 = driver.log_driving_hours(4.0)
    result2 = driver.log_driving_hours(3.5)
    result3 = driver.log_driving_hours(2.0)
    
    # Verify
    assert result1 == True
    assert result2 == True
    assert result3 == True
    assert driver.hours_worked_today == 9.5
    
    # Teardown
    driver = None


@patch('driver.datetime')
def test_take_rest_period(mock_datetime):
    """Test taking a rest period."""
    # Setup
    mock_datetime.now.return_value.date.return_value = date(2024, 1, 1)
    driver = Driver("D001", "John", "Doe", "DL123456789")
    driver.hours_worked_today = 10.0
    
    # Exercise
    driver.take_rest_period()
    
    # Verify
    assert driver.last_rest_period == date(2024, 1, 1)
    assert driver.hours_worked_today == 0.0
    
    # Teardown
    driver = None


# ============================================================================
# DRIVER REPORTS TESTS
# ============================================================================

def test_submit_driver_reports():
    """Test submitting driver reports."""
    # Setup
    driver = Driver("D001", "John", "Doe", "DL123456789")
    driver.driver_reports_ready = False
    
    # Exercise
    result = driver.submit_driver_reports()
    
    # Verify
    assert result == True
    assert driver.driver_reports_ready == True
    
    # Teardown
    driver = None


# ============================================================================
# DRIVER PERSONAL NEEDS TESTS
# ============================================================================

def test_check_personal_needs_no_needs():
    """Test checking personal needs when no needs exist."""
    # Setup
    driver = Driver("D001", "John", "Doe", "DL123456789")
    driver.has_personal_needs = False
    
    # Exercise
    result = driver.check_personal_needs()
    
    # Verify
    assert result == True
    
    # Teardown
    driver = None


def test_check_personal_needs_has_needs():
    """Test checking personal needs when needs exist."""
    # Setup
    driver = Driver("D001", "John", "Doe", "DL123456789")
    driver.has_personal_needs = True
    
    # Exercise
    result = driver.check_personal_needs()
    
    # Verify
    assert result == False
    
    # Teardown
    driver = None


def test_address_personal_needs():
    """Test addressing personal needs."""
    # Setup
    driver = Driver("D001", "John", "Doe", "DL123456789")
    driver.has_personal_needs = True
    
    # Exercise
    driver.address_personal_needs()
    
    # Verify
    assert driver.has_personal_needs == False
    
    # Teardown
    driver = None


def test_resolve_personal_needs():
    """Test resolving personal needs (alternative method)."""
    # Setup
    driver = Driver("D001", "John", "Doe", "DL123456789")
    driver.has_personal_needs = True
    
    # Exercise
    driver.resolve_personal_needs()
    
    # Verify
    assert driver.has_personal_needs == False
    
    # Teardown
    driver = None


# ============================================================================
# DRIVER LOCATION TESTS
# ============================================================================

def test_update_location_success():
    """Test successful location update."""
    # Setup
    driver = Driver("D001", "John", "Doe", "DL123456789")
    new_location = "Customer Site A"
    old_location = driver.current_location
    
    # Exercise
    driver.update_location(new_location)
    
    # Verify
    assert driver.current_location == new_location
    assert driver.current_location != old_location
    
    # Teardown
    driver = None


def test_update_location_empty_string():
    """Test location update with empty string."""
    # Setup
    driver = Driver("D001", "John", "Doe", "DL123456789")
    new_location = ""
    
    # Exercise
    driver.update_location(new_location)
    
    # Verify
    assert driver.current_location == new_location
    
    # Teardown
    driver = None


def test_update_location_same_location():
    """Test location update to same location."""
    # Setup
    driver = Driver("D001", "John", "Doe", "DL123456789")
    driver.current_location = "Home Base"
    same_location = "Home Base"
    
    # Exercise
    driver.update_location(same_location)
    
    # Verify
    assert driver.current_location == same_location
    
    # Teardown
    driver = None


# ============================================================================
# DRIVER DISTANCE CALCULATION TESTS
# ============================================================================

def test_calculate_distance_to_with_location():
    """Test distance calculation when driver has a location."""
    # Setup
    driver = Driver("D001", "John", "Doe", "DL123456789")
    driver.current_location = "Home Base"
    destination = "Customer Site A"
    
    # Exercise
    distance = driver.calculate_distance_to(destination)
    
    # Verify
    assert isinstance(distance, float)
    assert distance == 50.0  # Placeholder implementation returns 50.0
    
    # Teardown
    driver = None


def test_calculate_distance_to_no_location():
    """Test distance calculation when driver has no location."""
    # Setup
    driver = Driver("D001", "John", "Doe", "DL123456789")
    driver.current_location = ""
    destination = "Customer Site A"
    
    # Exercise
    distance = driver.calculate_distance_to(destination)
    
    # Verify
    assert distance == 0.0
    
    # Teardown
    driver = None


def test_calculate_distance_to_empty_destination():
    """Test distance calculation to empty destination."""
    # Setup
    driver = Driver("D001", "John", "Doe", "DL123456789")
    driver.current_location = "Home Base"
    destination = ""
    
    # Exercise
    distance = driver.calculate_distance_to(destination)
    
    # Verify
    assert isinstance(distance, float)
    assert distance == 50.0  # Placeholder implementation
    
    # Teardown
    driver = None


# ============================================================================
# DRIVER STATUS TESTS
# ============================================================================

def test_get_driver_status_basic():
    """Test getting basic driver status."""
    # Setup
    driver = Driver("D001", "John", "Doe", "DL123456789")
    
    # Exercise
    status = driver.get_driver_status()
    
    # Verify
    assert isinstance(status, dict)
    assert status['driver_id'] == driver.driver_id
    assert status['full_name'] == "John Doe"
    assert status['assigned_truck_id'] == ""
    assert status['is_available'] == True
    assert status['current_location'] == ""
    assert status['hours_worked_today'] == 0.0
    assert status['license_valid'] == False  # No expiry set
    assert status['medical_cert_current'] == False
    assert status['drug_test_current'] == False
    assert status['background_check_valid'] == False
    assert status['driving_eligible'] == False
    assert status['reports_ready'] == False
    assert status['personal_needs_addressed'] == True
    
    # Teardown
    driver = None


def test_get_driver_status_assigned():
    """Test getting driver status when assigned to truck."""
    # Setup
    driver = Driver("D001", "John", "Doe", "DL123456789")
    driver.assigned_truck_id = "T001"
    driver.is_available = False
    driver.hours_worked_today = 8.5
    
    # Exercise
    status = driver.get_driver_status()
    
    # Verify
    assert status['assigned_truck_id'] == "T001"
    assert status['is_available'] == False
    assert status['hours_worked_today'] == 8.5
    
    # Teardown
    driver = None


# ============================================================================
# DRIVER COMPLIANCE REPORT TESTS
# ============================================================================

def test_get_compliance_report_basic():
    """Test getting basic compliance report."""
    # Setup
    driver = Driver("D001", "John", "Doe", "DL123456789")
    
    # Exercise
    report = driver.get_compliance_report()
    
    # Verify
    assert isinstance(report, dict)
    assert report['driver_id'] == driver.driver_id
    assert report['license_number'] == driver.license_number
    assert report['license_expiry'] is None
    assert report['medical_cert_current'] == False
    assert report['drug_test_current'] == False
    assert report['background_check_valid'] == False
    assert report['certifications'] == []
    assert report['hours_compliance'] == True  # 0 hours <= 11
    assert report['overall_compliance'] == False
    
    # Teardown
    driver = None


def test_get_compliance_report_compliant():
    """Test compliance report when driver is compliant."""
    # Setup
    driver = Driver("D001", "John", "Doe", "DL123456789")
    driver.license_expiry = date(2025, 12, 31)
    driver.medical_cert_current = True
    driver.drug_test_current = True
    driver.background_check_valid = True
    driver.certifications = ["CDL Class A", "Hazmat"]
    driver.hours_worked_today = 9.0
    
    # Exercise
    report = driver.get_compliance_report()
    
    # Verify
    assert report['medical_cert_current'] == True
    assert report['drug_test_current'] == True
    assert report['background_check_valid'] == True
    assert report['certifications'] == ["CDL Class A", "Hazmat"]
    assert report['hours_compliance'] == True
    assert report['overall_compliance'] == True
    
    # Teardown
    driver = None


def test_get_compliance_report_hours_violation():
    """Test compliance report when hours limit is exceeded."""
    # Setup
    driver = Driver("D001", "John", "Doe", "DL123456789")
    driver.hours_worked_today = 12.0  # Exceeds 11-hour limit
    
    # Exercise
    report = driver.get_compliance_report()
    
    # Verify
    assert report['hours_compliance'] == False
    assert report['overall_compliance'] == False
    
    # Teardown
    driver = None


# ============================================================================
# DRIVER STRING REPRESENTATIONS TESTS
# ============================================================================

def test_str_representation_unassigned():
    """Test string representation when unassigned."""
    # Setup
    driver = Driver("D001", "John", "Doe", "DL123456789")
    
    # Exercise
    str_repr = str(driver)
    
    # Verify
    assert isinstance(str_repr, str)
    assert driver.driver_id in str_repr
    assert driver.first_name in str_repr
    assert driver.last_name in str_repr
    assert "Available" in str_repr
    assert "(Unassigned)" in str_repr
    
    # Teardown
    driver = None


def test_str_representation_assigned():
    """Test string representation when assigned to truck."""
    # Setup
    driver = Driver("D001", "John", "Doe", "DL123456789")
    driver.assigned_truck_id = "T001"
    driver.is_available = False
    
    # Exercise
    str_repr = str(driver)
    
    # Verify
    assert isinstance(str_repr, str)
    assert driver.driver_id in str_repr
    assert driver.first_name in str_repr
    assert driver.last_name in str_repr
    assert "Unavailable" in str_repr
    assert "(Assigned to T001)" in str_repr
    
    # Teardown
    driver = None


def test_repr_representation():
    """Test repr representation of driver."""
    # Setup
    driver = Driver("D001", "John", "Doe", "DL123456789")
    
    # Exercise
    repr_str = repr(driver)
    
    # Verify
    assert isinstance(repr_str, str)
    assert "Driver" in repr_str
    assert driver.driver_id in repr_str
    assert driver.first_name in repr_str
    assert driver.last_name in repr_str
    assert driver.license_number in repr_str
    
    # Teardown
    driver = None


# ============================================================================
# DRIVER EDGE CASES AND ERROR HANDLING TESTS
# ============================================================================

def test_log_driving_hours_exact_limit():
    """Test logging hours that exactly meet the daily limit."""
    # Setup
    driver = Driver("D001", "John", "Doe", "DL123456789")
    hours = 11.0  # Exactly at the limit
    
    # Exercise
    result = driver.log_driving_hours(hours)
    
    # Verify
    assert result == True
    assert driver.hours_worked_today == 11.0
    
    # Teardown
    driver = None


def test_log_driving_hours_fractional():
    """Test logging fractional hours."""
    # Setup
    driver = Driver("D001", "John", "Doe", "DL123456789")
    hours = 7.25
    
    # Exercise
    result = driver.log_driving_hours(hours)
    
    # Verify
    assert result == True
    assert driver.hours_worked_today == 7.25
    
    # Teardown
    driver = None


def test_certifications_list_sync():
    """Test that both certification lists stay in sync."""
    # Setup
    driver = Driver("D001", "John", "Doe", "DL123456789")
    cert_list = ["CDL Class A", "Hazmat"]
    
    # Exercise
    driver.update_certifications(cert_list)
    driver.add_certification("Defensive Driving")
    
    # Verify
    assert driver.certifications == driver.certifications_list_strings
    assert "Defensive Driving" in driver.certifications
    assert "Defensive Driving" in driver.certifications_list_strings
    
    # Teardown
    driver = None


def test_assign_to_empty_truck_id():
    """Test assignment with empty truck ID."""
    # Setup
    driver = Driver("D001", "John", "Doe", "DL123456789")
    driver.license_expiry = date(2025, 12, 31)
    driver.medical_cert_current = True
    driver.drug_test_current = True
    driver.background_check_valid = True
    
    # Exercise
    result = driver.assign_to_truck("")
    
    # Verify
    assert result == True  # Method doesn't validate truck_id
    assert driver.assigned_truck_id == ""
    
    # Teardown
    driver = None


if __name__ == '__main__':
    # Run tests using pytest if available, otherwise basic assertions
    import pytest
    pytest.main([__file__, '-v']) 