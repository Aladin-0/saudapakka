import os

# Append this to the bottom of settings.py
settings_path = '/app/src/core/settings.py' # Adjust if your settings path is different
with open(settings_path, 'a') as f:
    f.write('\nCSRF_TRUSTED_ORIGINS = ["https://saudapakka.com", "https://www.saudapakka.com"]\n')
    f.write('SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")\n')
    f.write('SESSION_COOKIE_SECURE = True\n')
    f.write('CSRF_COOKIE_SECURE = True\n')
