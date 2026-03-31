# Kubernetes Deployment Guide

This directory contains Kubernetes manifests for deploying the Professional Chess Game application.

## Prerequisites

- Docker installed on your machine
- Kubernetes cluster (minikube, kind, or cloud provider)
- kubectl configured to communicate with your cluster
- (Optional) nginx-ingress-controller for Ingress support

## Quick Start

### 1. Build the Docker Image

```bash
# Build the Docker image
docker build -t chess-game:latest .

# For minikube, use the minikube docker daemon
eval $(minikube docker-env)
docker build -t chess-game:latest .
```

### 2. Deploy to Kubernetes

```bash
# Apply all Kubernetes manifests
kubectl apply -f kubernetes/

# Or apply individually
kubectl apply -f kubernetes/deployment.yaml
kubectl apply -f kubernetes/service.yaml
kubectl apply -f kubernetes/ingress.yaml
```

### 3. Verify Deployment

```bash
# Check deployment status
kubectl get deployments
kubectl get pods
kubectl get services

# Check logs
kubectl logs -l app=chess-game

# Get deployment details
kubectl describe deployment chess-game
```

## Configuration Files

### deployment.yaml

Defines the Deployment resource with:
- **Replicas**: 2 instances for high availability
- **Resources**:
  - Requests: 128Mi memory, 100m CPU
  - Limits: 256Mi memory, 200m CPU
- **Health Checks**:
  - Liveness probe on `/health` endpoint
  - Readiness probe on `/health` endpoint

### service.yaml

Defines the Service resource with:
- **Type**: ClusterIP (internal cluster access)
- **Port**: 80
- **Selector**: Routes traffic to pods with label `app: chess-game`

### ingress.yaml

Defines the Ingress resource with:
- **Host**: chess-game.local
- **Path**: / (all paths)
- **Backend**: chess-game service on port 80

## Accessing the Application

### Option 1: Port Forwarding (Development)

```bash
kubectl port-forward service/chess-game 8080:80
```

Then access: http://localhost:8080

### Option 2: NodePort (Local Cluster)

Modify `service.yaml` to use NodePort:

```yaml
spec:
  type: NodePort
  ports:
  - port: 80
    targetPort: 80
    nodePort: 30080
```

Then access: http://<node-ip>:30080

### Option 3: Ingress (Production)

Ensure nginx-ingress-controller is installed:

```bash
# For minikube
minikube addons enable ingress

# For other clusters
kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.8.1/deploy/static/provider/cloud/deploy.yaml
```

Add to `/etc/hosts`:
```
<ingress-ip> chess-game.local
```

Then access: http://chess-game.local

### Option 4: LoadBalancer (Cloud Provider)

Modify `service.yaml` to use LoadBalancer:

```yaml
spec:
  type: LoadBalancer
```

Get external IP:
```bash
kubectl get service chess-game
```

## Scaling

### Scale Replicas

```bash
# Scale up to 5 replicas
kubectl scale deployment chess-game --replicas=5

# Scale down to 1 replica
kubectl scale deployment chess-game --replicas=1
```

### Autoscaling

Create HorizontalPodAutoscaler:

```bash
kubectl autoscale deployment chess-game --cpu-percent=80 --min=2 --max=10
```

## Updates and Rollbacks

### Rolling Update

```bash
# Build new image with tag
docker build -t chess-game:v2 .

# Update deployment
kubectl set image deployment/chess-game chess-game=chess-game:v2

# Monitor rollout
kubectl rollout status deployment/chess-game
```

### Rollback

```bash
# Rollback to previous version
kubectl rollout undo deployment/chess-game

# Rollback to specific revision
kubectl rollout undo deployment/chess-game --to-revision=2

# Check rollout history
kubectl rollout history deployment/chess-game
```

## Monitoring

### Check Pod Status

```bash
kubectl get pods -l app=chess-game -w
```

### View Logs

```bash
# All pods
kubectl logs -l app=chess-game --tail=100 -f

# Specific pod
kubectl logs <pod-name> -f
```

### Health Checks

```bash
# Execute health check in pod
kubectl exec -it <pod-name> -- curl http://localhost/health
```

## Cleanup

```bash
# Delete all resources
kubectl delete -f kubernetes/

# Or delete individually
kubectl delete deployment chess-game
kubectl delete service chess-game
kubectl delete ingress chess-game
```

## Troubleshooting

### Pods not starting

```bash
# Check pod status
kubectl describe pod <pod-name>

# Check events
kubectl get events --sort-by='.lastTimestamp'
```

### Image pull errors

```bash
# For minikube, ensure using minikube docker daemon
eval $(minikube docker-env)

# Rebuild image
docker build -t chess-game:latest .
```

### Service not accessible

```bash
# Check service endpoints
kubectl get endpoints chess-game

# Test service from within cluster
kubectl run -it --rm debug --image=alpine --restart=Never -- sh
# Then: wget -O- http://chess-game
```

## Production Considerations

1. **Image Registry**: Push images to a container registry (Docker Hub, ECR, GCR)
   ```bash
   docker tag chess-game:latest your-registry/chess-game:v1
   docker push your-registry/chess-game:v1
   ```

2. **Resource Limits**: Adjust based on actual usage patterns

3. **Security**:
   - Use non-root user in Dockerfile
   - Implement network policies
   - Use secrets for sensitive data

4. **Monitoring**: Integrate with Prometheus/Grafana

5. **Logging**: Use centralized logging (ELK stack, Loki)

6. **SSL/TLS**: Configure SSL certificates in Ingress for HTTPS

## Additional Resources

- [Kubernetes Documentation](https://kubernetes.io/docs/)
- [kubectl Cheat Sheet](https://kubernetes.io/docs/reference/kubectl/cheatsheet/)
- [nginx-ingress-controller](https://kubernetes.github.io/ingress-nginx/)
