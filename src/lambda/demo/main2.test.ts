// //Module bạn đang kiểm tra
// import { setMailDemo } from "./mail";

// //truy cập vào hàm mock để cấu hình hành vi của nó hoặc để thực hiện assertions
// import * as testingMock from "../create-update-detele-search-dynamo-sqs-s3/connectAndUpdateDynamoDb";

// // jest gọi đến hàm mock thay vì thực thi hàm gốc
// jest.mock(
//   "../create-update-detele-search-dynamo-sqs-s3/connectAndUpdateDynamoDb"
// );

// describe("test mock main 2", () => {
//   beforeEach(() => {
//     jest.clearAllMocks();
//   });

//   test("test mock main 2", async () => {
//     (
//       testingMock.updateAllRecordsInTableWithEmail as jest.Mock
//     ).mockResolvedValueOnce("Mail updated");
//     // khai báo biến mock cho dbnamoDB
//     const dynamoDb = {
//       update: jest.fn().mockReturnValue({
//         promise: jest.fn().mockResolvedValue({}),
//       }),
//     };
//     // mock cho s3
//     const s3 = {
//       putObject: jest.fn().mockReturnValue({
//         promise: jest.fn().mockResolvedValue({}),
//       }),
//     };
//     // mock cho usersTable
//     const usersTable = "usersTable";

//     const result = await setMailDemo(dynamoDb, s3, usersTable);
//     expect(result).toBe(true);
//   });
// });
