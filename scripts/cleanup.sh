#!/bin/bash

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${RED}🧹 Survivor - Nettoyage Complet${NC}"
echo "================================"
echo -e "${YELLOW}⚠️  ATTENTION: Cette opération va supprimer toutes les ressources déployées${NC}"
echo

show_usage() {
    echo "Usage: $0 [OPTIONS]"
    echo
    echo "OPTIONS:"
    echo "  --local-only     Nettoie uniquement l'environnement local (Docker)"
    echo "  --remote-only    Nettoie uniquement les ressources distantes (Terraform)"
    echo "  --dry-run        Affiche ce qui serait supprimé sans l'exécuter"
    echo "  --force          Force la suppression sans confirmation"
    echo "  -h, --help       Affiche cette aide"
    echo
    echo "EXEMPLES:"
    echo "  $0                    # Nettoyage complet avec confirmation"
    echo "  $0 --local-only      # Nettoie seulement Docker local"
    echo "  $0 --dry-run         # Simule le nettoyage"
    echo "  $0 --force           # Nettoyage sans confirmation"
}

LOCAL_ONLY=false
REMOTE_ONLY=false
DRY_RUN=false
FORCE=false

while [[ $# -gt 0 ]]; do
    case $1 in
        --local-only)
            LOCAL_ONLY=true
            shift
            ;;
        --remote-only)
            REMOTE_ONLY=true
            shift
            ;;
        --dry-run)
            DRY_RUN=true
            shift
            ;;
        --force)
            FORCE=true
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

run_command() {
    local cmd="$1"
    local description="$2"

    if [ "$DRY_RUN" = true ]; then
        echo -e "${BLUE}[DRY-RUN]${NC} $description"
        echo -e "${YELLOW}   Commande: $cmd${NC}"
    else
        echo -e "${YELLOW}$description${NC}"
        eval "$cmd"
        if [ $? -eq 0 ]; then
            echo -e "${GREEN}✅ Succès${NC}"
        else
            echo -e "${RED}❌ Échec${NC}"
        fi
    fi
    echo
}

confirm_action() {
    local message="$1"

    if [ "$FORCE" = true ] || [ "$DRY_RUN" = true ]; then
        return 0
    fi

    echo -e "${YELLOW}$message${NC}"
    read -p "Tapez 'YES' pour confirmer: " confirmation

    if [ "$confirmation" = "YES" ]; then
        return 0
    else
        echo -e "${YELLOW}🚫 Action annulée${NC}"
        return 1
    fi
}

cleanup_local() {
    echo -e "${BLUE}🐳 Nettoyage de l'environnement Docker local${NC}"
    echo "---------------------------------------------"

    if confirm_action "Voulez-vous arrêter et supprimer tous les containers Docker ?"; then
        if [ -d "Docker" ]; then
            cd Docker
            run_command "docker-compose down -v" "Arrêt des services Docker Compose"
            run_command "docker-compose -f docker-compose.prod.yml down -v" "Arrêt des services Docker Compose (prod)"
            cd ..
        fi

        run_command "docker container prune -f" "Suppression des containers arrêtés"
        run_command "docker image prune -f" "Suppression des images non utilisées"
        run_command "docker volume prune -f" "Suppression des volumes non utilisés"
        run_command "docker network prune -f" "Suppression des réseaux non utilisés"

        if docker images | grep -q "survivor"; then
            run_command "docker rmi \$(docker images | grep survivor | awk '{print \$3}') 2>/dev/null || true" "Suppression des images Survivor"
        fi
    fi
}

cleanup_remote() {
    echo -e "${BLUE}☁️  Nettoyage de l'infrastructure distante${NC}"
    echo "-------------------------------------------"

    if [ ! -d "terraform" ]; then
        echo -e "${YELLOW}⚠️  Répertoire terraform non trouvé${NC}"
        return
    fi

    cd terraform

    if [ -f "terraform.tfstate" ] && [ -s "terraform.tfstate" ]; then
        if confirm_action "Voulez-vous détruire toute l'infrastructure Terraform ?"; then
            run_command "terraform destroy -auto-approve" "Destruction de l'infrastructure Terraform"
        fi
    else
        echo -e "${YELLOW}⚠️  Aucune infrastructure Terraform trouvée${NC}"
    fi

    cd ..
}

cleanup_ansible() {
    echo -e "${BLUE}📋 Nettoyage des artefacts Ansible${NC}"
    echo "----------------------------------"

    if [ -f "ansible/hosts.ini" ]; then
        run_command "rm -f ansible/hosts.ini" "Suppression de l'inventaire Ansible"
    fi

    if [ "$FORCE" = true ]; then
        run_command "ssh-keygen -R \$(grep -oP '\\d+\\.\\d+\\.\\d+\\.\\d+' ansible/hosts.ini 2>/dev/null) 2>/dev/null || true" "Nettoyage des entrées known_hosts"
    fi
}

cleanup_temp() {
    echo -e "${BLUE}🗑️  Nettoyage des fichiers temporaires${NC}"
    echo "-------------------------------------"

    run_command "find . -name '*.log' -type f -delete" "Suppression des fichiers de logs"

    run_command "find . -name '*.backup' -type f -delete" "Suppression des fichiers de sauvegarde"

    if [ -d "terraform/.terraform" ]; then
        run_command "rm -rf terraform/.terraform" "Suppression du cache Terraform"
    fi

    run_command "find . -name 'node_modules' -type d -exec rm -rf {} + 2>/dev/null || true" "Suppression des node_modules"

    run_command "docker builder prune -f" "Nettoyage du cache de build Docker"
}

reset_to_clean() {
    echo -e "${BLUE}🔄 Remise à l'état initial${NC}"
    echo "---------------------------"

    if git status --porcelain | grep -q .; then
        if confirm_action "Voulez-vous annuler les modifications Git non commitées ?"; then
            run_command "git checkout -- ." "Annulation des modifications Git"
            run_command "git clean -fd" "Suppression des fichiers non trackés"
        fi
    fi

    if [ ! -f "terraform/terraform.tfvars.example" ] && [ -f "terraform/terraform.tfvars" ]; then
        run_command "cp terraform/terraform.tfvars terraform/terraform.tfvars.example" "Création du fichier d'exemple Terraform"
        run_command "git add terraform/terraform.tfvars.example" "Ajout du fichier d'exemple au Git"
    fi
}

echo -e "${BLUE}Configuration du nettoyage :${NC}"
echo "  Local seulement: $LOCAL_ONLY"
echo "  Distant seulement: $REMOTE_ONLY"
echo "  Simulation: $DRY_RUN"
echo "  Force: $FORCE"
echo

if [ "$DRY_RUN" = true ]; then
    echo -e "${BLUE}🔍 MODE SIMULATION - Aucune action ne sera exécutée${NC}"
    echo
fi

if [ "$REMOTE_ONLY" = false ]; then
    cleanup_local
fi

if [ "$LOCAL_ONLY" = false ]; then
    cleanup_remote
    cleanup_ansible
fi

cleanup_temp

if [ "$FORCE" = true ]; then
    reset_to_clean
fi

echo "=============================================="

if [ "$DRY_RUN" = true ]; then
    echo -e "${BLUE}🔍 Simulation terminée${NC}"
    echo -e "${YELLOW}💡 Lancez sans --dry-run pour exécuter les actions${NC}"
else
    echo -e "${GREEN}🎉 Nettoyage terminé !${NC}"
    echo
    echo -e "${BLUE}💡 Prochaines étapes suggérées :${NC}"
    echo "  1. Vérifiez l'état: ./scripts/health-check.sh"
    echo "  2. Redéployez si nécessaire: ./scripts/full-deploy.sh"
    echo "  3. Consultez DEPLOYMENT.md pour plus d'informations"
fi

echo
