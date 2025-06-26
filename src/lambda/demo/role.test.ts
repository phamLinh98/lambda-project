// import { setRoleDemo } from "./role";
// import * as dynamoDbModule from "../create-update-detele-search-dynamo-sqs-s3/connectAndUpdateDynamoDb";

// jest.mock(
//   "../create-update-detele-search-dynamo-sqs-s3/connectAndUpdateDynamoDb"
// );

// describe("setRoleDemo", () => {
//   beforeEach(() => {
//     jest.clearAllMocks();
//   });

//   it("should update roles successfully and return true", async () => {
//     (
//       dynamoDbModule.updateAllRecordsInTableWithRole as jest.Mock
//     ).mockResolvedValue("Role updated");
//     const mockDynamoDb = {} as any;
//     const mockS3 = {} as any;

//     const result = await setRoleDemo(mockDynamoDb, mockS3, "UsersTable");
//     expect(result).toBe(true);
//     expect(dynamoDbModule.updateAllRecordsInTableWithRole).toHaveBeenCalledWith(
//       mockDynamoDb,
//       "UsersTable"
//     );
//   });

//   it("should throw an error if updating roles fails", async () => {
//     (
//       dynamoDbModule.updateAllRecordsInTableWithRole as jest.Mock
//     ).mockRejectedValue(new Error("fail"));
//     const mockDynamoDb = {} as any;
//     const mockS3 = {} as any;

//     await expect(
//       setRoleDemo(mockDynamoDb, mockS3, "UsersTable")
//     ).rejects.toThrow("fail");
//   });
// });
