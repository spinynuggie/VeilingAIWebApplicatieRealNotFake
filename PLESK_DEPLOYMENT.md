# Plesk VPS Deployment Guide (Alpine + Docker)

This guide explains how to deploy the VeilingAI backend using the lightweight Alpine Docker image on a Plesk managed VPS.

## Prerequisites
1. **Plesk Obsidian** with **Docker** extension installed.
2. **SSH Access** to your VPS.
3. **PostgreSQL** database (can be hosted on the same VPS or external).

## 1. Build & Push Docker Image
You can build the image locally and push to a registry (Docker Hub/GHCR), or build on the VPS if git is available.

### Option A: Local Build & Push to Docker Hub
```bash
# Login to Docker Hub
docker login

# Build (replace 'youruser' with your Docker Hub username)
docker build -f backend/Dockerfile.alpine -t youruser/veiling-backend:alpine ./backend

# Push
docker push youruser/veiling-backend:alpine
```

## 2. Deploy on Plesk (Docker Extension)
1. Go to **Plesk > Docker**.
2. Search for `youruser/veiling-backend`.
3. Click **Run** (or pull image).
4. **Configuration Settings**:
   - **Container Name**: `veiling-backend`
   - **Memory Limit**: 512MB (optional, good for low-spec VPS)
   - **Automatic Start**: Enable (Restart Always)
   - **Port Mapping**:
     - Map container port `8080` to a host port (e.g., `5000`).

### Environment Variables
Add the following variables in the Plesk Docker configuration:

| Variable | Value | Description |
|----------|-------|-------------|
| `ASPNETCORE_ENVIRONMENT` | `Production` | Runs app in optimized mode |
| `ConnectionStrings__DefaultConnection` | `Host=...;Database=...;Username=...;Password=...` | Your PostgreSQL connection string |
| `Jwt__Key` | `(your_long_random_secret_key)` | Secret key for JWT tokens |
| `FRONTEND_URL` | `https://your-frontend-domain.com` | Allowed CORS origin |

## 3. Reverse Proxy (Nginx)
To make the backend accessible via a domain (e.g., `api.yourdomain.com`):

1. Go to **Websites & Domains**.
2. Create/Select a subdomain (e.g., `api.veiling.com`).
3. Go to **Apache & nginx Settings**.
4. Uncheck "Proxy mode" (if using pure Nginx) OR add this to **Additional nginx directives**:

```nginx
location / {
    proxy_pass http://localhost:5000;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
    proxy_set_header Host $host;
    proxy_cache_bypass $http_upgrade;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}
```

## 4. Verification
1. Check logs in **Plesk > Docker > Logs** to ensure the app started cleanly.
2. Visit `https://api.yourdomain.com/swagger` (if enabled in Prod) or check a health endpoint to verify connectivity.
