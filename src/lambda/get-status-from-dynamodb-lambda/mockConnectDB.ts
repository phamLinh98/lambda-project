import { DynamoDB } from '@aws-sdk/client-dynamodb';
import { GetItemCommand } from '@aws-sdk/client-dynamodb';

export const connectToDynamoDb = async () => {
    const dynamodb = new DynamoDB({
        region: 'us-east-1', // hoặc region bạn đang giả lập
        endpoint: 'http://localhost:4566', // endpoint của LocalStack
        credentials: {
            accessKeyId: 'test', // giá trị mặc định cho LocalStack
            secretAccessKey: 'test', // giá trị mặc định cho LocalStack
        },
    });
    return dynamodb;
};

export const getItemFromDynamoDB = async (dynamodb:any, tableName:any, id:any) => {
  console.log('TableName:', tableName);
  console.log('Id:', id);
  if (!tableName || !id) {
      throw new Error('Missing tableName or id');
  }

  const command = new GetItemCommand({
      TableName: tableName,
      Key: {
          id: { S: id },
      },
  });

  try {
      const response = command.input.Key
      console.log('DynamoDB Response:', response);
      return [response];
  } catch (error) {
      console.error('DynamoDB Error:', error);
      throw error;
  }
};
