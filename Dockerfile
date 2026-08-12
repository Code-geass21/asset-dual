# ==========================================
# STAGE 1: Build the React/Vite Frontend
# ==========================================
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend

# Install dependencies
COPY frontend/package*.json ./
RUN npm install

# Copy frontend source code and build it
COPY frontend/ ./

# ADD THIS LINE to prevent Portainer/VPS memory crashes!
ENV NODE_OPTIONS="--max-old-space-size=2048"

RUN npm run build

# ==========================================
# STAGE 2: Build the FastAPI Backend
# ==========================================
FROM python:3.11-slim

# Set Timezone to IST
ENV TZ=Asia/Kolkata
ENV DEBIAN_FRONTEND=noninteractive
RUN apt-get update && apt-get install -y tzdata && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install Python requirements
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the backend code
COPY backend/ backend/

# Copy the compiled React application from STAGE 1
# This places the built files into frontend/dist where FastAPI expects them
COPY --from=frontend-builder /app/frontend/dist /app/frontend/dist

# Setup SQLite Database Directory
RUN mkdir -p /app/data

EXPOSE 54320

# Start the application
CMD ["uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "54320"]
