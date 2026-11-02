FROM debian:bookworm

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    DEBIAN_FRONTEND=noninteractive

# Add testing repository for Python 3.12
RUN echo "deb http://deb.debian.org/debian testing main" > /etc/apt/sources.list.d/testing.list

RUN apt-get update && apt-get install -y \
    # Python 3.12 from testing
    python3.12 \
    python3.12-venv \
    python3.12-dev \
    python3-pip \
    # PostgreSQL dependencies
    libpq-dev \
    gcc \
    # WeasyPrint dependencies
    libpango-1.0-0 \
    libpangoft2-1.0-0 \
    libcairo2 \
    libgdk-pixbuf2.0-0 \
    libffi-dev \
    shared-mime-info \
    && rm -rf /var/lib/apt/lists/*

# Make python3.12 the default
RUN update-alternatives --install /usr/bin/python python /usr/bin/python3.12 1

WORKDIR /app

COPY requirements.txt .

RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000

CMD ["uvicorn", "MakerspaceService.asgi:application", "--host", "0.0.0.0", "--port", "8000"]