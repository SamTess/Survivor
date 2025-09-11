# Email Server

A simple Node.js server that receives POST requests and sends emails via Gmail SMTP.

## Overview

This email server is designed to run locally on your development machine while your main application runs on remote servers (like DigitalOcean). The remote servers can send POST requests to this local server to trigger email sending.

## Setup

1. Set up Gmail App Password:
   - Go to your Google Account settings
   - Enable 2-Factor Authentication
   - Generate an App Password for this application
   - Set the `GMAIL_APP_PASSWORD` environment variable

2. Set environment variables:
   - `GMAIL_USER`: Your Gmail address
   - `GMAIL_APP_PASSWORD`: The app password you generated
   - `PORT`: Port to run the server on (default: 4000)

## Deployment

### Via Docker Compose (Recommended)

The easiest way to run the email server:

```bash
cd email-server
docker-compose up -d
```

This will:
- Build the Docker image from the local Dockerfile
- Run the container on port 4000
- Set up environment variables from `.env` file
- Enable health checks and automatic restarts

To stop the server:
```bash
docker-compose down
```

To view logs:
```bash
docker-compose logs -f email-server
```

### Via Ansible (Automated)

The email server is automatically set up locally when you run the Ansible playbooks:

```bash
# For production deployment
ansible-playbook -i inventory.ini ansible/playbook-production.yml --tags email-server

# For staging deployment
ansible-playbook -i inventory.ini ansible/playbook-staging.yml --tags email-server
```

### Manual Docker Run

If you prefer to run it manually:

```bash
cd email-server
docker build -t email-server .
docker run -d --name email-server -p 4000:4000 --env-file .env email-server
```

## API

### POST /send-email

Send an email with the provided parameters.

**Request Body:**
```json
{
  "to": "recipient@example.com",
  "subject": "Email Subject",
  "text": "Plain text content",
  "html": "<p>HTML content</p>",
  "additionalParam": "value"
}
```

**Required fields:**
- `to`: Recipient email address
- `subject`: Email subject

**Optional fields:**
- `text`: Plain text content
- `html`: HTML content
- Any additional parameters will be logged and returned

**Response:**
```json
{
  "success": true,
  "message": "Email sent successfully",
  "messageId": "message-id",
  "params": {
    "additionalParam": "value"
  }
}
```

### GET /health

Health check endpoint.

**Response:**
```json
{
  "status": "OK",
  "service": "email-server"
}
```

## Usage from Remote Servers

Once the email server is running locally, remote servers can send emails by making POST requests to:

```
http://YOUR_LOCAL_IP:4000/send-email
```

Replace `YOUR_LOCAL_IP` with your machine's IP address that the remote server can access.

**Example from a remote server:**
```bash
curl -X POST http://your-local-ip:4000/send-email \
  -H "Content-Type: application/json" \
  -d '{
    "to": "test@example.com",
    "subject": "Test Email",
    "text": "This is a test email from remote server"
  }'
```

## Security Notes

- Ensure your local machine's firewall allows incoming connections on port 4000
- Consider using HTTPS in production (add nginx reverse proxy with SSL)
- The email server currently accepts requests from any IP - you may want to add IP whitelisting for security
