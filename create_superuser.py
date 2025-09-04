import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'fbwildlife.settings')
django.setup()

from django.contrib.auth.models import User

# Replace these values with your desired superuser credentials
USERNAME = 'filipbajacek'
EMAIL = 'bajacek.filip@gmail.com'
PASSWORD = 'filipbajacek'

if not User.objects.filter(username=USERNAME).exists():
    User.objects.create_superuser(USERNAME, EMAIL, PASSWORD)
    print(f"Superuser {USERNAME} created successfully!")
else:
    print(f"Superuser {USERNAME} already exists.")
