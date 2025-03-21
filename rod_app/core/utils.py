def split_trip(total_time, total_dist, cycle_used, speed):
    days = []
    remaining_time, remaining_dist = total_time, total_dist
    day_num = 1
    cycle_remaining = cycle_used

    while remaining_time > 0:
        segments = []
        current_time = 0

        duty_time = 1 if day_num == 1 else 0
        is_last_day = remaining_time <= 11
        duty_time += 1 if is_last_day else 0

        fuel_stops = min(total_dist // 1000, remaining_dist // 1000)
        fuel_time = fuel_stops * 0.5

        available_duty = min(14 - duty_time - fuel_time, cycle_remaining)
        driving_time = min(remaining_time, 11, available_duty)
        break_time = 0.5 if driving_time > 8 else 0
        if break_time:
            driving_time = min(driving_time, 11 - break_time)
            available_duty -= break_time

        dist_this_day = min(driving_time * speed, remaining_dist)

        if day_num == 1 and duty_time > 0:
            segments.append({
                "status": "on_duty_non_driving",
                "start": current_time,
                "end": current_time + 1
            })
            current_time += 1

        if driving_time > 0:
            segments.append({
                "status": "driving",
                "start": current_time,
                "end": current_time + driving_time
            })
            current_time += driving_time

        if break_time > 0:
            segments.append({
                "status": "off_duty",
                "start": current_time,
                "end": current_time + break_time
            })
            current_time += break_time

        if fuel_time > 0:
            segments.append({
                "status": "on_duty_non_driving",
                "start": current_time,
                "end": current_time + fuel_time
            })
            current_time += fuel_time

        if is_last_day and duty_time > 1:
            segments.append({
                "status": "on_duty_non_driving",
                "start": current_time,
                "end": current_time + 1
            })
            current_time += 1

        if current_time < 24:
            segments.append({
                "status": "off_duty",
                "start": current_time,
                "end": 24
            })

        total_duty = driving_time + duty_time + fuel_time + break_time

        days.append({
            "day": day_num,
            "distance": round(dist_this_day, 2),
            "segments": segments
        })

        remaining_time -= driving_time
        remaining_dist -= dist_this_day
        cycle_remaining -= total_duty
        day_num += 1

        if cycle_remaining <= 0 and remaining_time > 0:
            days.append({"error": "Cycle hours exhausted", "remaining_time": round(remaining_time, 2)})
            break

    return days