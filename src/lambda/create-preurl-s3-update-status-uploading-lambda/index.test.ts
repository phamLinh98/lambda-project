// import { handler } from "./index";
// import * as dbConfig from "../../db/config";
// import * as dynamoDbUtils from "../create-update-detele-search-dynamo-sqs-s3/connectAndUpdateDynamoDb";
// import * as s3Utils from "../create-update-detele-search-dynamo-sqs-s3/connectAndUpdateS3";
// import * as secretManager from "../get-secret-key-from-manager";

// jest.mock("../../db/config");
// jest.mock(
//   "../create-update-detele-search-dynamo-sqs-s3/connectAndUpdateDynamoDb"
// );
// jest.mock("../create-update-detele-search-dynamo-sqs-s3/connectAndUpdateS3");
// jest.mock("../get-secret-key-from-manager");

// describe("handler", () => {
//   const mockEvent = {};

//   beforeEach(() => {
//     jest.clearAllMocks();
//   });

//   it("should successfully create a pre-signed URL and update DynamoDB", async () => {
//     // mock bucket 1
//     const mockBucketName = "linh dep trai";
//     // mock table 1
//     const mockTableName = "linh khoai to";
//     // mock s3 client
//     const mockS3Client = new (jest.fn(
//       () =>
//         ({
//           send: jest.fn(),
//         } as any)
//     ))();
//     // mock dynamoDB client
//     const mockDynamoDB = {} as any; 
//     // mock pre-signed URL
//     const mockPreSignedUrl = { url: "https://javhd.pro" };
//     // đưa các giá trị mock vào các hàm tương ứng trong lambda 
//     jest
//       .spyOn(secretManager, "getSecretOfKey")
//       .mockResolvedValueOnce(mockBucketName);
//     jest
//       .spyOn(secretManager, "getSecretOfKey")
//       .mockResolvedValueOnce(mockTableName);
//     jest.spyOn(s3Utils, "connectToS3Bucket").mockResolvedValue(mockS3Client);
//     jest.spyOn(dbConfig, "getInstanceDynamoDB").mockResolvedValue(mockDynamoDB);
//     jest
//       .spyOn(dynamoDbUtils, "updateTableInDynamoDB")
//       .mockResolvedValue(undefined);
//     jest
//       .spyOn(s3Utils, "createPreUrlUpdateS3")
//       .mockResolvedValue(mockPreSignedUrl);

//     // gọi hàm handler với mockEvent
//     const result = await handler(mockEvent);
//     expect(secretManager.getSecretOfKey).toHaveBeenCalledWith("bucketCsvName");
//     expect(secretManager.getSecretOfKey).toHaveBeenCalledWith("uploadCsvTableName");
//     expect(s3Utils.connectToS3Bucket).toHaveBeenCalled();
//     expect(dbConfig.getInstanceDynamoDB).toHaveBeenCalled();
//     expect(dynamoDbUtils.updateTableInDynamoDB).toHaveBeenCalledWith(
//       mockDynamoDB,
//       mockTableName,
//       expect.any(String),
//       "Uploading"
//     );

//     // giả lập call function createPreUrlUpdateS3 với các tham số tương ứng xem có = mockPreSignedUrl không
//     expect(s3Utils.createPreUrlUpdateS3).toHaveBeenCalledWith(
//       mockS3Client,
//       mockBucketName,
//       expect.stringContaining("csv/"),
//       3600,
//       expect.any(String)
//     );
//     expect(result).toEqual(mockPreSignedUrl);
//   });

//   it("should return a 500 error if an exception occurs", async () => {
//     jest
//       .spyOn(secretManager, "getSecretOfKey")
//       .mockRejectedValue(new Error("Secrets Manager Error"));

//     const result = await handler(mockEvent);

//     expect(result).toEqual({
//       statusCode: 500,
//       body: JSON.stringify({ message: "Call Lambda PreURL fail" }),
//     });
//   })
// });
