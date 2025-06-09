import { handler } from "./index";
import * as dbConfig from "../../db/config";
import * as dynamoDbUtils from "../create-update-detele-search-dynamo-sqs-s3/connectAndUpdateDynamoDb";
import * as s3Utils from "../create-update-detele-search-dynamo-sqs-s3/connectAndUpdateS3";
import * as secretManager from "../get-secret-key-from-manager";

jest.mock("../../db/config");
jest.mock(
  "../create-update-detele-search-dynamo-sqs-s3/connectAndUpdateDynamoDb"
);
jest.mock("../create-update-detele-search-dynamo-sqs-s3/connectAndUpdateS3");
jest.mock("../get-secret-key-from-manager");

describe("handler", () => {
  const mockEvent = {};

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should successfully create a pre-signed URL and update DynamoDB", async () => {
    const mockBucketName = "test-bucket";
    const mockTableName = "test-table";
    const mockS3Client = new (jest.requireActual("@aws-sdk/client-s3").S3Client)({});
    const mockDynamoDB = new (jest.requireActual(
      "@aws-sdk/client-dynamodb"
    ).DynamoDBClient)({});
    const mockPreSignedUrl = { url: "https://example.com/presigned-url" };

    jest
      .spyOn(secretManager, "getSecretOfKey")
      .mockResolvedValueOnce(mockBucketName);
    jest
      .spyOn(secretManager, "getSecretOfKey")
      .mockResolvedValueOnce(mockTableName);
    jest.spyOn(s3Utils, "connectToS3Bucket").mockResolvedValue(mockS3Client);
    jest.spyOn(dbConfig, "getInstanceDynamoDB").mockResolvedValue(mockDynamoDB);
    jest
      .spyOn(dynamoDbUtils, "updateTableInDynamoDB")
      .mockResolvedValue(undefined);
    jest
      .spyOn(s3Utils, "createPreUrlUpdateS3")
      .mockResolvedValue(mockPreSignedUrl);

    const result = await handler(mockEvent);

    expect(secretManager.getSecretOfKey).toHaveBeenCalledWith("bucketCsvName");
    expect(secretManager.getSecretOfKey).toHaveBeenCalledWith(
      "uploadCsvTableName"
    );
    expect(s3Utils.connectToS3Bucket).toHaveBeenCalled();
    expect(dbConfig.getInstanceDynamoDB).toHaveBeenCalled();
    expect(dynamoDbUtils.updateTableInDynamoDB).toHaveBeenCalledWith(
      mockDynamoDB,
      mockTableName,
      expect.any(String),
      "Uploading"
    );
    expect(s3Utils.createPreUrlUpdateS3).toHaveBeenCalledWith(
      mockS3Client,
      mockBucketName,
      expect.stringContaining("csv/"),
      3600,
      expect.any(String)
    );
    expect(result).toEqual(mockPreSignedUrl);
  });

  it("should return a 500 error if an exception occurs", async () => {
    jest
      .spyOn(secretManager, "getSecretOfKey")
      .mockRejectedValue(new Error("Secrets Manager Error"));

    const result = await handler(mockEvent);

    expect(result).toEqual({
      statusCode: 500,
      body: JSON.stringify({ message: "Call Lambda PreURL fail" }),
    });
  });
});
