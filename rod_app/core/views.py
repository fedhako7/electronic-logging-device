from django.shortcuts import render

# Views below.
from rest_framework.views import APIView
from rest_framework.response import Response
import requests

class TripAPIView(APIView):
    def post(self, request):
        data = request.data
        current = data['current_location']
        pickup = data['pickup_location']
        dropoff = data['dropoff_location']
        cycle_used = float(data['cycle_hours'])

        # Mock map API call 
        total_dist = 1200  # miles
        total_time = 20    # hours
        speed = total_dist / total_time
        path = [current, pickup, dropoff]

        # Split into HOS-compliant days
        days = self.split_trip(total_time, total_dist, cycle_used, speed)

        # Response
        return Response({
            "route": {"distance": total_dist, "time": total_time, "path": path},
            "logs": days
        })

    def split_trip(self, T, D, C, S):
        days = []
        remaining_time, remaining_dist = T, D
        fuel_stops = D // 1000
        day_num = 1

        while remaining_time > 0:
            duty_time = 1 if day_num == 1 else 0  # Pickup
            duty_time += 1 if remaining_time <= 11 else 0  # Dropoff
            fuel_this_day = min(fuel_stops, remaining_dist // 1000) * 0.5
            available_duty = 14 - duty_time - fuel_this_day
            driving_time = min(11, available_duty - (0.5 if available_duty > 8 else 0))
            if driving_time > 8:
                driving_time -= 0.5  # Break
            dist_this_day = driving_time * S
            total_duty = driving_time + duty_time + fuel_this_day + (0.5 if driving_time > 8 else 0)
            
            days.append({
                "day": day_num,
                "driving": driving_time,
                "duty": total_duty,
                "distance": dist_this_day,
                "stops": {"fuel": fuel_this_day > 0, "break": driving_time > 8}
            })
            remaining_time -= driving_time
            remaining_dist -= dist_this_day
            fuel_stops -= remaining_dist // 1000
            day_num += 1

        return days
