# Deployment Guide

This document covers how to build, containerize, and deploy the Chess Game application to Kubernetes.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Architecture Overview](#architecture-overview)
- [Local Development](#local-development)
- [Docker](#docker)
- [Kubernetes Deployment](#kubernetes-deployment)
- [CI/CD Pipeline](#cicd-pipeline)
- [Configuration Reference](#configuration-reference)
- [Troubleshooting](#troubleshooting)

---

## Prerequisites

| Tool       | Minimum Version | Purpose                    |
| ---------- | --------------- | -------------------------- |
| Node.js    | 20.x            | Build the application      |
| npm        | 10.x            | Manage dependencies        |
| Docker     | 24.x            | Build container images     |
| kubectl    | 1.28+           | Interact with Kubernetes   |
| Kubernetes | 1.28+           | Run the application        |

---

## Architecture Overview

```
┌─────────────┐      ┌──────────────┐      ┌─────────────────────────┐
│   Client    │─────▶│   Ingress    │─────▶│  Service (ClusterIP)    │
│  (Browser)  │      │  (TLS/nginx) │      │     chess-game:80       │
└─────────────┘      └──────────────┘      └────────────┬────────────┘
                                                        │
                                           ┌────────────▼────────────┐
                                           │   Deployment (2+ pods)  │
                                           │  ┌─────────────────────┐│
                                           │  │  nginx:1.27-alpine  ││
                                           │  │  Serves SPA assets  ││
                                           │  └─────────────────────┘│
                                           └─────────────────────────┘
                                                        │
                                           ┌────────────▼────────────┐
                                           │  HPA (autoscaler)       │
                                           │  min: 2 / max: 10 pods  │
                                           └─────────────────────────┘
```

The application is a static single-page application (SPA) built with React and Vite. It is served via nginx inside a lightweight Alpine-based container. Kubernetes manages scaling, health checks, and traffic routing.

---

## Local Development

```bash
# Install dependencies
npm install

# Start development server (port 5000)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

---

## Docker

### Build the Image

```bash
docker build -t chess-game:latest .
```

### Run Locally

```bash
docker run -p 8080:80 chess-game:latest
```

The application will be available at `http://localhost:8080`.

### Multi-Stage Build Details

The `Dockerfile` uses a two-stage build:

1. **Build stage** (`node:20-alpine`): Installs dependencies and runs `npm run build` to produce static assets in `/app/dist`.
2. **Serve stage** (`nginx:1.27-alpine`): Copies the static assets and custom nginx configuration. Runs as non-root (`nginx` user) for security.

---

## Kubernetes Deployment

All Kubernetes manifests are in the `k8s/` directory.

### Manifests

| File                  | Resource              | Purpose                                         |
| --------------------- | --------------------- | ----------------------------------------------- |
| `namespace.yaml`      | Namespace             | Isolated `chess-game` namespace                  |
| `configmap.yaml`      | ConfigMap             | nginx configuration (SPA routing, compression)   |
| `deployment.yaml`     | Deployment            | Application pods with health checks              |
| `service.yaml`        | Service (ClusterIP)   | Internal service for pod discovery               |
| `ingress.yaml`        | Ingress               | External access with TLS termination             |
| `hpa.yaml`            | HorizontalPodAutoscaler | Auto-scaling based on CPU/memory              |
| `network-policy.yaml` | NetworkPolicy         | Restrict ingress/egress traffic                  |

### Quick Start

```bash
# 1. Create the namespace
kubectl apply -f k8s/namespace.yaml

# 2. Deploy all resources
kubectl apply -f k8s/

# 3. Verify deployment
kubectl -n chess-game get all
```

### Step-by-Step Deployment

```bash
# Create namespace
kubectl apply -f k8s/namespace.yaml

# Apply ConfigMap (nginx config)
kubectl apply -f k8s/configmap.yaml

# Deploy the application
kubectl apply -f k8s/deployment.yaml

# Create the service
kubectl apply -f k8s/service.yaml

# Set up Ingress (update host in ingress.yaml first)
kubectl apply -f k8s/ingress.yaml

# Enable autoscaling
kubectl apply -f k8s/hpa.yaml

# Apply network policy
kubectl apply -f k8s/network-policy.yaml
```

### Customization

#### Change the Domain

Edit `k8s/ingress.yaml` and replace `chess.example.com` with your domain:

```yaml
spec:
  tls:
    - hosts:
        - your-domain.com
      secretName: chess-game-tls
  rules:
    - host: your-domain.com
```

#### Change the Container Image

Edit `k8s/deployment.yaml` and update the image reference:

```yaml
containers:
  - name: chess-game
    image: your-registry.com/chess-game:v1.0.0
```

#### Adjust Resource Limits

Edit `k8s/deployment.yaml` under `resources`:

```yaml
resources:
  requests:
    cpu: 50m
    memory: 64Mi
  limits:
    cpu: 200m
    memory: 128Mi
```

#### Scale Replicas

Edit `k8s/deployment.yaml` to change the base replica count, or adjust `k8s/hpa.yaml` for autoscaler thresholds.

### Verify the Deployment

```bash
# Check pod status
kubectl -n chess-game get pods

# Check service endpoints
kubectl -n chess-game get endpoints chess-game

# View pod logs
kubectl -n chess-game logs -l app.kubernetes.io/name=chess-game

# Check HPA status
kubectl -n chess-game get hpa

# Describe deployment for events
kubectl -n chess-game describe deployment chess-game
```

### Port-Forward for Local Testing

If you don't have an Ingress controller configured, test the deployment locally:

```bash
kubectl -n chess-game port-forward svc/chess-game 8080:80
```

Then visit `http://localhost:8080`.

---

## CI/CD Pipeline

The GitHub Actions workflow (`.github/workflows/ci.yaml`) runs on every push and pull request to `main`:

| Job              | Trigger          | Steps                                        |
| ---------------- | ---------------- | -------------------------------------------- |
| `lint-and-build` | Push & PR        | Install → Lint → Build → Upload artifacts    |
| `docker-build`   | Push to `main`   | Build Docker image with BuildKit caching      |

### Extending the Pipeline

To push to a container registry, add credentials and update the `docker-build` job:

```yaml
- name: Login to Container Registry
  uses: docker/login-action@v3
  with:
    registry: ghcr.io
    username: ${{ github.actor }}
    password: ${{ secrets.GITHUB_TOKEN }}

- name: Build and Push
  uses: docker/build-push-action@v6
  with:
    context: .
    push: true
    tags: ghcr.io/${{ github.repository }}:${{ env.IMAGE_TAG }}
```

To add Kubernetes deployment, append a deploy job:

```yaml
deploy:
  needs: docker-build
  runs-on: ubuntu-latest
  steps:
    - name: Checkout
      uses: actions/checkout@v4

    - name: Set up kubectl
      uses: azure/setup-kubectl@v4

    - name: Deploy to Kubernetes
      run: |
        kubectl set image deployment/chess-game \
          chess-game=ghcr.io/${{ github.repository }}:${{ env.IMAGE_TAG }} \
          -n chess-game
```

---

## Configuration Reference

### Environment Variables

| Variable       | Default | Description                          |
| -------------- | ------- | ------------------------------------ |
| `PROJECT_ROOT` | `.`     | Root directory for Vite path aliases |

### Kubernetes Labels

All resources use the following standard labels:

```yaml
app.kubernetes.io/name: chess-game
app.kubernetes.io/component: webserver
```

### Health Checks

| Probe     | Path       | Interval | Timeout | Failure Threshold |
| --------- | ---------- | -------- | ------- | ----------------- |
| Liveness  | `/healthz` | 15s      | 3s      | 3                 |
| Readiness | `/healthz` | 10s      | 3s      | 3                 |

### Resource Defaults

| Resource | Request | Limit |
| -------- | ------- | ----- |
| CPU      | 50m     | 200m  |
| Memory   | 64Mi    | 128Mi |

---

## Troubleshooting

### Pod stuck in CrashLoopBackOff

```bash
kubectl -n chess-game logs <pod-name> --previous
kubectl -n chess-game describe pod <pod-name>
```

Common causes:
- nginx config syntax error — check the ConfigMap
- Permission issues — the container runs as non-root (UID 101)

### 502 Bad Gateway from Ingress

```bash
kubectl -n chess-game get endpoints chess-game
```

If no endpoints are listed, the readiness probe is failing. Check pod logs.

### HPA not scaling

```bash
kubectl -n chess-game describe hpa chess-game
```

Ensure the metrics-server is installed in your cluster:

```bash
kubectl -n kube-system get deployment metrics-server
```

### Accessing the app without Ingress

```bash
kubectl -n chess-game port-forward svc/chess-game 8080:80
```
