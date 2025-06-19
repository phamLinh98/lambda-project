import { DynamoDB, QueryCommand } from "@aws-sdk/client-dynamodb";

export const connectToDynamoDb = async () => {
  const dynamodb = new DynamoDB({
    region: "ap-northeast-1",
    endpoint: "http://localhost:4566", // endpoint của LocalStack
    credentials: {
      accessKeyId: "test", // giá trị mặc định cho LocalStack
      secretAccessKey: "test", // giá trị mặc định cho LocalStack
    },
  });
  return dynamodb;
};

export const getItemFromDynamoDB = async (
  dynamodb: any,
  tableName: any,
  id: any
) => {
  try {
    const command = new QueryCommand({
      TableName: tableName,
      KeyConditionExpression: "#id = :id",
      ExpressionAttributeNames: {
        "#id": "id",
      },
      ExpressionAttributeValues: {
        ":id": { S: id },
      },
    });
    const data = await dynamodb.send(command);
    return data.Items;
  } catch (error) {
    console.error("Error getting item from DynamoDB:", error);
    throw error;
  }
};
