# Data Model Design for Kubernetes Deployment

## Configuration Entities

### Environment Variables
- **DATABASE_URL** (sensitive)
  - Type: String
  - Purpose: PostgreSQL connection string
  - Source: Kubernetes Secret
  - Validation: Must be valid PostgreSQL connection string

- **OPENAI_API_KEY** (sensitive)
  - Type: String
  - Purpose: OpenAI API authentication
  - Source: Kubernetes Secret
  - Validation: Must be valid OpenAI API key format

- **NEXT_PUBLIC_API_URL** (non-sensitive)
  - Type: String
  - Purpose: Backend API URL for frontend
  - Source: Kubernetes ConfigMap
  - Default: "http://backend-service:8000"
  - Validation: Must be valid HTTP/HTTPS URL

- **MCP_SERVER_PORT** (non-sensitive)
  - Type: String/Number
  - Purpose: MCP server port configuration
  - Source: Kubernetes ConfigMap
  - Default: "8001"
  - Validation: Must be valid port number

- **CORS_ORIGINS** (non-sensitive)
  - Type: String
  - Purpose: Allowed CORS origins
  - Source: Kubernetes ConfigMap
  - Default: "*"
  - Validation: Must be valid origin format

## Kubernetes Entities

### ConfigMap: todo-config
- **Purpose**: Store non-sensitive configuration
- **Data**:
  - NEXT_PUBLIC_API_URL: "http://backend-service:8000"
  - MCP_SERVER_PORT: "8001"
  - CORS_ORIGINS: "*"
- **Usage**: Mounted as environment variables in deployments

### Secret: todo-secrets (to be created manually)
- **Purpose**: Store sensitive configuration
- **Data**:
  - DATABASE_URL: [base64 encoded]
  - OPENAI_API_KEY: [base64 encoded]
- **Usage**: Mounted as environment variables in deployments

## Docker Image Entities

### Backend Docker Image
- **Name**: todo-backend:latest
- **Base**: python:3.13-slim
- **Dependencies**:
  - UV package manager
  - Dependencies from pyproject.toml and uv.lock
- **Artifacts**: Python application code
- **Ports**: 8000
- **Health Check**: curl http://localhost:8000/health

### Frontend Docker Image
- **Name**: todo-frontend:latest
- **Base**: node:20-alpine (builder and runner)
- **Dependencies**:
  - Node.js packages from package.json and package-lock.json
- **Build Artifacts**: Next.js standalone output
- **Ports**: 3000
- **Health Check**: curl http://localhost:3000/

## Kubernetes Deployment Entities

### Backend Deployment
- **Name**: backend
- **Replicas**: 1 (configurable)
- **Container**:
  - Image: todo-backend:latest
  - Port: 8000
  - Environment Variables: From ConfigMap and Secret
  - Resources: CPU/Memory requests and limits
  - Probes: Liveness and readiness checking /health endpoint

### Frontend Deployment
- **Name**: frontend
- **Replicas**: 1 (configurable)
- **Container**:
  - Image: todo-frontend:latest
  - Port: 3000
  - Environment Variables: From ConfigMap
  - Resources: CPU/Memory requests and limits
  - Probes: Liveness and readiness checking root endpoint

## Kubernetes Service Entities

### Backend Service
- **Name**: backend-service
- **Type**: ClusterIP
- **Port**: 8000
- **Target Port**: 8000
- **Purpose**: Internal communication within cluster

### Frontend Service
- **Name**: frontend-service
- **Type**: NodePort
- **Port**: 3000
- **Target Port**: 3000
- **NodePort**: 30001 (or auto-assigned)
- **Purpose**: External access to the application

## Helm Chart Entities

### Chart Metadata
- **Name**: todo-app
- **Version**: 1.0.0
- **AppVersion**: "1.0"
- **Description**: Helm chart for Todo Application with AI Chatbot
- **Type**: application

### Default Values Structure
- **backend**:
  - name: backend
  - replicaCount: 1
  - image: {repository: todo-backend, tag: latest, pullPolicy: Never}
  - service: {type: ClusterIP, port: 8000}
  - resources: {requests: {cpu: 100m, memory: 256Mi}, limits: {cpu: 500m, memory: 512Mi}}
  - env: {MCP_SERVER_PORT: "8001", CORS_ORIGINS: "*"}

- **frontend**:
  - name: frontend
  - replicaCount: 1
  - image: {repository: todo-frontend, tag: latest, pullPolicy: Never}
  - service: {type: NodePort, port: 3000, nodePort: 30001}
  - resources: {requests: {cpu: 100m, memory: 256Mi}, limits: {cpu: 500m, memory: 512Mi}}
  - env: {NEXT_PUBLIC_API_URL: "http://backend-service:8000"}

- **config**:
  - MCP_SERVER_PORT: "8001"
  - CORS_ORIGINS: "*"
  - NEXT_PUBLIC_API_URL: "http://backend-service:8000"

## File System Entities

### Docker Context
- **backend/Dockerfile**: Backend container definition
- **backend/.dockerignore**: Files to exclude from backend build
- **frontend/Dockerfile**: Frontend container definition
- **frontend/.dockerignore**: Files to exclude from frontend build

### Docker Compose
- **docker-compose.yml**: Local development orchestration

### Kubernetes Manifests
- **k8s/configmap.yaml**: ConfigMap definition
- **k8s/backend-deployment.yaml**: Backend deployment definition
- **k8s/backend-service.yaml**: Backend service definition
- **k8s/frontend-deployment.yaml**: Frontend deployment definition
- **k8s/frontend-service.yaml**: Frontend service definition

### Helm Chart Structure
- **helm-charts/Chart.yaml**: Chart metadata
- **helm-charts/values.yaml**: Default values
- **helm-charts/templates/configmap.yaml**: ConfigMap template
- **helm-charts/templates/backend-deployment.yaml**: Backend deployment template
- **helm-charts/templates/backend-service.yaml**: Backend service template
- **helm-charts/templates/frontend-deployment.yaml**: Frontend deployment template
- **helm-charts/templates/frontend-service.yaml**: Frontend service template