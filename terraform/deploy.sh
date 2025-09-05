#!/bin/bash

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🚀 Survivor Infrastructure Deployment${NC}"
echo "======================================"
echo

show_menu() {
    echo -e "${YELLOW}Please select which environment(s) to deploy:${NC}"
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

deploy_environment() {
    local environments=$1
    local description=$2

    echo
    echo -e "${GREEN}🎯 Deploying: $description${NC}"
    echo "Environments: $environments"
    echo

    echo -e "${YELLOW}📋 Running terraform plan...${NC}"
    terraform plan -var="deploy_environments=$environments"

    if [ $? -eq 0 ]; then
        echo
        read -p "Do you want to apply these changes? (y/N): " apply_choice
        if [[ $apply_choice =~ ^[Yy]$ ]]; then
            echo -e "${GREEN}🚀 Applying terraform configuration...${NC}"
            terraform apply -var="deploy_environments=$environments" -auto-approve

            if [ $? -eq 0 ]; then
                echo -e "${GREEN}✅ Deployment completed successfully!${NC}"
            else
                echo -e "${RED}❌ Deployment failed!${NC}"
                exit 1
            fi
        else
            echo -e "${YELLOW}🚫 Deployment cancelled by user${NC}"
        fi
    else
        echo -e "${RED}❌ Terraform plan failed!${NC}"
        exit 1
    fi
}

while true; do
    show_menu
    choice=$(get_choice)

    case $choice in
        1)
            deploy_environment '["staging"]' "Staging Environment Only"
            break
            ;;
        2)
            deploy_environment '["prod"]' "Production Environment Only"
            break
            ;;
        3)
            deploy_environment '["staging", "prod"]' "Both Staging and Production"
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
