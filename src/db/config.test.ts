import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import * as configModule from "./config";

describe("config tests", () => {
  let originalEnv: string | undefined;

  beforeEach(() => {
    originalEnv = process.env.NODE_ENV;
    jest.clearAllMocks();
  });

  afterEach(() => {
    process.env.NODE_ENV = originalEnv;
  });

  it("connectToDynamoDb should create a DynamoDBClient instance", async () => {
    const client = await configModule.connectToDynamoDb();
    expect(client).toBeInstanceOf(DynamoDBClient);
  });

  it("getInstanceDynamoDB in Debug mode should return local connection object", async () => {
    process.env.NODE_ENV = "Debug";
    const instance = await configModule.getInstanceDynamoDB();
    expect(instance.send).toBeDefined();
    expect(instance).not.toBeInstanceOf(DynamoDBClient);
  });

  it("getInstanceDynamoDB in non-Debug mode should return a DynamoDBClient", async () => {
    process.env.NODE_ENV = "production";
    const instance = await configModule.getInstanceDynamoDB();
    expect(instance).toBeInstanceOf(DynamoDBClient);
  });
});
