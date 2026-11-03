"""
Django settings for RemoLabService project.
"""

import os
from pathlib import Path

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent

# ==============================================================================
# 1. DOCKER SECRETS HELPER
# ==============================================================================
def read_secret(secret_name):
    """Reads a secret from the Docker /run/secrets/ directory."""
    try:
        with open(f'/run/secrets/{secret_name}', 'r') as f:
            return f.read().strip()
    except FileNotFoundError:
        # Fallback for local development without Docker secrets
        return None

# ==============================================================================
# 2. CORE SETTINGS
# ==============================================================================
# SECURITY WARNING: Keep the secret key used in production secret!
SECRET_KEY = read_secret('django_secret_key') or 'unsafe-default-dev-key-change-me'

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = os.getenv('DEBUG', 'False') == 'True'

ALLOWED_HOSTS = os.getenv('ALLOWED_HOSTS', 'localhost,127.0.0.1').split(',')

# ==============================================================================
# 3. APPLICATION DEFINITIONS
# ==============================================================================
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',

    # Third-party apps
    'corsheaders',          # MUST be loaded early
    'rest_framework',
    'channels',
    'django_otp',
    'django_otp.plugins.otp_totp',   # For TOTP (Google Authenticator)
    'django_otp.plugins.otp_static', # For backup codes
    'auditlog',                      # For tracking model changes
    
    # Your local apps (add your own apps here)
    # 'catalog',
    # 'users',
    # 'jobs',
    'Organizations',
]

# ==============================================================================
# 4. MIDDLEWARE
# ==============================================================================
MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware', # MUST BE AT THE VERY TOP
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.locale.LocaleMiddleware', # Required for i18n (Arabic/English/French)
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django_otp.middleware.OTPMiddleware',       # Required for 2FA
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
    'auditlog.middleware.AuditlogMiddleware',    # For tracking changes
]

ROOT_URLCONF = 'MakerspaceService.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [BASE_DIR / 'templates'],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

# ==============================================================================
# 5. WSGI / ASGI (Required for Django Channels / WebSockets)
# ==============================================================================
WSGI_APPLICATION = 'MakerspaceService.wsgi.application'
ASGI_APPLICATION = 'MakerspaceService.asgi.application'

# ==============================================================================
# 6. DATABASE (PostgreSQL via Docker Secrets)
# ==============================================================================
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': read_secret('db_name') or 'makerspace_db',
        'USER': read_secret('db_user') or 'makerspace_user',
        'PASSWORD': read_secret('db_password') or 'password',
        'HOST': os.getenv('DB_HOST', 'db'),
        'PORT': os.getenv('DB_PORT', '5432'),
    }
}

# ==============================================================================
# 7. PASSWORD VALIDATION
# ==============================================================================
AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator'},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},
]

# ==============================================================================
# 8. INTERNATIONALIZATION (i18n)
# ==============================================================================
LANGUAGE_CODE = 'en'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_TZ = True

LANGUAGES = [
    ('en', 'English'),
    ('ar', 'Arabic'),
    ('fr', 'French'),
]

# ==============================================================================
# 9. STATIC & MEDIA FILES (Mapped to Docker Volumes)
# ==============================================================================
STATIC_URL = '/static/'
STATIC_ROOT = '/app/static/'  # Where `collectstatic` gathers files for Nginx

MEDIA_URL = '/media/'
MEDIA_ROOT = '/app/media/'    # Where user uploads (3D files, PDFs) are stored

# ==============================================================================
# 10. CORS CONFIGURATION (Crucial for React on port 8080)
# ==============================================================================
CORS_ALLOWED_ORIGINS = [
    "http://localhost:8080",
    "http://127.0.0.1:8080",
]
CORS_ALLOW_CREDENTIALS = True  # Required for sending session cookies/2FA tokens

# ==============================================================================
# 11. DJANGO REST FRAMEWORK
# ==============================================================================
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework.authentication.SessionAuthentication', # For browser/cookie auth
        'rest_framework.authentication.TokenAuthentication',   # Or JWT if you add it later
    ],
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticated',
    ],
    'DEFAULT_SCHEMA_CLASS': 'drf_spectacular.openapi.AutoSchema', # For OpenAPI docs
}

# ==============================================================================
# 12. DJANGO CHANNELS & REDIS (Live Data / WebSockets)
# ==============================================================================
CHANNEL_LAYERS = {
    'default': {
        'BACKEND': 'channels_redis.core.RedisChannelLayer',
        'CONFIG': {
            "hosts": [os.getenv('REDIS_URL', 'redis://redis:6379/0')],
        },
    },
}

# ==============================================================================
# 13. DEFAULT AUTO FIELD
# ==============================================================================
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'