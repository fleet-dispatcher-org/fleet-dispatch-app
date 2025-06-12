import unittest
import sys
import os
from unittest.mock import Mock, patch
from datetime import datetime, date


# Add the project root directory to the Python path
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))  # Relative path

from trailer import Trailer

def create_mock_truck():
    """Helper function to create a mock truck object."""
    mock_truck = Mock()
    mock_truck.truck_id = "T001"
    mock_truck.make = "Volvo"
    mock_truck.model = "VNL"
    mock_truck.year = 2023
    mock_truck.is_drivable = True
    mock_truck.attached_trailer_id = ""
    mock_truck.attach_trailer.return_value = True
    mock_truck.detach_trailer.return_value = True
    return mock_truck


# ============================================================================
# TRAILER INITIALIZATION TESTS
# ============================================================================

def test_trailer_initialization_valid_parameters():
    """Test trailer initialization with valid parameters."""
    # Setup
    trailer_id = "TR123"
    make = "Great Dane"
    model = "Dry Van"
    year = 2023
    
    # Exercise
    trailer = Trailer(trailer_id, make, model, year)
    
    # Verify
    assert trailer.trailer_id == trailer_id
    assert trailer.make == make
    assert trailer.model == model
    assert trailer.year == year
    assert trailer.attached_truck_id == ""
    assert trailer.location == ""
    assert trailer.is_working_condition == True
    assert trailer.has_registration == False
    assert trailer.bureaucratically_sound == True
    assert trailer.is_currently_working == False
    assert trailer.in_range_first_step == False
    assert trailer.max_cargo_capacity == 0.0
    assert trailer.current_cargo_weight == 0.0
    assert trailer.registration_expiry is None
    assert trailer.last_inspection is None
    assert trailer.next_inspection_due is None
    assert trailer.insurance_carrier == ""
    assert trailer.insurance_valid == False
    
    # Teardown
    trailer = None


def test_trailer_initialization_empty_strings():
    """Test trailer initialization with empty strings."""
    # Setup & Exercise
    trailer = Trailer("", "", "", 0)
    
    # Verify
    assert trailer.trailer_id == ""
    assert trailer.make == ""
    assert trailer.model == ""
    assert trailer.year == 0
    
    # Teardown
    trailer = None


# ============================================================================
# TRAILER ATTACHMENT TESTS
# ============================================================================

def test_attach_to_truck_success():
    """Test successful attachment to truck."""
    # Setup
    trailer = Trailer("TR001", "Great Dane", "Dry Van", 2023)
    truck_id = "T001"
    
    # Exercise
    result = trailer.attach_to_truck(truck_id)
    
    # Verify
    assert result == True
    assert trailer.attached_truck_id == truck_id
    assert trailer.is_currently_working == True
    
    # Teardown
    trailer = None


def test_attach_to_truck_already_attached():
    """Test attachment when trailer is already attached."""
    # Setup
    trailer = Trailer("TR001", "Great Dane", "Dry Van", 2023)
    trailer.attached_truck_id = "T999"
    
    # Exercise
    result = trailer.attach_to_truck("T001")
    
    # Verify
    assert result == False
    assert trailer.attached_truck_id == "T999"  # Should remain unchanged
    
    # Teardown
    trailer = None


def test_attach_to_truck_not_working_condition():
    """Test attachment when trailer is not in working condition."""
    # Setup
    trailer = Trailer("TR001", "Great Dane", "Dry Van", 2023)
    trailer.is_working_condition = False
    
    # Exercise
    result = trailer.attach_to_truck("T001")
    
    # Verify
    assert result == False
    assert trailer.attached_truck_id == ""
    assert trailer.is_currently_working == False
    
    # Teardown
    trailer = None


def test_detach_from_truck_success():
    """Test successful detachment from truck."""
    # Setup
    trailer = Trailer("TR001", "Great Dane", "Dry Van", 2023)
    trailer.attached_truck_id = "T001"
    trailer.is_currently_working = True
    
    # Exercise
    result = trailer.detach_from_truck()
    
    # Verify
    assert result == True
    assert trailer.attached_truck_id == ""
    assert trailer.is_currently_working == False
    
    # Teardown
    trailer = None


def test_detach_from_truck_not_attached():
    """Test detachment when trailer is not attached."""
    # Setup
    trailer = Trailer("TR001", "Great Dane", "Dry Van", 2023)
    
    # Exercise
    result = trailer.detach_from_truck()
    
    # Verify
    assert result == False
    assert trailer.attached_truck_id == ""
    
    # Teardown
    trailer = None


# ============================================================================
# TRAILER WORKING CONDITION TESTS
# ============================================================================

def test_set_working_condition_true():
    """Test setting working condition to True."""
    # Setup
    trailer = Trailer("TR001", "Great Dane", "Dry Van", 2023)
    trailer.is_working_condition = False
    
    # Exercise
    trailer.set_working_condition(True)
    
    # Verify
    assert trailer.is_working_condition == True
    
    # Teardown
    trailer = None


def test_set_working_condition_false():
    """Test setting working condition to False."""
    # Setup
    trailer = Trailer("TR001", "Great Dane", "Dry Van", 2023)
    trailer.is_working_condition = True
    
    # Exercise
    trailer.set_working_condition(False)
    
    # Verify
    assert trailer.is_working_condition == False
    
    # Teardown
    trailer = None


def test_set_working_condition_false_detaches_from_truck():
    """Test setting working condition to False detaches from truck."""
    # Setup
    trailer = Trailer("TR001", "Great Dane", "Dry Van", 2023)
    trailer.attached_truck_id = "T001"
    trailer.is_currently_working = True
    
    # Exercise
    trailer.set_working_condition(False)
    
    # Verify
    assert trailer.is_working_condition == False
    assert trailer.attached_truck_id == ""
    assert trailer.is_currently_working == False
    
    # Teardown
    trailer = None


# ============================================================================
# TRAILER BUREAUCRATIC STATUS TESTS
# ============================================================================

def test_check_bureaucratic_status_all_valid():
    """Test bureaucratic status check when all requirements are met."""
    # Setup
    trailer = Trailer("TR001", "Great Dane", "Dry Van", 2023)
    trailer.has_registration = True
    trailer.insurance_valid = True
    
    # Exercise
    result = trailer.check_bureaucratic_status()
    
    # Verify
    assert result == True
    assert trailer.bureaucratically_sound == True
    
    # Teardown
    trailer = None


def test_check_bureaucratic_status_no_registration():
    """Test bureaucratic status check when registration is missing."""
    # Setup
    trailer = Trailer("TR001", "Great Dane", "Dry Van", 2023)
    trailer.has_registration = False
    trailer.insurance_valid = True
    
    # Exercise
    result = trailer.check_bureaucratic_status()
    
    # Verify
    assert result == False
    assert trailer.bureaucratically_sound == False
    
    # Teardown
    trailer = None


def test_check_bureaucratic_status_no_insurance():
    """Test bureaucratic status check when insurance is invalid."""
    # Setup
    trailer = Trailer("TR001", "Great Dane", "Dry Van", 2023)
    trailer.has_registration = True
    trailer.insurance_valid = False
    
    # Exercise
    result = trailer.check_bureaucratic_status()
    
    # Verify
    assert result == False
    assert trailer.bureaucratically_sound == False
    
    # Teardown
    trailer = None


def test_check_bureaucratic_status_all_invalid():
    """Test bureaucratic status check when all requirements are missing."""
    # Setup
    trailer = Trailer("TR001", "Great Dane", "Dry Van", 2023)
    trailer.has_registration = False
    trailer.insurance_valid = False
    
    # Exercise
    result = trailer.check_bureaucratic_status()
    
    # Verify
    assert result == False
    assert trailer.bureaucratically_sound == False
    
    # Teardown
    trailer = None


# ============================================================================
# TRAILER EQUIPMENT CONDITION TESTS
# ============================================================================

def test_verify_equipment_condition_working():
    """Test equipment condition verification when trailer is working."""
    # Setup
    trailer = Trailer("TR001", "Great Dane", "Dry Van", 2023)
    trailer.is_working_condition = True
    
    # Exercise
    result = trailer.verify_equipment_condition()
    
    # Verify
    assert result == True
    
    # Teardown
    trailer = None


def test_verify_equipment_condition_not_working():
    """Test equipment condition verification when trailer is not working."""
    # Setup
    trailer = Trailer("TR001", "Great Dane", "Dry Van", 2023)
    trailer.is_working_condition = False
    
    # Exercise
    result = trailer.verify_equipment_condition()
    
    # Verify
    assert result == False
    
    # Teardown
    trailer = None


# ============================================================================
# TRAILER RANGE TESTS
# ============================================================================

def test_check_in_range_to_first_step_with_location():
    """Test range check when trailer has a location."""
    # Setup
    trailer = Trailer("TR001", "Great Dane", "Dry Van", 2023)
    trailer.location = "Depot A"
    destination = "Customer Site B"
    
    # Exercise
    result = trailer.check_in_range_to_first_step(destination)
    
    # Verify
    assert result == True
    assert trailer.in_range_first_step == True
    
    # Teardown
    trailer = None


def test_check_in_range_to_first_step_no_location():
    """Test range check when trailer has no location."""
    # Setup
    trailer = Trailer("TR001", "Great Dane", "Dry Van", 2023)
    trailer.location = ""
    destination = "Customer Site B"
    
    # Exercise
    result = trailer.check_in_range_to_first_step(destination)
    
    # Verify
    assert result == False
    
    # Teardown
    trailer = None


def test_check_in_range_to_first_step_empty_destination():
    """Test range check with empty destination."""
    # Setup
    trailer = Trailer("TR001", "Great Dane", "Dry Van", 2023)
    trailer.location = "Depot A"
    destination = ""
    
    # Exercise
    result = trailer.check_in_range_to_first_step(destination)
    
    # Verify
    assert result == True  # Method assumes in range for now
    
    # Teardown
    trailer = None


# ============================================================================
# TRAILER LOCATION TESTS
# ============================================================================

def test_update_location_success():
    """Test successful location update."""
    # Setup
    trailer = Trailer("TR001", "Great Dane", "Dry Van", 2023)
    new_location = "New Depot"
    old_location = trailer.location
    
    # Exercise
    trailer.update_location(new_location)
    
    # Verify
    assert trailer.location == new_location
    assert trailer.location != old_location
    
    # Teardown
    trailer = None


def test_update_location_empty_string():
    """Test location update with empty string."""
    # Setup
    trailer = Trailer("TR001", "Great Dane", "Dry Van", 2023)
    new_location = ""
    
    # Exercise
    trailer.update_location(new_location)
    
    # Verify
    assert trailer.location == new_location
    
    # Teardown
    trailer = None


def test_update_location_same_location():
    """Test location update to same location."""
    # Setup
    trailer = Trailer("TR001", "Great Dane", "Dry Van", 2023)
    trailer.location = "Depot A"
    same_location = "Depot A"
    
    # Exercise
    trailer.update_location(same_location)
    
    # Verify
    assert trailer.location == same_location
    
    # Teardown
    trailer = None


# ============================================================================
# TRAILER CARGO OPERATIONS TESTS
# ============================================================================

def test_load_cargo_success():
    """Test successful cargo loading."""
    # Setup
    trailer = Trailer("TR001", "Great Dane", "Dry Van", 2023)
    trailer.max_cargo_capacity = 1000.0
    weight = 500.0
    cargo_type = "Electronics"
    
    # Exercise
    result = trailer.load_cargo(weight, cargo_type)
    
    # Verify
    assert result == True
    assert trailer.current_cargo_weight == weight
    
    # Teardown
    trailer = None


def test_load_cargo_exceeds_capacity():
    """Test cargo loading that exceeds capacity."""
    # Setup
    trailer = Trailer("TR001", "Great Dane", "Dry Van", 2023)
    trailer.max_cargo_capacity = 1000.0
    weight = 1500.0
    
    # Exercise
    result = trailer.load_cargo(weight)
    
    # Verify
    assert result == False
    assert trailer.current_cargo_weight == 0.0
    
    # Teardown
    trailer = None


def test_load_cargo_multiple_loads():
    """Test multiple cargo loads within capacity."""
    # Setup
    trailer = Trailer("TR001", "Great Dane", "Dry Van", 2023)
    trailer.max_cargo_capacity = 1000.0
    
    # Exercise
    result1 = trailer.load_cargo(400.0, "Electronics")
    result2 = trailer.load_cargo(300.0, "Furniture")
    
    # Verify
    assert result1 == True
    assert result2 == True
    assert trailer.current_cargo_weight == 700.0
    
    # Teardown
    trailer = None


def test_load_cargo_zero_weight():
    """Test cargo loading with zero weight."""
    # Setup
    trailer = Trailer("TR001", "Great Dane", "Dry Van", 2023)
    trailer.max_cargo_capacity = 1000.0
    weight = 0.0
    
    # Exercise
    result = trailer.load_cargo(weight)
    
    # Verify
    assert result == False
    assert trailer.current_cargo_weight == 0.0
    
    # Teardown
    trailer = None


def test_load_cargo_negative_weight():
    """Test cargo loading with negative weight."""
    # Setup
    trailer = Trailer("TR001", "Great Dane", "Dry Van", 2023)
    trailer.max_cargo_capacity = 1000.0
    weight = -100.0
    
    # Exercise
    result = trailer.load_cargo(weight)
    
    # Verify
    assert result == False
    assert trailer.current_cargo_weight == 0.0
    
    # Teardown
    trailer = None


def test_load_cargo_partial_capacity_then_exceed():
    """Test loading cargo that would exceed remaining capacity."""
    # Setup
    trailer = Trailer("TR001", "Great Dane", "Dry Van", 2023)
    trailer.max_cargo_capacity = 1000.0
    trailer.current_cargo_weight = 800.0
    
    # Exercise
    result = trailer.load_cargo(300.0)  # Would exceed by 100
    
    # Verify
    assert result == False
    assert trailer.current_cargo_weight == 800.0  # Should remain unchanged
    
    # Teardown
    trailer = None


def test_unload_cargo_with_cargo():
    """Test cargo unloading when cargo is present."""
    # Setup
    trailer = Trailer("TR001", "Great Dane", "Dry Van", 2023)
    trailer.current_cargo_weight = 500.0
    
    # Exercise
    trailer.unload_cargo()
    
    # Verify
    assert trailer.current_cargo_weight == 0.0
    
    # Teardown
    trailer = None


def test_unload_cargo_empty():
    """Test cargo unloading when no cargo is present."""
    # Setup
    trailer = Trailer("TR001", "Great Dane", "Dry Van", 2023)
    trailer.current_cargo_weight = 0.0
    
    # Exercise
    trailer.unload_cargo()
    
    # Verify
    assert trailer.current_cargo_weight == 0.0
    
    # Teardown
    trailer = None


# ============================================================================
# TRAILER REGISTRATION TESTS
# ============================================================================

def test_renew_registration():
    """Test registration renewal."""
    # Setup
    trailer = Trailer("TR001", "Great Dane", "Dry Van", 2023)
    new_expiry = date(2025, 12, 31)
    
    # Exercise
    trailer.renew_registration(new_expiry)
    
    # Verify
    assert trailer.has_registration == True
    assert trailer.registration_expiry == new_expiry
    
    # Teardown
    trailer = None


def test_renew_registration_string_date():
    """Test registration renewal with string date."""
    # Setup
    trailer = Trailer("TR001", "Great Dane", "Dry Van", 2023)
    new_expiry = "2025-12-31"
    
    # Exercise
    trailer.renew_registration(new_expiry)
    
    # Verify
    assert trailer.has_registration == True
    assert trailer.registration_expiry == new_expiry
    
    # Teardown
    trailer = None


def test_renew_registration_none_date():
    """Test registration renewal with None date."""
    # Setup
    trailer = Trailer("TR001", "Great Dane", "Dry Van", 2023)
    new_expiry = None
    
    # Exercise
    trailer.renew_registration(new_expiry)
    
    # Verify
    assert trailer.has_registration == True
    assert trailer.registration_expiry == new_expiry
    
    # Teardown
    trailer = None


# ============================================================================
# TRAILER STATUS TESTS
# ============================================================================

def test_get_trailer_status_basic():
    """Test getting basic trailer status."""
    # Setup
    trailer = Trailer("TR001", "Great Dane", "Dry Van", 2023)
    
    # Exercise
    status = trailer.get_trailer_status()
    
    # Verify
    assert isinstance(status, dict)
    assert status['trailer_id'] == trailer.trailer_id
    assert status['attached_truck_id'] == ""
    assert status['is_attached'] == False
    assert status['location'] == ""
    assert status['is_working_condition'] == True
    assert status['bureaucratically_sound'] == True
    assert status['is_currently_working'] == False
    assert status['cargo_utilization'] == "0.0/0.0"
    assert status['cargo_percentage'] == 0
    
    # Teardown
    trailer = None


def test_get_trailer_status_with_cargo():
    """Test getting trailer status with cargo loaded."""
    # Setup
    trailer = Trailer("TR001", "Great Dane", "Dry Van", 2023)
    trailer.max_cargo_capacity = 1000.0
    trailer.current_cargo_weight = 500.0
    
    # Exercise
    status = trailer.get_trailer_status()
    
    # Verify
    assert status['cargo_utilization'] == "500.0/1000.0"
    assert status['cargo_percentage'] == 50.0
    
    # Teardown
    trailer = None


def test_get_trailer_status_attached():
    """Test getting trailer status when attached to truck."""
    # Setup
    trailer = Trailer("TR001", "Great Dane", "Dry Van", 2023)
    trailer.attached_truck_id = "T001"
    trailer.is_currently_working = True
    
    # Exercise
    status = trailer.get_trailer_status()
    
    # Verify
    assert status['attached_truck_id'] == "T001"
    assert status['is_attached'] == True
    assert status['is_currently_working'] == True
    
    # Teardown
    trailer = None


# ============================================================================
# TRAILER MAINTENANCE TESTS
# ============================================================================

def test_schedule_maintenance():
    """Test maintenance scheduling."""
    # Setup
    trailer = Trailer("TR001", "Great Dane", "Dry Van", 2023)
    
    # Exercise
    trailer.schedule_maintenance()
    
    # Verify - just verify it doesn't crash (method just prints)
    # This is a placeholder implementation
    
    # Teardown
    trailer = None


# ============================================================================
# TRAILER DISTANCE CALCULATION TESTS
# ============================================================================

def test_calculate_distance_to():
    """Test distance calculation to destination."""
    # Setup
    trailer = Trailer("TR001", "Great Dane", "Dry Van", 2023)
    trailer.location = "Depot A"
    destination = "Customer Site B"
    
    # Exercise
    distance = trailer.calculate_distance_to(destination)
    
    # Verify
    assert isinstance(distance, float)
    assert distance == 100.0  # Placeholder implementation returns 100.0
    
    # Teardown
    trailer = None


def test_calculate_distance_to_empty_destination():
    """Test distance calculation to empty destination."""
    # Setup
    trailer = Trailer("TR001", "Great Dane", "Dry Van", 2023)
    trailer.location = "Depot A"
    destination = ""
    
    # Exercise
    distance = trailer.calculate_distance_to(destination)
    
    # Verify
    assert isinstance(distance, float)
    assert distance == 100.0  # Placeholder implementation
    
    # Teardown
    trailer = None


# ============================================================================
# TRAILER COMPLIANCE REPORT TESTS
# ============================================================================

def test_get_compliance_report_basic():
    """Test getting basic compliance report."""
    # Setup
    trailer = Trailer("TR001", "Great Dane", "Dry Van", 2023)
    
    # Exercise
    report = trailer.get_compliance_report()
    
    # Verify
    assert isinstance(report, dict)
    assert report['trailer_id'] == trailer.trailer_id
    assert report['has_registration'] == False
    assert report['registration_expiry'] is None
    assert report['insurance_valid'] == False
    assert report['insurance_carrier'] == ""
    assert report['last_inspection'] is None
    assert report['next_inspection_due'] is None
    assert report['bureaucratically_sound'] == True  # Initial value
    assert 'overall_compliance' in report
    
    # Teardown
    trailer = None


def test_get_compliance_report_with_registration():
    """Test compliance report with registration."""
    # Setup
    trailer = Trailer("TR001", "Great Dane", "Dry Van", 2023)
    trailer.has_registration = True
    trailer.registration_expiry = date(2025, 12, 31)
    trailer.insurance_valid = True
    trailer.insurance_carrier = "Fleet Insurance Co."
    
    # Exercise
    report = trailer.get_compliance_report()
    
    # Verify
    assert report['has_registration'] == True
    assert report['registration_expiry'] == date(2025, 12, 31)
    assert report['insurance_valid'] == True
    assert report['insurance_carrier'] == "Fleet Insurance Co."
    assert report['overall_compliance'] == True
    
    # Teardown
    trailer = None


# ============================================================================
# TRAILER STRING REPRESENTATIONS TESTS
# ============================================================================

def test_str_representation_not_attached():
    """Test string representation when not attached."""
    # Setup
    trailer = Trailer("TR001", "Great Dane", "Dry Van", 2023)
    
    # Exercise
    str_repr = str(trailer)
    
    # Verify
    assert isinstance(str_repr, str)
    assert trailer.trailer_id in str_repr
    assert trailer.make in str_repr
    assert trailer.model in str_repr
    assert str(trailer.year) in str_repr
    assert "(Not attached)" in str_repr
    
    # Teardown
    trailer = None


def test_str_representation_attached():
    """Test string representation when attached to truck."""
    # Setup
    trailer = Trailer("TR001", "Great Dane", "Dry Van", 2023)
    trailer.attached_truck_id = "T001"
    
    # Exercise
    str_repr = str(trailer)
    
    # Verify
    assert isinstance(str_repr, str)
    assert trailer.trailer_id in str_repr
    assert trailer.make in str_repr
    assert trailer.model in str_repr
    assert str(trailer.year) in str_repr
    assert "(Attached to T001)" in str_repr
    
    # Teardown
    trailer = None


def test_repr_representation():
    """Test repr representation of trailer."""
    # Setup
    trailer = Trailer("TR001", "Great Dane", "Dry Van", 2023)
    
    # Exercise
    repr_str = repr(trailer)
    
    # Verify
    assert isinstance(repr_str, str)
    assert "Trailer" in repr_str
    assert trailer.trailer_id in repr_str
    assert trailer.make in repr_str
    assert trailer.model in repr_str
    assert str(trailer.year) in repr_str
    
    # Teardown
    trailer = None


# ============================================================================
# TRAILER EDGE CASES AND ERROR HANDLING TESTS
# ============================================================================

def test_load_cargo_exact_capacity():
    """Test loading cargo that exactly matches capacity."""
    # Setup
    trailer = Trailer("TR001", "Great Dane", "Dry Van", 2023)
    trailer.max_cargo_capacity = 1000.0
    weight = 1000.0
    
    # Exercise
    result = trailer.load_cargo(weight)
    
    # Verify
    assert result == True
    assert trailer.current_cargo_weight == 1000.0
    
    # Teardown
    trailer = None


def test_load_cargo_very_small_amount():
    """Test loading very small cargo amount."""
    # Setup
    trailer = Trailer("TR001", "Great Dane", "Dry Van", 2023)
    trailer.max_cargo_capacity = 1000.0
    weight = 0.1
    
    # Exercise
    result = trailer.load_cargo(weight)
    
    # Verify
    assert result == True
    assert trailer.current_cargo_weight == 0.1
    
    # Teardown
    trailer = None


def test_cargo_percentage_zero_capacity():
    """Test cargo percentage calculation with zero capacity."""
    # Setup
    trailer = Trailer("TR001", "Great Dane", "Dry Van", 2023)
    trailer.max_cargo_capacity = 0.0
    trailer.current_cargo_weight = 0.0
    
    # Exercise
    status = trailer.get_trailer_status()
    
    # Verify
    assert status['cargo_percentage'] == 0
    
    # Teardown
    trailer = None


def test_attach_to_empty_truck_id():
    """Test attachment with empty truck ID."""
    # Setup
    trailer = Trailer("TR001", "Great Dane", "Dry Van", 2023)
    
    # Exercise
    result = trailer.attach_to_truck("")
    
    # Verify
    assert result == True  # Method doesn't validate truck_id
    assert trailer.attached_truck_id == ""
    
    # Teardown
    trailer = None


if __name__ == '__main__':
    # Run tests using pytest if available, otherwise basic assertions
    import pytest
    pytest.main([__file__, '-v']) 