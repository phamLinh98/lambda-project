// import { setAvatarDemo } from "./avatar";
// import * as dynamoDbModule from "../create-update-detele-search-dynamo-sqs-s3/connectAndUpdateDynamoDb";
// import * as s3Module from "../create-update-detele-search-dynamo-sqs-s3/connectAndUpdateS3";

// jest.mock(
//   "../create-update-detele-search-dynamo-sqs-s3/connectAndUpdateDynamoDb"
// );
// jest.mock("../create-update-detele-search-dynamo-sqs-s3/connectAndUpdateS3");

// describe("setAvatarDemo", () => {
//   beforeEach(() => {
//     jest.clearAllMocks();
//   });

//   it("should update avatar for all users and copy file to new bucket", async () => {
//     (
//       dynamoDbModule.updateAllRecordsInTableWithAvatar as jest.Mock
//     ).mockResolvedValueOnce("Update Success");
//     (s3Module.copyItemToNewBucket as jest.Mock).mockResolvedValueOnce(true);

//     const mockDynamoDb = {} as any;
//     const mockS3 = {} as any;
//     const newBucket = "newBucket";
//     const usersTable = "usersTable";

//     await setAvatarDemo(mockDynamoDb, mockS3, newBucket, usersTable);

//     expect(
//       dynamoDbModule.updateAllRecordsInTableWithAvatar
//     ).toHaveBeenCalledWith(
//       mockDynamoDb,
//       expect.stringContaining("avatar_"),
//       usersTable
//     );
//     expect(s3Module.copyItemToNewBucket).toHaveBeenCalledWith(
//       mockS3,
//       newBucket,
//       expect.stringContaining("avatar_"),
//       "picture/linh123.jpg"
//     );
//   });

//   it("should throw an error if something fails", async () => {
//     (
//       dynamoDbModule.updateAllRecordsInTableWithAvatar as jest.Mock
//     ).mockRejectedValueOnce(new Error("Update fail"));

//     const mockDynamoDb = {} as any;
//     const mockS3 = {} as any;

//     await expect(
//       setAvatarDemo(mockDynamoDb, mockS3, "bucket", "table")
//     ).rejects.toThrow("Update fail");
//   });
// });
