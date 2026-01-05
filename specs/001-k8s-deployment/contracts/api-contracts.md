# API Contracts for Kubernetes Deployment

## Backend Service Contracts

### Health Check Endpoint
- **Endpoint**: `GET /health`
- **Purpose**: Health check for Docker and Kubernetes
- **Request**:
  - Method: GET
  - Path: `/health`
  - Headers: None required
  - Body: None
- **Response**:
  - Status: 200 OK
  - Content-Type: application/json
  - Body: `{"status": "healthy"}`
- **Error Responses**:
  - 503 Service Unavailable (if service is unhealthy)

## Frontend to Backend Communication Contracts

### Backend API Base URL
- **Environment Variable**: `NEXT_PUBLIC_API_URL`
- **Default Value**: `http://backend-service:8000`
- **Purpose**: Configuration for frontend to communicate with backend
- **Usage**: All API calls from frontend should be prefixed with this URL

## Configuration Contracts

### Environment Variable Contracts

#### Backend Environment Variables
- **DATABASE_URL**:
  - Type: String
  - Purpose: PostgreSQL connection string
  - Format: Standard PostgreSQL connection URL
  - Required: Yes
  - Source: Kubernetes Secret

- **OPENAI_API_KEY**:
  - Type: String
  - Purpose: OpenAI API authentication
  - Format: Valid OpenAI API key
  - Required: Yes
  - Source: Kubernetes Secret

- **MCP_SERVER_PORT**:
  - Type: String
  - Purpose: MCP server port configuration
  - Default: "8001"
  - Required: No (has default)
  - Source: Kubernetes ConfigMap

- **CORS_ORIGINS**:
  - Type: String
  - Purpose: Allowed CORS origins
  - Default: "*"
  - Required: No (has default)
  - Source: Kubernetes ConfigMap

#### Frontend Environment Variables
- **NEXT_PUBLIC_API_URL**:
  - Type: String
  - Purpose: Backend API URL for frontend
  - Default: "http://backend-service:8000"
  - Required: Yes
  - Source: Kubernetes ConfigMap

## Kubernetes Service Contracts

### Backend Service
- **Service Name**: `backend-service`
- **Type**: ClusterIP
- **Port**: 8000
- **Target Port**: 8000
- **Purpose**: Internal communication within Kubernetes cluster
- **Consumer**: Frontend service, external clients via ingress (future)
- **Protocol**: HTTP

### Frontend Service
- **Service Name**: `frontend-service`
- **Type**: NodePort
- **Port**: 3000
- **Target Port**: 3000
- **NodePort**: 30001 (or auto-assigned)
- **Purpose**: External access to the application
- **Consumer**: End users
- **Protocol**: HTTP

## Docker Image Contracts

### Backend Image
- **Image Name**: `todo-backend:latest`
- **Exposed Port**: 8000
- **Health Check**: `curl http://localhost:8000/health`
- **Entrypoint**: `uvicorn main:app --host 0.0.0.0 --port 8000`
- **Working Directory**: `/app`
- **User**: Non-root user

### Frontend Image
- **Image Name**: `todo-frontend:latest`
- **Exposed Port**: 3000
- **Health Check**: `curl http://localhost:3000/`
- **Entrypoint**: `node server.js`
- **Working Directory**: `/app`
- **User**: Non-root user

## Docker Compose Service Contracts

### Backend Service in Compose
- **Service Name**: `backend`
- **Build Context**: `./backend`
- **Ports**: `8000:8000`
- **Environment**:
  - `DATABASE_URL`: From .env file
  - `OPENAI_API_KEY`: From .env file
  - `MCP_SERVER_PORT`: "8001"
- **Health Check**: `curl -f http://localhost:8000/health || exit 1`
- **Depends On**: None (standalone)

### Frontend Service in Compose
- **Service Name**: `frontend`
- **Build Context**: `./frontend`
- **Ports**: `3000:3000`
- **Environment**:
  - `NEXT_PUBLIC_API_URL`: "http://backend:8000"
- **Depends On**: `backend`

## Helm Chart Parameter Contracts

### Backend Configuration Parameters
- **backend.name**:
  - Type: String
  - Default: "backend"
  - Purpose: Name for backend deployment and service

- **backend.replicaCount**:
  - Type: Integer
  - Default: 1
  - Purpose: Number of backend replicas

- **backend.image.repository**:
  - Type: String
  - Default: "todo-backend"
  - Purpose: Backend image repository

- **backend.image.tag**:
  - Type: String
  - Default: "latest"
  - Purpose: Backend image tag

- **backend.image.pullPolicy**:
  - Type: String
  - Default: "Never"
  - Purpose: Image pull policy (Never for Minikube)

- **backend.service.type**:
  - Type: String
  - Default: "ClusterIP"
  - Purpose: Backend service type

- **backend.service.port**:
  - Type: Integer
  - Default: 8000
  - Purpose: Backend service port

### Frontend Configuration Parameters
- **frontend.name**:
  - Type: String
  - Default: "frontend"
  - Purpose: Name for frontend deployment and service

- **frontend.replicaCount**:
  - Type: Integer
  - Default: 1
  - Purpose: Number of frontend replicas

- **frontend.image.repository**:
  - Type: String
  - Default: "todo-frontend"
  - Purpose: Frontend image repository

- **frontend.image.tag**:
  - Type: String
  - Default: "latest"
  - Purpose: Frontend image tag

- **frontend.image.pullPolicy**:
  - Type: String
  - Default: "Never"
  - Purpose: Image pull policy (Never for Minikube)

- **frontend.service.type**:
  - Type: String
  - Default: "NodePort"
  - Purpose: Frontend service type

- **frontend.service.port**:
  - Type: Integer
  - Default: 3000
  - Purpose: Frontend service port

- **frontend.service.nodePort**:
  - Type: Integer
  - Default: 30001
  - Purpose: Frontend NodePort (if service type is NodePort)

## Resource Requirements Contracts

### Backend Resource Requirements
- **CPU Request**: 100m
- **CPU Limit**: 500m
- **Memory Request**: 256Mi
- **Memory Limit**: 512Mi

### Frontend Resource Requirements
- **CPU Request**: 100m
- **CPU Limit**: 500m
- **Memory Request**: 256Mi
- **Memory Limit**: 512Mi