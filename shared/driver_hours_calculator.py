import math
from datetime import datetime, timedelta
import pandas as pd

def hrs_min_sec(hour_of_day):
    if 0 <= hour_of_day <= 24:
        hours = math.floor(hour_of_day)
        minutes = math.floor((hour_of_day % hours) * 60)
        return f"{hours:02d}:{minutes:02d}:00"
    else:
        return "Invalid Hour: Input # between 0 and 24"

def trip_schedule(start_time, distance, ave_speed):
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

    start_datetime = datetime.now().replace(hour=int(start_time), minute=int((start_time % 1) * 60), second=0, microsecond=0)
    datetimes = [start_datetime + timedelta(hours=21.5 * i) for i in range(n)]

    # Create lists of datetime stamps for each event
    start_times_dt = [datetimes[i] for i in range(n)]
    half_hour_break_times_dt = [datetimes[i] + timedelta(hours=3) for i in range(n)]
    ten_hour_break_times_dt = [datetimes[i] + timedelta(hours=11.5) if i < n-1 else None for i in range(n)]
    # Adjust the last half_hour_break_time for the last work day
    half_hour_break_times_dt[-1] = datetimes[-1] + timedelta(hours=last_work_day_hours)
    ten_hour_break_times_dt[-1] = None

    schedule = pd.DataFrame({
        "datetimes": [dt.strftime("%Y-%m-%d %H:%M:%S") for dt in datetimes],
        "start_times": [dt.strftime("%Y-%m-%d %H:%M:%S") for dt in start_times_dt],
        "half_hour_break_times": [dt.strftime("%Y-%m-%d %H:%M:%S") for dt in half_hour_break_times_dt],
        "ten_hour_break_times": [dt.strftime("%Y-%m-%d %H:%M:%S") if dt is not None else None for dt in ten_hour_break_times_dt],
        "last_work_day_hours": last_work_day_hours,
        "total_road_hours": total_road_hours,
        "total_full_drive_legs": total_full_drive_legs,
        "total_drive_legs": total_drive_legs
    })
    
    # Create a trip table with just the first start time and the final end time
    trip_table = pd.DataFrame({
        "start_time": [datetimes[0].strftime("%Y-%m-%d %H:%M:%S")],
        "end_time": [(datetimes[-1] + timedelta(hours=last_work_day_hours)).strftime("%Y-%m-%d %H:%M:%S")]
    })
    
    print(schedule)
    print(trip_table)


