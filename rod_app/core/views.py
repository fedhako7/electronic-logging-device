from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
import requests
from geopy.geocoders import Nominatim

class TripAPIView(APIView):
    def post(self, request):
        data = request.data
        current = data['current_location']
        pickup = data['pickup_location']
        dropoff = data['dropoff_location']
        cycle_used = float(data['cycle_hours'])

        # Initialize geocoder
        geolocator = Nominatim(user_agent="rod_app")

        # Convert locations to coordinates
        try:
            current_loc = geolocator.geocode(current)
            pickup_loc = geolocator.geocode(pickup)
            dropoff_loc = geolocator.geocode(dropoff)

            if not all([current_loc, pickup_loc, dropoff_loc]):
                return Response({"error": "Could not geocode one or more locations"}, status=400)

            coords = f"{current_loc.longitude},{current_loc.latitude};" \
                     f"{pickup_loc.longitude},{pickup_loc.latitude};" \
                     f"{dropoff_loc.longitude},{dropoff_loc.latitude}"
        except Exception as e:
            return Response({"error": f"Geocoding failed: {str(e)}"}, status=500)

        # OSRM API call
        url = f"http://router.project-osrm.org/route/v1/driving/{coords}?overview=full"
        response = requests.get(url).json()

        if response.get("code") != "Ok" or "routes" not in response:
            return Response({"error": "OSRM API failed", "details": response}, status=500)

        total_dist = response['routes'][0]['distance'] / 1609.34  # Meters to miles
        total_time = response['routes'][0]['duration'] / 3600      # Seconds to hours
        path = response['routes'][0]['geometry']
        speed = total_dist / total_time if total_time > 0 else 0

        # Split into HOS-compliant days
        days = self.split_trip(total_time, total_dist, cycle_used, speed)

        return Response({
            "route": {"distance": total_dist, "time": total_time, "path": path},
            "logs": days
        })

    def split_trip(self, T, D, C, S):
        days = []
        remaining_time, remaining_dist = T, D
        day_num = 1
        cycle_remaining = C  # Total cycle hours (e.g., 70)

        while remaining_time > 0:
            # Base duty time: 1 hour for pickup on day 1, 1 hour for dropoff on last day
            duty_time = 1 if day_num == 1 else 0
            duty_time += 1 if remaining_time <= remaining_time and remaining_time <= 11 else 0

            # Fuel stops (0.5 hours each, every 1000 miles)
            fuel_this_day = min(D // 1000, remaining_dist // 1000) * 0.5

            # Available duty time within 14-hour limit
            available_duty = min(14 - duty_time - fuel_this_day, cycle_remaining)

            # Driving time: min of remaining trip time, 11-hour limit, or available duty
            driving_time = min(remaining_time, 11, available_duty)
            if driving_time > 8:
                driving_time = min(driving_time, 11 - 0.5)  # Subtract 0.5 for break
                available_duty -= 0.5  # Include break in duty

            # Distance covered this day
            dist_this_day = min(driving_time * S, remaining_dist)

            # Total duty time for the day
            total_duty = driving_time + duty_time + fuel_this_day + (0.5 if driving_time > 8 else 0)

            # Add day to logs
            days.append({
                "day": day_num,
                "driving": round(driving_time, 2),
                "duty": round(total_duty, 2),
                "distance": round(dist_this_day, 2),
                "stops": {"fuel": fuel_this_day > 0, "break": driving_time > 8}
            })

            # Update remaining values
            remaining_time -= driving_time
            remaining_dist -= dist_this_day
            cycle_remaining -= total_duty
            day_num += 1

            # Stop if cycle hours are exhausted
            if cycle_remaining <= 0 and remaining_time > 0:
                return days + [{"error": "Cycle hours exhausted", "remaining_time": remaining_time}]

        return days