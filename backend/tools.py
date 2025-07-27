import csv
import os
from agents import function_tool
from logger import log_tool_call, log_tool_result, log_error
from typing import Optional, Dict, Any
import math
from datetime import datetime, timedelta
import pandas as pd



@function_tool  
def hrs_min_sec(hour_of_day: float) -> str:
    """Convert decimal hour to HH:MM:SS format."""
    log_tool_call("hrs_min_sec", {"hour_of_day": hour_of_day})
    
    try:
        if 0 <= hour_of_day <= 24:
            hours = math.floor(hour_of_day)
            minutes = math.floor((hour_of_day % 1) * 60)
            result = f"{hours:02d}:{minutes:02d}:00"
            log_tool_result("hrs_min_sec", result)
            return result
        else:
            result = "Invalid Hour: Input # between 0 and 24"
            log_tool_result("hrs_min_sec", result)
            return result
    except Exception as e:
        error_msg = f"Error converting hour format: {str(e)}"
        log_error(e, "hrs_min_sec")
        return error_msg

@function_tool
def trip_schedule(start_time: float, distance: float, ave_speed: float) -> Dict[str, Any]:
    """Calculate trip schedule with DOT compliance breaks for a given distance and speed."""
    log_tool_call("trip_schedule", {
        "start_time": start_time, 
        "distance": distance, 
        "ave_speed": ave_speed
    })
    
    try:
        total_road_hours = distance / ave_speed

        # Calculate the total number of full-day drive sections:
        total_full_drive_legs = math.floor(total_road_hours / 11)
        # Calculate the total number of drive legs including the last leg < 11 hrs
        total_drive_legs = math.ceil(total_road_hours / 11)
        # Calculate the number of hours required on the last day's leg
        last_work_day_hours = (total_road_hours % 11) * (total_road_hours != 11) + 11 * (total_road_hours == 11)

        # Set graph parameters
        start_times = [(start_time + 21.5 * i) % 24 for i in range(total_drive_legs)]
        n = len(start_times)

        # Create a list of datetimes for the schedule
        start_datetime = datetime.now().replace(
            hour=int(start_time), 
            minute=int((start_time % 1) * 60), 
            second=0, 
            microsecond=0
        )
        datetimes = [start_datetime + timedelta(hours=21.5 * i) for i in range(n)]

        # Create lists of datetime stamps for each event
        start_times_dt = [datetimes[i] for i in range(n)]
        half_hour_break_times_dt = [datetimes[i] + timedelta(hours=3) for i in range(n)]
        ten_hour_break_times_dt = [datetimes[i] + timedelta(hours=11.5) if i < n-1 else None for i in range(n)]
        
        # Adjust the last half_hour_break_time for the last work day
        half_hour_break_times_dt[-1] = datetimes[-1] + timedelta(hours=last_work_day_hours)
        ten_hour_break_times_dt[-1] = None

        schedule_data = {
            "datetimes": [dt.strftime("%Y-%m-%d %H:%M:%S") for dt in datetimes],
            "start_times": [dt.strftime("%Y-%m-%d %H:%M:%S") for dt in start_times_dt],
            "half_hour_break_times": [dt.strftime("%Y-%m-%d %H:%M:%S") for dt in half_hour_break_times_dt],
            "ten_hour_break_times": [dt.strftime("%Y-%m-%d %H:%M:%S") if dt is not None else None for dt in ten_hour_break_times_dt],
            "last_work_day_hours": last_work_day_hours,
            "total_road_hours": total_road_hours,
            "total_full_drive_legs": total_full_drive_legs,
            "total_drive_legs": total_drive_legs
        }
        
        # Create a trip table with just the first start time and the final end time
        trip_summary = {
            "start_time": datetimes[0].strftime("%Y-%m-%d %H:%M:%S"),
            "end_time": (datetimes[-1] + timedelta(hours=last_work_day_hours)).strftime("%Y-%m-%d %H:%M:%S"),
            "total_hours": total_road_hours,
            "total_days": total_drive_legs
        }
        
        result = {
            "schedule": schedule_data,
            "trip_summary": trip_summary
        }
        
        log_tool_result("trip_schedule", f"Generated schedule for {distance} mile trip at {ave_speed} mph")
        return result
        
    except Exception as e:
        error_msg = f"Error calculating trip schedule: {str(e)}"
        log_error(e, "trip_schedule")
        return {"error": error_msg}


