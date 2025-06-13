import { setMailDemo } from "./mail";
import * as dynamoDbModule from "../create-update-detele-search-dynamo-sqs-s3/connectAndUpdateDynamoDb";

jest.mock(
  "../create-update-detele-search-dynamo-sqs-s3/connectAndUpdateDynamoDb"
);

describe("setMailDemo", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should update email records successfully and return true", async () => {
    (
      dynamoDbModule.updateAllRecordsInTableWithEmail as jest.Mock
    ).mockResolvedValueOnce("Mail updated");

    const mockDynamoDb = {} as any;
    const mockS3 = {} as any;
    const mockUsersTable = "UsersTable";

    const result = await setMailDemo(mockDynamoDb, mockS3, mockUsersTable);

    expect(result).toBe(true);
    expect(
      dynamoDbModule.updateAllRecordsInTableWithEmail
    ).toHaveBeenCalledWith(mockDynamoDb, mockUsersTable);
  });

  it("should throw an error if updating email records fails", async () => {
    (
      dynamoDbModule.updateAllRecordsInTableWithEmail as jest.Mock
    ).mockRejectedValueOnce(new Error("Update failed"));

    const mockDynamoDb = {} as any;
    const mockS3 = {} as any;
    const mockUsersTable = "UsersTable";

    await expect(
      setMailDemo(mockDynamoDb, mockS3, mockUsersTable)
    ).rejects.toThrow("Update failed");
  });
});
