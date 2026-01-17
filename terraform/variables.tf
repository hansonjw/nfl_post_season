variable "aws_region" {
  description = "AWS region for resources"
  type        = string
  default     = "us-east-1"
}

variable "project_name" {
  description = "Project name for resource naming"
  type        = string
  default     = "nfl_post_season"
}

variable "admin_emails" {
  description = "List of admin email addresses (must match Google account emails)"
  type        = list(string)
  default     = [] # Set this in terraform.tfvars or via -var flag
}

variable "google_client_id" {
  description = "Google OAuth Client ID (deprecated - not used, kept for backward compatibility)"
  type        = string
  sensitive   = true
  default     = ""
}

variable "google_client_secret" {
  description = "Google OAuth Client Secret (deprecated - not used, kept for backward compatibility)"
  type        = string
  sensitive   = true
  default     = ""
}

variable "allowed_origins" {
  description = "Allowed CORS origins for API Gateway"
  type        = list(string)
  default     = ["*"] # Update this to your frontend domain
}

variable "enable_write_endpoints" {
  description = "Enable POST, PUT, DELETE endpoints for admin operations (set to true for local development)"
  type        = bool
  default     = false # Disabled by default for production
}

variable "admin_passkey" {
  description = "Admin passkey for write operations (required if enable_write_endpoints is true). Set this in terraform.tfvars or via -var flag."
  type        = string
  sensitive   = true
  default     = "" # Set this in terraform.tfvars or via -var flag
}
