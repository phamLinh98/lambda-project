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

// table, dynamoDB
aws dynamodb list-tables --endpoint-url http://localhost:4566 --output json | jq

aws dynamodb describe-table --table-name upload-csv --endpoint-url http://localhost:4566 --output json | jq '.Table | {TableName: .TableName, KeySchema: .KeySchema, AttributeDefinitions: .AttributeDefinitions}'

aws dynamodb scan --table-name upload-csv --endpoint-url http://localhost:4566 --output json | jq '.Items'

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

aws --endpoint-url=http://localhost:4566 \
 secretsmanager create-secret \
 --name "HitoEnvSecret" \
 --secret-string '{"sampleKey":"mySecretData"}' \
 --region ap-northeast-1

aws --endpoint-url=http://localhost:4566 secretsmanager create-secret \
 --name uploadCsvTableName \
 --secret-string "upload-csv" \
 --region ap-northeast-1

aws --endpoint-url=http://localhost:4566 secretsmanager get-secret-value \
 --secret-id uploadCsvTableName \
 --region us-east-1

aws --endpoint-url=http://localhost:4566 secretsmanager create-secret \
 --name HitoEnvSecret \
 --secret-string '{"uploadCsvTableName": "upload-csv", "bucketCsvName": "linhclass-csv-bucket"}'

aws --endpoint-url=http://localhost:4566 secretsmanager delete-secret \
 --secret-id HitoEnvSecret \
 --force-delete-without-recovery

aws --endpoint-url=http://localhost:4566 dynamodb put-item \
 --table-name upload-csv \
 --item '{"id": {"S": "123"}}'

aws dynamodb scan --table-name upload-csv --endpoint-url http://localhost:4566 --output json

//s3

aws s3 ls s3://my-mock-bucket --endpoint-url http://localhost:4566

aws s3 cp /Users/linhthusinh/Desktop/SideProject/lambda-project/test.csv s3://my-mock-bucket/test.csv --endpoint-url http://localhost:4566

aws s3 cp test.csv s3://my-mock-bucket/test123.csv --endpoint-url http://localhost:4566

python3 /Users/linhthusinh/Desktop/SideProject/lambda-project/show-s3-bucket.py

aws s3 rm s3://my-mock-bucket --endpoint-url http://localhost:4566 --recursive

aws s3 ls s3://my-mock-bucket --endpoint-url http://localhost:4566

//dynamodb

aws --endpoint-url=http://localhost:4566 dynamodb delete-table --table-name upload-csv

aws --endpoint-url=http://localhost:4566 dynamodb create-table \
 --table-name upload-csv \
 --attribute-definitions AttributeName=id,AttributeType=S \
 --key-schema AttributeName=id,KeyType=HASH \
 --provisioned-throughput ReadCapacityUnits=5,WriteCapacityUnits=5

// secrets manager
aws secretsmanager list-secrets --endpoint-url http://localhost:4566 --output json | jq

aws secretsmanager get-secret-value --endpoint-url http://localhost:4566 --secret-id HitoEnvSecret --output json | jq

aws secretsmanager put-secret-value \
 --secret-id HitoEnvSecret \
 --secret-string '{"usersTableName":"users","uploadCsvTableName":"upload-csv","bucketCsvName":"linhclass-csv-bucket","sqsName":"linhclass-lambda-call-to-queue","apiGateway":"https://4aau8uivqj.execute-api.ap-northeast-1.amazonaws.com/prod","prefixQueueURL":"http://sqs.ap-northeast-1.localhost.localstack.cloud:4566/000000000000/","bucketAvatar":"linhclass-avatar-bucket"}' \
 --endpoint-url http://localhost:4566 \
 --output json \
| jq --color-output

aws secretsmanager update-secret \
  --secret-id "HitoEnvSecret" \
  --secret-string "{}"

// sqs

aws sqs create-queue \
 --queue-name linhclass-lambda-call-to-queue \
 --region ap-northeast-1 \
 --endpoint-url http://localhost:4566

aws sqs create-queue \
 --queue-name linhclass-dead-queue \
 --region ap-northeast-1 \
 --endpoint-url http://localhost:4566

aws sqs list-queues --endpoint-url http://localhost:4566 --output json | jq

aws sqs delete-queue \
 --queue-url http://sqs.ap-northeast-1.localhost.localstack.cloud:4566/000000000000/linhclass-lambda-call-to-queue \
 --endpoint-url http://localhost:4566

 aws --endpoint-url=http://localhost:4566 sqs list-queues --output table

aws --endpoint-url=http://localhost:4566 sqs receive-message \
  --queue-url http://localhost:4566/000000000000/linhclass-lambda-call-to-queue \
  --max-number-of-messages 10 \
  --wait-time-seconds 1 \
  --visibility-timeout 0 \
  --output json | jq --color-output 

