# Phase 4: Kubernetes Deployment Guide

## Overview
Complete guide for deploying the Todo AI Chatbot on local Kubernetes (Minikube).

## Prerequisites
- Docker Desktop installed
- Minikube installed
- kubectl installed
- Helm installed (v3+)

## Architecture
[Diagram showing Frontend Pod -> Backend Pod -> Neon DB]

## Step 1: Local Docker Testing

### Build Docker Images
```bash
# Backend
docker build -t todo-backend:latest ./backend

# Frontend
docker build -t todo-frontend:latest ./frontend
```

### Test with Docker Compose
```bash
# Start services
docker-compose up

# Test in browser
http://localhost:3000

# Stop services
docker-compose down
```

## Step 2: Minikube Setup

### Start Minikube
```bash
minikube start --cpus=2 --memory=4096
```

### Load Docker Images
```bash
minikube image load todo-backend:latest
minikube image load todo-frontend:latest
```

### Verify Images
```bash
minikube image ls | grep todo
```

## Step 3: Create Kubernetes Secrets

### Create Secret for Sensitive Data
```bash
kubectl create secret generic todo-secrets \
  --from-literal=DATABASE_URL='your-neon-db-url' \
  --from-literal=OPENAI_API_KEY='your-openai-key'
```

### Verify Secret
```bash
kubectl get secrets
```

## Step 4: Deploy with Raw Kubernetes Manifests

### Apply Configurations
```bash
# ConfigMap
kubectl apply -f k8s/configmap.yaml

# Backend
kubectl apply -f k8s/backend-deployment.yaml
kubectl apply -f k8s/backend-service.yaml

# Frontend
kubectl apply -f k8s/frontend-deployment.yaml
kubectl apply -f k8s/frontend-service.yaml
```

### Verify Deployment
```bash
kubectl get deployments
kubectl get pods
kubectl get services
```

### Access Application
```bash
minikube service frontend-service --url
```

## Step 5: Deploy with Helm (Recommended)

### Install Helm Chart
```bash
helm install todo-app ./helm-charts
```

### Verify Deployment
```bash
helm list
kubectl get all
```

### Access Application
```bash
minikube service frontend-service --url
```

### Upgrade Deployment
```bash
helm upgrade todo-app ./helm-charts
```

### Uninstall
```bash
helm uninstall todo-app
```

## Step 6: Monitoring and Debugging

### Check Pod Logs
```bash
# Backend logs
kubectl logs -f deployment/backend

# Frontend logs
kubectl logs -f deployment/frontend
```

### Describe Resources
```bash
kubectl describe pod <pod-name>
kubectl describe service backend-service
```

### Port Forwarding (Alternative Access)
```bash
# Frontend
kubectl port-forward service/frontend-service 3000:3000

# Backend
kubectl port-forward service/backend-service 8000:8000
```

### Execute Commands in Pod
```bash
kubectl exec -it <pod-name> -- /bin/sh
```

## Step 7: Testing the Application

### Test Frontend
- Open browser to Minikube URL
- Test task creation, update, deletion
- Test AI chatbot functionality

### Test Backend API
```bash
# Get Minikube IP
minikube ip

# Test health endpoint
curl http://<minikube-ip>:<nodeport>/health
```

## Troubleshooting

### Pod Not Starting
```bash
kubectl describe pod <pod-name>
kubectl logs <pod-name>
```

### Image Pull Errors
- Ensure `imagePullPolicy: Never` for Minikube
- Verify image loaded: `minikube image ls`

### Service Not Accessible
```bash
# Check service endpoints
kubectl get endpoints

# Use port-forward
kubectl port-forward service/frontend-service 3000:3000
```

### Environment Variables Not Set
```bash
# Check ConfigMap
kubectl describe configmap todo-config

# Check Secrets
kubectl get secret todo-secrets -o yaml
```

## Updating the Application

### Rebuild and Redeploy
```bash
# Build new image
docker build -t todo-backend:latest ./backend

# Load to Minikube
minikube image load todo-backend:latest

# Restart deployment
kubectl rollout restart deployment/backend

# Or with Helm
helm upgrade todo-app ./helm-charts
```

## Cleanup

### Delete All Resources
```bash
# With kubectl
kubectl delete -f k8s/

# With Helm
helm uninstall todo-app

# Stop Minikube
minikube stop

# Delete Minikube cluster
minikube delete
```

## Production Considerations (Phase 5 Preview)

- Use proper image registry (Docker Hub, etc.)
- Implement proper secrets management
- Configure resource limits
- Set up horizontal pod autoscaling
- Implement ingress for external access
- Add monitoring and logging

## Additional Resources

- Minikube: https://minikube.sigs.k8s.io/
- Kubernetes: https://kubernetes.io/docs/
- Helm: https://helm.sh/docs/