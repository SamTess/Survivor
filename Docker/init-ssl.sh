#!/bin/bash

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

DOMAIN="survivooooor.duckdns.org"
EMAIL="tryt9398@gmail.com"
STAGING=${1:-0}

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

echo -e "${YELLOW}📁 Creating certificate directories...${NC}"
mkdir -p ./certbot-etc/live/$DOMAIN
mkdir -p ./certbot-var
mkdir -p ./certbot-web/.well-known/acme-challenge

echo -e "${YELLOW}🔧 Creating temporary self-signed certificates...${NC}"
docker run --rm -v "${PWD}/certbot-etc:/etc/letsencrypt" \
    -v "${PWD}/certbot-var:/var/lib/letsencrypt" \
    certbot/certbot \
    sh -c "
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

echo -e "${YELLOW}🚀 Starting nginx and certbot services...${NC}"
docker compose -f docker-compose.https.yml up -d nginx certbot

echo -e "${YELLOW}⏳ Waiting for nginx to start...${NC}"
sleep 10

if ! docker compose -f docker-compose.https.yml ps nginx | grep -q "running"; then
    echo -e "${RED}❌ Nginx failed to start!${NC}"
    docker compose -f docker-compose.https.yml logs nginx
    exit 1
fi

echo -e "${GREEN}✅ Nginx is running${NC}"

echo -e "${YELLOW}🔐 Requesting Let's Encrypt certificate...${NC}"

CERTBOT_CMD="certbot certonly --webroot --webroot-path=/var/www/certbot \
    --email $EMAIL \
    --agree-tos \
    --no-eff-email \
    -d $DOMAIN"

if [ $STAGING = 1 ]; then
    CERTBOT_CMD="$CERTBOT_CMD --staging"
    echo -e "${YELLOW}⚠️  Using staging server (test certificates)${NC}"
fi

docker compose -f docker-compose.https.yml exec certbot sh -c "$CERTBOT_CMD"

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Failed to obtain SSL certificate!${NC}"
    echo -e "${YELLOW}💡 Troubleshooting tips:${NC}"
    echo "1. Ensure your domain $DOMAIN points to this server's IP address"
    echo "2. Check if port 80 is accessible from the internet"
    echo "3. Verify DuckDNS is properly configured"
    echo
    echo -e "${BLUE}🔍 Checking domain resolution...${NC}"
    nslookup $DOMAIN
    exit 1
fi

echo -e "${GREEN}✅ SSL certificate obtained successfully!${NC}"

echo -e "${YELLOW}🔄 Restarting nginx with real certificate...${NC}"
docker compose -f docker-compose.https.yml restart nginx

sleep 5

echo -e "${YELLOW}🧪 Testing HTTPS connection...${NC}"
if curl -sSf https://$DOMAIN > /dev/null; then
    echo -e "${GREEN}✅ HTTPS is working correctly!${NC}"
    echo -e "${BLUE}🌐 Your application is now available at: https://$DOMAIN${NC}"
else
    echo -e "${RED}❌ HTTPS test failed${NC}"
    echo -e "${YELLOW}💡 Check nginx logs:${NC} docker compose -f docker-compose.https.yml logs nginx"
fi

echo -e "${YELLOW}📋 Certificate information:${NC}"
docker compose -f docker-compose.https.yml exec certbot certbot certificates

echo
echo -e "${GREEN}🎉 SSL setup completed!${NC}"
echo -e "${BLUE}📝 Next steps:${NC}"
echo "1. Update your .env files to use HTTPS URLs"
echo "2. Test your application at https://$DOMAIN"
echo "3. Certificates will auto-renew every 12 hours"
echo
echo -e "${YELLOW}⚙️  To start the full application with HTTPS:${NC}"
echo "docker compose -f docker-compose.https.yml up -d"