# ♟️ Professional Chess Game

A fully functional chess game built with React, TypeScript, and Vite — containerized with Docker and deployable to Kubernetes.

## Quick Start

```bash
# Development
npm install
npm run dev        # http://localhost:5000

# Production build
npm run build
npm run preview
```

## Docker

```bash
docker build -t chess-game:latest .
docker run -p 8080:80 chess-game:latest
```

## Kubernetes Deployment

```bash
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/
kubectl -n chess-game get pods
```

See **[DEPLOYMENT.md](DEPLOYMENT.md)** for the full deployment guide, including configuration, CI/CD, scaling, and troubleshooting.

## Project Structure

```
├── src/                 # Application source code
│   ├── components/      # React components (Chess + Radix UI)
│   ├── lib/             # Chess logic and utilities
│   ├── hooks/           # Custom React hooks
│   └── styles/          # Theme and styling
├── k8s/                 # Kubernetes manifests
│   ├── namespace.yaml
│   ├── configmap.yaml
│   ├── deployment.yaml
│   ├── service.yaml
│   ├── ingress.yaml
│   ├── hpa.yaml
│   └── network-policy.yaml
├── .github/workflows/   # CI/CD pipeline
├── Dockerfile           # Multi-stage Docker build
├── nginx.conf           # nginx server configuration
└── DEPLOYMENT.md        # Full deployment documentation
```

## Tech Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS 4, Radix UI
- **Build**: Vite 7
- **Container**: Docker (multi-stage), nginx 1.27
- **Orchestration**: Kubernetes with HPA, Ingress, NetworkPolicy
- **CI/CD**: GitHub Actions

## License

The Spark Template files and resources from GitHub are licensed under the terms of the MIT license, Copyright GitHub, Inc.
