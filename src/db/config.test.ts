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

  it("connectToDynamoDb should return a DynamoDBClient instance", async () => {
    const client = await configModule.connectToDynamoDb();
    expect(client).toBeInstanceOf(DynamoDBClient);
  });

  it("getInstanceDynamoDB should return the same instance on multiple calls", async () => {
    const instance1 = await configModule.getInstanceDynamoDB();
    const instance2 = await configModule.getInstanceDynamoDB();
    expect(instance1).toBe(instance2);
  });
});
