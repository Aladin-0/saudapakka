import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'saudapakka.settings')
django.setup()

from apps.users.models import User, UserAPIKey

# Create or get user
email = "bot_seller@example.com"
user, created = User.objects.get_or_create(
    email=email,
    defaults={
        'username': email,
        'first_name': 'Bot',
        'last_name': 'Seller',
        'phone_number': '1234567890',
        'is_active_seller': True, # Grant permission
        'role_category': 'SELLER'
    }
)
user.set_password('password')
user.save()

# Create Key
key_obj, k_created = UserAPIKey.objects.get_or_create(
    user=user,
    name="Test Bot Key"
)

print(f"KEY:{key_obj.key}")
