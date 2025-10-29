# GitHub Workflows & CI/CD Documentation

This directory contains all GitHub Actions workflows for the Meteo App project.

## 📋 Available Workflows

### 1. CI (Continuous Integration)
**File:** [`workflows/ci.yml`](workflows/ci.yml)

**Triggers:**
- Push to `main` branch
- Pull requests to `main` branch

**Jobs:**
- **Backend Tests** - Runs tests on Node.js 14, 16, and 18
- **Frontend Tests** - Runs React tests and builds on Node.js 14, 16, and 18
- **Docker Build** - Validates Docker images build successfully

**Purpose:** Ensures code quality and prevents broken builds from being merged.

---

### 2. Deploy to Production
**File:** [`workflows/deploy.yml`](workflows/deploy.yml)

**Triggers:**
- Automatically on push to `main` branch (after code is committed)
- Manual trigger via GitHub Actions UI

**Jobs:**
- SSH into production server (`tachyonfuture.com`)
- Run deployment script (`scripts/deploy-beta.sh`)
- Verify deployment by checking frontend and API health

**Requirements:**
- `SSH_PRIVATE_KEY` secret must be configured (see [SECRETS_SETUP.md](SECRETS_SETUP.md))

**Purpose:** Automatically deploys the latest code to production whenever changes are pushed to main.

---

### 3. Docker Build & Publish
**File:** [`workflows/docker-publish.yml`](workflows/docker-publish.yml)

**Triggers:**
- Push to `main` branch
- Release creation
- Manual trigger via GitHub Actions UI

**Jobs:**
- Build Docker images for backend and frontend
- Publish images to GitHub Container Registry (ghcr.io)
- Tag images with:
  - `latest` (for main branch pushes)
  - `sha-<commit>` (for all commits)
  - Semantic version tags (for releases)

**Purpose:** Creates production-ready Docker images and publishes them to the container registry.

---

### 4. CodeQL Security Scan
**File:** [`workflows/codeql.yml`](workflows/codeql.yml)

**Triggers:**
- Push to `main` branch
- Pull requests to `main` branch
- Weekly schedule (Mondays at midnight)

**Jobs:**
- Analyze JavaScript code for security vulnerabilities
- Report findings to GitHub Security tab

**Purpose:** Continuously monitors the codebase for security issues.

---

## 🔧 Setup Instructions

### First-Time Setup

1. **Configure SSH Private Key:**
   - Follow the instructions in [SECRETS_SETUP.md](SECRETS_SETUP.md)
   - Add `SSH_PRIVATE_KEY` to GitHub repository secrets

2. **Verify Workflows:**
   - Go to the "Actions" tab in your GitHub repository
   - Check that all workflows are listed and enabled

3. **Test Deployment:**
   - Make a small commit to `main` branch
   - Watch the deployment workflow run automatically
   - Or manually trigger from Actions → Deploy to Production

---

## 🚀 Workflow Flow

Here's how the workflows work together:

```
┌─────────────────────────────────────────────────────────────┐
│  Developer pushes code to main branch                       │
└────────────────┬────────────────────────────────────────────┘
                 │
                 ├──────────────────────────────────────────┐
                 │                                          │
                 ▼                                          ▼
┌────────────────────────────┐          ┌──────────────────────────────┐
│  CI Workflow               │          │  Docker Build & Publish      │
│                            │          │                              │
│  ✓ Backend tests           │          │  ✓ Build backend image       │
│  ✓ Frontend tests          │          │  ✓ Build frontend image      │
│  ✓ Docker build validation │          │  ✓ Push to ghcr.io           │
└────────────────┬───────────┘          │  ✓ Tag as 'latest'           │
                 │                      └──────────────────────────────┘
                 │
                 ▼
┌────────────────────────────┐
│  Deploy Workflow           │
│                            │
│  ✓ SSH to server           │
│  ✓ Pull latest code        │
│  ✓ Run deploy script       │
│  ✓ Restart services        │
│  ✓ Verify deployment       │
└────────────────────────────┘
```

---

## 📊 Monitoring

### View Workflow Status
- Go to the repository's "Actions" tab
- Click on any workflow run to see detailed logs
- Failed workflows will send notifications (if configured)

### Deployment Verification
After deployment completes, the workflow automatically checks:
- ✅ Frontend: https://meteo-beta.tachyonfuture.com
- ✅ Backend API: https://api.meteo-beta.tachyonfuture.com/api/health

### Container Status
To check container status on the server:
```bash
ssh michael@tachyonfuture.com
docker ps | grep meteo
docker logs meteo-backend-prod --tail 50
```

---

## 🔒 Security

- All secrets are stored in GitHub Secrets (never in code)
- SSH authentication uses private key (no passwords)
- Docker images are scanned by CodeQL
- Server has Fail2ban protection (see DEPLOYMENT_GUIDE_PRIVATE.md)

---

## 🛠️ Troubleshooting

### Deployment Fails
1. Check the workflow logs in GitHub Actions
2. SSH into the server and run the script manually:
   ```bash
   ssh michael@tachyonfuture.com
   cd /home/michael/meteo-app
   ./scripts/deploy-beta.sh
   ```

### SSH Permission Denied
- Verify `SSH_PRIVATE_KEY` is set in GitHub Secrets
- Ensure public key is in `~/.ssh/authorized_keys` on server
- See [SECRETS_SETUP.md](SECRETS_SETUP.md) for detailed instructions

### Docker Build Fails
- Check if Node.js dependencies are up to date
- Verify `package-lock.json` is committed
- Try rebuilding locally with `docker-compose build`

---

## 📚 Additional Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Secrets Setup Guide](SECRETS_SETUP.md)
- [Deployment Guide](../DEPLOYMENT_GUIDE_PRIVATE.md) (private, not in repo)
- [Project README](../README.md)

---

## 📞 Support

For issues with CI/CD workflows:
1. Check workflow logs in GitHub Actions
2. Review [SECRETS_SETUP.md](SECRETS_SETUP.md)
3. Check server logs via SSH
4. Open an issue in the repository
