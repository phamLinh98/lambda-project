import { DynamoDBClient } from "@aws-sdk/client-dynamodb";

//OK12345
export const connectToDynamoDb = async() => {
  const dynamoDB = new DynamoDBClient({
    region: "ap-northeast-1",
    endpoint: "http://localhost:8001",
    credentials: {
      accessKeyId: "fake",
      secretAccessKey: "fake",
    },
  });
  return dynamoDB;
}

export const getInstanceDynamoDB = async() => {
  const dynamoDB = new DynamoDBClient({
    region: "ap-northeast-1",
    endpoint: "http://localhost:8001",
    credentials: {
      accessKeyId: "fake",
      secretAccessKey: "fake",
    },
  });
  return dynamoDB;
}
