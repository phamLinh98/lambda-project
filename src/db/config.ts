import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { getUserDataMock } from "./mocks/get-user-data-mock";

let dynamoDB: DynamoDBClient;

// DynamoDB configuration
export const connectToDynamoDb = async () => {
  return new DynamoDBClient({ region: "ap-northeast-1" });
};

const connectToDynamoDbOnce = async () => {
  if (!dynamoDB) {
    dynamoDB = await connectToDynamoDb();
  }
  return dynamoDB;
};

export const getInstanceDynamoDB = async () => {
  return await connectToDynamoDbOnce();
};
