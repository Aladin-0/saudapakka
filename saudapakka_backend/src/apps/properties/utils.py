import requests
from django.conf import settings

def geocode_address(address):
    """
    Geocodes an address string to (lat, lng) using Google Maps API.
    Returns (lat, lng) tuple or (None, None) if failed.
    """
    api_key = settings.GOOGLE_MAPS_API_KEY
    if not api_key:
        return None, None
        
    base_url = "https://maps.googleapis.com/maps/api/geocode/json"
    params = {
        "address": address,
        "key": api_key
    }
    
    try:
        response = requests.get(base_url, params=params)
        if response.status_code == 200:
            data = response.json()
            if data['status'] == 'OK':
                location = data['results'][0]['geometry']['location']
                return location['lat'], location['lng']
    except Exception:
        pass
        
    return None, None
