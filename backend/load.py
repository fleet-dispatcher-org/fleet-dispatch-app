from datetime import datetime
from typing import Optional, Dict, Any
from pydantic import BaseModel
import logging

# Get logger
logger = logging.getLogger('dispatch_logger')


class Load(BaseModel):
    id: str
    origin: str
    destination: str
    weight: float
    due_by: datetime
    status: str
    assigned_driver: Optional[str]
    assigned_truck: Optional[str]
    assigned_trailer: Optional[str]
    percentage_complete: float
    is_active: bool
    assigned_fleet: Optional[str]

    def __init__(self):
        super().__init__()
        self.id = ""
        self.origin = ""
        self.destination = ""
        self.weight = 0.0
        self.due_by = None
        self.status = ""
        self.assigned_driver = None
        self.assigned_truck = None
        self.assigned_trailer = None
        self.percentage_complete = 0.0
        self.is_active = False
        self.assigned_fleet = None
    
    def __str__(self):
        return f"Load ID: {self.id}, Origin: {self.origin}, Destination: {self.destination}, Weight: {self.weight}, Due By: {self.due_by}, Status: {self.status}"
    
    def __json__(self):
        return {
            "id": self.id,
            "origin": self.origin,
            "destination": self.destination,
            "weight": self.weight,
            "due_by": self.due_by,
            "status": self.status,
            "assigned_driver": self.assigned_driver,
            "assigned_truck": self.assigned_truck,
            "assigned_trailer": self.assigned_trailer,
            "percentage_complete": self.percentage_complete,
            "is_active": self.is_active,
            "assigned_fleet": self.assigned_fleet
        }

    def to_json(self):
        return self.__json__()