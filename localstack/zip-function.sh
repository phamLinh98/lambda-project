#!/bin/bash

rm -f lambda.zip
zip -r lambda.zip handler.js utils/

awslocal lambda create-function \
  --function-name get-item-function \
  --runtime nodejs18.x \
  --handler handler.handler \
  --zip-file fileb://lambda.zip \
  --role arn:aws:iam::000000000000:role/lambda-role \
  --timeout 30
