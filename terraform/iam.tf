# IAM Role for Read API Lambda
resource "aws_iam_role" "read_api_lambda" {
  name = "${var.project_name}-read-api-lambda-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action = "sts:AssumeRole"
      Effect = "Allow"
      Principal = {
        Service = "lambda.amazonaws.com"
      }
    }]
  })
}

# IAM Policy for Read API Lambda (read-only DynamoDB access)
resource "aws_iam_role_policy" "read_api_lambda" {
  name = "${var.project_name}-read-api-lambda-policy"
  role = aws_iam_role.read_api_lambda.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "logs:CreateLogGroup",
          "logs:CreateLogStream",
          "logs:PutLogEvents"
        ]
        Resource = "arn:aws:logs:*:*:*"
      },
      {
        Effect = "Allow"
        Action = [
          "dynamodb:GetItem",
          "dynamodb:Query",
          "dynamodb:Scan"
        ]
        Resource = [
          aws_dynamodb_table.players.arn,
          aws_dynamodb_table.games.arn,
          aws_dynamodb_table.picks.arn,
          "${aws_dynamodb_table.players.arn}/index/*",
          "${aws_dynamodb_table.games.arn}/index/*",
          "${aws_dynamodb_table.picks.arn}/index/*"
        ]
      }
    ]
  })
}

# IAM Role for Admin API Lambda
resource "aws_iam_role" "admin_api_lambda" {
  name = "${var.project_name}-admin-api-lambda-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action = "sts:AssumeRole"
      Effect = "Allow"
      Principal = {
        Service = "lambda.amazonaws.com"
      }
    }]
  })
}

# IAM Policy for Admin API Lambda (full DynamoDB access)
resource "aws_iam_role_policy" "admin_api_lambda" {
  name = "${var.project_name}-admin-api-lambda-policy"
  role = aws_iam_role.admin_api_lambda.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "logs:CreateLogGroup",
          "logs:CreateLogStream",
          "logs:PutLogEvents"
        ]
        Resource = "arn:aws:logs:*:*:*"
      },
      {
        Effect = "Allow"
        Action = [
          "dynamodb:*"
        ]
        Resource = [
          aws_dynamodb_table.players.arn,
          aws_dynamodb_table.games.arn,
          aws_dynamodb_table.picks.arn,
          "${aws_dynamodb_table.players.arn}/index/*",
          "${aws_dynamodb_table.games.arn}/index/*",
          "${aws_dynamodb_table.picks.arn}/index/*"
        ]
      }
    ]
  })
}

