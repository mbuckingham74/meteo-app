# Security Policy

## Supported Versions

We currently support the following versions with security updates:

| Version | Supported          |
| ------- | ------------------ |
| main    | :white_check_mark: |

## Reporting a Vulnerability

We take the security of Meteo Weather App seriously. If you discover a security vulnerability, please follow these steps:

### 1. Do Not Create a Public Issue

**Please do not report security vulnerabilities through public GitHub issues.**

### 2. Report Privately

Send an email to **michael.buckingham74@gmail.com** with:

- **Description of the vulnerability**
- **Steps to reproduce** the issue
- **Potential impact** of the vulnerability
- **Suggested fix** (if you have one)

### 3. What to Expect

- **Acknowledgment**: We'll acknowledge your email within **48 hours**
- **Updates**: We'll keep you informed of our progress
- **Timeline**: We aim to resolve critical vulnerabilities within **7 days**
- **Credit**: With your permission, we'll credit you in the security advisory

## Security Best Practices for Self-Hosting

### Environment Variables

**Never commit sensitive information to the repository:**
- API keys
- Database passwords
- JWT secrets
- Any credentials

Always use `.env` files (which are gitignored) for sensitive data.

### Database Security

**Production deployments should:**
- Use strong database passwords
- Restrict database access to internal network only
- Regularly backup database data
- Keep MySQL updated to the latest version

### API Key Management

**Protect your API keys:**
- Store in environment variables
- Use different keys for development and production
- Rotate keys periodically
- Monitor API usage for anomalies

### Docker Security

**Recommended Docker practices:**
- Keep Docker and Docker Compose updated
- Use specific version tags instead of `latest`
- Run containers as non-root when possible
- Regularly update base images
- Use Docker secrets for sensitive data in production

### Network Security

**For production deployments:**
- Use HTTPS with valid SSL certificates (Let's Encrypt)
- Configure CORS properly (don't use `*` in production)
- Use a reverse proxy (nginx, Caddy, or Traefik)
- Implement rate limiting
- Use firewall rules to restrict access

### JWT Security

**For authentication:**
- Use strong, unique `JWT_SECRET` values
- Never expose JWT secrets in client-side code
- Implement token expiration
- Use refresh tokens appropriately
- Consider implementing token blacklisting

## Known Security Considerations

### API Rate Limits

The application uses external APIs with rate limits:
- **Visual Crossing**: 1,000 records/day (free tier)
- **OpenWeather**: 1,000 calls/day (free tier)
- **RainViewer**: 1,000 requests/IP/minute

Aggressive caching is implemented to minimize API calls, but consider implementing application-level rate limiting for public deployments.

### SQL Injection Prevention

The application uses MySQL2 with prepared statements to prevent SQL injection. Always use parameterized queries when adding new database interactions.

### XSS Prevention

React provides built-in XSS protection through automatic escaping. Be cautious when:
- Using `dangerouslySetInnerHTML`
- Rendering user-generated HTML
- Using third-party libraries that manipulate the DOM

### CSRF Protection

For production deployments with user authentication, consider implementing CSRF protection for state-changing operations.

## Security Checklist for Production

Before deploying to production, ensure:

- [ ] All environment variables are set with strong, unique values
- [ ] Database is not publicly accessible
- [ ] HTTPS is configured with valid certificates
- [ ] CORS is configured with specific allowed origins
- [ ] API keys are secured and not exposed in client code
- [ ] Docker containers are up to date
- [ ] Firewall rules are configured
- [ ] Backups are configured and tested
- [ ] Logging is enabled for security events
- [ ] Rate limiting is implemented
- [ ] Security headers are set (CSP, HSTS, X-Frame-Options, etc.)

## Third-Party Dependencies

We regularly update dependencies to address security vulnerabilities. You can check for vulnerabilities by running:

```bash
# Frontend
cd frontend
npm audit

# Backend
cd backend
npm audit
```

To automatically fix vulnerabilities:

```bash
npm audit fix
```

## Security Updates

Security updates will be released as soon as possible after a vulnerability is confirmed. Check the following for updates:

- GitHub Security Advisories
- Release notes
- Commit messages tagged with `[SECURITY]`

## Disclosure Policy

- **Coordinated Disclosure**: We prefer coordinated disclosure with researchers
- **Public Disclosure**: Security fixes will be disclosed in release notes after a patch is available
- **Credit**: Security researchers will be credited (with permission) in security advisories

## Contact

For security-related questions or concerns:
- **Email**: michael.buckingham74@gmail.com
- **GitHub**: [@mbuckingham74](https://github.com/mbuckingham74)

Thank you for helping keep Meteo Weather App and its users safe!
