# GitHub Secrets Setup Guide

This document explains how to configure GitHub Secrets for the CI/CD workflows in this repository.

## Required Secrets

### SSH_PRIVATE_KEY

**Purpose:** Allows GitHub Actions to SSH into the production server for automated deployments.

**Setup Steps:**

1. **Generate or locate your SSH private key** on your local machine:
   ```bash
   # If you need to generate a new key pair:
   ssh-keygen -t ed25519 -C "github-actions@meteo-app" -f ~/.ssh/meteo_deploy_key

   # Or use your existing key (the one you use to SSH into tachyonfuture.com)
   cat ~/.ssh/id_ed25519  # or ~/.ssh/id_rsa
   ```

2. **Copy the entire private key** (including the `-----BEGIN` and `-----END` lines)

3. **Add to GitHub Secrets:**
   - Go to your repository on GitHub
   - Navigate to: Settings → Secrets and variables → Actions
   - Click "New repository secret"
   - Name: `SSH_PRIVATE_KEY`
   - Value: Paste the entire private key
   - Click "Add secret"

4. **Ensure the public key is on the server:**
   ```bash
   # SSH into your server
   ssh michael@tachyonfuture.com

   # Check if your public key is in authorized_keys
   cat ~/.ssh/authorized_keys

   # If you generated a new key pair, add the public key:
   cat ~/.ssh/meteo_deploy_key.pub | ssh michael@tachyonfuture.com "mkdir -p ~/.ssh && cat >> ~/.ssh/authorized_keys"
   ```

## Workflow Triggers

### 1. Deploy Workflow (`.github/workflows/deploy.yml`)
**Triggers:**
- Automatically on every push to `main` branch
- Manually via GitHub Actions UI (workflow_dispatch)

**What it does:**
- SSH into the production server
- Runs the deployment script (`scripts/deploy-beta.sh`)
- Verifies the deployment by checking frontend and API health

### 2. Docker Build & Publish (`.github/workflows/docker-publish.yml`)
**Triggers:**
- Automatically on every push to `main` branch
- On release creation
- Manually via GitHub Actions UI

**What it does:**
- Builds Docker images for backend and frontend
- Publishes to GitHub Container Registry (ghcr.io)
- Tags images with:
  - `latest` (for main branch)
  - `sha-<commit>` (for all commits)
  - Semantic version tags (for releases)

### 3. CI Workflow (`.github/workflows/ci.yml`)
**Triggers:**
- On every push to `main` branch
- On every pull request to `main`

**What it does:**
- Runs backend tests (Node.js 14, 16, 18)
- Runs frontend tests (Node.js 14, 16, 18)
- Validates Docker builds
- Verifies docker-compose configuration

### 4. CodeQL Security Scan (`.github/workflows/codeql.yml`)
**Triggers:**
- On every push to `main` branch
- On every pull request to `main`
- Weekly schedule (Mondays at midnight)

**What it does:**
- Scans JavaScript code for security vulnerabilities
- Reports findings to GitHub Security tab

## Security Considerations

### SSH Key Protection
- ⚠️ **NEVER commit the private key to the repository**
- Store it ONLY in GitHub Secrets
- Use a dedicated deploy key if possible (not your personal SSH key)
- Rotate keys periodically

### Server Security
- The production server (`tachyonfuture.com`) has aggressive security software (Fail2ban)
- Multiple failed SSH attempts will ban the IP
- The GitHub Actions workflow uses proper SSH key authentication to avoid lockouts
- If deployment fails repeatedly, manually check server logs before retrying

### Environment Variables
- Production environment variables are stored on the server in `.env.production`
- Do NOT commit `.env.production` to the repository
- The deployment script loads these variables during build

## Testing the Deployment

After setting up secrets, test the deployment workflow:

1. **Manual trigger (recommended for first test):**
   - Go to: Actions → Deploy to Production → Run workflow
   - Select the `main` branch
   - Click "Run workflow"
   - Monitor the logs for any errors

2. **Automatic trigger:**
   - Make a small commit to the `main` branch
   - Push to GitHub
   - Watch the Actions tab to see workflows run automatically

## Troubleshooting

### "Permission denied (publickey)" error
- Verify the `SSH_PRIVATE_KEY` secret is set correctly
- Ensure the corresponding public key is in `~/.ssh/authorized_keys` on the server
- Check that the private key format is correct (includes BEGIN/END markers)

### Deployment script fails
- SSH into the server manually and run the script to see detailed errors:
  ```bash
  ssh michael@tachyonfuture.com
  cd /home/michael/meteo-app
  ./scripts/deploy-beta.sh
  ```

### Docker images not building
- Check if you have the `packages: write` permission on the repository
- Verify the GitHub Actions workflow has access to GITHUB_TOKEN

## Additional Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [GitHub Encrypted Secrets](https://docs.github.com/en/actions/security-guides/encrypted-secrets)
- [SSH Agent GitHub Action](https://github.com/webfactory/ssh-agent)
- [Docker Metadata Action](https://github.com/docker/metadata-action)

## Contact

If you encounter issues with the CI/CD setup:
- Check the deployment guide: `DEPLOYMENT_GUIDE_PRIVATE.md`
- Review server logs: `ssh michael@tachyonfuture.com "docker logs meteo-backend-prod"`
- Open an issue in the repository
