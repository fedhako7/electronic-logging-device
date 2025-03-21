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
            response = requests.get(url, timeout=10).json()
            if response.get("code") != "Ok" or "routes" not in response:
                return Response({"error": "OSRM API failed", "details": response}, status=500)

            total_dist = response['routes'][0]['distance'] / 1609.34
            total_time = response['routes'][0]['duration'] / 3600
            path = response['routes'][0]['geometry']
            speed = total_dist / total_time if total_time > 0 else 0
        except requests.RequestException as e:
            return Response({"error": f"OSRM request failed: {str(e)}"}, status=500)

        days = split_trip(total_time, total_dist, 70 - cycle_used, speed)

        return Response({
            "route": {"distance": round(total_dist, 2), "time": round(total_time, 2), "path": path},
            "logs": days
        })
    