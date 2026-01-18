import os
import sys
import django
from django.conf import settings

# Setup Django environment
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'saudapakka.settings')
django.setup()

def validate():
    print("Checking Production Configuration...\n")
    errors = []

    # 1. Debug Mode
    if settings.DEBUG:
        errors.append("CRITICAL: DEBUG is True. It must be False in production.")
    else:
        print("[OK] DEBUG is False")

    # 2. Secret Key
    if settings.SECRET_KEY == 'dev-only-insecure-key-replace-in-production':
        errors.append("CRITICAL: SECRET_KEY is using the insecure default.")
    elif len(settings.SECRET_KEY) < 50:
        errors.append("WARNING: SECRET_KEY is seemingly short (<50 chars).")
    else:
        print("[OK] SECRET_KEY looks secure")

    # 3. Allowed Hosts
    if '*' in settings.ALLOWED_HOSTS:
        errors.append("CRITICAL: ALLOWED_HOSTS contains '*'. This is unsafe.")
    else:
        print(f"[OK] ALLOWED_HOSTS: {settings.ALLOWED_HOSTS}")

    # 4. Email
    if '"' in settings.DEFAULT_FROM_EMAIL or "'" in settings.DEFAULT_FROM_EMAIL:
        errors.append(f"CRITICAL: DEFAULT_FROM_EMAIL contains quotes: {settings.DEFAULT_FROM_EMAIL}")
    else:
        print(f"[OK] DEFAULT_FROM_EMAIL: {settings.DEFAULT_FROM_EMAIL}")

    # 5. Database
    db_config = settings.DATABASES['default']
    if db_config['PASSWORD'] == 'hello_django' and db_config['HOST'] != 'localhost':
        errors.append("WARNING: Using default DB password 'hello_django'. Change this in production.")
    else:
        print(f"[OK] Database Host: {db_config['HOST']}")

    # 6. Security Headers
    if not settings.SECURE_SSL_REDIRECT:
        errors.append("CRITICAL: SECURE_SSL_REDIRECT is False.")
    if not settings.SESSION_COOKIE_SECURE:
        errors.append("CRITICAL: SESSION_COOKIE_SECURE is False.")
    
    # 7. Media
    if str(settings.MEDIA_ROOT) != '/app/media':
        errors.append(f"CRITICAL: MEDIA_ROOT is not '/app/media'. Current: {settings.MEDIA_ROOT}")
    else:
        print("[OK] MEDIA_ROOT is correct (/app/media)")

    print("\n------------------------------------------------")
    if errors:
        print("VALIDATION FAILED WITH ERRORS:")
        for err in errors:
            print(f"❌ {err}")
        sys.exit(1)
    else:
        print("✅ CONFIGURATION LOOKS GOOD FOR PRODUCTION!")
        sys.exit(0)

if __name__ == "__main__":
    validate()
