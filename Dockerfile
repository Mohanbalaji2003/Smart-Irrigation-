# =========================================================================
# Stage 1: Build Modern React + Tailwind Frontend
# =========================================================================
FROM node:20-alpine AS frontend-builder
WORKDIR /build

COPY frontend/package*.json ./
RUN npm ci

COPY frontend/ ./
RUN npm run build

# =========================================================================
# Stage 2: Production Python Runtime with Scikit-Learn ML Engine
# =========================================================================
FROM python:3.11-slim AS runner
WORKDIR /app

# Install system dependencies if needed
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install Python requirements
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend application and ML assets
COPY backend/ ./backend/
COPY Farm_Irrigation_System.pkl .
COPY irrigation_machine.csv .

# Copy compiled frontend from Stage 1 into frontend/dist
COPY --from=frontend-builder /build/dist ./frontend/dist

# Expose port (Render/Railway/CloudRun injects PORT environment variable)
ENV PORT=8000
ENV HOST=0.0.0.0
EXPOSE 8000

# Start unified production server
CMD ["python", "backend/run_backend.py"]
