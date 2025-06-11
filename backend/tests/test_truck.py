import unittest
import sys
import os
from unittest.mock import Mock, patch
from datetime import datetime, date


# Add the project root directory to the Python path
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))  # Relative path

from truck import Truck

def create_mock_driver():
    """Helper function to create a mock driver object."""
    mock_driver = Mock()
    mock_driver.driver_id = "D001"
    mock_driver.first_name = "John"
    mock_driver.last_name = "Doe"
    mock_driver.is_available = True
    mock_driver.check_driving_eligibility.return_value = True
    mock_driver.assign_to_truck.return_value = True
    mock_driver.unassign_from_truck.return_value = True
    return mock_driver


def create_mock_trailer():
    """Helper function to create a mock trailer object."""
    mock_trailer = Mock()
    mock_trailer.trailer_id = "TR001"
    mock_trailer.year = 2021
    mock_trailer.make = "Great Dane"
    mock_trailer.model = "Dry Van"
    mock_trailer.is_working_condition = True
    mock_trailer.attached_truck_id = ""
    mock_trailer.attach_to_truck.return_value = True
    mock_trailer.detach_from_truck.return_value = True
    mock_trailer.max_cargo_capacity = 25000.0
    mock_trailer.current_cargo_weight = 0.0
    return mock_trailer


# ============================================================================
# TRUCK INITIALIZATION TESTS
# ============================================================================

def test_truck_initialization_valid_parameters():
    """Test truck initialization with valid parameters."""
    # Setup
    truck_id = "T123"
    make = "Volvo"
    model = "VNL"
    year = 2023
    
    # Exercise
    truck = Truck(truck_id, make, model, year)
    
    # Verify
    assert truck.truck_id == truck_id
    assert truck.make == make
    assert truck.model == model
    assert truck.year == year
    assert truck.is_drivable == True
    assert truck.has_registration == False
    assert truck.location == ""
    assert truck.mileage == 0
    assert truck.has_container == False
    assert truck.driver_id == ""
    assert truck.max_capacity == 0.0
    assert truck.attached_trailer_id == ""
    assert truck.assigned_driver is None
    assert truck.attached_trailer is None
    
    # Teardown
    truck = None


def test_truck_initialization_empty_strings():
    """Test truck initialization with empty strings."""
    # Setup & Exercise
    truck = Truck("", "", "", 0)
    
    # Verify
    assert truck.truck_id == ""
    assert truck.make == ""
    assert truck.model == ""
    assert truck.year == 0
    
    # Teardown
    truck = None


# ============================================================================
# TRUCK DRIVING TESTS
# ============================================================================

def test_drive_to_success():
    """Test successful drive to destination."""
    # Setup
    truck = Truck("T001", "Ford", "F-150", 2022)
    truck.driver_id = "D001"
    truck.is_drivable = True
    destination = "Warehouse B"
    
    # Exercise
    result = truck.drive_to(destination)
    
    # Verify
    assert result == True
    assert truck.location == destination
    
    # Teardown
    truck = None


def test_drive_to_not_drivable():
    """Test drive attempt when truck is not drivable."""
    # Setup
    truck = Truck("T001", "Ford", "F-150", 2022)
    truck.is_drivable = False
    truck.driver_id = "D001"
    old_location = truck.location
    
    # Exercise
    result = truck.drive_to("Warehouse B")
    
    # Verify
    assert result == False
    assert truck.location == old_location
    
    # Teardown
    truck = None


def test_drive_to_no_driver():
    """Test drive attempt without assigned driver."""
    # Setup
    truck = Truck("T001", "Ford", "F-150", 2022)
    truck.is_drivable = True
    truck.driver_id = ""
    old_location = truck.location
    
    # Exercise
    result = truck.drive_to("Warehouse B")
    
    # Verify
    assert result == False
    assert truck.location == old_location
    
    # Teardown
    truck = None


def test_drive_to_empty_destination():
    """Test drive to empty destination."""
    # Setup
    truck = Truck("T001", "Ford", "F-150", 2022)
    truck.driver_id = "D001"
    truck.is_drivable = True
    
    # Exercise
    result = truck.drive_to("")
    
    # Verify
    assert result == True
    assert truck.location == ""
    
    # Teardown
    truck = None


# ============================================================================
# TRUCK MILEAGE TESTS
# ============================================================================

def test_add_mileage_positive():
    """Test adding positive mileage."""
    # Setup
    truck = Truck("T001", "Ford", "F-150", 2022)
    initial_mileage = truck.mileage
    miles_to_add = 100
    
    # Exercise
    truck.add_mileage(miles_to_add)
    
    # Verify
    assert truck.mileage == initial_mileage + miles_to_add
    
    # Teardown
    truck = None


def test_add_mileage_zero():
    """Test adding zero mileage."""
    # Setup
    truck = Truck("T001", "Ford", "F-150", 2022)
    initial_mileage = truck.mileage
    
    # Exercise
    truck.add_mileage(0)
    
    # Verify
    assert truck.mileage == initial_mileage
    
    # Teardown
    truck = None


def test_add_mileage_negative():
    """Test adding negative mileage."""
    # Setup
    truck = Truck("T001", "Ford", "F-150", 2022)
    initial_mileage = truck.mileage
    
    # Exercise
    truck.add_mileage(-50)
    
    # Verify
    assert truck.mileage == initial_mileage
    
    # Teardown
    truck = None


def test_add_mileage_large_number():
    """Test adding very large mileage."""
    # Setup
    truck = Truck("T001", "Ford", "F-150", 2022)
    initial_mileage = truck.mileage
    large_miles = 999999
    
    # Exercise
    truck.add_mileage(large_miles)
    
    # Verify
    assert truck.mileage == initial_mileage + large_miles
    
    # Teardown
    truck = None


# ============================================================================
# TRUCK DRIVABLE STATUS TESTS
# ============================================================================

def test_set_drivable_status_true():
    """Test setting drivable status to True."""
    # Setup
    truck = Truck("T001", "Ford", "F-150", 2022)
    truck.is_drivable = False
    
    # Exercise
    truck.set_drivable_status(True)
    
    # Verify
    assert truck.is_drivable == True
    
    # Teardown
    truck = None


def test_set_drivable_status_false():
    """Test setting drivable status to False."""
    # Setup
    truck = Truck("T001", "Ford", "F-150", 2022)
    truck.is_drivable = True
    
    # Exercise
    truck.set_drivable_status(False)
    
    # Verify
    assert truck.is_drivable == False
    
    # Teardown
    truck = None


# ============================================================================
# TRUCK REGISTRATION TESTS
# ============================================================================

def test_check_registration_no_registration():
    """Test registration check when truck has no registration."""
    # Setup
    truck = Truck("T001", "Ford", "F-150", 2022)
    truck.has_registration = False
    
    # Exercise
    result = truck.check_registration()
    
    # Verify
    assert result == False
    
    # Teardown
    truck = None


def test_check_registration_valid_no_expiry():
    """Test registration check with valid registration but no expiry date."""
    # Setup
    truck = Truck("T001", "Ford", "F-150", 2022)
    truck.has_registration = True
    truck.registration_expiry = None
    
    # Exercise
    result = truck.check_registration()
    
    # Verify
    assert result == True
    
    # Teardown
    truck = None


@patch('truck.date')
def test_check_registration_valid_future_expiry(mock_date):
    """Test registration check with future expiry date."""
    # Setup
    mock_date.today.return_value = date(2024, 1, 1)
    truck = Truck("T001", "Ford", "F-150", 2022)
    truck.has_registration = True
    truck.registration_expiry = date(2024, 12, 31)
    
    # Exercise
    result = truck.check_registration()
    
    # Verify
    assert result == False
    
    # Teardown
    truck = None


@patch('truck.date')
def test_check_registration_expired(mock_date):
    """Test registration check with expired registration."""
    # Setup
    mock_date.today.return_value = date(2024, 6, 1)
    truck = Truck("T001", "Ford", "F-150", 2022)
    truck.has_registration = True
    truck.registration_expiry = date(2024, 1, 1)
    
    # Exercise
    result = truck.check_registration()
    
    # Verify
    assert result == False
    
    # Teardown
    truck = None


@patch('truck.date')
def test_check_registration_string_date_valid(mock_date):
    """Test registration check with valid string date format."""
    # Setup
    mock_date.today.return_value = date(2024, 1, 1)
    truck = Truck("T001", "Ford", "F-150", 2022)
    truck.has_registration = True
    truck.registration_expiry = "2024-12-31"
    
    # Exercise
    result = truck.check_registration()
    
    # Verify
    assert result == True
    
    # Teardown
    truck = None


@patch('truck.date')
def test_check_registration_string_date_alternative_format(mock_date):
    """Test registration check with alternative string date format."""
    # Setup
    mock_date.today.return_value = date(2024, 1, 1)
    truck = Truck("T001", "Ford", "F-150", 2022)
    truck.has_registration = True
    truck.registration_expiry = "12/31/2024"
    
    # Exercise
    result = truck.check_registration()
    
    # Verify
    assert result == True
    
    # Teardown
    truck = None


def test_check_registration_invalid_string_date():
    """Test registration check with invalid string date format."""
    # Setup
    truck = Truck("T001", "Ford", "F-150", 2022)
    truck.has_registration = True
    truck.registration_expiry = "invalid-date"
    
    # Exercise
    result = truck.check_registration()
    
    # Verify
    assert result == False
    
    # Teardown
    truck = None


def test_check_registration_invalid_date_type():
    """Test registration check with invalid date type."""
    # Setup
    truck = Truck("T001", "Ford", "F-150", 2022)
    truck.has_registration = True
    truck.registration_expiry = 12345  # Invalid type
    
    # Exercise
    result = truck.check_registration()
    
    # Verify
    assert result == False
    
    # Teardown
    truck = None


def test_renew_registration():
    """Test registration renewal."""
    # Setup
    truck = Truck("T001", "Ford", "F-150", 2022)
    new_expiry = date(2025, 12, 31)
    
    # Exercise
    truck.renew_registration(new_expiry)
    
    # Verify
    assert truck.has_registration == True
    assert truck.registration_expiry == new_expiry
    
    # Teardown
    truck = None


# ============================================================================
# TRUCK DRIVER ASSIGNMENT TESTS
# ============================================================================

def test_assign_driver_string_success():
    """Test successful driver assignment with string ID."""
    # Setup
    truck = Truck("T001", "Ford", "F-150", 2022)
    driver_id = "D001"
    
    # Exercise
    result = truck.assign_driver(driver_id)
    
    # Verify
    assert result == True
    assert truck.driver_id == driver_id
    
    # Teardown
    truck = None


def test_assign_driver_string_already_assigned():
    """Test driver assignment when driver already assigned."""
    # Setup
    truck = Truck("T001", "Ford", "F-150", 2022)
    truck.driver_id = "D001"
    
    # Exercise
    result = truck.assign_driver("D002")
    
    # Verify
    assert result == False
    assert truck.driver_id == "D001"
    
    # Teardown
    truck = None


def test_assign_driver_object_success():
    """Test successful driver assignment with Driver object."""
    # Setup
    truck = Truck("T001", "Ford", "F-150", 2022)
    mock_driver = create_mock_driver()
    
    # Exercise
    result = truck.assign_driver(mock_driver)
    
    # Verify
    assert result == True
    assert truck.assigned_driver == mock_driver
    assert truck.driver_id == mock_driver.driver_id
    mock_driver.assign_to_truck.assert_called_once_with(truck.truck_id)
    
    # Teardown
    truck = None
    mock_driver = None


def test_assign_driver_object_already_assigned():
    """Test driver assignment when truck already has driver object."""
    # Setup
    truck = Truck("T001", "Ford", "F-150", 2022)
    existing_driver = Mock()
    existing_driver.driver_id = "D999"
    truck.assigned_driver = existing_driver
    mock_driver = create_mock_driver()
    
    # Exercise
    result = truck.assign_driver(mock_driver)
    
    # Verify
    assert result == False
    assert truck.assigned_driver != mock_driver
    
    # Teardown
    truck = None
    mock_driver = None


def test_assign_driver_object_not_eligible():
    """Test driver assignment when driver not eligible."""
    # Setup
    truck = Truck("T001", "Ford", "F-150", 2022)
    mock_driver = create_mock_driver()
    mock_driver.check_driving_eligibility.return_value = False
    
    # Exercise
    result = truck.assign_driver(mock_driver)
    
    # Verify
    assert result == False
    assert truck.assigned_driver is None
    assert truck.driver_id == ""
    
    # Teardown
    truck = None
    mock_driver = None


def test_assign_driver_object_not_available():
    """Test driver assignment when driver not available."""
    # Setup
    truck = Truck("T001", "Ford", "F-150", 2022)
    mock_driver = create_mock_driver()
    mock_driver.is_available = False
    
    # Exercise
    result = truck.assign_driver(mock_driver)
    
    # Verify
    assert result == False
    assert truck.assigned_driver is None
    assert truck.driver_id == ""
    
    # Teardown
    truck = None
    mock_driver = None


def test_assign_driver_object_assignment_fails():
    """Test driver assignment when driver's assign_to_truck fails."""
    # Setup
    truck = Truck("T001", "Ford", "F-150", 2022)
    mock_driver = create_mock_driver()
    mock_driver.assign_to_truck.return_value = False
    
    # Exercise
    result = truck.assign_driver(mock_driver)
    
    # Verify
    assert result == False
    assert truck.assigned_driver is None
    assert truck.driver_id == ""
    
    # Teardown
    truck = None
    mock_driver = None


def test_remove_driver_success_string_only():
    """Test successful driver removal with string ID only."""
    # Setup
    truck = Truck("T001", "Ford", "F-150", 2022)
    truck.driver_id = "D001"
    
    # Exercise
    result = truck.remove_driver()
    
    # Verify
    assert result == True
    assert truck.driver_id == ""
    
    # Teardown
    truck = None


def test_remove_driver_success_with_object():
    """Test successful driver removal with Driver object."""
    # Setup
    truck = Truck("T001", "Ford", "F-150", 2022)
    mock_driver = create_mock_driver()
    truck.driver_id = "D001"
    truck.assigned_driver = mock_driver
    
    # Exercise
    result = truck.remove_driver()
    
    # Verify
    assert result == True
    assert truck.driver_id == ""
    assert truck.assigned_driver is None
    mock_driver.unassign_from_truck.assert_called_once()
    
    # Teardown
    truck = None
    mock_driver = None


def test_remove_driver_no_driver_assigned():
    """Test driver removal when no driver is assigned."""
    # Setup
    truck = Truck("T001", "Ford", "F-150", 2022)
    
    # Exercise
    result = truck.remove_driver()
    
    # Verify
    assert result == False
    
    # Teardown
    truck = None


# ============================================================================
# TRUCK TRAILER OPERATIONS TESTS
# ============================================================================

def test_attach_trailer_string_success():
    """Test successful trailer attachment with string ID."""
    # Setup
    truck = Truck("T001", "Ford", "F-150", 2022)
    trailer_id = "TR001"
    
    # Exercise
    result = truck.attach_trailer(trailer_id)
    
    # Verify
    assert result == True
    assert truck.attached_trailer_id == trailer_id
    
    # Teardown
    truck = None


def test_attach_trailer_string_already_attached():
    """Test trailer attachment when trailer already attached."""
    # Setup
    truck = Truck("T001", "Ford", "F-150", 2022)
    truck.attached_trailer_id = "TR001"
    
    # Exercise
    result = truck.attach_trailer("TR002")
    
    # Verify
    assert result == False
    assert truck.attached_trailer_id == "TR001"
    
    # Teardown
    truck = None


def test_attach_trailer_object_success():
    """Test successful trailer attachment with Trailer object."""
    # Setup
    truck = Truck("T001", "Ford", "F-150", 2022)
    mock_trailer = create_mock_trailer()
    
    # Exercise
    result = truck.attach_trailer(mock_trailer)
    
    # Verify
    assert result == True
    assert truck.attached_trailer == mock_trailer
    assert truck.attached_trailer_id == mock_trailer.trailer_id
    mock_trailer.attach_to_truck.assert_called_once_with(truck.truck_id)
    
    # Teardown
    truck = None
    mock_trailer = None


def test_attach_trailer_object_already_attached():
    """Test trailer attachment when truck already has trailer."""
    # Setup
    truck = Truck("T001", "Ford", "F-150", 2022)
    existing_trailer = Mock()
    existing_trailer.trailer_id = "TR999"
    truck.attached_trailer = existing_trailer
    mock_trailer = create_mock_trailer()
    
    # Exercise
    result = truck.attach_trailer(mock_trailer)
    
    # Verify
    assert result == False
    assert truck.attached_trailer != mock_trailer
    
    # Teardown
    truck = None
    mock_trailer = None


def test_attach_trailer_object_not_working():
    """Test trailer attachment when trailer not in working condition."""
    # Setup
    truck = Truck("T001", "Ford", "F-150", 2022)
    mock_trailer = create_mock_trailer()
    mock_trailer.is_working_condition = False
    
    # Exercise
    result = truck.attach_trailer(mock_trailer)
    
    # Verify
    assert result == False
    assert truck.attached_trailer is None
    
    # Teardown
    truck = None
    mock_trailer = None


def test_attach_trailer_object_already_attached_elsewhere():
    """Test trailer attachment when trailer attached to another truck."""
    # Setup
    truck = Truck("T001", "Ford", "F-150", 2022)
    mock_trailer = create_mock_trailer()
    mock_trailer.attached_truck_id = "T999"
    
    # Exercise
    result = truck.attach_trailer(mock_trailer)
    
    # Verify
    assert result == False
    assert truck.attached_trailer is None
    
    # Teardown
    truck = None
    mock_trailer = None


def test_attach_trailer_object_attachment_fails():
    """Test trailer attachment when trailer's attach_to_truck fails."""
    # Setup
    truck = Truck("T001", "Ford", "F-150", 2022)
    mock_trailer = create_mock_trailer()
    mock_trailer.attach_to_truck.return_value = False
    
    # Exercise
    result = truck.attach_trailer(mock_trailer)
    
    # Verify
    assert result == False
    assert truck.attached_trailer is None
    assert truck.attached_trailer_id == ""
    
    # Teardown
    truck = None
    mock_trailer = None


def test_detach_trailer_success_with_object():
    """Test successful trailer detachment with Trailer object."""
    # Setup
    truck = Truck("T001", "Ford", "F-150", 2022)
    mock_trailer = create_mock_trailer()
    truck.attached_trailer = mock_trailer
    truck.attached_trailer_id = "TR001"
    truck.has_container = True
    
    # Exercise
    result = truck.detach_trailer()
    
    # Verify
    assert result == True
    assert truck.attached_trailer is None
    assert truck.attached_trailer_id == ""
    assert truck.has_container == False  # Container should be removed
    mock_trailer.detach_from_truck.assert_called_once()
    
    # Teardown
    truck = None
    mock_trailer = None


def test_detach_trailer_success_string_only():
    """Test successful trailer detachment with string ID only."""
    # Setup
    truck = Truck("T001", "Ford", "F-150", 2022)
    truck.attached_trailer_id = "TR001"
    
    # Exercise
    result = truck.detach_trailer()
    
    # Verify
    assert result == True
    assert truck.attached_trailer_id == ""
    
    # Teardown
    truck = None


def test_detach_trailer_no_trailer():
    """Test trailer detachment when no trailer is attached."""
    # Setup
    truck = Truck("T001", "Ford", "F-150", 2022)
    
    # Exercise
    result = truck.detach_trailer()
    
    # Verify
    assert result == False
    
    # Teardown
    truck = None


# ============================================================================
# TRUCK CONTAINER OPERATIONS TESTS
# ============================================================================

def test_attach_container_success():
    """Test successful container attachment."""
    # Setup
    truck = Truck("T001", "Ford", "F-150", 2022)
    mock_trailer = create_mock_trailer()
    truck.attached_trailer = mock_trailer
    
    # Exercise
    result = truck.attach_container()
    
    # Verify
    assert result == True
    assert truck.has_container == True
    
    # Teardown
    truck = None
    mock_trailer = None


def test_attach_container_no_trailer():
    """Test container attachment when no trailer is attached."""
    # Setup
    truck = Truck("T001", "Ford", "F-150", 2022)
    
    # Exercise
    result = truck.attach_container()
    
    # Verify
    assert result == False
    assert truck.has_container == False
    
    # Teardown
    truck = None


def test_attach_container_already_has_container():
    """Test container attachment when container already attached."""
    # Setup
    truck = Truck("T001", "Ford", "F-150", 2022)
    mock_trailer = create_mock_trailer()
    truck.attached_trailer = mock_trailer
    truck.has_container = True
    
    # Exercise
    result = truck.attach_container()
    
    # Verify
    assert result == False
    assert truck.has_container == True
    
    # Teardown
    truck = None
    mock_trailer = None


def test_remove_container_success():
    """Test successful container removal."""
    # Setup
    truck = Truck("T001", "Ford", "F-150", 2022)
    mock_trailer = create_mock_trailer()
    truck.has_container = True
    truck.attached_trailer = mock_trailer
    
    # Exercise
    result = truck.remove_container()
    
    # Verify
    assert result == True
    assert truck.has_container == False
    
    # Teardown
    truck = None
    mock_trailer = None


def test_remove_container_no_container():
    """Test container removal when no container is attached."""
    # Setup
    truck = Truck("T001", "Ford", "F-150", 2022)
    
    # Exercise
    result = truck.remove_container()
    
    # Verify
    assert result == False
    assert truck.has_container == False
    
    # Teardown
    truck = None


# ============================================================================
# TRUCK CARGO OPERATIONS TESTS
# ============================================================================

def test_load_cargo_success():
    """Test successful cargo loading."""
    # Setup
    truck = Truck("T001", "Ford", "F-150", 2022)
    truck.max_capacity = 1000.0
    weight = 500.0
    
    # Exercise
    result = truck.load_cargo(weight)
    
    # Verify
    assert result == True
    
    # Teardown
    truck = None


def test_load_cargo_exceeds_capacity():
    """Test cargo loading that exceeds capacity."""
    # Setup
    truck = Truck("T001", "Ford", "F-150", 2022)
    truck.max_capacity = 1000.0
    weight = 1500.0
    
    # Exercise
    result = truck.load_cargo(weight)
    
    # Verify
    assert result == False
    
    # Teardown
    truck = None


def test_load_cargo_zero_weight():
    """Test cargo loading with zero weight."""
    # Setup
    truck = Truck("T001", "Ford", "F-150", 2022)
    truck.max_capacity = 1000.0
    weight = 0.0
    
    # Exercise
    result = truck.load_cargo(weight)
    
    # Verify
    assert result == True
    
    # Teardown
    truck = None


def test_load_cargo_negative_weight():
    """Test cargo loading with negative weight."""
    # Setup
    truck = Truck("T001", "Ford", "F-150", 2022)
    truck.max_capacity = 1000.0
    weight = -100.0
    
    # Exercise
    result = truck.load_cargo(weight)
    
    # Verify
    assert result == False
    
    # Teardown
    truck = None


def test_unload_cargo():
    """Test cargo unloading."""
    # Setup
    truck = Truck("T001", "Ford", "F-150", 2022)
    
    # Exercise
    truck.unload_cargo()
    
    # Verify - just verify it doesn't crash (method doesn't return anything)
    # This is a placeholder implementation that just prints
    
    # Teardown
    truck = None


# ============================================================================
# TRUCK INFORMATION TESTS
# ============================================================================

def test_get_truck_info_basic():
    """Test getting basic truck information."""
    # Setup
    truck = Truck("T001", "Ford", "F-150", 2022)
    
    # Exercise
    info = truck.get_truck_info()
    
    # Verify
    assert isinstance(info, dict)
    assert info['truck_id'] == truck.truck_id
    assert info['make'] == truck.make
    assert info['model'] == truck.model
    assert info['year'] == truck.year
    assert 'registration_valid' in info
    assert 'is_roadworthy' in info
    
    # Teardown
    truck = None


def test_get_truck_info_with_driver():
    """Test getting truck info with assigned driver."""
    # Setup
    truck = Truck("T001", "Ford", "F-150", 2022)
    mock_driver = create_mock_driver()
    truck.assigned_driver = mock_driver
    
    # Exercise
    info = truck.get_truck_info()
    
    # Verify
    assert 'driver_name' in info
    assert 'driver_available' in info
    assert 'driver_eligible' in info
    assert info['driver_name'] == f"{mock_driver.first_name} {mock_driver.last_name}"
    
    # Teardown
    truck = None
    mock_driver = None


def test_get_truck_info_with_trailer():
    """Test getting truck info with attached trailer."""
    # Setup
    truck = Truck("T001", "Ford", "F-150", 2022)
    mock_trailer = create_mock_trailer()
    truck.attached_trailer = mock_trailer
    
    # Exercise
    info = truck.get_truck_info()
    
    # Verify
    assert 'trailer_make_model' in info
    assert 'trailer_working_condition' in info
    assert 'trailer_cargo_capacity' in info
    assert 'trailer_current_cargo' in info
    
    # Teardown
    truck = None
    mock_trailer = None


def test_is_roadworthy_true():
    """Test roadworthy check when truck is roadworthy."""
    # Setup
    truck = Truck("T001", "Ford", "F-150", 2022)
    truck.is_drivable = True
    truck.has_registration = True
    
    # Exercise
    result = truck.is_roadworthy()
    
    # Verify
    assert result == True
    
    # Teardown
    truck = None


def test_is_roadworthy_not_drivable():
    """Test roadworthy check when truck is not drivable."""
    # Setup
    truck = Truck("T001", "Ford", "F-150", 2022)
    truck.is_drivable = False
    truck.has_registration = True
    
    # Exercise
    result = truck.is_roadworthy()
    
    # Verify
    assert result == False
    
    # Teardown
    truck = None


def test_is_roadworthy_no_registration():
    """Test roadworthy check when truck has no registration."""
    # Setup
    truck = Truck("T001", "Ford", "F-150", 2022)
    truck.is_drivable = True
    truck.has_registration = False
    
    # Exercise
    result = truck.is_roadworthy()
    
    # Verify
    assert result == False
    
    # Teardown
    truck = None


# ============================================================================
# TRUCK LOCATION OPERATIONS TESTS
# ============================================================================

def test_update_location_success():
    """Test successful location update."""
    # Setup
    truck = Truck("T001", "Ford", "F-150", 2022)
    new_location = "New Warehouse"
    old_location = truck.location
    
    # Exercise
    truck.update_location(new_location)
    
    # Verify
    assert truck.location == new_location
    assert truck.location != old_location
    
    # Teardown
    truck = None


def test_update_location_empty_string():
    """Test location update with empty string."""
    # Setup
    truck = Truck("T001", "Ford", "F-150", 2022)
    new_location = ""
    
    # Exercise
    truck.update_location(new_location)
    
    # Verify
    assert truck.location == new_location
    
    # Teardown
    truck = None


def test_update_location_same_location():
    """Test location update to same location."""
    # Setup
    truck = Truck("T001", "Ford", "F-150", 2022)
    truck.location = "Warehouse A"
    same_location = "Warehouse A"
    
    # Exercise
    truck.update_location(same_location)
    
    # Verify
    assert truck.location == same_location
    
    # Teardown
    truck = None


# ============================================================================
# TRUCK STRING REPRESENTATIONS TESTS
# ============================================================================

def test_str_representation():
    """Test string representation of truck."""
    # Setup
    truck = Truck("T001", "Ford", "F-150", 2022)
    
    # Exercise
    str_repr = str(truck)
    
    # Verify
    assert isinstance(str_repr, str)
    assert truck.truck_id in str_repr
    assert truck.make in str_repr
    assert truck.model in str_repr
    assert str(truck.year) in str_repr
    assert str(truck.mileage) in str_repr
    
    # Teardown
    truck = None


def test_repr_representation():
    """Test repr representation of truck."""
    # Setup
    truck = Truck("T001", "Ford", "F-150", 2022)
    
    # Exercise
    repr_str = repr(truck)
    
    # Verify
    assert isinstance(repr_str, str)
    assert "Truck" in repr_str
    assert truck.truck_id in repr_str
    assert truck.make in repr_str
    assert truck.model in repr_str
    assert str(truck.year) in repr_str
    
    # Teardown
    truck = None


if __name__ == '__main__':
    # Run tests using pytest if available, otherwise basic assertions
    import pytest
    pytest.main([__file__, '-v']) 