terraform {
  required_version = ">= 1.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }

  backend "s3" {
    bucket         = "nfl-post-season-terraform-state"
    key            = "terraform/terraform.tfstate"
    region         = "us-west-2"
    dynamodb_table = "nfl_post_season_terraform_state_lock"
  }
}

provider "aws" {
  region = var.aws_region
}

