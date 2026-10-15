#!/usr/bin/env bash
# Tegagn Automated Production Build Script for Render / Railway PaaS
set -o errexit

echo "==> [1/4] Installing Python production dependencies..."
pip install --upgrade pip
pip install -r requirements.txt

echo "==> [2/4] Collecting static assets via WhiteNoise..."
python manage.py collectstatic --no-input

echo "==> [3/4] Applying PostgreSQL database migrations..."
python manage.py migrate --no-input

echo "==> [4/4] Verifying system readiness..."
python manage.py check --deploy

echo "==> Build completed successfully!"
