from rest_framework.authentication import BaseAuthentication
from rest_framework.exceptions import AuthenticationFailed
from django.contrib.auth.hashers import check_password
from .models import ExternalAPIKey

class APIKeyAuthentication(BaseAuthentication):
    """
    Authenticate requests using an API Key provided in the header.
    Header: 'X-API-KEY: <key>'
    Key Format: 'sPk_<prefix>.<secret>'
    """
    def authenticate(self, request):
        api_key = request.headers.get('X-API-KEY')
        
        if not api_key:
            return None  # No key, let other auth methods try (or fail permission)
            
        # Parse Key Format: sPk_<prefix>.<secret>
        try:
            if not api_key.startswith('sPk_'):
                raise ValueError("Invalid format")
            
            parts = api_key.split('.')
            if len(parts) != 2:
                raise ValueError("Invalid format")
                
            prefix_part = parts[0][4:] # Remove 'sPk_'
            secret_part = parts[1]
            
        except ValueError:
            raise AuthenticationFailed('Invalid API Key Format')

        try:
            # Lookup by Prefix (Fast)
            key_obj = ExternalAPIKey.objects.get(prefix=prefix_part)
        except ExternalAPIKey.DoesNotExist:
            raise AuthenticationFailed('Invalid API Key')
            
        # Verify Secret Hash (Secure)
        if not check_password(secret_part, key_obj.hashed_key):
             raise AuthenticationFailed('Invalid API Key')
            
        if not key_obj.is_active:
            raise AuthenticationFailed('API Key is inactive')
            
        if not key_obj.user.is_active:
            raise AuthenticationFailed('User account is inactive')
            
        return (key_obj.user, key_obj)  # request.user, request.auth

