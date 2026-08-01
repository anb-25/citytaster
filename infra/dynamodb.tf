# infra/dynamodb.tf
# PURPOSE: Small on-demand DynamoDB table for sessions/state.

resource "aws_dynamodb_table" "session" {
  name         = var.dynamo_table_name
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "pk"

  attribute {
    name = "pk"
    type = "S"
  }

  point_in_time_recovery {
    enabled = true
  }
}
