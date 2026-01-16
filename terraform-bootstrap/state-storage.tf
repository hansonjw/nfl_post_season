# S3 Bucket for Terraform State Storage
resource "aws_s3_bucket" "terraform_state" {
  bucket = replace("${var.project_name}_terraform_state", "_", "-")

  tags = {
    Name        = "Terraform State Storage"
    Project     = var.project_name
    ManagedBy   = "Terraform"
    Purpose     = "Remote State Backend"
  }
}

# Enable versioning on state bucket (critical for state management)
resource "aws_s3_bucket_versioning" "terraform_state" {
  bucket = aws_s3_bucket.terraform_state.id

  versioning_configuration {
    status = "Enabled"
  }
}

# Enable server-side encryption
resource "aws_s3_bucket_server_side_encryption_configuration" "terraform_state" {
  bucket = aws_s3_bucket.terraform_state.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

# Block public access (state should be private!)
resource "aws_s3_bucket_public_access_block" "terraform_state" {
  bucket = aws_s3_bucket.terraform_state.id

  block_public_acls       = true
  block_public_policy      = true
  ignore_public_acls      = true
  restrict_public_buckets  = true
}

# DynamoDB Table for State Locking
# Prevents multiple Terraform runs from modifying state simultaneously
resource "aws_dynamodb_table" "terraform_state_lock" {
  name           = "${var.project_name}_terraform_state_lock"
  billing_mode   = "PAY_PER_REQUEST"
  hash_key       = "LockID"

  attribute {
    name = "LockID"
    type = "S"
  }

  tags = {
    Name        = "Terraform State Lock"
    Project     = var.project_name
    ManagedBy   = "Terraform"
    Purpose     = "State Locking"
  }
}
