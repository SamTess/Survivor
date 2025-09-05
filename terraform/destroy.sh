#!/bin/bash

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${RED}🔥 Survivor Infrastructure Cleanup${NC}"
echo "==================================="
echo

show_menu() {
    echo -e "${YELLOW}Please select which environment(s) to destroy:${NC}"
    echo "1) Staging only"
    echo "2) Production only"
    echo "3) Both staging and production"
    echo "4) Exit"
    echo
}

get_choice() {
    local choice
    read -p "Enter your choice [1-4]: " choice
    echo $choice
}

destroy_environment() {
    local environments=$1
    local description=$2

    echo
    echo -e "${RED}🎯 Destroying: $description${NC}"
    echo "Environments: $environments"
    echo

    echo -e "${RED}⚠️  WARNING: This will permanently destroy the selected infrastructure!${NC}"
    read -p "Are you absolutely sure? Type 'YES' to confirm: " confirmation

    if [ "$confirmation" = "YES" ]; then
        echo -e "${RED}🔥 Destroying terraform resources...${NC}"
        terraform destroy -var="deploy_environments=$environments" -auto-approve

        if [ $? -eq 0 ]; then
            echo -e "${GREEN}✅ Destruction completed successfully!${NC}"
        else
            echo -e "${RED}❌ Destruction failed!${NC}"
            exit 1
        fi
    else
        echo -e "${YELLOW}🚫 Destruction cancelled${NC}"
    fi
}

while true; do
    show_menu
    choice=$(get_choice)

    case $choice in
        1)
            destroy_environment '["staging"]' "Staging Environment Only"
            break
            ;;
        2)
            destroy_environment '["prod"]' "Production Environment Only"
            break
            ;;
        3)
            destroy_environment '["staging", "prod"]' "Both Staging and Production"
            break
            ;;
        4)
            echo -e "${YELLOW}👋 Goodbye!${NC}"
            exit 0
            ;;
        *)
            echo -e "${RED}❌ Invalid option. Please try again.${NC}"
            echo
            ;;
    esac
done
