import {
  connectToDynamoDb,
  findTableExists,
  getItemFromDynamoDB,
  createTableInDynamoDB,
  updateTableInDynamoDB,
  updateUsersTableWitInfoFromCSV,
  findAllRecordsHaveStatusInsertSuccess,
  updateAllRecordsInTableWithAvatar,
  updateAllRecordsInTableWithEmail,
  updateAllRecordsInTableWithRole,
} from "./connectAndUpdateDynamoDb";
import {
  DynamoDBClient,
  ListTablesCommand,
  ScanCommand,
  CreateTableCommand,
  UpdateItemCommand,
  GetItemCommand,
  PutItemCommand,
} from "@aws-sdk/client-dynamodb";

jest.mock("@aws-sdk/client-dynamodb", () => {
  const originalModule = jest.requireActual("@aws-sdk/client-dynamodb");
  return {
    ...originalModule,
    DynamoDBClient: jest.fn().mockImplementation(() => ({
      send: jest.fn(),
    })),
  };
});

describe("DynamoDB helpers", () => {
  let mockClient: any;

  beforeEach(() => {
    mockClient = new DynamoDBClient({ region: "ap-northeast-1" });
    (mockClient.send as jest.Mock).mockReset();
  });

  it("connectToDynamoDb should return a new DynamoDBClient", async () => {
    const client = await connectToDynamoDb();
    expect(client).toBeDefined();
    expect(DynamoDBClient).toHaveBeenCalledWith({ region: "ap-northeast-1" });
  });

  it("findTableExists should return true if table is found", async () => {
    (mockClient.send as jest.Mock).mockResolvedValueOnce({
      TableNames: ["TestTable", "OtherTable"],
    });
    const result = await findTableExists("TestTable", mockClient);
    expect(result).toBe(true);
    expect(mockClient.send).toHaveBeenCalledWith(expect.any(ListTablesCommand));
  });

  it("findTableExists should return false if table is not found", async () => {
    (mockClient.send as jest.Mock).mockResolvedValueOnce({
      TableNames: ["OtherTable"],
    });
    const result = await findTableExists("FakeTable", mockClient);
    expect(result).toBe(false);
  });

  it("getItemFromDynamoDB should return data.Items from scan", async () => {
    const mockItems = [{ id: { S: "123" } }];
    (mockClient.send as jest.Mock).mockResolvedValueOnce({ Items: mockItems });
    const items = await getItemFromDynamoDB(mockClient, "TestTable", "123");
    expect(items).toEqual(mockItems);
    expect(mockClient.send).toHaveBeenCalledWith(expect.any(ScanCommand));
  });

  it("createTableInDynamoDB should create table and handle ResourceInUseException", async () => {
    (mockClient.send as jest.Mock).mockResolvedValueOnce({}); // success
    await createTableInDynamoDB(mockClient, "NewTable");
    expect(mockClient.send).toHaveBeenCalledWith(
      expect.any(CreateTableCommand)
    );

    (mockClient.send as jest.Mock).mockRejectedValueOnce({
      name: "ResourceInUseException",
    });
    await expect(
      createTableInDynamoDB(mockClient, "NewTable")
    ).resolves.not.toThrow();
  });

  it("updateTableInDynamoDB should send UpdateItemCommand", async () => {
    (mockClient.send as jest.Mock).mockResolvedValueOnce({});
    await updateTableInDynamoDB(
      mockClient,
      "TestTable",
      "file123",
      "Uploading"
    );
    expect(mockClient.send).toHaveBeenCalledWith(expect.any(UpdateItemCommand));
  });

  describe("updateUsersTableWitInfoFromCSV", () => {
    it("should update an item if it exists", async () => {
      (mockClient.send as jest.Mock)
        .mockResolvedValueOnce({ Item: { id: { S: "file123" } } }) // getUserResponse
        .mockResolvedValueOnce({}); // update
      const userData = {
        userName: "UserA",
        userAge: 25,
        userAvatar: "avatar.png",
        userPosition: "Dev",
        userSalary: 2000,
      };
      await updateUsersTableWitInfoFromCSV(
        mockClient,
        userData,
        "file123",
        "UsersTable"
      );
      expect(mockClient.send).toHaveBeenCalledWith(expect.any(GetItemCommand));
      expect(mockClient.send).toHaveBeenCalledWith(
        expect.any(UpdateItemCommand)
      );
    });

    it("should put an item if it does not exist", async () => {
      (mockClient.send as jest.Mock)
        .mockResolvedValueOnce({ Item: undefined }) // getUserResponse
        .mockResolvedValueOnce({}); // put
      const userData = { userName: "UserA", userAge: 25 };
      await updateUsersTableWitInfoFromCSV(
        mockClient,
        userData,
        "file123",
        "UsersTable"
      );
      expect(mockClient.send).toHaveBeenCalledWith(expect.any(GetItemCommand));
      expect(mockClient.send).toHaveBeenCalledWith(expect.any(PutItemCommand));
    });
  });

  it("findAllRecordsHaveStatusInsertSuccess should scan table with filter", async () => {
    (mockClient.send as jest.Mock).mockResolvedValueOnce({ Items: [] });
    const result = await findAllRecordsHaveStatusInsertSuccess(
      mockClient,
      "TestTable",
      "InsertSuccess"
    );
    expect(mockClient.send).toHaveBeenCalledWith(expect.any(ScanCommand));
    expect(result.Items).toEqual([]);
  });

  it("updateAllRecordsInTableWithAvatar should update each item found", async () => {
    (mockClient.send as jest.Mock).mockResolvedValueOnce({
      Items: [{ id: { S: "1" } }, { id: { S: "2" } }],
    });
    await updateAllRecordsInTableWithAvatar(
      mockClient,
      "imageUrl",
      "UsersTable"
    );
    expect(mockClient.send).toHaveBeenCalledTimes(3); // 1 scan + 2 updates
  });

  it("updateAllRecordsInTableWithEmail should update email for each item", async () => {
    (mockClient.send as jest.Mock).mockResolvedValueOnce({
      Items: [{ id: { S: "1" } }],
    });
    await updateAllRecordsInTableWithEmail(mockClient, "TestTable");
    expect(mockClient.send).toHaveBeenCalledTimes(2);
  });

  it("updateAllRecordsInTableWithRole should update role for each item found", async () => {
    (mockClient.send as jest.Mock).mockResolvedValueOnce({
      Items: [{ id: { S: "10" } }],
    });
    await updateAllRecordsInTableWithRole(mockClient, "UsersTable");
    expect(mockClient.send).toHaveBeenCalledTimes(2); // 1 scan + 1 update
  });
});
