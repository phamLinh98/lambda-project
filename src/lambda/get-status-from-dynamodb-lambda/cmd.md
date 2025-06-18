aws dynamodb put-item \
    --table-name uploadCsvTable \
    --item '{"id": {"S": "add123"}}' \
    --endpoint-url http://localhost:4566



    aws dynamodb scan \
    --table-name UploadCsvTable \
    --endpoint-url http://localhost:4566