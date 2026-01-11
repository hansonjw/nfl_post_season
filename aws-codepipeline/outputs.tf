output "codepipeline_name" {
  description = "Name of the CodePipeline"
  value       = aws_codepipeline.main.name
}

output "codepipeline_arn" {
  description = "ARN of the CodePipeline"
  value       = aws_codepipeline.main.arn
}

output "s3_artifacts_bucket" {
  description = "S3 bucket for pipeline artifacts"
  value       = aws_s3_bucket.codepipeline_artifacts.bucket
}

output "codebuild_lambda_project" {
  description = "CodeBuild project for Lambda builds"
  value       = aws_codebuild_project.lambda_build.name
}

output "codebuild_terraform_project" {
  description = "CodeBuild project for Terraform deployment"
  value       = aws_codebuild_project.terraform_deploy.name
}


