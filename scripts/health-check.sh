#!/bin/bash

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🏥 Survivor - Vérification Santé des Services${NC}"
echo "=============================================="
echo

check_http_endpoint() {
    local url=$1
    local name=$2
    local timeout=${3:-10}

    echo -n -e "Vérification ${BLUE}$name${NC}... "

    if curl -s --max-time $timeout --fail "$url" > /dev/null 2>&1; then
        echo -e "${GREEN}✅ OK${NC}"
        return 0
    else
        echo -e "${RED}❌ ÉCHEC${NC}"
        return 1
    fi
}

check_health_endpoint() {
    local url=$1
    local name=$2
    local timeout=${3:-10}

    echo -n -e "Vérification santé ${BLUE}$name${NC}... "

    local response=$(curl -s --max-time $timeout "$url" 2>/dev/null)
    local http_code=$(curl -s --max-time $timeout -o /dev/null -w "%{http_code}" "$url" 2>/dev/null)

    if [ "$http_code" = "200" ]; then
        echo -e "${GREEN}✅ OK${NC} (HTTP $http_code)"
        if echo "$response" | jq . > /dev/null 2>&1; then
            echo -e "   ${GREEN}Response${NC}: $(echo $response | jq -c .)"
        else
            echo -e "   ${GREEN}Response${NC}: $response"
        fi
        return 0
    else
        echo -e "${RED}❌ ÉCHEC${NC} (HTTP $http_code)"
        if [ ! -z "$response" ]; then
            echo -e "   ${RED}Error${NC}: $response"
        fi
        return 1
    fi
}

check_docker_service() {
    local service_name=$1
    local container_name=$2

    echo -n -e "Vérification Docker ${BLUE}$service_name${NC}... "

    if docker ps --format "table {{.Names}}" | grep -q "$container_name"; then
        local status=$(docker inspect --format='{{.State.Status}}' "$container_name" 2>/dev/null)
        if [ "$status" = "running" ]; then
            echo -e "${GREEN}✅ RUNNING${NC}"
            return 0
        else
            echo -e "${RED}❌ $status${NC}"
            return 1
        fi
    else
        echo -e "${RED}❌ NOT FOUND${NC}"
        return 1
    fi
}

get_terraform_ips() {
    if [ -d "terraform" ]; then
        cd terraform
        STAGING_IP=$(terraform output -raw droplet_staging_ip 2>/dev/null || echo "")
        PROD_IP=$(terraform output -raw droplet_prod_ip 2>/dev/null || echo "")
        cd ..
    fi
}

check_remote_docker() {
    local host=$1
    local name=$2
    local key_path=${3:-"~/.ssh/id_rsa"}

    echo -n -e "Vérification Docker distant ${BLUE}$name${NC}... "

    if [ -z "$host" ]; then
        echo -e "${YELLOW}⏭️  IGNORÉ (IP non disponible)${NC}"
        return 0
    fi

    local docker_status=$(ssh -o ConnectTimeout=10 -o StrictHostKeyChecking=no -i "$key_path" root@"$host" "docker ps --format 'table {{.Names}}\t{{.Status}}'" 2>/dev/null)

    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ ACCESSIBLE${NC}"
        echo "$docker_status" | grep -v "NAMES" | while read line; do
            if [ ! -z "$line" ]; then
                echo -e "   ${GREEN}$line${NC}"
            fi
        done
        return 0
    else
        echo -e "${RED}❌ INACCESSIBLE${NC}"
        return 1
    fi
}

get_terraform_ips

echo -e "${BLUE}📋 Environnement Local${NC}"
echo "---------------------"

if [ -f "Docker/docker-compose.yml" ]; then
    if docker info > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Docker Daemon${NC}: Actif"

        cd Docker 2>/dev/null
        if [ -f "docker-compose.yml" ]; then
            check_docker_service "Web App" "docker_web_1\|docker-web-1\|survivor_web"
            check_docker_service "Database" "docker_db_1\|docker-db-1\|survivor_db"
        fi
        cd - > /dev/null 2>&1

        check_health_endpoint "http://localhost:3000/health" "Application Health"
        check_http_endpoint "http://localhost:3000" "Application Root"

    else
        echo -e "${RED}❌ Docker Daemon${NC}: Inactif"
    fi
else
    echo -e "${YELLOW}⏭️  Configuration Docker locale non trouvée${NC}"
fi

echo

echo -e "${BLUE}📋 Environnement Staging${NC}"
echo "-------------------------"

if [ ! -z "$STAGING_IP" ]; then
    echo -e "IP Staging: ${YELLOW}$STAGING_IP${NC}"

    check_health_endpoint "http://$STAGING_IP:3000/health" "Staging Health"
    check_http_endpoint "http://$STAGING_IP:3000" "Staging App"
    check_remote_docker "$STAGING_IP" "Staging Docker"
else
    echo -e "${YELLOW}⏭️  Adresse IP staging non disponible${NC}"
    echo -e "${YELLOW}   Vérifiez que l'infrastructure Terraform est déployée${NC}"
fi

echo

echo -e "${BLUE}📋 Environnement Production${NC}"
echo "---------------------------"

if [ ! -z "$PROD_IP" ]; then
    echo -e "IP Production: ${YELLOW}$PROD_IP${NC}"

    check_health_endpoint "http://$PROD_IP:8080/health" "Production Health"
    check_http_endpoint "http://$PROD_IP:8080" "Production App"
    check_remote_docker "$PROD_IP" "Production Docker"
else
    echo -e "${YELLOW}⏭️  Adresse IP production non disponible${NC}"
    echo -e "${YELLOW}   Vérifiez que l'infrastructure Terraform est déployée${NC}"
fi

echo

echo -e "${BLUE}📋 Vérifications Supplémentaires${NC}"
echo "--------------------------------"

if [ -f "ansible/hosts.ini" ]; then
    echo -e "${GREEN}✅ Ansible Inventory${NC}: Disponible"
else
    echo -e "${YELLOW}⚠️  Ansible Inventory${NC}: Non trouvé"
fi

if [ -f "terraform/terraform.tfstate" ]; then
    echo -e "${GREEN}✅ Terraform State${NC}: Présent"
else
    echo -e "${YELLOW}⚠️  Terraform State${NC}: Non trouvé"
fi

local_ports=(3000 5432 8080)
for port in "${local_ports[@]}"; do
    if lsof -ti:$port > /dev/null 2>&1; then
        local process=$(lsof -ti:$port | head -1)
        echo -e "${GREEN}✅ Port $port${NC}: Utilisé (PID: $process)"
    else
        echo -e "${YELLOW}⚠️  Port $port${NC}: Libre"
    fi
done

echo
echo "=============================================="

failed_checks=0

if [ -z "$STAGING_IP" ] && [ -z "$PROD_IP" ]; then
    failed_checks=$((failed_checks + 1))
fi

if ! docker info > /dev/null 2>&1; then
    failed_checks=$((failed_checks + 1))
fi

if [ $failed_checks -eq 0 ]; then
    echo -e "${GREEN}🎉 Tous les services sont opérationnels !${NC}"
else
    echo -e "${YELLOW}⚠️  $failed_checks problème(s) détecté(s)${NC}"
    echo
    echo -e "${BLUE}💡 Actions suggérées :${NC}"
    echo "  - Vérifiez les logs: docker-compose logs"
    echo "  - Redémarrez les services: docker-compose restart"
    echo "  - Vérifiez la connectivité réseau"
    echo "  - Consultez DEPLOYMENT.md pour le troubleshooting"
fi

echo
