// connectToDynamoDb.ts
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, GetCommand } from "@aws-sdk/lib-dynamodb";

// Tạo DynamoDBDocumentClient kết nối LocalStack
export const connectToDynamoDb = async() => {
  const client = new DynamoDBClient({
    region: "us-east-1",
    endpoint: "http://localhost:4566", // LocalStack endpoint
    credentials: {
      accessKeyId: "test",
      secretAccessKey: "test",
    },
  });

  // Sử dụng DynamoDBDocumentClient để dễ thao tác với object JS thuầnclear
  return DynamoDBDocumentClient.from(client);
};

export const getItemFromDynamoDB = async (
  dynamodb: DynamoDBDocumentClient,
  tableName: string,
  id: string
) => {
  const params = {
    TableName: tableName,
    Key: { id },
  };

  const command = new GetCommand(params);
  const data = await dynamodb.send(command);

  return data.Item ? [data.Item] : [];
};
