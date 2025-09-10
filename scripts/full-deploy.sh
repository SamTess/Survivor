#!/bin/bash

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

ENVIRONMENT="both"
SKIP_PREREQ=false
SKIP_INFRA=false
SKIP_APP=false

show_usage() {
    echo -e "${BLUE}🚀 Survivor - Déploiement Complet${NC}"
    echo "Usage: $0 [OPTIONS] [ENVIRONMENT]"
    echo
    echo "ENVIRONMENT:"
    echo "  staging     Déploie uniquement l'environnement de staging"
    echo "  prod        Déploie uniquement l'environnement de production"
    echo "  both        Déploie les deux environnements (défaut)"
    echo
    echo "OPTIONS:"
    echo "  --skip-prereq    Ignore la vérification des pré-requis"
    echo "  --skip-infra     Ignore le déploiement de l'infrastructure"
    echo "  --skip-app       Ignore le déploiement de l'application"
    echo "  -h, --help       Affiche cette aide"
    echo
    echo "EXEMPLES:"
    echo "  $0                     # Déploie tout (staging + prod)"
    echo "  $0 staging             # Déploie uniquement staging"
    echo "  $0 prod --skip-prereq  # Déploie prod sans vérifier les pré-requis"
    echo "  $0 --skip-infra both   # Déploie app uniquement sur les deux env"
}

while [[ $# -gt 0 ]]; do
    case $1 in
        staging|prod|both)
            ENVIRONMENT="$1"
            shift
            ;;
        --skip-prereq)
            SKIP_PREREQ=true
            shift
            ;;
        --skip-infra)
            SKIP_INFRA=true
            shift
            ;;
        --skip-app)
            SKIP_APP=true
            shift
            ;;
        -h|--help)
            show_usage
            exit 0
            ;;
        *)
            echo -e "${RED}❌ Option inconnue: $1${NC}"
            show_usage
            exit 1
            ;;
    esac
done

echo -e "${BLUE}🚀 Survivor - Déploiement Complet${NC}"
echo "=================================="
echo -e "Environnement cible: ${YELLOW}$ENVIRONMENT${NC}"
echo

if [ "$SKIP_PREREQ" = false ]; then
    echo -e "${BLUE}📋 Étape 1/3: Vérification des pré-requis${NC}"
    echo "--------------------------------------------"

    if [ -x "./scripts/check-prerequisites.sh" ]; then
        ./scripts/check-prerequisites.sh
        if [ $? -ne 0 ]; then
            echo -e "${RED}❌ Échec de la vérification des pré-requis${NC}"
            echo -e "${YELLOW}💡 Utilisez --skip-prereq pour ignorer cette étape${NC}"
            exit 1
        fi
    else
        echo -e "${YELLOW}⚠️  Script de vérification non trouvé, continuons...${NC}"
    fi
    echo
else
    echo -e "${YELLOW}⏭️  Étape 1/3: Vérification des pré-requis (ignorée)${NC}"
    echo
fi

if [ "$SKIP_INFRA" = false ]; then
    echo -e "${BLUE}🏗️  Étape 2/3: Déploiement de l'infrastructure${NC}"
    echo "------------------------------------------------"

    if [ ! -d "terraform" ]; then
        echo -e "${RED}❌ Répertoire terraform non trouvé${NC}"
        exit 1
    fi

    cd terraform

    if [ ! -f "terraform.tfvars" ]; then
        echo -e "${YELLOW}⚠️  terraform.tfvars non trouvé${NC}"
        echo -e "${YELLOW}   Copie du fichier d'exemple...${NC}"
        if [ -f "terraform.tfvars.example" ]; then
            cp terraform.tfvars.example terraform.tfvars
            echo -e "${RED}🔧 Veuillez éditer terraform.tfvars avec vos credentials${NC}"
            echo -e "${RED}   Puis relancez ce script${NC}"
            exit 1
        fi
    fi

    if [ ! -d ".terraform" ]; then
        echo -e "${YELLOW}📦 Initialisation de Terraform...${NC}"
        terraform init
        if [ $? -ne 0 ]; then
            echo -e "${RED}❌ Échec de l'initialisation Terraform${NC}"
            exit 1
        fi
    fi

    case $ENVIRONMENT in
        staging)
            echo -e "${GREEN}🎯 Déploiement infrastructure staging...${NC}"
            terraform apply -var='deploy_environments=["staging"]' -auto-approve
            ;;
        prod)
            echo -e "${GREEN}🎯 Déploiement infrastructure production...${NC}"
            terraform apply -var='deploy_environments=["prod"]' -auto-approve
            ;;
        both)
            echo -e "${GREEN}🎯 Déploiement infrastructure complète...${NC}"
            terraform apply -var='deploy_environments=["staging", "prod"]' -auto-approve
            ;;
    esac

    if [ $? -ne 0 ]; then
        echo -e "${RED}❌ Échec du déploiement infrastructure${NC}"
        exit 1
    fi

    cd ..
    echo -e "${GREEN}✅ Infrastructure déployée avec succès${NC}"
    echo
else
    echo -e "${YELLOW}⏭️  Étape 2/3: Déploiement de l'infrastructure (ignorée)${NC}"
    echo
fi

if [ "$SKIP_APP" = false ]; then
    echo -e "${BLUE}🚀 Étape 3/3: Déploiement de l'application${NC}"
    echo "---------------------------------------------"

    if [ ! -d "ansible" ]; then
        echo -e "${RED}❌ Répertoire ansible non trouvé${NC}"
        exit 1
    fi

    cd ansible

    if [ ! -f "hosts.ini" ]; then
        echo -e "${RED}❌ Fichier hosts.ini non trouvé${NC}"
        echo -e "${YELLOW}   L'infrastructure doit être déployée en premier${NC}"
        exit 1
    fi

    echo -e "${YELLOW}📦 Installation des collections Ansible...${NC}"
    if [ -f "requirements.yml" ]; then
        ansible-galaxy collection install -r requirements.yml --force
    else
        ansible-galaxy collection install community.docker --force
    fi

    case $ENVIRONMENT in
        staging)
            echo -e "${GREEN}🎯 Déploiement application staging...${NC}"
            if [ -f "playbook-staging.yml" ]; then
                ansible-playbook playbook-staging.yml -v
            else
                ansible-playbook playbook.yml --limit=survivor_staging -v
            fi
            ;;
        prod)
            echo -e "${GREEN}🎯 Déploiement application production...${NC}"
            if [ -f "playbook-production.yml" ]; then
                ansible-playbook playbook-production.yml -v
            else
                ansible-playbook playbook.yml --limit=survivor_prod -v
            fi
            ;;
        both)
            echo -e "${GREEN}🎯 Déploiement application complète...${NC}"
            ansible-playbook playbook.yml -v
            ;;
    esac

    if [ $? -ne 0 ]; then
        echo -e "${RED}❌ Échec du déploiement application${NC}"
        exit 1
    fi

    cd ..
    echo -e "${GREEN}✅ Application déployée avec succès${NC}"
    echo
else
    echo -e "${YELLOW}⏭️  Étape 3/3: Déploiement de l'application (ignorée)${NC}"
    echo
fi

echo "=================================================="
echo -e "${GREEN}🎉 Déploiement Complet Terminé !${NC}"
echo

if [ "$SKIP_INFRA" = false ]; then
    echo -e "${BLUE}📊 Ressources déployées :${NC}"
    cd terraform
    terraform output 2>/dev/null | while read line; do
        echo -e "   ${GREEN}$line${NC}"
    done
    cd ..
    echo
fi

echo -e "${BLUE}🔍 Vérifications suggérées :${NC}"

case $ENVIRONMENT in
    staging)
        echo "   curl http://\$(terraform -chdir=terraform output -raw droplet_staging_ip 2>/dev/null || echo 'STAGING_IP'):3000/health"
        ;;
    prod)
        echo "   curl http://\$(terraform -chdir=terraform output -raw droplet_prod_ip 2>/dev/null || echo 'PROD_IP'):8080/health"
        ;;
    both)
        echo "   curl http://\$(terraform -chdir=terraform output -raw droplet_staging_ip 2>/dev/null || echo 'STAGING_IP'):3000/health"
        echo "   curl http://\$(terraform -chdir=terraform output -raw droplet_prod_ip 2>/dev/null || echo 'PROD_IP'):8080/health"
        ;;
esac

echo
echo -e "${YELLOW}💡 Utilisez './scripts/health-check.sh' pour vérifier l'état des services${NC}"
echo -e "${YELLOW}💡 Consultez 'DEPLOYMENT.md' pour plus d'informations${NC}"
