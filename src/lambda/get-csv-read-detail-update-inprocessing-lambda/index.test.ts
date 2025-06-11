import { handler } from "./index";
import * as dynamoDbModule from "../create-update-detele-search-dynamo-sqs-s3/connectAndUpdateDynamoDb";
import * as s3Module from "../create-update-detele-search-dynamo-sqs-s3/connectAndUpdateS3";
import * as sqsModule from "../create-update-detele-search-dynamo-sqs-s3/connectAndUpdateSQS";
import * as avatarModule from "../demo/avatar";
import * as mailModule from "../demo/mail";
import * as roleModule from "../demo/role";
import * as secretManager from "../get-secret-key-from-manager";

jest.mock(
  "../create-update-detele-search-dynamo-sqs-s3/connectAndUpdateDynamoDb"
);
jest.mock("../create-update-detele-search-dynamo-sqs-s3/connectAndUpdateS3");
jest.mock("../create-update-detele-search-dynamo-sqs-s3/connectAndUpdateSQS");
jest.mock("../demo/avatar");
jest.mock("../demo/mail");
jest.mock("../demo/role");
jest.mock("../get-secret-key-from-manager");

describe("handler", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should process records correctly and update data in DynamoDB", async () => {
    // Mock secrets
    (secretManager.getSecretOfKey as jest.Mock)
      .mockResolvedValueOnce("UsersTableMock")
      .mockResolvedValueOnce("UploadCsvTableMock")
      .mockResolvedValueOnce("BucketCsvMock")
      .mockResolvedValueOnce("SqsNameMock")
      .mockResolvedValueOnce("ApiGatewayMock")
      .mockResolvedValueOnce("PrefixQueueUrlMock/")
      .mockResolvedValueOnce("BucketAvatarMock");

    // Mock clients
    const mockDynamoDb = {} as any;
    (dynamoDbModule.connectToDynamoDb as jest.Mock).mockResolvedValue(
      mockDynamoDb
    );

    const mockS3 = {} as any;
    (s3Module.connectToS3Bucket as jest.Mock).mockResolvedValue(mockS3);

    const mockSqs = {} as any;
    (sqsModule.connectToSQS as jest.Mock).mockResolvedValue(mockSqs);

    // Mock table check
    (dynamoDbModule.findTableExists as jest.Mock).mockResolvedValueOnce(false);
    (dynamoDbModule.createTableInDynamoDB as jest.Mock).mockResolvedValueOnce(
      undefined
    );

    // Mock data updates
    (dynamoDbModule.updateTableInDynamoDB as jest.Mock).mockResolvedValue(
      undefined
    );

    // Mock reading from S3
    const mockJsonData = [{ name: "UserA" }, { name: "UserB" }];
    (s3Module.getAllContentFromS3Uploaded as jest.Mock).mockResolvedValue(
      mockJsonData
    );

    // Mock update of CSV data
    (
      dynamoDbModule.updateUsersTableWitInfoFromCSV as jest.Mock
    ).mockResolvedValue(undefined);

    // Mock findAllRecordsHaveStatusInsertSuccess
    (
      dynamoDbModule.findAllRecordsHaveStatusInsertSuccess as jest.Mock
    ).mockResolvedValue({
      Items: [{ id: { S: "abc123" } }],
    });

    // Mock removing message
    (sqsModule.removeMessageFromSQS as jest.Mock).mockResolvedValue(undefined);

    // Mock demo functions
    (avatarModule.setAvatarDemo as jest.Mock).mockResolvedValue(
      "avatar updated"
    );
    (mailModule.setMailDemo as jest.Mock).mockResolvedValue("mail updated");
    (roleModule.setRoleDemo as jest.Mock).mockResolvedValue("role updated");

    // Prepare event
    const mockEvent = {
      Records: [
        {
          body: JSON.stringify({ fileId: "fakeFileId123" }),
        },
      ],
    };

    await handler(mockEvent);

    expect(secretManager.getSecretOfKey).toHaveBeenCalledTimes(7);
    expect(dynamoDbModule.connectToDynamoDb).toHaveBeenCalled();
    expect(s3Module.connectToS3Bucket).toHaveBeenCalled();
    expect(sqsModule.connectToSQS).toHaveBeenCalled();
    expect(dynamoDbModule.findTableExists).toHaveBeenCalledWith(
      "UsersTableMock",
      mockDynamoDb
    );
    expect(dynamoDbModule.createTableInDynamoDB).toHaveBeenCalledWith(
      mockDynamoDb,
      "UsersTableMock"
    );
    expect(dynamoDbModule.updateTableInDynamoDB).toHaveBeenCalledWith(
      mockDynamoDb,
      "UploadCsvTableMock",
      "fakeFileId123",
      "inProcessing"
    );
    expect(s3Module.getAllContentFromS3Uploaded).toHaveBeenCalledWith(
      { Bucket: "BucketCsvMock", Key: "csv/fakeFileId123.csv" },
      mockS3
    );
    expect(dynamoDbModule.updateUsersTableWitInfoFromCSV).toHaveBeenCalledTimes(
      2
    );
    expect(dynamoDbModule.updateTableInDynamoDB).toHaveBeenCalledWith(
      mockDynamoDb,
      "UploadCsvTableMock",
      "fakeFileId123",
      "InsertSuccess"
    );
    expect(
      dynamoDbModule.findAllRecordsHaveStatusInsertSuccess
    ).toHaveBeenCalledWith(mockDynamoDb, "UploadCsvTableMock", "InsertSuccess");
    expect(sqsModule.removeMessageFromSQS).toHaveBeenCalled();
    expect(dynamoDbModule.updateTableInDynamoDB).toHaveBeenCalledWith(
      mockDynamoDb,
      "UploadCsvTableMock",
      "abc123",
      "BatchRunning"
    );
    expect(avatarModule.setAvatarDemo).toHaveBeenCalledWith(
      mockDynamoDb,
      mockS3,
      "BucketAvatarMock",
      "UsersTableMock"
    );
    expect(mailModule.setMailDemo).toHaveBeenCalledWith(
      mockDynamoDb,
      mockS3,
      "UsersTableMock"
    );
    expect(roleModule.setRoleDemo).toHaveBeenCalledWith(
      mockDynamoDb,
      mockS3,
      "UsersTableMock"
    );
    expect(dynamoDbModule.updateTableInDynamoDB).toHaveBeenCalledWith(
      mockDynamoDb,
      "UploadCsvTableMock",
      "fakeFileId123",
      "Success"
    );
  });

  it("should throw an error if getSecretOfKey fails", async () => {
    (secretManager.getSecretOfKey as jest.Mock).mockRejectedValue(
      new Error("Secrets Manager Error")
    );
    const mockEvent = { Records: [] };

    await expect(handler(mockEvent)).rejects.toThrow("Secrets Manager Error");
  });
});
