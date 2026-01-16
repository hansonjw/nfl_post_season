terraform {
  required_version = ">= 1.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }

  # Bootstrap uses local state (chicken-and-egg problem)
  # After this runs, other terraform configs can use S3 backend
}

provider "aws" {
  region = var.aws_region
}
