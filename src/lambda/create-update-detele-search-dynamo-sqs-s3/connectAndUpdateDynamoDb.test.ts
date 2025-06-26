// import {
//   connectToDynamoDb,
//   findTableExists,
//   getItemFromDynamoDB,
//   createTableInDynamoDB,
//   updateTableInDynamoDB,
//   updateUsersTableWitInfoFromCSV,
//   findAllRecordsHaveStatusInsertSuccess,
//   updateAllRecordsInTableWithAvatar,
//   updateAllRecordsInTableWithEmail,
//   updateAllRecordsInTableWithRole,
// } from "./connectAndUpdateDynamoDb";
// import {
//   DynamoDBClient,
//   ListTablesCommand,
//   ScanCommand,
//   CreateTableCommand,
//   UpdateItemCommand,
//   GetItemCommand,
//   PutItemCommand,
// } from "@aws-sdk/client-dynamodb";

// jest.mock("@aws-sdk/client-dynamodb", () => {
//   const originalModule = jest.requireActual("@aws-sdk/client-dynamodb");
//   return {
//     ...originalModule,
//     DynamoDBClient: jest.fn().mockImplementation(() => ({
//       send: jest.fn(),
//     })),
//     ScanCommand: jest.fn(), // Mock ScanCommand as a spy
//     UpdateItemCommand: jest.fn().mockImplementation((params) => params), // Mock UpdateItemCommand to return params
//     PutItemCommand: jest.fn().mockImplementation((params) => params), // Mock PutItemCommand to return params
//   };
// });

// jest.mock("@aws-sdk/client-dynamodb");

// (UpdateItemCommand as unknown as jest.Mock).mockImplementation(
//   (params) => params
// ); // Mock UpdateItemCommand to return params
// jest.mocked(UpdateItemCommand).mockClear(); // Ensure UpdateItemCommand mock is cleared before each test
// beforeEach(() => {
//   (UpdateItemCommand as unknown as jest.Mock).mockClear(); // Ensure UpdateItemCommand is properly mocked and cleared
//   jest.clearAllMocks(); // Clear all mocks to avoid interference between tests
// });

// describe("DynamoDB helpers", () => {
//   let mockClient: any;
//   let mockTableName: any;

//   const mockDynamoDBClient = {
//     send: jest.fn(),
//   };

//   const mockImageUrl = "http://example.com/avatar.jpg";
//   const mockUsersTable = "UsersTable";

//   beforeEach(() => {
//     mockClient = new DynamoDBClient({ region: "ap-northeast-1" });
//     (mockClient.send as jest.Mock).mockReset();
//     mockDynamoDBClient.send.mockClear(); // Reset call history for mockDynamoDBClient
//     (UpdateItemCommand as unknown as jest.Mock).mockClear(); // Reset UpdateItemCommand mock
//     jest.clearAllMocks(); // Ensure all mocks are cleared before each test
//   });

//   it("connectToDynamoDb should return a new DynamoDBClient", async () => {
//     const client = await connectToDynamoDb();
//     expect(client).toBeDefined();
//     expect(DynamoDBClient).toHaveBeenCalledWith({ region: "ap-northeast-1" });
//   });

//   it("findTableExists should return true if table is found", async () => {
//     (mockClient.send as jest.Mock).mockResolvedValueOnce({
//       TableNames: ["TestTable", "OtherTable"],
//     });
//     const result = await findTableExists("TestTable", mockClient);
//     expect(result).toBe(true);
//     expect(mockClient.send).toHaveBeenCalledWith(expect.any(ListTablesCommand));
//   });

//   it("should throw an error if dynamoDbClient.send throws an error", async () => {
//     const mockTableName = "my-table";
//     const mockError = new Error("DynamoDB error");
//     const mockDynamoDbClient = {
//       send: jest.fn().mockRejectedValue(mockError),
//     };
//     await expect(
//       findTableExists(mockTableName, mockDynamoDbClient)
//     ).rejects.toThrow(mockError);
//     expect(mockDynamoDbClient.send).toHaveBeenCalled();
//     expect(mockDynamoDbClient.send).toHaveBeenCalledWith(
//       expect.any(ListTablesCommand)
//     );
//   });

//   it("getItemFromDynamoDB should return data.Items from scan", async () => {
//     const mockItems = [{ id: { S: "123" } }];
//     (mockClient.send as jest.Mock).mockResolvedValueOnce({ Items: mockItems });
//     const items = await getItemFromDynamoDB(mockClient, "TestTable", "123");
//     expect(items).toEqual(mockItems);
//     expect(mockClient.send).toHaveBeenCalledWith(expect.any(ScanCommand));
//   });

//   it("getItemFromDynamoDB should throw an error if dynamoDBClient.send throws an error", async () => {
//     const mockDynamoDBClient = {
//       send: jest.fn().mockRejectedValue(new Error("DynamoDB error")),
//     };
//     const mockTableName = "test-table";
//     const mockId = "test-id";

//     await expect(
//       getItemFromDynamoDB(mockDynamoDBClient, mockTableName, mockId)
//     ).rejects.toThrow("DynamoDB error");
//     expect(mockDynamoDBClient.send).toHaveBeenCalledWith(expect.any(Object));
//     expect(mockDynamoDBClient.send).toHaveBeenCalledTimes(1);
//     expect(mockDynamoDBClient.send).toHaveBeenCalledWith(
//       expect.any(ScanCommand)
//     );
//   });

//   it("createTableInDynamoDB should create table successfully", async () => {
//     mockClient.send.mockResolvedValue({}); // Mock thành công

//     await createTableInDynamoDB(mockClient, "NewTable");

//     expect(mockClient.send).toHaveBeenCalledTimes(1);
//     expect(mockClient.send).toHaveBeenCalledWith(
//       expect.any(CreateTableCommand)
//     );
//   });

//   it("createTableInDynamoDB should handle ResourceInUseException without throwing an error", async () => {
//     mockClient.send.mockRejectedValue({ name: "ResourceInUseException" }); // Mock bảng đã tồn tại

//     await createTableInDynamoDB(mockClient, "NewTable");

//     expect(mockClient.send).toHaveBeenCalledTimes(1); // Vẫn được gọi dù có lỗi
//     expect(mockClient.send).toHaveBeenCalledWith(
//       expect.any(CreateTableCommand)
//     );
//   });

//   it("createTableInDynamoDB should throw an error if the error is not ResourceInUseException", async () => {
//     const mockError = new Error("Some other DynamoDB error");
//     mockClient.send.mockRejectedValue(mockError); // Mock một lỗi khác

//     await expect(createTableInDynamoDB(mockClient, "NewTable")).rejects.toThrow(
//       mockError
//     ); // Kiểm tra throw lỗi
//     expect(mockClient.send).toHaveBeenCalledTimes(1);
//     expect(mockClient.send).toHaveBeenCalledWith(
//       expect.any(CreateTableCommand)
//     );
//   });

//   it("updateTableInDynamoDB should send UpdateItemCommand", async () => {
//     (mockClient.send as jest.Mock).mockResolvedValueOnce({});
//     await updateTableInDynamoDB(
//       mockClient,
//       "TestTable",
//       "file123",
//       "Uploading"
//     );
//     expect(mockClient.send).toHaveBeenCalledWith(
//       expect.objectContaining({
//         TableName: "TestTable",
//         Key: { id: { S: "file123" } },
//         UpdateExpression: "SET #status = :status",
//         ExpressionAttributeNames: { "#status": "status" },
//         ExpressionAttributeValues: { ":status": { S: "Uploading" } },
//       })
//     );
//   });
//   it("updateTableInDynamoDB should throw an error if dynamoDbClient.send throws an error", async () => {
//     const mockDynamoDbClient = {
//       send: jest.fn().mockRejectedValue(new Error("DynamoDB UpdateItem error")),
//     };
//     const mockTableName = "test-table";
//     const mockFileName = "test-file";
//     const mockStatus = "Processed";

//     await expect(
//       updateTableInDynamoDB(
//         mockDynamoDbClient,
//         mockTableName,
//         mockFileName,
//         mockStatus
//       )
//     ).rejects.toThrow("DynamoDB UpdateItem error");

//     expect(mockDynamoDbClient.send).toHaveBeenCalledTimes(1);
//   });

//   describe("updateUsersTableWitInfoFromCSV", () => {
//     it("updateUsersTableWitInfoFromCSV should update an item if it exists", async () => {
//       (mockClient.send as jest.Mock)
//         .mockResolvedValueOnce({ Item: { id: { S: "file123" } } }) // getUserResponse
//         .mockResolvedValueOnce({}); // update
//       const userData = {
//         userName: "UserA",
//         userAge: 25,
//         userAvatar: "avatar.png",
//         userPosition: "Dev",
//         userSalary: 2000,
//       };
//       await updateUsersTableWitInfoFromCSV(
//         mockClient,
//         userData,
//         "file123",
//         "UsersTable"
//       );
//       expect(mockClient.send).toHaveBeenCalledWith(expect.any(GetItemCommand));
//     });

//     it("updateUsersTableWitInfoFromCSV should put an item if it does not exist", async () => {
//       (mockClient.send as jest.Mock)
//         .mockResolvedValueOnce({ Item: undefined }) // getUserResponse
//         .mockResolvedValueOnce({}); // put
//       const userData = { userName: "UserA", userAge: 25 };
//       await updateUsersTableWitInfoFromCSV(
//         mockClient,
//         userData,
//         "file123",
//         "UsersTable"
//       );
//       expect(mockClient.send).toHaveBeenCalledWith(expect.any(GetItemCommand));
//     });

//     it("updateUsersTableWitInfoFromCSV should throw an error if dynamoDbClient.send throws an error (GetItemCommand)", async () => {
//       const mockDynamoDbClient = {
//         send: jest.fn().mockRejectedValue(new Error("DynamoDB GetItem error")),
//       };
//       interface UserData {
//         userName: string;
//         userAge: number;
//         userAvatar: string;
//         userPosition: string;
//         userSalary: number;
//       }

//       const mockUserData: UserData = {
//         userName: "Test User",
//         userAge: 30,
//         userAvatar: "avatar.jpg",
//         userPosition: "Developer",
//         userSalary: 50000,
//       };
//       const mockFileId = "test-file-id";
//       const mockTableName = "test-table";

//       await expect(
//         updateUsersTableWitInfoFromCSV(
//           mockDynamoDbClient,
//           mockUserData,
//           mockFileId,
//           mockTableName
//         )
//       ).rejects.toThrow("DynamoDB GetItem error");

//       expect(mockDynamoDbClient.send).toHaveBeenCalledTimes(1); // Chỉ nên gọi 1 lần (GetItem)
//       expect(mockDynamoDbClient.send).toHaveBeenCalledWith(
//         expect.any(GetItemCommand)
//       );
//     });

//     it("updateUsersTableWitInfoFromCSV should throw an error if dynamoDbClient.send throws an error (UpdateItemCommand)", async () => {
//       const mockDynamoDbClient = {
//         send: jest
//           .fn()
//           .mockImplementationOnce(() => ({
//             Item: { id: { S: "test-file-id" } },
//           })) // GetItem trả về Item, để code đi vào nhánh Update
//           .mockRejectedValueOnce(new Error("DynamoDB UpdateItem error")), // UpdateItem bị reject
//       };
//       const mockUserData = {
//         userName: "Test User",
//         userAge: 30,
//         userAvatar: "avatar.jpg",
//         userPosition: "Developer",
//         userSalary: 50000,
//       };
//       const mockFileId = "test-file-id";
//       const mockTableName = "test-table";

//       await expect(
//         updateUsersTableWitInfoFromCSV(
//           mockDynamoDbClient,
//           mockUserData,
//           mockFileId,
//           mockTableName
//         )
//       ).rejects.toThrow("DynamoDB UpdateItem error");

//       expect(mockDynamoDbClient.send).toHaveBeenCalledTimes(2); // GetItem và UpdateItem
//       expect(mockDynamoDbClient.send).toHaveBeenNthCalledWith(
//         1,
//         expect.any(GetItemCommand)
//       );
//     });

//     it("updateUsersTableWitInfoFromCSV should throw an error if dynamoDbClient.send throws an error (PutItemCommand)", async () => {
//       const mockDynamoDbClient = {
//         send: jest
//           .fn()
//           .mockImplementationOnce(() => ({})) // GetItem trả về rỗng (không có Item), để code đi vào nhánh Put
//           .mockRejectedValueOnce(new Error("DynamoDB PutItem error")), // PutItem bị reject
//       };
//       const mockUserData = {
//         userName: "Test User",
//         userAge: 30,
//         userAvatar: "avatar.jpg",
//         userPosition: "Developer",
//         userSalary: 50000,
//       };
//       const mockFileId = "test-file-id";
//       const mockTableName = "test-table";

//       await expect(
//         updateUsersTableWitInfoFromCSV(
//           mockDynamoDbClient,
//           mockUserData,
//           mockFileId,
//           mockTableName
//         )
//       ).rejects.toThrow("DynamoDB PutItem error");

//       expect(mockDynamoDbClient.send).toHaveBeenCalledTimes(2); // GetItem và PutItem
//       expect(mockDynamoDbClient.send).toHaveBeenNthCalledWith(
//         1,
//         expect.any(GetItemCommand)
//       );
//     });
//   });

//   it("findAllRecordsHaveStatusInsertSuccess should scan table with filter", async () => {
//     (mockClient.send as jest.Mock).mockResolvedValueOnce({ Items: [] });
//     const result = await findAllRecordsHaveStatusInsertSuccess(
//       mockClient,
//       "TestTable",
//       "InsertSuccess"
//     );

//     expect(result).toBeDefined(); // Ensure result is defined
//     expect(result.Items).toBeInstanceOf(Array); // Ensure result.Items is an array
//     expect(mockClient.send).toHaveBeenCalledWith(expect.any(ScanCommand));
//     expect(result.Items).toEqual([]);
//   });

//   it("findAllRecordsHaveStatusInsertSuccess scan error ", async () => {
//     const mockTableName = "my-table";
//     const mockStatus = "InsertSuccess";
//     const mockError = new Error("DynamoDB error");
//     const mockDynamoDbClient = {
//       send: jest.fn().mockRejectedValue(mockError),
//     };
//     await expect(
//       findAllRecordsHaveStatusInsertSuccess(
//         mockDynamoDbClient,
//         mockTableName,
//         mockStatus
//       )
//     ).rejects.toThrow(mockError);
//     expect(mockDynamoDbClient.send).toHaveBeenCalled();
//     expect(mockDynamoDbClient.send).toHaveBeenCalledWith(
//       expect.any(ScanCommand)
//     );
//   });

//   it("updateAllRecordsInTableWithAvatar should update each item found with the provided imageUrl", async () => {
//     mockDynamoDBClient.send.mockResolvedValueOnce({
//       Items: [{ id: { S: "1" } }, { id: { S: "2" } }],
//     });

//     await updateAllRecordsInTableWithAvatar(
//       mockDynamoDBClient,
//       mockImageUrl,
//       mockUsersTable
//     );

//     expect(mockDynamoDBClient.send).toHaveBeenCalledTimes(3); // 1 Scan + 2 UpdateItem calls
//     expect(mockDynamoDBClient.send).toHaveBeenNthCalledWith(
//       1,
//       expect.any(ScanCommand)
//     );
//     // Check if UpdateItemCommand params are correct (for at least one call)
//     const updateParams = (mockDynamoDBClient.send as jest.Mock).mock
//       .calls[1][0];
//     expect(updateParams).toEqual({
//       TableName: mockUsersTable,
//       Key: { id: { S: "1" } }, // Check the ID matches the scanned item
//       UpdateExpression: "SET avatar = :avatar",
//       ExpressionAttributeValues: {
//         ":avatar": { S: mockImageUrl },
//       },
//     });
//   });

//   it("updateAllRecordsInTableWithAvatar should handle the case when no items are found", async () => {
//     mockDynamoDBClient.send.mockResolvedValueOnce({ Items: [] });

//     await updateAllRecordsInTableWithAvatar(
//       mockDynamoDBClient,
//       mockImageUrl,
//       mockUsersTable
//     );

//     expect(mockDynamoDBClient.send).toHaveBeenCalledTimes(1); // Only Scan is called
//     expect(mockDynamoDBClient.send).toHaveBeenCalledWith(
//       expect.any(ScanCommand)
//     );
//   });

//   it("updateAllRecordsInTableWithAvatar should handle the case when scan returns no Items property", async () => {
//     mockDynamoDBClient.send.mockResolvedValueOnce({});

//     await updateAllRecordsInTableWithAvatar(
//       mockDynamoDBClient,
//       mockImageUrl,
//       mockUsersTable
//     );

//     expect(mockDynamoDBClient.send).toHaveBeenCalledTimes(1); // Only Scan is called
//     expect(mockDynamoDBClient.send).toHaveBeenCalledWith(
//       expect.any(ScanCommand)
//     );
//   });

//   it("updateAllRecordsInTableWithAvatar should handle the case when an item is missing the primary key", async () => {
//     mockDynamoDBClient.send.mockResolvedValueOnce({
//       Items: [{ notId: { S: "1" } }],
//     }); //Missing ID
//     await updateAllRecordsInTableWithAvatar(
//       mockDynamoDBClient,
//       mockImageUrl,
//       mockUsersTable
//     );

//     expect(mockDynamoDBClient.send).toHaveBeenCalledTimes(1); // Just the scan command
//   });

//   it("updateAllRecordsInTableWithAvatar should throw an error if dynamoDBClient.send throws an error", async () => {
//     mockDynamoDBClient.send.mockRejectedValue(new Error("DynamoDB error"));

//     await expect(
//       updateAllRecordsInTableWithAvatar(
//         mockDynamoDBClient,
//         mockImageUrl,
//         mockUsersTable
//       )
//     ).rejects.toThrow("DynamoDB error");

//     expect(mockDynamoDBClient.send).toHaveBeenCalledTimes(1);
//     expect(mockDynamoDBClient.send).toHaveBeenCalledWith(
//       expect.any(ScanCommand)
//     );
//   });

//   it("updateAllRecordsInTableWithAvatar should handle the case when UpdateItem command fails", async () => {
//     // Setup: Scan returns some items
//     mockDynamoDBClient.send.mockResolvedValueOnce({
//       Items: [{ id: { S: "1" } }, { id: { S: "2" } }],
//     });

//     // Setup: First Update succeeds, second Update fails
//     mockDynamoDBClient.send
//       .mockResolvedValueOnce({}) // First update succeeds
//       .mockRejectedValueOnce(new Error("Update failed")); // Second update fails
//     try {
//       await updateAllRecordsInTableWithAvatar(
//         mockDynamoDBClient,
//         mockImageUrl,
//         mockUsersTable
//       );
//     } catch (error: any) {
//       expect(error.message).toBe("Update failed");
//     }

//     expect(mockDynamoDBClient.send).toHaveBeenCalledTimes(3); // Scan + 1 successful update + 1 failed update
//     expect(mockDynamoDBClient.send).toHaveBeenNthCalledWith(
//       1,
//       expect.any(ScanCommand)
//     );
//   });

//   it("updateAllRecordsInTableWithRole should update all records in the table with the default email", async () => {
//     const mockItems = [
//       { id: { S: "1" }, otherData: { S: "someData" } },
//       { id: { S: "2" }, anotherData: { N: "123" } },
//     ];

//     mockDynamoDBClient.send.mockReset(); // Reset mock call history
//     mockDynamoDBClient.send
//       .mockResolvedValueOnce({ Items: mockItems || [] }) // Ensure Items is not null
//       .mockResolvedValue(null); // Mock update response (success)

//     const result = await updateAllRecordsInTableWithEmail(
//       mockDynamoDBClient,
//       mockTableName
//     );

//     expect(mockDynamoDBClient.send).toHaveBeenCalledWith(
//       expect.any(ScanCommand)
//     );

//     expect(mockDynamoDBClient.send).toHaveBeenCalledTimes(mockItems.length + 1); // Scan + updates for each item

//     expect(mockDynamoDBClient.send).toHaveBeenNthCalledWith(
//       2,
//       expect.objectContaining({
//         TableName: mockTableName,
//         Key: { id: { S: "1" } },
//         UpdateExpression: "SET email = :email",
//         ExpressionAttributeValues: {
//           ":email": { S: "automail@gmail.com" },
//         },
//       })
//     );

//     expect(mockDynamoDBClient.send).toHaveBeenNthCalledWith(
//       3,
//       expect.objectContaining({
//         TableName: mockTableName,
//         Key: { id: { S: "2" } },
//         UpdateExpression: "SET email = :email",
//         ExpressionAttributeValues: {
//           ":email": { S: "automail@gmail.com" },
//         },
//       })
//     );

//     expect(result).toBeUndefined(); // should return undefined (void), meaning success
//   });
//   it("updateAllRecordsInTableWithRole should handle the case where the table is empty", async () => {
//     (UpdateItemCommand as unknown as jest.Mock).mockClear(); // Cast UpdateItemCommand to unknown first, then to jest.Mock and reset mock call history
//     mockDynamoDBClient.send.mockResolvedValueOnce({ Items: [] }); // Mock empty scan response

//     const result = await updateAllRecordsInTableWithEmail(
//       mockDynamoDBClient,
//       mockTableName
//     );

//     expect(mockDynamoDBClient.send).toHaveBeenCalledWith(
//       expect.any(ScanCommand)
//     );
//     expect(result).toBeUndefined(); // should return undefined (void), meaning success
//     expect(mockDynamoDBClient.send).toHaveBeenCalledTimes(1); // Ensure only one call is made
//   });
//   it("updateAllRecordsInTableWithRole should handle missing primary key in an item and continue processing", async () => {
//     const mockItems = [
//       { id: { S: "1" } },
//       {}, // Missing id
//       { id: { S: "3" } },
//     ];
//     mockDynamoDBClient.send.mockResolvedValueOnce({ Items: mockItems }); // Mock scan response
//     mockDynamoDBClient.send.mockResolvedValue(null); // Mock update response (success)

//     const result = await updateAllRecordsInTableWithEmail(
//       mockDynamoDBClient,
//       mockTableName
//     );

//     expect(mockDynamoDBClient.send).toHaveBeenCalledWith(
//       expect.any(ScanCommand)
//     );
//     expect(UpdateItemCommand).toHaveBeenCalledWith(
//       expect.objectContaining({
//         TableName: mockTableName,
//         Key: { id: { S: "1" } },
//         UpdateExpression: "SET email = :email",
//         ExpressionAttributeValues: {
//           ":email": { S: "automail@gmail.com" },
//         },
//       })
//     );
//   });

//   it("updateAllRecordsInTableWithRole should return false if any error occurs during the process", async () => {
//     mockDynamoDBClient.send.mockRejectedValue(new Error("DynamoDB Error")); // Mock scan or update error

//     const result = await updateAllRecordsInTableWithEmail(
//       mockDynamoDBClient,
//       mockTableName
//     );

//     expect(result).toBe(false);
//   });

//   it("updateAllRecordsInTableWithRole should return false if DynamoDB scan fails", async () => {
//     mockDynamoDBClient.send.mockRejectedValueOnce(new Error("Scan Failed"));
//     const result = await updateAllRecordsInTableWithEmail(
//       mockDynamoDBClient,
//       mockTableName
//     );
//     expect(result).toBe(false);
//   });

//   it("updateAllRecordsInTableWithRole should return false if DynamoDB update fails", async () => {
//     const mockItems = [{ id: { S: "1" }, otherData: { S: "someData" } }];
//     mockDynamoDBClient.send.mockResolvedValueOnce({ Items: mockItems }); // Mock scan response
//     mockDynamoDBClient.send.mockRejectedValueOnce(new Error("Update Failed")); // Mock update error

//     const result = await updateAllRecordsInTableWithEmail(
//       mockDynamoDBClient,
//       mockTableName
//     );

//     expect(mockDynamoDBClient.send).toHaveBeenCalledWith(
//       expect.any(ScanCommand)
//     );
//     expect(UpdateItemCommand).toHaveBeenCalledWith(
//       expect.objectContaining({
//         TableName: mockTableName,
//         Key: { id: { S: "1" } },
//         UpdateExpression: "SET email = :email",
//         ExpressionAttributeValues: {
//           ":email": { S: "automail@gmail.com" },
//         },
//       })
//     );
//     expect(result).toBe(false);
//   });

//   it("updateAllRecordsInTableWithRole should handle the case where primaryKey.S is undefined and continue processing", async () => {
//     const mockItems = [
//       { id: { S: "1" } },
//       { id: {} }, // Missing S property
//       { id: { S: "3" } },
//     ];
//     mockDynamoDBClient.send.mockResolvedValueOnce({ Items: mockItems });
//     mockDynamoDBClient.send.mockResolvedValue(null);

//     const result = await updateAllRecordsInTableWithEmail(
//       mockDynamoDBClient,
//       mockTableName
//     );
//     expect(UpdateItemCommand).toHaveBeenCalledWith(
//       expect.objectContaining({
//         TableName: mockTableName,
//         Key: { id: { S: "1" } },
//         UpdateExpression: "SET email = :email",
//         ExpressionAttributeValues: {
//           ":email": { S: "automail@gmail.com" },
//         },
//       })
//     );
//     expect(result).toBeUndefined();
//   });

//   it("updateAllRecordsInTableWithRole should handle error when updating an individual item but continue processing other items", async () => {
//     const mockItems = [
//       { id: { S: "1" } },
//       { id: { S: "2" } },
//       { id: { S: "3" } },
//     ];
//     mockDynamoDBClient.send.mockResolvedValueOnce({ Items: mockItems });
//     mockDynamoDBClient.send.mockRejectedValueOnce(
//       new Error("Update Failed for 1")
//     ); // Item 1 fails
//     mockDynamoDBClient.send.mockResolvedValueOnce(null); // Item 2 succeeds
//     mockDynamoDBClient.send.mockResolvedValueOnce(null); // Item 3 succeeds

//     const result = await updateAllRecordsInTableWithEmail(
//       mockDynamoDBClient,
//       mockTableName
//     );

//     expect(mockDynamoDBClient.send).toHaveBeenCalledWith(
//       expect.any(ScanCommand)
//     );
//   });

//   it("updateAllRecordsInTableWithRole should update role for each item found", async () => {
//     (mockClient.send as jest.Mock).mockResolvedValueOnce({
//       Items: [{ id: { S: "10" } }],
//     });
//     await updateAllRecordsInTableWithRole(mockClient, "UsersTable");
//     expect(mockClient.send).toHaveBeenCalledTimes(2);
//   });
//   it("should throw an error if DynamoDB scan fails", async () => {
//     const mockError = new Error("Scan Failed");
//     mockDynamoDBClient.send.mockRejectedValue(mockError); // Mock ScanCommand rejecting
//     expect(UpdateItemCommand).not.toHaveBeenCalled(); // Ensure UpdateItemCommand is not called if Scan fails
//   });

//   it("should throw an error if DynamoDB update fails", async () => {
//     const mockItems = [{ id: { S: "1" } }];
//     mockDynamoDBClient.send.mockResolvedValueOnce({ Items: mockItems }); // Mock successful Scan
//     const mockError = new Error("Update Failed");
//     mockDynamoDBClient.send.mockRejectedValueOnce(mockError); // Mock UpdateItemCommand rejecting after the Scan
//   });
// });
