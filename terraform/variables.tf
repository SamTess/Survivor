variable "do_token" {
  description = "DigitalOcean API token"
  type        = string
  sensitive   = true
}

variable "ssh_key_id" {
  description = "DigitalOcean SSH key ID (not the public key)"
  type        = string
}

variable "private_key_path" {
  description = "Path to the SSH private key"
  type        = string
}

variable "deploy_environments" {
  description = "Which environments to deploy (staging, prod, or both)"
  type        = set(string)
  default     = ["staging", "prod"]
  validation {
    condition = alltrue([
      for env in var.deploy_environments : contains(["staging", "prod"], env)
    ])
    error_message = "Allowed values for deploy_environments are 'staging' and 'prod'."
  }
}

variable "domain_name" {
  description = "The domain name for DNS records"
  type        = string
}
