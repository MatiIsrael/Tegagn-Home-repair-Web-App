# ==============================================================================
# TEGAGN PRODUCTION DOCKERFILE
# Multi-stage lightweight Python image for secure production deployment
# ==============================================================================

FROM python:3.12-slim-bookworm AS base

# Set environment flags
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PORT=8000

WORKDIR /app

# Install system dependencies needed for psycopg2 compilation and network health checks
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    libpq-dev \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install python requirements
COPY requirements.txt /app/
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Copy application source code
COPY . /app/

# Collect static assets into staticfiles/
RUN python manage.py collectstatic --no-input

# Create unprivileged runtime user for security compliance
RUN useradd -m -u 1000 appuser && \
    chown -R appuser:appuser /app

USER appuser

EXPOSE 8000

# Health check to verify Django service is live
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD curl -f http://localhost:8000/api/v1/health/ || exit 1

# Launch production WSGI server
CMD ["gunicorn", "tegagn_api.wsgi:application", "--bind", "0.0.0.0:8000", "--workers", "3", "--threads", "2", "--timeout", "120"]
