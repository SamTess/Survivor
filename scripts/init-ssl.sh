#!/bin/bash

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

DOMAIN=$2
EMAIL="tryt9398@gmail.com"
STAGING=${1:-0}

if [ -z "$DOMAIN" ]; then
    echo -e "${RED}❌ Error: Domain is required!${NC}"
    echo "Usage: $0 <staging_mode> <domain>"
    echo "Example: $0 1 staging.example.com"
    echo "Example: $0 0 www.example.com"
    exit 1
fi

echo -e "${BLUE}🔐 SSL Certificate Setup for Survivor Application${NC}"
echo "=================================================="
echo -e "Domain: ${GREEN}$DOMAIN${NC}"
echo -e "Email: ${GREEN}$EMAIL${NC}"
echo -e "Staging mode: ${YELLOW}$([ $STAGING = 1 ] && echo 'YES' || echo 'NO')${NC}"
echo

if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker is not installed!${NC}"
    exit 1
fi

if ! docker compose version &> /dev/null; then
    echo -e "${RED}❌ Docker Compose is not installed!${NC}"
    exit 1
fi

echo -e "${YELLOW}🧹 Cleaning up existing containers...${NC}"
docker compose -f docker-compose.https.yml down

echo -e "${YELLOW}� Generating nginx configuration for domain: $DOMAIN${NC}"
if [ -f "nginx.conf.template" ]; then
    envsubst '${DOMAIN}' < nginx.conf.template > nginx.conf
    echo -e "${GREEN}✅ Nginx configuration updated for $DOMAIN${NC}"
else
    echo -e "${YELLOW}⚠️  nginx.conf.template not found, using existing nginx.conf${NC}"
fi

echo -e "${YELLOW}�📁 Creating certificate directories...${NC}"
mkdir -p ./certbot-etc/live/$DOMAIN
mkdir -p ./certbot-var
mkdir -p ./certbot-web/.well-known/acme-challenge

echo -e "${YELLOW}🔧 Creating temporary self-signed certificates in the volume...${NC}"
docker compose -f docker-compose.https.yml up -d certbot
sleep 2

docker compose -f docker-compose.https.yml exec certbot sh -c "
    mkdir -p /etc/letsencrypt/live/$DOMAIN && \
    openssl req -x509 -nodes -days 1 -newkey rsa:2048 \
    -keyout /etc/letsencrypt/live/$DOMAIN/privkey.pem \
    -out /etc/letsencrypt/live/$DOMAIN/fullchain.pem \
    -subj '/CN=$DOMAIN'
"

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Failed to create temporary certificates!${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Temporary certificates created${NC}"

echo -e "${YELLOW}🚀 Starting required services...${NC}"
docker compose -f docker-compose.https.yml up -d db web

echo -e "${YELLOW}⏳ Waiting for web service to be healthy...${NC}"
timeout=60
counter=0
while [ $counter -lt $timeout ]; do
    if docker compose -f docker-compose.https.yml ps web | grep -q "healthy\|running"; then
        break
    fi
    echo "Waiting for web service... ($counter/$timeout)"
    sleep 2
    counter=$((counter + 2))
done

if [ $counter -ge $timeout ]; then
    echo -e "${RED}❌ Web service failed to start properly!${NC}"
    docker compose -f docker-compose.https.yml logs web
    exit 1
fi

echo -e "${YELLOW}🚀 Starting nginx...${NC}"
docker compose -f docker-compose.https.yml up -d nginx

echo -e "${YELLOW}⏳ Waiting for nginx to start...${NC}"
sleep 10

echo -e "${YELLOW}🔍 Checking all container statuses...${NC}"
docker compose -f docker-compose.https.yml ps

NGINX_RUNNING=$(docker compose -f docker-compose.https.yml ps nginx | grep -E "Up|running|healthy" | wc -l)

if [ $NGINX_RUNNING -eq 0 ]; then
    echo -e "${RED}❌ Nginx failed to start!${NC}"
    echo -e "${YELLOW}🔍 Checking certificate files...${NC}"
    docker compose -f docker-compose.https.yml exec certbot ls -la /etc/letsencrypt/live/$DOMAIN/ || echo "Could not check certificates"
    echo -e "${YELLOW}🔍 Full nginx logs:${NC}"
    docker compose -f docker-compose.https.yml logs nginx

    echo -e "${YELLOW}🔍 Checking for port conflicts...${NC}"
    netstat -tlnp | grep -E ':80|:443' || echo "No port conflicts detected"

    exit 1
fi

echo -e "${GREEN}✅ Nginx is running${NC}"

echo -e "${YELLOW}🔍 Testing nginx config from within container...${NC}"
if docker compose -f docker-compose.https.yml exec nginx nginx -t; then
    echo -e "${GREEN}✅ Nginx configuration is valid${NC}"
else
    echo -e "${RED}❌ Nginx configuration has issues${NC}"
fi

echo -e "${YELLOW}🧪 Testing nginx HTTP response...${NC}"
if timeout 5 curl -s -o /dev/null -w "%{http_code}" http://localhost | grep -q "200\|301\|302"; then
    echo -e "${GREEN}✅ Nginx is responding to HTTP requests${NC}"
else
    echo -e "${YELLOW}⚠️  Could not test nginx HTTP response (might be normal behind NAT)${NC}"
fi

echo -e "${YELLOW}🧪 Testing webroot access...${NC}"
echo "test" > ./certbot-web/.well-known/acme-challenge/test
if curl -f "http://$DOMAIN/.well-known/acme-challenge/test" &> /dev/null; then
    echo -e "${GREEN}✅ Webroot challenge path is accessible${NC}"
    rm -f ./certbot-web/.well-known/acme-challenge/test
else
    echo -e "${YELLOW}⚠️  Webroot challenge path test failed - this might be due to NAT/firewall${NC}"
    rm -f ./certbot-web/.well-known/acme-challenge/test
fi

echo -e "${YELLOW}🔐 Requesting Let's Encrypt certificate...${NC}"

CERTBOT_CMD="certbot certonly --webroot --webroot-path=/var/www/certbot \
    --email $EMAIL \
    --agree-tos \
    --no-eff-email \
    --force-renewal \
    -d $DOMAIN"

if [ $STAGING = 1 ]; then
    CERTBOT_CMD="$CERTBOT_CMD --staging"
    echo -e "${YELLOW}⚠️  Using staging server (test certificates)${NC}"
fi

docker compose -f docker-compose.https.yml exec certbot sh -c "$CERTBOT_CMD"

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Failed to obtain SSL certificate!${NC}"
    echo -e "${YELLOW}💡 Troubleshooting tips:${NC}"
    echo "1. You're behind NAT - Let's Encrypt can't reach your server"
    echo "2. Consider using staging mode first: ./init-ssl.sh 1 $DOMAIN"
    echo "3. For school networks, you might need DNS challenge instead"
    echo "4. Check if your domain DNS is properly configured"
    echo "5. Verify domain resolves to this server: dig $DOMAIN"
    echo
    echo -e "${BLUE}🔍 Checking domain resolution...${NC}"
    nslookup $DOMAIN || echo "nslookup failed"
    echo
    echo -e "${BLUE}🔍 Your current public IP (if detectable):${NC}"
    curl -s ifconfig.me || echo "Could not detect public IP"
    exit 1
fi

echo -e "${GREEN}✅ SSL certificate obtained successfully!${NC}"

echo -e "${YELLOW}🔄 Restarting nginx with real certificate...${NC}"
docker compose -f docker-compose.https.yml restart nginx

sleep 5

echo -e "${YELLOW}🧪 Testing HTTPS connection...${NC}"
if timeout 10 curl -sSf --max-time 10 https://$DOMAIN > /dev/null 2>&1; then
    echo -e "${GREEN}✅ HTTPS is working correctly!${NC}"
    echo -e "${BLUE}🌐 Your application is now available at: https://$DOMAIN${NC}"
else
    echo -e "${YELLOW}⚠️  HTTPS test failed, but certificates might still be valid${NC}"
    echo -e "${YELLOW}💡 Check nginx logs:${NC} docker compose -f docker-compose.https.yml logs nginx"
    echo -e "${YELLOW}💡 Try accessing manually:${NC} https://$DOMAIN"
fi

echo -e "${YELLOW}📋 Certificate information:${NC}"
docker compose -f docker-compose.https.yml exec certbot certbot certificates || echo "Could not retrieve certificate info"

echo
echo -e "${GREEN}🎉 SSL setup completed!${NC}"
echo -e "${BLUE}📝 Next steps:${NC}"
echo "1. Update your .env files to use HTTPS URLs"
echo "2. Test your application at https://$DOMAIN"
echo "3. Certificates will auto-renew every 12 hours"
echo
echo -e "${YELLOW}⚙️  To start the full application with HTTPS:${NC}"
echo "docker compose -f docker-compose.https.yml up -d"