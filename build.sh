#!/usr/bin/env bash
# Exit on error
set -o errexit

echo "Building Frontend..."
npm --prefix frontend install
npm --prefix frontend run build

echo "Installing Python Dependencies..."
pip install -r requirements.txt
