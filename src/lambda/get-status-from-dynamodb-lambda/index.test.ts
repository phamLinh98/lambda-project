// import { handler } from "./index";
// import * as corsUtils from "../../utils/cors";
// import * as dynamoDbModule from "../create-update-detele-search-dynamo-sqs-s3/connectAndUpdateDynamoDb";
// import * as secretModule from "../get-secret-key-from-manager";

// jest.mock("../../utils/cors");
// jest.mock(
//   "../create-update-detele-search-dynamo-sqs-s3/connectAndUpdateDynamoDb"
// );
// jest.mock("../get-secret-key-from-manager");

// describe("handler", () => {
//   beforeEach(() => {
//     jest.clearAllMocks();
//   });

//   it("should return 200 with item found", async () => {
//     (dynamoDbModule.connectToDynamoDb as jest.Mock).mockResolvedValue(
//       "mockDynamoDb" as any
//     );
//     (secretModule.getSecretOfKey as jest.Mock).mockResolvedValue(
//       "uploadCsvTable"
//     );
//     (dynamoDbModule.getItemFromDynamoDB as jest.Mock).mockResolvedValue([
//       { id: "123" },
//     ]);
//     (corsUtils.addCorsHeaders as jest.Mock).mockImplementation((res) => res);

//     const event = { queryStringParameters: { id: "123" } } as any;
//     const result = await handler(event);

//     expect(dynamoDbModule.connectToDynamoDb).toHaveBeenCalled();
//     expect(secretModule.getSecretOfKey).toHaveBeenCalledWith(
//       "uploadCsvTableName"
//     );
//     expect(dynamoDbModule.getItemFromDynamoDB).toHaveBeenCalledWith(
//       "mockDynamoDb",
//       "uploadCsvTable",
//       "123"
//     );
//     expect(result.statusCode).toBe(200);
//     expect(JSON.parse(result.body)).toEqual({ id: "123" });
//   });

//   it("should return 404 when no records found", async () => {
//     (dynamoDbModule.connectToDynamoDb as jest.Mock).mockResolvedValue(
//       "mockDynamoDb" as any
//     );
//     (secretModule.getSecretOfKey as jest.Mock).mockResolvedValue(
//       "uploadCsvTable"
//     );
//     (dynamoDbModule.getItemFromDynamoDB as jest.Mock).mockResolvedValue([]);
//     (corsUtils.addCorsHeaders as jest.Mock).mockImplementation((res) => res);

//     const event = { queryStringParameters: { id: "123" } } as any;
//     const result = await handler(event);

//     expect(result.statusCode).toBe(404);
//     expect(JSON.parse(result.body)).toEqual({ message: "No records found" });
//   });

//   it("should return 500 on error", async () => {
//     (dynamoDbModule.connectToDynamoDb as jest.Mock).mockResolvedValue(
//       "mockDynamoDb" as any
//     );
//     (secretModule.getSecretOfKey as jest.Mock).mockResolvedValue(
//       "uploadCsvTable"
//     );
//     (dynamoDbModule.getItemFromDynamoDB as jest.Mock).mockRejectedValue(
//       new Error("Some error")
//     );

//     const event = { queryStringParameters: { id: "123" } } as any;
//     const result = await handler(event);
//     expect(result.statusCode).toBe(500);
//     expect(JSON.parse(result.body)).toEqual({ error: "Some error" });
//   });
// });
