output "state_bucket_name" {
  description = "Name of the S3 bucket for Terraform state"
  value       = aws_s3_bucket.terraform_state.bucket
}

output "state_bucket_arn" {
  description = "ARN of the S3 bucket for Terraform state"
  value       = aws_s3_bucket.terraform_state.arn
}

output "state_lock_table_name" {
  description = "Name of the DynamoDB table for state locking"
  value       = aws_dynamodb_table.terraform_state_lock.name
}

output "state_lock_table_arn" {
  description = "ARN of the DynamoDB table for state locking"
  value       = aws_dynamodb_table.terraform_state_lock.arn
}

output "backend_config" {
  description = "Backend configuration to add to other Terraform configs"
  value = {
    bucket = aws_s3_bucket.terraform_state.bucket
    key    = "terraform/terraform.tfstate"  # For main infrastructure
    region = var.aws_region
    dynamodb_table = aws_dynamodb_table.terraform_state_lock.name
  }
}

output "codepipeline_backend_config" {
  description = "Backend configuration for CodePipeline Terraform"
  value = {
    bucket = aws_s3_bucket.terraform_state.bucket
    key    = "codepipeline/terraform.tfstate"  # For CodePipeline infrastructure
    region = var.aws_region
    dynamodb_table = aws_dynamodb_table.terraform_state_lock.name
  }
}
