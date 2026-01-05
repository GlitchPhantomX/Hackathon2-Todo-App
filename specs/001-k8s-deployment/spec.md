# Kubernetes Deployment Specification

## Feature Description
Create a complete Kubernetes deployment setup for Phase 4 of the hackathon by **ADDING** the following new files to the existing project:

- Docker containerization for backend and frontend
- Docker Compose configuration for local testing
- Kubernetes manifests for deployment
- Helm charts for production-ready deployments
- Documentation for deployment process

The specification must preserve all existing code while adding deployment capabilities.

## User Scenarios & Testing

### Primary User Scenarios
1. **Developer deploys locally**: Developer can build Docker images and test the application locally using Docker Compose
2. **Developer deploys to Kubernetes**: Developer can deploy the application to a local Minikube cluster
3. **Developer uses Helm**: Developer can deploy using Helm charts for easier management
4. **Developer accesses application**: End users can access the frontend application which communicates with the backend API
5. **Developer troubleshoots**: Developer can monitor and debug the deployed application

### Acceptance Scenarios
1. Docker images build successfully for both backend and frontend
2. Docker Compose successfully runs both services and they communicate properly
3. Kubernetes deployments are created and pods are running healthily
4. Services are accessible via NodePort and application functions correctly
5. Helm chart installs successfully and manages the deployment properly
6. Health checks pass for both backend and frontend services
7. Environment variables are properly configured for inter-service communication

### Edge Cases & Error Conditions
1. Image pull failures due to incorrect image policies in Minikube
2. Missing environment variables causing application startup failures
3. Port conflicts when exposing services
4. Network connectivity issues between frontend and backend services
5. Insufficient resource allocation causing pod startup failures

## Functional Requirements

### FR1: Docker Containerization
- The system SHALL provide Dockerfiles for both backend and frontend applications
- The system SHALL use appropriate base images (python:3.13-slim for backend, node:20-alpine for frontend)
- The system SHALL implement multi-stage builds for the frontend to reduce image size
- The system SHALL include proper .dockerignore files to exclude unnecessary files
- The system SHALL expose the correct ports (8000 for backend, 3000 for frontend)

### FR2: Docker Build Process
- The system SHALL install dependencies using the appropriate package managers (UV for Python, npm for Node.js)
- The system SHALL copy dependencies first for efficient layer caching
- The system SHALL build the application in the container
- The system SHALL run the application with non-root user for security

### FR3: Health Checks
- The system SHALL provide a health check endpoint at `/health` for the backend
- The system SHALL implement health checks in Dockerfiles using curl
- The system SHALL implement Kubernetes liveness and readiness probes

### FR4: Docker Compose Configuration
- The system SHALL provide a docker-compose.yml file that builds and runs both services
- The system SHALL configure proper service dependencies (frontend depends on backend)
- The system SHALL set up correct environment variables for service communication
- The system SHALL include health checks for the backend service

### FR5: Kubernetes Manifests
- The system SHALL provide ConfigMap for non-sensitive configuration
- The system SHALL provide Deployment manifests for both backend and frontend
- The system SHALL provide Service manifests to expose the applications
- The system SHALL configure proper resource requests and limits
- The system SHALL set imagePullPolicy to Never for Minikube compatibility

### FR6: Helm Chart
- The system SHALL provide a valid Helm chart with proper Chart.yaml metadata
- The system SHALL include default values in values.yaml
- The system SHALL provide templated Kubernetes manifests in templates/
- The system SHALL support configurable parameters through values

### FR7: Documentation
- The system SHALL provide comprehensive README with deployment instructions
- The system SHALL include prerequisites, setup steps, and troubleshooting guides
- The system SHALL document both raw Kubernetes and Helm deployment methods

## Non-Functional Requirements

### Performance Requirements
- Docker builds shall complete within reasonable timeframes (under 5 minutes for each)
- Application startup time shall be under 30 seconds in Kubernetes
- Service communication latency shall not exceed 100ms in local cluster

### Security Requirements
- Docker images shall run as non-root users
- Sensitive data (database URLs, API keys) shall be stored in Kubernetes secrets
- Network access shall be properly configured with appropriate service types

### Scalability Requirements
- Deployments shall support scaling to multiple replicas
- Resource requests and limits shall be configurable
- Application shall maintain statelessness for horizontal scaling

## Success Criteria

### Quantitative Metrics
- 100% of Docker builds complete successfully without errors
- Application responds to health checks within 5 seconds
- Both frontend and backend services remain healthy for at least 5 minutes after deployment
- Deployment process completes within 10 minutes including all setup steps

### Qualitative Measures
- Developers can successfully deploy the application to Minikube using provided instructions
- End users can access the frontend application and interact with backend APIs
- Application maintains the same functionality as the local development version
- Deployment process is repeatable and reliable across different environments

### Business Outcomes
- Team can demonstrate the application in a containerized environment
- Application can be deployed consistently across different Kubernetes clusters
- Deployment process is documented and maintainable for future development

## Key Entities

### Configuration Entities
- **Environment Variables**: DATABASE_URL, OPENAI_API_KEY, NEXT_PUBLIC_API_URL, MCP_SERVER_PORT, CORS_ORIGINS
- **Kubernetes ConfigMap**: Stores non-sensitive configuration data
- **Kubernetes Secrets**: Stores sensitive data like database URLs and API keys

### Deployment Entities
- **Docker Images**: todo-backend:latest, todo-frontend:latest
- **Kubernetes Deployments**: backend, frontend
- **Kubernetes Services**: backend-service (ClusterIP), frontend-service (NodePort)
- **Helm Release**: todo-app

### Network Entities
- **Backend Service**: Exposes port 8000 internally
- **Frontend Service**: Exposes port 3000 externally via NodePort
- **Service Communication**: Frontend connects to backend via http://backend-service:8000

## Assumptions

1. Developers have Docker, Minikube, kubectl, and Helm installed and configured
2. The existing application code functions correctly in local development
3. Neon PostgreSQL database is accessible from the Kubernetes cluster
4. OpenAI API key is valid and has appropriate permissions
5. Local development workflow remains unchanged after deployment setup
6. NodePort range 30000-32767 is available for service exposure
7. The next.config.ts file may need output: 'standalone' for Docker compatibility

## Dependencies

### External Dependencies
- Docker Desktop
- Minikube
- kubectl
- Helm v3+
- Neon PostgreSQL (existing cloud database)
- OpenAI API

### Internal Dependencies
- Existing backend application code (FastAPI, Python 3.13)
- Existing frontend application code (Next.js 15)
- Existing environment variables (.env, .env.local)

## Scope

### In Scope
- Creating Dockerfiles for backend and frontend
- Creating .dockerignore files
- Creating docker-compose.yml for local testing
- Creating Kubernetes deployment manifests
- Creating Helm chart with templates
- Creating comprehensive deployment documentation
- Ensuring health check endpoints work properly

### Out of Scope
- Modifying existing application code logic
- Changing existing dependency management (pyproject.toml, package.json)
- Implementing new application features
- Setting up production-grade infrastructure
- Implementing CI/CD pipelines
- Configuring monitoring and logging systems