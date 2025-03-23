from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
import requests
from geopy.geocoders import Nominatim
from .utils import split_trip

class TripAPIView(APIView):
    def post(self, request):
        data = request.data
        try:
            current = data['current_location']
            pickup = data['pickup_location']
            dropoff = data['dropoff_location']
            cycle_used = float(data['cycle_hours'])
        except (KeyError, ValueError) as e:
            return Response({"error": f"Invalid input: {str(e)}"}, status=400)

        geolocator = Nominatim(user_agent="rod_app")

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

        url = f"http://router.project-osrm.org/route/v1/driving/{coords}?overview=full"
        try:
            response = requests.get(url, timeout=160).json()
            if response.get("code") != "Ok" or "routes" not in response:
                return Response({"error": "OSRM API failed", "details": response}, status=500)

            total_dist = response['routes'][0]['distance'] / 1609.34  # Convert meters to miles
            total_time = response['routes'][0]['duration'] / 3600  # Convert seconds to hours
            path = response['routes'][0]['geometry']
            speed = total_dist / total_time if total_time > 0 else 0

            # Distance b/t locations
            legs = response['routes'][0]['legs']  
            current_to_pickup_time = legs[0]['duration'] / 3600
            pickup_to_dropoff_time = legs[1]['duration'] / 3600
            current_to_pickup_dist = (current_to_pickup_time / total_time) * total_dist
            pickup_to_dropoff_dist = (pickup_to_dropoff_time / total_time) * total_dist

        except requests.RequestException as e:
            return Response({"error": f"OSRM request failed: {str(e)}"}, status=500)

        # Check HOS 70-hour limit
        pickup_time = 1  # 1 hr for pickup
        dropoff_time = 1  # 1 hr for dropoff
        fuel_stops = total_dist // 1000  # At least once every 1,000 miles
        fuel_time = fuel_stops * 0.5
        required_time = total_time + pickup_time + dropoff_time + fuel_time  # Driving + duty time
        available_cycle = 70 - cycle_used

        if required_time > available_cycle:
            rest_message = f"{'Plan a shorter trip or' if available_cycle > 0 else 'Cycle exhausted'} take a 34-hour reset to refresh cycle."

            return Response({
                "error": "Insufficient cycle hours",
                "details": {
                    "required_hours": round(required_time, 2),
                    "available_cycle": round(available_cycle, 2),
                    "message": rest_message
                }
            }, status=400)

        days = split_trip(total_time, total_dist, cycle_used, speed)

        return Response({
            "route": {
                "total_distance": round(total_dist, 2),
                "current_to_pickup_distance": round(current_to_pickup_dist, 2),
                "pickup_to_dropoff_distance": round(pickup_to_dropoff_dist, 2),
                "time": round(total_time, 2),
                "path": path,
                "locations": {
                    "current": {"lat": current_loc.latitude, "lon": current_loc.longitude},
                    "pickup": {"lat": pickup_loc.latitude, "lon": pickup_loc.longitude},
                    "dropoff": {"lat": dropoff_loc.latitude, "lon": dropoff_loc.longitude}
                },
            },
            "logs": days
        })
    