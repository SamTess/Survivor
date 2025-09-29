# 🔐 HTTPS Deployment Guide

## Overview

This guide covers setting up HTTPS for your Survivor application using:
- **DuckDNS** for dynamic DNS
- **Let's Encrypt** for SSL certificates
- **Nginx** as reverse proxy
- **Automated certificate renewal**

## Prerequisites

1. **DuckDNS Account**: `tryt9398@gmail.com`
2. **DuckDNS Token**: `a5432d07-bfbb-4794-818c-7d06fd4d846f`
3. **Domain**: `survivooooor.duckdns.org`
4. **Server with ports 80 and 443 accessible**

## Files Added/Modified

### New Files
- `Docker/nginx.conf` - Nginx reverse proxy configuration
- `Docker/docker-compose.https.yml` - Docker Compose with HTTPS support
- `Docker/init-ssl.sh` - SSL certificate initialization script
- `Docker/HTTPS_DEPLOYMENT.md` - This guide

### Modified Files
- `ansible/.env.staging.j2` - Updated NEXT_PUBLIC_APP_URL to HTTPS
- `ansible/.env.production.j2` - Updated NEXT_PUBLIC_APP_URL to HTTPS
- `ansible/config.yml` - Updated to use HTTPS compose file
- `ansible/playbook-staging.yml` - Added SSL support
- `ansible/playbook-production.yml` - Added SSL support

## Deployment Steps

### 1. Deploy Infrastructure

```bash
cd terraform
./deploy.sh
# Select both staging and production environments
```

### 2. Deploy Application with HTTPS

```bash
cd ansible
./deploy.sh
# This will now use the HTTPS configuration
```

## Manual SSL Setup (if needed)

If you need to set up SSL manually on the server:

```bash
# SSH into your server
ssh root@your-server-ip

# Navigate to the Docker directory
cd /opt/survivor/Docker

# Initialize SSL certificates
./init-ssl.sh

# Start the full HTTPS application
docker compose -f docker-compose.https.yml up -d
```

## Testing HTTPS

1. **Check domain resolution**:
   ```bash
   nslookup survivooooor.duckdns.org
   ```

2. **Test HTTP redirect**:
   ```bash
   curl -I http://survivooooor.duckdns.org
   # Should return 301 redirect to HTTPS
   ```

3. **Test HTTPS**:
   ```bash
   curl -I https://survivooooor.duckdns.org
   # Should return 200 OK
   ```

4. **Check SSL certificate**:
   ```bash
   curl -vI https://survivooooor.duckdns.org
   # Should show valid Let's Encrypt certificate
   ```

## Architecture

```
Internet → Port 80/443 → Nginx → Next.js App (Port 3000)
                    ↓
               PostgreSQL DB (Port 5432)
                    ↓
               DuckDNS Service (Domain Updates)
```

## Key Features

### 🔒 Security
- **TLS 1.2/1.3 only**
- **Strong cipher suites**
- **HSTS headers**
- **Security headers** (X-Frame-Options, X-Content-Type-Options, etc.)
- **Rate limiting** for API and auth endpoints

### 🚀 Performance
- **HTTP/2 support**
- **Gzip compression**
- **Static file caching**
- **Connection keep-alive**

### 🔄 Automation
- **Automatic certificate renewal** (every 12 hours)
- **DuckDNS IP updates** (automatic)
- **Zero-downtime certificate replacement**

## Troubleshooting

### Certificate Issues

1. **Certificate request fails**:
   ```bash
   # Check if domain points to server
   nslookup survivooooor.duckdns.org
   
   # Check if port 80 is accessible
   curl -I http://survivooooor.duckdns.org/.well-known/acme-challenge/test
   
   # Use staging certificates for testing
   ./init-ssl.sh 1
   ```

2. **Nginx fails to start**:
   ```bash
   # Check nginx configuration
   docker run --rm -v $(pwd)/nginx.conf:/etc/nginx/nginx.conf nginx nginx -t
   
   # Check nginx logs
   docker compose -f docker-compose.https.yml logs nginx
   ```

### DuckDNS Issues

1. **Domain not updating**:
   ```bash
   # Check DuckDNS service logs
   docker compose -f docker-compose.https.yml logs duckdns
   
   # Test DuckDNS API manually
   curl "https://www.duckdns.org/update?domains=survivooooor&token=a5432d07-bfbb-4794-818c-7d06fd4d846f&ip="
   ```

### Application Issues

1. **App not accessible via HTTPS**:
   ```bash
   # Check if web service is running
   docker compose -f docker-compose.https.yml ps
   
   # Check web service logs
   docker compose -f docker-compose.https.yml logs web
   
   # Test internal connectivity
   docker compose -f docker-compose.https.yml exec nginx curl http://web:3000/health
   ```

## Maintenance

### Certificate Renewal
Certificates auto-renew every 12 hours. To force renewal:

```bash
docker compose -f docker-compose.https.yml exec certbot certbot renew --force-renewal
docker compose -f docker-compose.https.yml restart nginx
```

### Check Certificate Status
```bash
docker compose -f docker-compose.https.yml exec certbot certbot certificates
```

### Update DuckDNS Token
If you need to update the DuckDNS token:

1. Update `docker-compose.https.yml`
2. Restart DuckDNS service:
   ```bash
   docker compose -f docker-compose.https.yml restart duckdns
   ```

## Environment Variables

The following environment variables are set for HTTPS:

```env
NEXT_PUBLIC_APP_URL=https://survivooooor.duckdns.org
NODE_ENV=production  # for production environment
```

## Ports

- **80**: HTTP (redirects to HTTPS)
- **443**: HTTPS (main application)
- **5432**: PostgreSQL (internal only)

## Support

If you encounter issues:

1. Check this troubleshooting guide
2. Examine Docker logs: `docker compose -f docker-compose.https.yml logs`
3. Test individual components
4. Verify DuckDNS configuration
5. Check firewall settings on the server

---

**Domain**: survivooooor.duckdns.org  
**Email**: tryt9398@gmail.com  
**Last Updated**: September 25, 2025