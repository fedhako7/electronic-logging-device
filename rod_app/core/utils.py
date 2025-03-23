def split_trip(total_time, total_dist, cycle_used, speed):
    days = []
    remaining_time, remaining_dist = total_time, total_dist
    cycle_remaining = 70 - cycle_used
    day_num = 1

    while remaining_time > 0:
        segments = []
        current_time = 0

        # Determine if this is the last day (for drop-off)
        is_last_day = remaining_time <= 11
        duty_time = 1 if is_last_day else 0 

        # Fuel stops: 
        fuel_stops = max(0, min(total_dist // 1000, remaining_dist // 1000))
        fuel_time = fuel_stops * 0.5

        # Available duty time within 14-hour window
        available_duty = min(14 - duty_time - fuel_time, cycle_remaining)
        driving_time = min(remaining_time, 11, available_duty)

        dist_this_day = min(driving_time * speed, remaining_dist)

        # Handle driving with 8-hour limit and breaks
        remaining_driving = driving_time
        while remaining_driving > 0:
            drive_segment = min(remaining_driving, 8) 
            if drive_segment > 0:
                segments.append({
                    "status": "driving",
                    "start": current_time,
                    "end": current_time + drive_segment,
                    "reason": "driving"
                })
                current_time += drive_segment
                remaining_driving -= drive_segment

            # Add 0.5 hr break after 8 hr driving if more driving remains
            if remaining_driving > 0:
                segments.append({
                    "status": "off_duty",
                    "start": current_time,
                    "end": current_time + 0.5,
                    "reason": "8-hr-limitation-1/2-hr-rest"
                })
                current_time += 0.5
                available_duty -= 0.5 

  
        if day_num == 1 and remaining_dist > 0:
            segments.append({
                "status": "on_duty_non_driving",
                "start": current_time,
                "end": current_time + 1,  
                "reason": "pick-up"
            })
            current_time += 1
            duty_time += 1  

        # Fuel stops: Add after pickup/driving if applicable
        if fuel_time > 0:
            segments.append({
                "status": "on_duty_non_driving",
                "start": current_time,
                "end": current_time + fuel_time,
                "reason": "fuel"
            })
            current_time += fuel_time

        # Drop-off on last day
        if is_last_day and duty_time > 0:
            segments.append({
                "status": "on_duty_non_driving",
                "start": current_time,
                "end": current_time + 1,
                "reason": "drop-off"
            })
            current_time += 1

        # Off-duty after 11-hour driving limit: Ensure 10-hour rest
        if driving_time >= 11:
            segments.append({
                "status": "off_duty",
                "start": current_time,
                "end": current_time + 10, 
                "reason": "11-hr-limitation-10-hr-rest"
            })
            current_time += 10
        elif current_time < 24:
            segments.append({
                "status": "off_duty",
                "start": current_time,
                "end": 24,
                "reason": "daily-rest"
            })
            current_time = 24

        # Calculate total duty time for this day
        total_duty = driving_time + duty_time + fuel_time + (0.5 if driving_time > 8 else 0)

        days.append({
            "day": day_num,
            "distance": round(dist_this_day, 2),
            "segments": segments
        })

        remaining_time -= driving_time
        remaining_dist -= dist_this_day
        cycle_remaining -= total_duty
        day_num += 1

    return days
