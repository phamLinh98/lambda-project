import { DynamoDB, QueryCommand } from "@aws-sdk/client-dynamodb";
import { UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";

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

export const getInstanceDynamoDB = async () => {
  const client = new DynamoDBClient({
    region: "ap-northeast-1",
    endpoint: "http://localhost:4566",
    credentials: {
      accessKeyId: "test",
      secretAccessKey: "test",
    },
  });
  return DynamoDBDocumentClient.from(client); // trả về document client
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

export const updateTableInDynamoDB = async (
  dynamoDbClient: any,
  tableName: string,
  fileName: string,
  status: string
) => {
  console.log("tableName", tableName);
  console.log("fileName", fileName);
  console.log("status", status);

  try {
    const params = {
      TableName: tableName,
      Key: { id: fileName }, // không cần { S: ... } vì đã dùng DocumentClient
      UpdateExpression: "SET #status = :status",
      ExpressionAttributeNames: {
        "#status": "status",
      },
      ExpressionAttributeValues: {
        ":status": status,
      },
    };

    const command = new UpdateCommand(params);
    await dynamoDbClient.send(command);
    console.log("✅ Table updated successfully");
  } catch (error) {
    console.error("❌ Failed to update:", error);
    throw error;
  }
};

