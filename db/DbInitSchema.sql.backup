-- Active: 1756719689456@@127.0.0.1@5432@Survivor
----------------------------------------------------------------------------------------------------
-- File: DbInitSchema.sql
-- Description: This file contains the SQL schema initialization for the Survivor project database.
--              It defines the structure, tables, and relationships required for the application.
-- Author: [Your Name]
-- Date: [Creation Date]
----------------------------------------------------------------------------------------------------


-- Table des startups
CREATE TABLE S_STARTUP (
    id SERIAL PRIMARY KEY NOT NULL,
    name VARCHAR(255) NOT NULL,
    legal_status VARCHAR(255) NOT NULL,
    address VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    sector VARCHAR(100) NOT NULL,
    maturity VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    image_data BYTEA,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table des détails des startups
CREATE TABLE S_STARTUP_DETAIL (
    id SERIAL PRIMARY KEY NOT NULL,
    startup_id INTEGER NOT NULL,
    description TEXT,
    website_url VARCHAR(255),
    social_media_url VARCHAR(255),
    project_status VARCHAR(255),
    needs VARCHAR(255),
    FOREIGN KEY (startup_id) REFERENCES S_STARTUP(id) ON DELETE CASCADE
);

-- Table des utilisateurs
CREATE TABLE S_USER (
    id SERIAL PRIMARY KEY NOT NULL,
    name VARCHAR(50) NOT NULL,
    email VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    address VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    legal_status VARCHAR(255),
    description TEXT,
    image_data BYTEA,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    role VARCHAR(50) NOT NULL
);

-- Table des fondateurs
CREATE TABLE S_FOUNDER (
    id SERIAL PRIMARY KEY NOT NULL,
    startup_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    FOREIGN KEY (startup_id) REFERENCES S_STARTUP(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES S_USER(id) ON DELETE CASCADE
);

-- Table des investisseurs
CREATE TABLE S_INVESTOR (
    id SERIAL PRIMARY KEY NOT NULL,
    investor_type VARCHAR(255),
    investment_focus VARCHAR(255),
    user_id INTEGER NOT NULL,
    FOREIGN KEY (user_id) REFERENCES S_USER(id) ON DELETE CASCADE
);

-- Table des partenaires
CREATE TABLE S_PARTNER (
    id SERIAL PRIMARY KEY NOT NULL,
    partnership_type VARCHAR(255),
    user_id INTEGER NOT NULL,
    FOREIGN KEY (user_id) REFERENCES S_USER(id) ON DELETE CASCADE
);

-- Table des actualités
CREATE TABLE S_NEWS (
    id SERIAL PRIMARY KEY NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    image_data BYTEA,
    startup_id INTEGER NOT NULL,
    news_date TIMESTAMP,
    location VARCHAR(255),
    category VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (startup_id) REFERENCES S_STARTUP(id) ON DELETE CASCADE
);

-- Table des événements
CREATE TABLE S_EVENT (
    id SERIAL PRIMARY KEY NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    image_data BYTEA,
    dates TIMESTAMP,
    location VARCHAR(255),
    event_type VARCHAR(255),
    target_audience VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table des références de rôles existants
CREATE TABLE S_ROLES_REF (
    id SERIAL PRIMARY KEY NOT NULL,
    role_name VARCHAR(50) NOT NULL UNIQUE,
    description TEXT
);

-- Table des permissions des utilisateurs
CREATE TABLE S_PERMISSION (
    id SERIAL PRIMARY KEY NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    can_create BOOLEAN DEFAULT FALSE,
    can_read BOOLEAN DEFAULT FALSE,
    can_update BOOLEAN DEFAULT FALSE,
    can_delete BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    user_id INTEGER NOT NULL,
    FOREIGN KEY (user_id) REFERENCES S_USER(id) ON DELETE CASCADE
);

-- Table des conversations (privées ou de groupe)
CREATE TABLE S_CONVERSATION (
    id SERIAL PRIMARY KEY NOT NULL,
    name VARCHAR(255), -- null pour une conversation privée
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table de liaison entre conversation et utilisateurs (participants)
CREATE TABLE S_CONVERSATION_USER (
    conversation_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    PRIMARY KEY (conversation_id, user_id),
    FOREIGN KEY (conversation_id) REFERENCES S_CONVERSATION(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES S_USER(id) ON DELETE CASCADE
);

-- Table des messages
CREATE TABLE S_MESSAGE (
    id SERIAL PRIMARY KEY NOT NULL,
    conversation_id INTEGER NOT NULL,
    sender_id INTEGER NOT NULL,
    content TEXT NOT NULL,
    sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (conversation_id) REFERENCES S_CONVERSATION(id) ON DELETE CASCADE,
    FOREIGN KEY (sender_id) REFERENCES S_USER(id) ON DELETE CASCADE
);
