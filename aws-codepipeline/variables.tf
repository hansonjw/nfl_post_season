variable "github_owner" {
  description = "GitHub repository owner/username"
  type        = string
}

variable "github_repo" {
  description = "GitHub repository name"
  type        = string
}

# Note: GitHub v2 uses CodeStar Connections, not tokens
# The github_token variable is kept for reference but not used
variable "github_token" {
  description = "GitHub personal access token (deprecated - using CodeStar Connections v2 instead)"
  type        = string
  sensitive   = true
  default     = ""  # Not used with v2
}

# Reuse variables from main terraform
variable "project_name" {
  description = "Project name"
  type        = string
  default     = "nfl_post_season"
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


