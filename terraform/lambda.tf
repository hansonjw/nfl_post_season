# Read API Lambda Function
resource "aws_lambda_function" "read_api" {
  filename         = "${path.module}/../lambda/read-api/dist/index.zip"
  function_name    = "${var.project_name}_read_api"
  role             = aws_iam_role.read_api_lambda.arn
  handler          = "read-api/index.handler"
  runtime          = "nodejs20.x"
  timeout          = 30
  source_code_hash = fileexists("${path.module}/../lambda/read-api/dist/index.zip") ? filebase64sha256("${path.module}/../lambda/read-api/dist/index.zip") : null

  environment {
    variables = {
      PLAYERS_TABLE = aws_dynamodb_table.players.name
      GAMES_TABLE   = aws_dynamodb_table.games.name
      PICKS_TABLE   = aws_dynamodb_table.picks.name
    }
  }

  depends_on = [
    aws_iam_role_policy.read_api_lambda
  ]
}

# Admin API Lambda Function
resource "aws_lambda_function" "admin_api" {
  filename         = "${path.module}/../lambda/admin-api/dist/index.zip"
  function_name    = "${var.project_name}_admin_api"
  role             = aws_iam_role.admin_api_lambda.arn
  handler          = "admin-api/index.handler"
  runtime          = "nodejs20.x"
  timeout          = 30
  source_code_hash = fileexists("${path.module}/../lambda/admin-api/dist/index.zip") ? filebase64sha256("${path.module}/../lambda/admin-api/dist/index.zip") : null

  environment {
    variables = {
      PLAYERS_TABLE = aws_dynamodb_table.players.name
      GAMES_TABLE   = aws_dynamodb_table.games.name
      PICKS_TABLE   = aws_dynamodb_table.picks.name
      ADMIN_EMAILS  = join(",", var.admin_emails)
    }
  }

  depends_on = [
    aws_iam_role_policy.admin_api_lambda
  ]
}

# Lambda Permissions for API Gateway
resource "aws_lambda_permission" "read_api" {
  statement_id  = "AllowExecutionFromAPIGateway"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.read_api.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_api_gateway_rest_api.main.execution_arn}/*/*"
}

resource "aws_lambda_permission" "admin_api" {
  statement_id  = "AllowExecutionFromAPIGateway"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.admin_api.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_api_gateway_rest_api.main.execution_arn}/*/*"
}

