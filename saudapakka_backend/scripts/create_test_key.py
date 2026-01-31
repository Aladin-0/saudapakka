
import os
import django
import sys

# Add project root to path
sys.path.append('/app')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'saudapakka.settings')

django.setup()

from apps.users.models import User, ExternalAPIKey

def create_key():
    try:
        # Get or create a superuser/admin to attach key to
        user = User.objects.filter(is_superuser=True).first()
        if not user:
            print("No superuser found. Please create one first.")
            return

        key_obj, created = ExternalAPIKey.objects.get_or_create(
            user=user, 
            name='TestWhatsAppBot'
        )
        print(f"API_KEY:{key_obj.key}")
        print(f"USER:{user.email}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    create_key()
