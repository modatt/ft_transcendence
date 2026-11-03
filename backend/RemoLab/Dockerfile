FROM python:3.12-bookworm

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    DEBIAN_FRONTEND=noninteractive

# Install system dependencies for PostgreSQL and WeasyPrint
RUN apt-get update && apt-get install -y \
    # PostgreSQL dependencies
    libpq-dev \
    gcc \
    # WeasyPrint dependencies (for PDF generation with Arabic/RTL support)
    libpango-1.0-0 \
    libpangoft2-1.0-0 \
    libcairo2 \
    libgdk-pixbuf2.0-0 \
    libffi-dev \
    shared-mime-info \
    # Cleanup
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy requirements first (for better Docker layer caching)
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Copy the rest of the Django project
COPY . .

# Expose port for Django
EXPOSE 8000

# Run Django with Uvicorn (ASGI server for Channels/WebSockets)
CMD ["uvicorn", "MakerspaceService.asgi:application", "--host", "0.0.0.0", "--port", "8000"]