# Quickstart Guide for Kubernetes Deployment

## Prerequisites

Before starting with the Kubernetes deployment, ensure you have the following tools installed:

- Docker Desktop (with Docker Compose)
- Minikube
- kubectl
- Helm v3+
- Git

## Quick Setup Steps

### 1. Clone and Navigate to Project
```bash
git clone [your-repo-url]
cd hackathon2-todo-app
```

### 2. Build Docker Images
```bash
# Backend
docker build -t todo-backend:latest ./backend

# Frontend
docker build -t todo-frontend:latest ./frontend
```

### 3. Test with Docker Compose (Optional)
```bash
docker-compose up
```
Access the application at http://localhost:3000

### 4. Start Minikube
```bash
minikube start --cpus=2 --memory=4096
```

### 5. Load Docker Images to Minikube
```bash
minikube image load todo-backend:latest
minikube image load todo-frontend:latest
```

### 6. Create Kubernetes Secrets
```bash
kubectl create secret generic todo-secrets \
  --from-literal=DATABASE_URL='your-neon-db-url' \
  --from-literal=OPENAI_API_KEY='your-openai-key'
```

### 7. Deploy with Raw Kubernetes Manifests
```bash
# Apply ConfigMap
kubectl apply -f k8s/configmap.yaml

# Apply Backend
kubectl apply -f k8s/backend-deployment.yaml
kubectl apply -f k8s/backend-service.yaml

# Apply Frontend
kubectl apply -f k8s/frontend-deployment.yaml
kubectl apply -f k8s/frontend-service.yaml
```

### 8. Access the Application
```bash
minikube service frontend-service --url
```

## Alternative: Deploy with Helm

### 1. Install Helm Chart
```bash
helm install todo-app ./helm-charts
```

### 2. Access the Application
```bash
minikube service frontend-service --url
```

## Quick Verification Commands

### Check Deployments
```bash
kubectl get deployments
```

### Check Pods
```bash
kubectl get pods
```

### Check Services
```bash
kubectl get services
```

### Check Application Logs
```bash
# Backend logs
kubectl logs -f deployment/backend

# Frontend logs
kubectl logs -f deployment/frontend
```

## Quick Cleanup

### Remove Helm Release
```bash
helm uninstall todo-app
```

### Or Remove Raw Manifests
```bash
kubectl delete -f k8s/
```

### Stop Minikube
```bash
minikube stop
```

## Troubleshooting Quick Fixes

### If Pods Are Not Starting
```bash
kubectl describe pod <pod-name>
```

### If Services Are Not Accessible
```bash
kubectl get endpoints
```

### If You Need Direct Access to Pods
```bash
kubectl exec -it <pod-name> -- /bin/sh
```

## Next Steps

After successful deployment, you can:

1. Scale your deployments: `kubectl scale deployment/backend --replicas=2`
2. Update your Helm chart: `helm upgrade todo-app ./helm-charts`
3. Add monitoring and logging solutions
4. Configure ingress for better external access
5. Set up CI/CD pipelines for automated deployments