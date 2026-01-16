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
  description = "Google OAuth Client ID"
  type        = string
  sensitive   = true
}

variable "google_client_secret" {
  description = "Google OAuth Client Secret"
  type        = string
  sensitive   = true
}

variable "allowed_origins" {
  description = "Allowed CORS origins for API Gateway"
  type        = list(string)
  default     = ["*"] # Update this to your frontend domain
}

