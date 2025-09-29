#!/bin/bash

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🚀 Survivor Application Deployment${NC}"
echo "===================================="
echo

check_inventory() {
    if [ ! -f "hosts.ini" ]; then
        echo -e "${RED}❌ hosts.ini file not found!${NC}"
        echo "Please run Terraform first to generate the inventory file."
        exit 1
    fi
}

install_collections() {
    echo -e "${YELLOW}📦 Checking Ansible collections...${NC}"

    if [ -f "requirements.yml" ]; then
        echo "Installing collections from requirements.yml..."
        ansible-galaxy collection install -r requirements.yml --force

        if [ $? -eq 0 ]; then
            echo -e "${GREEN}✅ Collections installed successfully!${NC}"
        else
            echo -e "${RED}❌ Failed to install collections!${NC}"
            exit 1
        fi
    else
        echo "Installing community.docker collection..."
        ansible-galaxy collection install community.docker --force

        if [ $? -eq 0 ]; then
            echo -e "${GREEN}✅ community.docker collection installed!${NC}"
        else
            echo -e "${RED}❌ Failed to install community.docker collection!${NC}"
            exit 1
        fi
    fi
    echo
}

check_environments() {
    local staging_available=false
    local prod_available=false

    if grep -q "\[survivor_staging\]" hosts.ini && grep -A1 "\[survivor_staging\]" hosts.ini | grep -q "ansible_user"; then
        staging_available=true
    fi

    if grep -q "\[survivor_prod\]" hosts.ini && grep -A1 "\[survivor_prod\]" hosts.ini | grep -q "ansible_user"; then
        prod_available=true
    fi

    echo "staging_available=$staging_available"
    echo "prod_available=$prod_available"
}

show_menu() {
    local envs=$(check_environments)
    eval $envs

    echo -e "${YELLOW}Available deployment options:${NC}"

    if [ "$staging_available" = true ]; then
        echo "1) Deploy to Staging only"
    else
        echo -e "1) Deploy to Staging only ${RED}(not available)${NC}"
    fi

    if [ "$prod_available" = true ]; then
        echo "2) Deploy to Production only"
    else
        echo -e "2) Deploy to Production only ${RED}(not available)${NC}"
    fi

    if [ "$staging_available" = true ] && [ "$prod_available" = true ]; then
        echo "3) Deploy to Both environments"
    else
        echo -e "3) Deploy to Both environments ${RED}(not available)${NC}"
    fi

    echo "4) Install dependencies only (all available hosts)"
    echo "5) Exit"
    echo
}

get_choice() {
    local choice
    read -p "Enter your choice [1-5]: " choice
    echo $choice
}

run_dependencies() {
    echo
    echo -e "${GREEN}🔧 Installing Dependencies on All Hosts${NC}"
    echo -e "${YELLOW}📋 Running: ansible-playbook playbook.yml${NC}"
    ansible-playbook playbook.yml -v

    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Dependencies installed successfully!${NC}"
    else
        echo -e "${RED}❌ Dependencies installation failed!${NC}"
        exit 1
    fi
}

run_staging_deployment() {
    echo
    echo -e "${GREEN}🎯 Deploying to Staging Environment${NC}"
    echo -e "${YELLOW}📋 Running: ansible-playbook playbook-staging.yml${NC}"
    ansible-playbook playbook-staging.yml

    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Staging deployment completed successfully!${NC}"
    else
        echo -e "${RED}❌ Staging deployment failed!${NC}"
        exit 1
    fi
}

run_production_deployment() {
    echo
    echo -e "${GREEN}🎯 Deploying to Production Environment${NC}"
    echo -e "${YELLOW}📋 Running: ansible-playbook playbook-production.yml${NC}"
    ansible-playbook playbook-production.yml

    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Production deployment completed successfully!${NC}"
    else
        echo -e "${RED}❌ Production deployment failed!${NC}"
        exit 1
    fi
}

run_full_deployment() {
    echo
    echo -e "${GREEN}🎯 Deploying to Both Environments${NC}"

    echo -e "${YELLOW}📋 Step 1/3: Installing dependencies...${NC}"
    ansible-playbook playbook.yml

    if [ $? -ne 0 ]; then
        echo -e "${RED}❌ Dependencies installation failed!${NC}"
        exit 1
    fi

    echo -e "${YELLOW}📋 Step 2/3: Deploying to staging...${NC}"
    ansible-playbook playbook-staging.yml

    if [ $? -ne 0 ]; then
        echo -e "${RED}❌ Staging deployment failed!${NC}"
        exit 1
    fi

    echo -e "${YELLOW}📋 Step 3/3: Deploying to production...${NC}"
    ansible-playbook playbook-production.yml

    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Full deployment completed successfully!${NC}"
    else
        echo -e "${RED}❌ Production deployment failed!${NC}"
        exit 1
    fi
}

check_inventory
install_collections

while true; do
    show_menu
    choice=$(get_choice)

    envs=$(check_environments)
    eval $envs

    case $choice in
        1)
            if [ "$staging_available" = true ]; then
                run_dependencies
                run_staging_deployment
                break
            else
                echo -e "${RED}❌ Staging environment not available in hosts.ini${NC}"
                echo
            fi
            ;;
        2)
            if [ "$prod_available" = true ]; then
                run_dependencies
                run_production_deployment
                break
            else
                echo -e "${RED}❌ Production environment not available in hosts.ini${NC}"
                echo
            fi
            ;;
        3)
            if [ "$staging_available" = true ] && [ "$prod_available" = true ]; then
                run_full_deployment
                break
            else
                echo -e "${RED}❌ Both environments not available in hosts.ini${NC}"
                echo
            fi
            ;;
        4)
            run_dependencies
            break
            ;;
        5)
            echo -e "${YELLOW}👋 Goodbye!${NC}"
            exit 0
            ;;
        *)
            echo -e "${RED}❌ Invalid option. Please try again.${NC}"
            echo
            ;;
    esac
done
