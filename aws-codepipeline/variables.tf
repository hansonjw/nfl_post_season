variable "github_owner" {
  description = "GitHub repository owner/username"
  type        = string
}

variable "github_repo" {
  description = "GitHub repository name"
  type        = string
}

variable "github_token" {
  description = "GitHub personal access token (for CodePipeline)"
  type        = string
  sensitive   = true
}

# Reuse variables from main terraform
variable "project_name" {
  description = "Project name"
  type        = string
  default     = "nfl-post-season"
}

variable "admin_emails" {
  description = "Admin email addresses"
  type        = list(string)
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
  description = "Allowed CORS origins"
  type        = list(string)
}

variable "aws_region" {
  description = "AWS region"
  type        = string
  default     = "us-east-1"
}


