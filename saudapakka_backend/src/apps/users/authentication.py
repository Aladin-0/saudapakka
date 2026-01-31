from rest_framework.authentication import BaseAuthentication
from rest_framework.exceptions import AuthenticationFailed
from .models import ExternalAPIKey

class APIKeyAuthentication(BaseAuthentication):
    """
    Authenticate requests using an API Key provided in the header.
    Header: 'X-API-KEY: <key>'
    """
    def authenticate(self, request):
        api_key = request.headers.get('X-API-KEY')
        
        if not api_key:
            return None  # No key, let other auth methods try (or fail permission)
            
        try:
            key_obj = ExternalAPIKey.objects.get(key=api_key)
        except ExternalAPIKey.DoesNotExist:
            raise AuthenticationFailed('Invalid API Key')
            
        if not key_obj.is_active:
            raise AuthenticationFailed('API Key is inactive')
            
        if not key_obj.user.is_active:
            raise AuthenticationFailed('User account is inactive')
            
        return (key_obj.user, key_obj)  # request.user, request.auth
