# FROM python:3.12-bookworm

# # Set environment variables
# ENV PYTHONDONTWRITEBYTECODE=1 \
#     PYTHONUNBUFFERED=1 \
#     DEBIAN_FRONTEND=noninteractive

# # Install system dependencies for PostgreSQL and WeasyPrint
# RUN apt-get update && apt-get install -y \
#     # PostgreSQL dependencies
#     libpq-dev \
#     gcc \
#     # WeasyPrint dependencies (for PDF generation with Arabic/RTL support)
#     libpango-1.0-0 \
#     libpangoft2-1.0-0 \
#     libcairo2 \
#     libgdk-pixbuf2.0-0 \
#     libffi-dev \
#     shared-mime-info \
#     # Cleanup
#     && rm -rf /var/lib/apt/lists/*

# # Set working directory
# WORKDIR /app

# # Copy requirements first (for better Docker layer caching)
# COPY requirements.txt .

# # Install Python dependencies
# RUN pip install --no-cache-dir --upgrade pip && \
#     pip install --no-cache-dir -r requirements.txt

# # Copy the rest of the Django project
# COPY . .

# # Make the entrypoint script executable
# RUN chmod +x /app/entrypoint.sh

# # Expose port for Django
# EXPOSE 8000

# # Run Django with Uvicorn (ASGI server for Channels/WebSockets)
# CMD ["uvicorn", "remolab.asgi:application", "--host", "0.0.0.0", "--port", "8000"]
# ENTRYPOINT ["/app/entrypoint.sh"]

FROM python:3.12-bookworm

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    DEBIAN_FRONTEND=noninteractive

RUN apt-get update && apt-get install -y \
    libpq-dev gcc \
    libpango-1.0-0 libpangoft2-1.0-0 libcairo2 libgdk-pixbuf2.0-0 libffi-dev shared-mime-info \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir --upgrade pip && pip install --no-cache-dir -r requirements.txt

COPY . .

# Make the entrypoint script executable
RUN chmod +x /app/entrypoint.sh

EXPOSE 8000

# THIS IS THE MISSING PIECE: Tell Docker to run the script first
ENTRYPOINT ["/app/entrypoint.sh"]