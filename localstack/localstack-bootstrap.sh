#!/bin/bash
set -e

echo "🏗️ Bootstrap LocalStack..."

awslocal dynamodb create-table \
  --table-name UploadCsvTable \
  --attribute-definitions AttributeName=id,AttributeType=S \
  --key-schema AttributeName=id,KeyType=HASH \
  --billing-mode PAY_PER_REQUEST

awslocal secretsmanager create-secret \
  --name uploadCsvTableName \
  --secret-string "UploadCsvTable"

awslocal dynamodb put-item \
  --table-name UploadCsvTable \
  --item '{"id": {"S": "abc123"}, "name": {"S": "Linh"}, "age": {"N": "25"}}'

echo "✅ LocalStack setup complete!"
