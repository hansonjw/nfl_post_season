# Locals for conditional depends_on
locals {
  # Build list of write integrations that exist when enable_write_endpoints = true
  write_integrations = var.enable_write_endpoints ? [
    aws_api_gateway_integration.players_post[0],
    aws_api_gateway_integration.players_put[0],
    aws_api_gateway_integration.players_delete[0],
    aws_api_gateway_integration.games_post[0],
    aws_api_gateway_integration.games_put[0],
    aws_api_gateway_integration.picks_post[0],
    aws_api_gateway_integration.picks_put[0],
  ] : []
}

# API Gateway REST API
resource "aws_api_gateway_rest_api" "main" {
  name        = "${var.project_name}_api"
  description = "NFL Post Season Pick 'Em API"

  endpoint_configuration {
    types = ["REGIONAL"]
  }
}

# API Gateway Authorizer (Cognito)
# Using a new name to create a fresh authorizer without identity_source
resource "aws_api_gateway_authorizer" "cognito" {
  name          = "${var.project_name}_cognito_authorizer_v2"
  rest_api_id   = aws_api_gateway_rest_api.main.id
  type          = "COGNITO_USER_POOLS"
  provider_arns = [aws_cognito_user_pool.main.arn]
  # For COGNITO_USER_POOLS, identity_source must NOT be set
  # API Gateway automatically extracts the token from Authorization header
  # Setting identity_source causes it to parse as AWS Signature V4 instead of JWT
}

# API Gateway CORS
resource "aws_api_gateway_gateway_response" "cors" {
  rest_api_id   = aws_api_gateway_rest_api.main.id
  response_type = "DEFAULT_4XX"

  response_templates = {
    "application/json" = "{\"message\":$context.error.messageString}"
  }

  response_parameters = {
    "gatewayresponse.header.Access-Control-Allow-Origin"  = "'*'"
    "gatewayresponse.header.Access-Control-Allow-Headers" = "'Content-Type,X-Amz-Date,Authorization,X-Api-Key'"
  }
}

# Players Resource
resource "aws_api_gateway_resource" "players" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  parent_id   = aws_api_gateway_rest_api.main.root_resource_id
  path_part   = "players"
}

# Players {id} Resource
resource "aws_api_gateway_resource" "players_id" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  parent_id   = aws_api_gateway_resource.players.id
  path_part   = "{id}"
}

# Games Resource
resource "aws_api_gateway_resource" "games" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  parent_id   = aws_api_gateway_rest_api.main.root_resource_id
  path_part   = "games"
}

# Games {id} Resource
resource "aws_api_gateway_resource" "games_id" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  parent_id   = aws_api_gateway_resource.games.id
  path_part   = "{id}"
}

# Picks Resource
resource "aws_api_gateway_resource" "picks" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  parent_id   = aws_api_gateway_rest_api.main.root_resource_id
  path_part   = "picks"
}

# Picks {id} Resource
resource "aws_api_gateway_resource" "picks_id" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  parent_id   = aws_api_gateway_resource.picks.id
  path_part   = "{id}"
}

# Scoreboard Resource
resource "aws_api_gateway_resource" "scoreboard" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  parent_id   = aws_api_gateway_rest_api.main.root_resource_id
  path_part   = "scoreboard"
}

# Players GET (read-api, no auth)
resource "aws_api_gateway_method" "players_get" {
  rest_api_id   = aws_api_gateway_rest_api.main.id
  resource_id   = aws_api_gateway_resource.players.id
  http_method   = "GET"
  authorization = "NONE"
}

resource "aws_api_gateway_integration" "players_get" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  resource_id = aws_api_gateway_resource.players.id
  http_method = aws_api_gateway_method.players_get.http_method

  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.read_api.invoke_arn
}

# Players POST (admin-api, conditionally enabled via enable_write_endpoints variable)
resource "aws_api_gateway_method" "players_post" {
  count         = var.enable_write_endpoints ? 1 : 0
  rest_api_id   = aws_api_gateway_rest_api.main.id
  resource_id   = aws_api_gateway_resource.players.id
  http_method   = "POST"
  authorization = "NONE"
}

resource "aws_api_gateway_integration" "players_post" {
  count       = var.enable_write_endpoints ? 1 : 0
  rest_api_id = aws_api_gateway_rest_api.main.id
  resource_id = aws_api_gateway_resource.players.id
  http_method = aws_api_gateway_method.players_post[0].http_method

  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.admin_api.invoke_arn
}

# Players PUT (admin-api, conditionally enabled) - on {id} resource
resource "aws_api_gateway_method" "players_put" {
  count         = var.enable_write_endpoints ? 1 : 0
  rest_api_id   = aws_api_gateway_rest_api.main.id
  resource_id   = aws_api_gateway_resource.players_id.id
  http_method   = "PUT"
  authorization = "NONE"
}

resource "aws_api_gateway_integration" "players_put" {
  count       = var.enable_write_endpoints ? 1 : 0
  rest_api_id = aws_api_gateway_rest_api.main.id
  resource_id = aws_api_gateway_resource.players_id.id
  http_method = aws_api_gateway_method.players_put[0].http_method

  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.admin_api.invoke_arn
}

# Players DELETE (admin-api, conditionally enabled) - on {id} resource
resource "aws_api_gateway_method" "players_delete" {
  count         = var.enable_write_endpoints ? 1 : 0
  rest_api_id   = aws_api_gateway_rest_api.main.id
  resource_id   = aws_api_gateway_resource.players_id.id
  http_method   = "DELETE"
  authorization = "NONE"
}

resource "aws_api_gateway_integration" "players_delete" {
  count       = var.enable_write_endpoints ? 1 : 0
  rest_api_id = aws_api_gateway_rest_api.main.id
  resource_id = aws_api_gateway_resource.players_id.id
  http_method = aws_api_gateway_method.players_delete[0].http_method

  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.admin_api.invoke_arn
}

# Games GET (read-api, no auth)
resource "aws_api_gateway_method" "games_get" {
  rest_api_id   = aws_api_gateway_rest_api.main.id
  resource_id   = aws_api_gateway_resource.games.id
  http_method   = "GET"
  authorization = "NONE"
}

resource "aws_api_gateway_integration" "games_get" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  resource_id = aws_api_gateway_resource.games.id
  http_method = aws_api_gateway_method.games_get.http_method

  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.read_api.invoke_arn
}

# Games POST (admin-api, conditionally enabled)
resource "aws_api_gateway_method" "games_post" {
  count         = var.enable_write_endpoints ? 1 : 0
  rest_api_id   = aws_api_gateway_rest_api.main.id
  resource_id   = aws_api_gateway_resource.games.id
  http_method   = "POST"
  authorization = "NONE"
}

resource "aws_api_gateway_integration" "games_post" {
  count       = var.enable_write_endpoints ? 1 : 0
  rest_api_id = aws_api_gateway_rest_api.main.id
  resource_id = aws_api_gateway_resource.games.id
  http_method = aws_api_gateway_method.games_post[0].http_method

  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.admin_api.invoke_arn
}

# Games PUT (admin-api, conditionally enabled) - on {id} resource
resource "aws_api_gateway_method" "games_put" {
  count         = var.enable_write_endpoints ? 1 : 0
  rest_api_id   = aws_api_gateway_rest_api.main.id
  resource_id   = aws_api_gateway_resource.games_id.id
  http_method   = "PUT"
  authorization = "NONE"
}

resource "aws_api_gateway_integration" "games_put" {
  count       = var.enable_write_endpoints ? 1 : 0
  rest_api_id = aws_api_gateway_rest_api.main.id
  resource_id = aws_api_gateway_resource.games_id.id
  http_method = aws_api_gateway_method.games_put[0].http_method

  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.admin_api.invoke_arn
}

# Picks GET (read-api, no auth)
resource "aws_api_gateway_method" "picks_get" {
  rest_api_id   = aws_api_gateway_rest_api.main.id
  resource_id   = aws_api_gateway_resource.picks.id
  http_method   = "GET"
  authorization = "NONE"
}

resource "aws_api_gateway_integration" "picks_get" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  resource_id = aws_api_gateway_resource.picks.id
  http_method = aws_api_gateway_method.picks_get.http_method

  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.read_api.invoke_arn
}

# Picks POST (admin-api, conditionally enabled)
resource "aws_api_gateway_method" "picks_post" {
  count         = var.enable_write_endpoints ? 1 : 0
  rest_api_id   = aws_api_gateway_rest_api.main.id
  resource_id   = aws_api_gateway_resource.picks.id
  http_method   = "POST"
  authorization = "NONE"
}

resource "aws_api_gateway_integration" "picks_post" {
  count       = var.enable_write_endpoints ? 1 : 0
  rest_api_id = aws_api_gateway_rest_api.main.id
  resource_id = aws_api_gateway_resource.picks.id
  http_method = aws_api_gateway_method.picks_post[0].http_method

  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.admin_api.invoke_arn
}

# Picks PUT (admin-api, conditionally enabled) - on {id} resource
resource "aws_api_gateway_method" "picks_put" {
  count         = var.enable_write_endpoints ? 1 : 0
  rest_api_id   = aws_api_gateway_rest_api.main.id
  resource_id   = aws_api_gateway_resource.picks_id.id
  http_method   = "PUT"
  authorization = "NONE"
}

resource "aws_api_gateway_integration" "picks_put" {
  count       = var.enable_write_endpoints ? 1 : 0
  rest_api_id = aws_api_gateway_rest_api.main.id
  resource_id = aws_api_gateway_resource.picks_id.id
  http_method = aws_api_gateway_method.picks_put[0].http_method

  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.admin_api.invoke_arn
}

# Scoreboard GET (read-api, no auth)
resource "aws_api_gateway_method" "scoreboard_get" {
  rest_api_id   = aws_api_gateway_rest_api.main.id
  resource_id   = aws_api_gateway_resource.scoreboard.id
  http_method   = "GET"
  authorization = "NONE"
}

resource "aws_api_gateway_integration" "scoreboard_get" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  resource_id = aws_api_gateway_resource.scoreboard.id
  http_method = aws_api_gateway_method.scoreboard_get.http_method

  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.read_api.invoke_arn
}

# OPTIONS methods for CORS preflight (for all resources)
resource "aws_api_gateway_method" "players_options" {
  rest_api_id   = aws_api_gateway_rest_api.main.id
  resource_id   = aws_api_gateway_resource.players.id
  http_method   = "OPTIONS"
  authorization = "NONE"
}

resource "aws_api_gateway_integration" "players_options" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  resource_id = aws_api_gateway_resource.players.id
  http_method = aws_api_gateway_method.players_options.http_method

  type                    = "MOCK"
  integration_http_method = "POST"

  request_templates = {
    "application/json" = "{\"statusCode\":200}"
  }
}

resource "aws_api_gateway_method_response" "players_options" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  resource_id = aws_api_gateway_resource.players.id
  http_method = aws_api_gateway_method.players_options.http_method
  status_code = "200"

  response_parameters = {
    "method.response.header.Access-Control-Allow-Headers" = true,
    "method.response.header.Access-Control-Allow-Methods" = true,
    "method.response.header.Access-Control-Allow-Origin"  = true
  }
}

resource "aws_api_gateway_integration_response" "players_options" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  resource_id = aws_api_gateway_resource.players.id
  http_method = aws_api_gateway_method.players_options.http_method
  status_code = aws_api_gateway_method_response.players_options.status_code

  depends_on = [aws_api_gateway_integration.players_options]

  response_templates = {
    "application/json" = ""
  }

  response_parameters = {
    "method.response.header.Access-Control-Allow-Headers" = "'Content-Type,X-Amz-Date,Authorization,X-Api-Key'",
    "method.response.header.Access-Control-Allow-Methods" = "'*'",
    "method.response.header.Access-Control-Allow-Origin"  = "'*'"
  }
}

resource "aws_api_gateway_method" "games_options" {
  rest_api_id   = aws_api_gateway_rest_api.main.id
  resource_id   = aws_api_gateway_resource.games.id
  http_method   = "OPTIONS"
  authorization = "NONE"
}

resource "aws_api_gateway_integration" "games_options" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  resource_id = aws_api_gateway_resource.games.id
  http_method = aws_api_gateway_method.games_options.http_method

  type                    = "MOCK"
  integration_http_method = "POST"

  request_templates = {
    "application/json" = "{\"statusCode\":200}"
  }
}

resource "aws_api_gateway_method_response" "games_options" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  resource_id = aws_api_gateway_resource.games.id
  http_method = aws_api_gateway_method.games_options.http_method
  status_code = "200"

  response_parameters = {
    "method.response.header.Access-Control-Allow-Headers" = true,
    "method.response.header.Access-Control-Allow-Methods" = true,
    "method.response.header.Access-Control-Allow-Origin"  = true
  }
}

resource "aws_api_gateway_integration_response" "games_options" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  resource_id = aws_api_gateway_resource.games.id
  http_method = aws_api_gateway_method.games_options.http_method
  status_code = aws_api_gateway_method_response.games_options.status_code

  depends_on = [aws_api_gateway_integration.games_options]

  response_templates = {
    "application/json" = ""
  }

  response_parameters = {
    "method.response.header.Access-Control-Allow-Headers" = "'Content-Type,X-Amz-Date,Authorization,X-Api-Key'",
    "method.response.header.Access-Control-Allow-Methods" = "'*'",
    "method.response.header.Access-Control-Allow-Origin"  = "'*'"
  }
}

resource "aws_api_gateway_method" "picks_options" {
  rest_api_id   = aws_api_gateway_rest_api.main.id
  resource_id   = aws_api_gateway_resource.picks.id
  http_method   = "OPTIONS"
  authorization = "NONE"
}

resource "aws_api_gateway_integration" "picks_options" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  resource_id = aws_api_gateway_resource.picks.id
  http_method = aws_api_gateway_method.picks_options.http_method

  type                    = "MOCK"
  integration_http_method = "POST"

  request_templates = {
    "application/json" = "{\"statusCode\":200}"
  }
}

resource "aws_api_gateway_method_response" "picks_options" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  resource_id = aws_api_gateway_resource.picks.id
  http_method = aws_api_gateway_method.picks_options.http_method
  status_code = "200"

  response_parameters = {
    "method.response.header.Access-Control-Allow-Headers" = true,
    "method.response.header.Access-Control-Allow-Methods" = true,
    "method.response.header.Access-Control-Allow-Origin"  = true
  }
}

resource "aws_api_gateway_integration_response" "picks_options" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  resource_id = aws_api_gateway_resource.picks.id
  http_method = aws_api_gateway_method.picks_options.http_method
  status_code = aws_api_gateway_method_response.picks_options.status_code

  depends_on = [aws_api_gateway_integration.picks_options]

  response_templates = {
    "application/json" = ""
  }

  response_parameters = {
    "method.response.header.Access-Control-Allow-Headers" = "'Content-Type,X-Amz-Date,Authorization,X-Api-Key'",
    "method.response.header.Access-Control-Allow-Methods" = "'*'",
    "method.response.header.Access-Control-Allow-Origin"  = "'*'"
  }
}

resource "aws_api_gateway_method" "scoreboard_options" {
  rest_api_id   = aws_api_gateway_rest_api.main.id
  resource_id   = aws_api_gateway_resource.scoreboard.id
  http_method   = "OPTIONS"
  authorization = "NONE"
}

resource "aws_api_gateway_integration" "scoreboard_options" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  resource_id = aws_api_gateway_resource.scoreboard.id
  http_method = aws_api_gateway_method.scoreboard_options.http_method

  type                    = "MOCK"
  integration_http_method = "POST"

  request_templates = {
    "application/json" = "{\"statusCode\":200}"
  }
}

resource "aws_api_gateway_method_response" "scoreboard_options" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  resource_id = aws_api_gateway_resource.scoreboard.id
  http_method = aws_api_gateway_method.scoreboard_options.http_method
  status_code = "200"

  response_parameters = {
    "method.response.header.Access-Control-Allow-Headers" = true,
    "method.response.header.Access-Control-Allow-Methods" = true,
    "method.response.header.Access-Control-Allow-Origin"  = true
  }
}

resource "aws_api_gateway_integration_response" "scoreboard_options" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  resource_id = aws_api_gateway_resource.scoreboard.id
  http_method = aws_api_gateway_method.scoreboard_options.http_method
  status_code = aws_api_gateway_method_response.scoreboard_options.status_code

  depends_on = [aws_api_gateway_integration.scoreboard_options]

  response_templates = {
    "application/json" = ""
  }

  response_parameters = {
    "method.response.header.Access-Control-Allow-Headers" = "'Content-Type,X-Amz-Date,Authorization,X-Api-Key'",
    "method.response.header.Access-Control-Allow-Methods" = "'*'",
    "method.response.header.Access-Control-Allow-Origin"  = "'*'"
  }
}

# OPTIONS methods for {id} resources (for PUT/DELETE operations)
# Players {id} OPTIONS
resource "aws_api_gateway_method" "players_id_options" {
  rest_api_id   = aws_api_gateway_rest_api.main.id
  resource_id   = aws_api_gateway_resource.players_id.id
  http_method   = "OPTIONS"
  authorization = "NONE"
}

resource "aws_api_gateway_integration" "players_id_options" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  resource_id = aws_api_gateway_resource.players_id.id
  http_method = aws_api_gateway_method.players_id_options.http_method

  type                    = "MOCK"
  integration_http_method = "POST"

  request_templates = {
    "application/json" = "{\"statusCode\":200}"
  }
}

resource "aws_api_gateway_method_response" "players_id_options" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  resource_id = aws_api_gateway_resource.players_id.id
  http_method = aws_api_gateway_method.players_id_options.http_method
  status_code = "200"

  response_parameters = {
    "method.response.header.Access-Control-Allow-Headers" = true,
    "method.response.header.Access-Control-Allow-Methods" = true,
    "method.response.header.Access-Control-Allow-Origin"  = true
  }
}

resource "aws_api_gateway_integration_response" "players_id_options" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  resource_id = aws_api_gateway_resource.players_id.id
  http_method = aws_api_gateway_method.players_id_options.http_method
  status_code = aws_api_gateway_method_response.players_id_options.status_code

  depends_on = [aws_api_gateway_integration.players_id_options]

  response_templates = {
    "application/json" = ""
  }

  response_parameters = {
    "method.response.header.Access-Control-Allow-Headers" = "'Content-Type,X-Amz-Date,Authorization,X-Api-Key'",
    "method.response.header.Access-Control-Allow-Methods" = "'*'",
    "method.response.header.Access-Control-Allow-Origin"  = "'*'"
  }
}

# Games {id} OPTIONS
resource "aws_api_gateway_method" "games_id_options" {
  rest_api_id   = aws_api_gateway_rest_api.main.id
  resource_id   = aws_api_gateway_resource.games_id.id
  http_method   = "OPTIONS"
  authorization = "NONE"
}

resource "aws_api_gateway_integration" "games_id_options" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  resource_id = aws_api_gateway_resource.games_id.id
  http_method = aws_api_gateway_method.games_id_options.http_method

  type                    = "MOCK"
  integration_http_method = "POST"

  request_templates = {
    "application/json" = "{\"statusCode\":200}"
  }
}

resource "aws_api_gateway_method_response" "games_id_options" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  resource_id = aws_api_gateway_resource.games_id.id
  http_method = aws_api_gateway_method.games_id_options.http_method
  status_code = "200"

  response_parameters = {
    "method.response.header.Access-Control-Allow-Headers" = true,
    "method.response.header.Access-Control-Allow-Methods" = true,
    "method.response.header.Access-Control-Allow-Origin"  = true
  }
}

resource "aws_api_gateway_integration_response" "games_id_options" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  resource_id = aws_api_gateway_resource.games_id.id
  http_method = aws_api_gateway_method.games_id_options.http_method
  status_code = aws_api_gateway_method_response.games_id_options.status_code

  depends_on = [aws_api_gateway_integration.games_id_options]

  response_templates = {
    "application/json" = ""
  }

  response_parameters = {
    "method.response.header.Access-Control-Allow-Headers" = "'Content-Type,X-Amz-Date,Authorization,X-Api-Key'",
    "method.response.header.Access-Control-Allow-Methods" = "'*'",
    "method.response.header.Access-Control-Allow-Origin"  = "'*'"
  }
}

# Picks {id} OPTIONS
resource "aws_api_gateway_method" "picks_id_options" {
  rest_api_id   = aws_api_gateway_rest_api.main.id
  resource_id   = aws_api_gateway_resource.picks_id.id
  http_method   = "OPTIONS"
  authorization = "NONE"
}

resource "aws_api_gateway_integration" "picks_id_options" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  resource_id = aws_api_gateway_resource.picks_id.id
  http_method = aws_api_gateway_method.picks_id_options.http_method

  type                    = "MOCK"
  integration_http_method = "POST"

  request_templates = {
    "application/json" = "{\"statusCode\":200}"
  }
}

resource "aws_api_gateway_method_response" "picks_id_options" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  resource_id = aws_api_gateway_resource.picks_id.id
  http_method = aws_api_gateway_method.picks_id_options.http_method
  status_code = "200"

  response_parameters = {
    "method.response.header.Access-Control-Allow-Headers" = true,
    "method.response.header.Access-Control-Allow-Methods" = true,
    "method.response.header.Access-Control-Allow-Origin"  = true
  }
}

resource "aws_api_gateway_integration_response" "picks_id_options" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  resource_id = aws_api_gateway_resource.picks_id.id
  http_method = aws_api_gateway_method.picks_id_options.http_method
  status_code = aws_api_gateway_method_response.picks_id_options.status_code

  depends_on = [aws_api_gateway_integration.picks_id_options]

  response_templates = {
    "application/json" = ""
  }

  response_parameters = {
    "method.response.header.Access-Control-Allow-Headers" = "'Content-Type,X-Amz-Date,Authorization,X-Api-Key'",
    "method.response.header.Access-Control-Allow-Methods" = "'*'",
    "method.response.header.Access-Control-Allow-Origin"  = "'*'"
  }
}

# API Gateway Deployment
resource "aws_api_gateway_deployment" "main" {
  rest_api_id = aws_api_gateway_rest_api.main.id

  triggers = {
    redeployment = sha1(jsonencode(compact([
      aws_api_gateway_resource.players.id,
      aws_api_gateway_resource.players_id.id,
      aws_api_gateway_resource.games.id,
      aws_api_gateway_resource.games_id.id,
      aws_api_gateway_resource.picks.id,
      aws_api_gateway_resource.picks_id.id,
      aws_api_gateway_resource.scoreboard.id,
      aws_api_gateway_method.players_options.id,
      aws_api_gateway_method.players_id_options.id,
      aws_api_gateway_method.games_options.id,
      aws_api_gateway_method.games_id_options.id,
      aws_api_gateway_method.picks_options.id,
      aws_api_gateway_method.picks_id_options.id,
      aws_api_gateway_method.scoreboard_options.id,
      aws_api_gateway_integration.players_id_options.id,
      aws_api_gateway_integration.games_id_options.id,
      aws_api_gateway_integration.picks_id_options.id,
      # Conditionally include write methods/integrations when enabled
      var.enable_write_endpoints ? try(aws_api_gateway_integration.players_post[0].id, null) : null,
      var.enable_write_endpoints ? try(aws_api_gateway_integration.players_put[0].id, null) : null,
      var.enable_write_endpoints ? try(aws_api_gateway_integration.players_delete[0].id, null) : null,
      var.enable_write_endpoints ? try(aws_api_gateway_integration.games_post[0].id, null) : null,
      var.enable_write_endpoints ? try(aws_api_gateway_integration.games_put[0].id, null) : null,
      var.enable_write_endpoints ? try(aws_api_gateway_integration.picks_post[0].id, null) : null,
      var.enable_write_endpoints ? try(aws_api_gateway_integration.picks_put[0].id, null) : null,
      aws_api_gateway_authorizer.cognito.id,
      timestamp(),
      "force-deploy-v2", # Force new deployment
    ])))
  }

  lifecycle {
    create_before_destroy = true
  }

  # Wait for all integrations to be created before deploying
  # Note: Conditional write integrations are included implicitly via their dependencies
  # When count=0, Terraform will skip the dependency gracefully
  depends_on = [
    aws_api_gateway_method.players_get,
    aws_api_gateway_method.players_options,
    aws_api_gateway_method.players_id_options,
    aws_api_gateway_method.games_get,
    aws_api_gateway_method.games_options,
    aws_api_gateway_method.games_id_options,
    aws_api_gateway_method.picks_get,
    aws_api_gateway_method.picks_options,
    aws_api_gateway_method.picks_id_options,
    aws_api_gateway_method.scoreboard_get,
    aws_api_gateway_method.scoreboard_options,
    aws_api_gateway_integration.players_get,
    aws_api_gateway_integration.players_options,
    aws_api_gateway_method_response.players_options,
    aws_api_gateway_integration_response.players_options,
    aws_api_gateway_integration.players_id_options,
    aws_api_gateway_method_response.players_id_options,
    aws_api_gateway_integration_response.players_id_options,
    aws_api_gateway_integration.games_get,
    aws_api_gateway_integration.games_options,
    aws_api_gateway_method_response.games_options,
    aws_api_gateway_integration_response.games_options,
    aws_api_gateway_integration.games_id_options,
    aws_api_gateway_method_response.games_id_options,
    aws_api_gateway_integration_response.games_id_options,
    aws_api_gateway_integration.picks_get,
    aws_api_gateway_integration.picks_options,
    aws_api_gateway_method_response.picks_options,
    aws_api_gateway_integration_response.picks_options,
    aws_api_gateway_integration.picks_id_options,
    aws_api_gateway_method_response.picks_id_options,
    aws_api_gateway_integration_response.picks_id_options,
    aws_api_gateway_integration.scoreboard_get,
    aws_api_gateway_integration.scoreboard_options,
    aws_api_gateway_method_response.scoreboard_options,
    aws_api_gateway_integration_response.scoreboard_options,
    # Conditional write integrations (only exist when enable_write_endpoints = true)
    # Terraform will handle these gracefully - they're already implicitly depended on
    # via their parent methods, but we list them here to be explicit
  ]
}

# API Gateway Stage
resource "aws_api_gateway_stage" "main" {
  deployment_id = aws_api_gateway_deployment.main.id
  rest_api_id   = aws_api_gateway_rest_api.main.id
  stage_name    = "prod"
}

