#!/bin/bash

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🔍 Survivor - Vérification des Pré-requis${NC}"
echo "=============================================="
echo

check_command() {
    local cmd=$1
    local name=$2
    local min_version=$3

    if command -v $cmd &> /dev/null; then
        local version=$($cmd --version 2>/dev/null | head -n1)
        echo -e "${GREEN}✅ $name${NC}: $version"

        if [ ! -z "$min_version" ]; then
            local current_version=$(echo $version | grep -oP '\d+\.\d+' | head -1)
            if [ "$(printf '%s\n' "$min_version" "$current_version" | sort -V | head -n1)" = "$min_version" ]; then
                echo -e "   ${GREEN}   Version OK (>= $min_version)${NC}"
            else
                echo -e "   ${YELLOW}   ⚠️  Version recommandée: >= $min_version${NC}"
            fi
        fi
    else
        echo -e "${RED}❌ $name${NC}: Non installé"
        return 1
    fi
    echo
}

check_docker_compose() {
    if docker compose version &> /dev/null; then
        local version=$(docker compose version 2>/dev/null)
        echo -e "${GREEN}✅ Docker Compose${NC}: $version"
    elif docker-compose --version &> /dev/null; then
        local version=$(docker-compose --version 2>/dev/null)
        echo -e "${GREEN}✅ Docker Compose${NC}: $version (legacy)"
        echo -e "   ${YELLOW}   ⚠️  Considérez la migration vers 'docker compose'${NC}"
    else
        echo -e "${RED}❌ Docker Compose${NC}: Non installé"
        return 1
    fi
    echo
}

check_docker_daemon() {
    if docker info &> /dev/null; then
        echo -e "${GREEN}✅ Docker Daemon${NC}: Actif et accessible"
    else
        echo -e "${RED}❌ Docker Daemon${NC}: Non accessible"
        echo -e "   ${YELLOW}   💡 Essayez: sudo systemctl start docker${NC}"
        return 1
    fi
    echo
}

check_ssh_key() {
    if [ -f ~/.ssh/id_rsa ] || [ -f ~/.ssh/id_ed25519 ]; then
        echo -e "${GREEN}✅ SSH Key${NC}: Trouvée dans ~/.ssh/"
    else
        echo -e "${YELLOW}⚠️  SSH Key${NC}: Aucune clé trouvée dans ~/.ssh/"
        echo -e "   ${YELLOW}   💡 Générez une clé: ssh-keygen -t ed25519 -C 'your_email@example.com'${NC}"
    fi
    echo
}

check_do_token() {
    if [ ! -z "$DO_TOKEN" ] || [ -f terraform/terraform.tfvars ]; then
        echo -e "${GREEN}✅ DigitalOcean${NC}: Configuration détectée"
    else
        echo -e "${YELLOW}⚠️  DigitalOcean${NC}: Token non configuré"
        echo -e "   ${YELLOW}   💡 Configurez DO_TOKEN ou terraform/terraform.tfvars${NC}"
    fi
    echo
}

check_project_structure() {
    local required_dirs=("Docker" "terraform" "ansible" "src")
    local missing_dirs=()

    for dir in "${required_dirs[@]}"; do
        if [ ! -d "$dir" ]; then
            missing_dirs+=("$dir")
        fi
    done

    if [ ${#missing_dirs[@]} -eq 0 ]; then
        echo -e "${GREEN}✅ Structure du Projet${NC}: Complète"
    else
        echo -e "${RED}❌ Structure du Projet${NC}: Répertoires manquants:"
        for dir in "${missing_dirs[@]}"; do
            echo -e "   ${RED}   - $dir${NC}"
        done
        return 1
    fi
    echo
}

check_ports() {
    local ports=(3000 5432 8080)
    local busy_ports=()

    for port in "${ports[@]}"; do
        if lsof -ti:$port &> /dev/null; then
            busy_ports+=("$port")
        fi
    done

    if [ ${#busy_ports[@]} -eq 0 ]; then
        echo -e "${GREEN}✅ Ports${NC}: 3000, 5432, 8080 sont disponibles"
    else
        echo -e "${YELLOW}⚠️  Ports${NC}: Ports occupés:"
        for port in "${busy_ports[@]}"; do
            local process=$(lsof -ti:$port | head -1)
            echo -e "   ${YELLOW}   - Port $port (PID: $process)${NC}"
        done
        echo -e "   ${YELLOW}   💡 Libérez les ports ou arrêtez les services conflictuels${NC}"
    fi
    echo
}

echo -e "${BLUE}📋 Vérification des outils de développement${NC}"
echo "-------------------------------------------"

errors=0

check_command "git" "Git" "2.0" || ((errors++))
check_command "node" "Node.js" "20.0" || ((errors++))
check_command "npm" "npm" "9.0" || ((errors++))

echo -e "${BLUE}📋 Vérification Docker${NC}"
echo "----------------------"

check_command "docker" "Docker" "20.10" || ((errors++))
check_docker_compose || ((errors++))
check_docker_daemon || ((errors++))

echo -e "${BLUE}📋 Vérification des outils de déploiement${NC}"
echo "--------------------------------------------"

check_command "terraform" "Terraform" "1.0" || ((errors++))
check_command "ansible" "Ansible" "2.9" || ((errors++))
check_command "ansible-playbook" "Ansible Playbook" || ((errors++))

echo -e "${BLUE}📋 Vérification de la configuration${NC}"
echo "------------------------------------"

check_ssh_key
check_do_token

echo -e "${BLUE}📋 Vérification de l'environnement${NC}"
echo "-----------------------------------"

check_project_structure || ((errors++))
check_ports

echo "=============================================="
if [ $errors -eq 0 ]; then
    echo -e "${GREEN}🎉 Tous les pré-requis sont satisfaits !${NC}"
    echo -e "${GREEN}   Vous pouvez procéder au déploiement.${NC}"
    exit 0
else
    echo -e "${RED}⚠️  $errors erreur(s) détectée(s)${NC}"
    echo -e "${YELLOW}   Veuillez corriger les problèmes avant de continuer.${NC}"
    echo
    echo -e "${BLUE}💡 Installation rapide des outils manquants :${NC}"
    echo
    echo "# Ubuntu/Debian"
    echo "sudo apt update"
    echo "sudo apt install -y git nodejs npm docker.io docker-compose"
    echo
    echo "# Installation Terraform"
    echo "wget -O- https://apt.releases.hashicorp.com/gpg | sudo gpg --dearmor -o /usr/share/keyrings/hashicorp-archive-keyring.gpg"
    echo "echo \"deb [signed-by=/usr/share/keyrings/hashicorp-archive-keyring.gpg] https://apt.releases.hashicorp.com $(lsb_release -cs) main\" | sudo tee /etc/apt/sources.list.d/hashicorp.list"
    echo "sudo apt update && sudo apt install terraform"
    echo
    echo "# Installation Ansible"
    echo "sudo apt install -y ansible"
    echo
    exit 1
fi
