aws dynamodb put-item \
    --table-name uploadCsvTable \
    --item '{"id": {"S": "add123"}}' \
    --endpoint-url http://localhost:4566



    aws dynamodb scan \
    --table-name UploadCsvTable \
    --endpoint-url http://localhost:4566

    aws dynamodb put-item \
  --table-name UploadCsvTableName \
  --item '{"id": {"S": "add123"}}' \
  --endpoint-url http://localhost:4566


aws --endpoint-url=http://localhost:4566 dynamodb create-table \
  --table-name upload-csv \
  --attribute-definitions AttributeName=id,AttributeType=S \
  --key-schema AttributeName=id,KeyType=HASH \
  --provisioned-throughput ReadCapacityUnits=5,WriteCapacityUnits=5


aws --endpoint-url=http://localhost:4566 dynamodb put-item \
  --table-name upload-csv \
  --item '{"id": {"S": "add123"}}'


aws dynamodb list-tables --endpoint-url http://localhost:4566 --output json | jq

aws --endpoint-url=http://localhost:4566 dynamodb get-item \
  --table-name upload-csv \
  --key '{"id": {"S": "add123"}}' \
  --output json | jq

aws --endpoint-url=http://localhost:4566 dynamodb scan \

aws --endpoint-url=http://localhost:4566 s3api list-buckets
--output json | jq

aws --endpoint-url=http://localhost:4566 s3api create-bucket \
  --bucket my-mock-bucket \
  --region us-east-1
  --output json | jq

aws --endpoint-url=http://localhost:4566 s3api get-object --bucket my-mock-bucket --key example.csv example.csv
cat example.csv
