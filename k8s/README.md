# Kubernetes Deployment Guide

This guide provides instructions for deploying the Professional Chess Game application to Kubernetes.

## Prerequisites

- Docker installed
- Kubernetes cluster (minikube, kind, or cloud provider)
- kubectl configured to access your cluster
- NGINX Ingress Controller installed in your cluster

## Building the Docker Image

Build the multistage Docker image:

```bash
docker build -t chess-game:latest .
```

For production, tag and push to a container registry:

```bash
docker tag chess-game:latest <your-registry>/chess-game:latest
docker push <your-registry>/chess-game:latest
```

Then update `k8s/deployment.yaml` to use your registry image.

## Deploying to Kubernetes

### Quick Start

Deploy all resources at once:

```bash
kubectl apply -f k8s/
```

### Step-by-Step Deployment

1. **Create the namespace:**
   ```bash
   kubectl apply -f k8s/namespace.yaml
   ```

2. **Deploy the application:**
   ```bash
   kubectl apply -f k8s/deployment.yaml
   ```

3. **Create the service:**
   ```bash
   kubectl apply -f k8s/service.yaml
   ```

4. **Create the ingress:**
   ```bash
   kubectl apply -f k8s/ingress.yaml
   ```

## Verify Deployment

Check if pods are running:

```bash
kubectl get pods -n chess-game
```

Check service:

```bash
kubectl get svc -n chess-game
```

Check ingress:

```bash
kubectl get ingress -n chess-game
```

## Access the Application

### Using Ingress (Recommended)

Add the following entry to your `/etc/hosts` file:

```
<ingress-controller-ip> chess-game.local
```

Then access the application at: `http://chess-game.local`

### Using Port Forwarding (Development)

```bash
kubectl port-forward -n chess-game svc/chess-game 8080:80
```

Then access the application at: `http://localhost:8080`

## Useful Commands

View logs:
```bash
kubectl logs -n chess-game -l app=chess-game
```

Scale deployment:
```bash
kubectl scale deployment chess-game -n chess-game --replicas=3
```

Delete all resources:
```bash
kubectl delete -f k8s/
```

## Architecture

- **Multistage Dockerfile**:
  - Stage 1: Builds the React application using Node.js 20
  - Stage 2: Serves the built static files using nginx 1.27-alpine

- **Kubernetes Resources**:
  - Namespace: Isolates the application
  - Deployment: Runs 2 replicas with health checks
  - Service: ClusterIP service exposing port 80
  - Ingress: Routes external traffic to the service

## Resource Limits

The deployment is configured with:
- Memory: 128Mi request, 256Mi limit
- CPU: 100m request, 200m limit

Adjust these values in `k8s/deployment.yaml` based on your needs.

## Health Checks

- **Liveness Probe**: Checks if the container is alive (HTTP GET /)
- **Readiness Probe**: Checks if the container is ready to serve traffic (HTTP GET /)
