# Players table
resource "aws_dynamodb_table" "players" {
  name           = "${var.project_name}-players"
  billing_mode   = "PAY_PER_REQUEST"
  hash_key       = "id"

  attribute {
    name = "id"
    type = "S"
  }

  tags = {
    Project = var.project_name
  }
}

# Games table
resource "aws_dynamodb_table" "games" {
  name           = "${var.project_name}-games"
  billing_mode   = "PAY_PER_REQUEST"
  hash_key       = "id"

  attribute {
    name = "id"
    type = "S"
  }

  attribute {
    name = "round"
    type = "S"
  }

  attribute {
    name = "week"
    type = "N"
  }

  # Global Secondary Index for querying by round
  global_secondary_index {
    name     = "round-week-index"
    hash_key = "round"
    range_key = "week"
  }

  tags = {
    Project = var.project_name
  }
}

# Picks table
resource "aws_dynamodb_table" "picks" {
  name           = "${var.project_name}-picks"
  billing_mode   = "PAY_PER_REQUEST"
  hash_key       = "id"

  attribute {
    name = "id"
    type = "S"
  }

  attribute {
    name = "playerId"
    type = "S"
  }

  attribute {
    name = "gameId"
    type = "S"
  }

  # Global Secondary Index for querying picks by player
  global_secondary_index {
    name     = "player-index"
    hash_key = "playerId"
  }

  # Global Secondary Index for querying picks by game
  global_secondary_index {
    name     = "game-index"
    hash_key = "gameId"
  }

  tags = {
    Project = var.project_name
  }
}

