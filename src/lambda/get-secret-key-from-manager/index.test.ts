// // src/lambda/get-secret-key-from-manager/index.test.ts
// // 1️⃣ Khai báo mock (hoisted)
// jest.mock("@aws-sdk/client-secrets-manager", () => ({
//   SecretsManagerClient: jest.fn(),
//   GetSecretValueCommand: jest.fn(),
// }));

// describe("getSecretOfKey", () => {
//   const mockKey = "bucketCsvName";
//   const awsPath = "@aws-sdk/client-secrets-manager";
//   const indexPath = "./index";

//   beforeEach(() => {
//     jest.resetModules(); // xoá cache của mọi module
//   });

//   it("returns the secret value for the given key", async () => {
//     // 2️⃣ Lấy mock MỚI sinh ra sau resetModules
//     const { SecretsManagerClient, GetSecretValueCommand } =
//       jest.requireMock(awsPath);

//     const mockSend = jest.fn().mockResolvedValue({
//       SecretString: JSON.stringify({ bucketCsvName: "mockBucketName" }),
//     });

//     (SecretsManagerClient as jest.Mock).mockImplementation(() => ({
//       send: mockSend,
//     }));

//     // 3️⃣ Import module đích — lúc này mock đã đúng
//     const { getSecretOfKey } = await import(indexPath);

//     const result = await getSecretOfKey(mockKey);

//     expect(result).toBe("mockBucketName");
//     expect(mockSend).toHaveBeenCalledTimes(1);
//     expect((GetSecretValueCommand as jest.Mock).mock.calls.length).toBe(1);
//   });

//   it("throws an error if fetching the secret fails", async () => {
//     const { SecretsManagerClient } = jest.requireMock(awsPath);

//     const mockError = new Error("Failed to fetch secret");
//     const mockSend = jest.fn().mockRejectedValue(mockError);

//     (SecretsManagerClient as jest.Mock).mockImplementation(() => ({
//       send: mockSend,
//     }));

//     const { getSecretOfKey } = await import(indexPath);

//     await expect(getSecretOfKey(mockKey)).rejects.toThrow(mockError);
//     expect(mockSend).toHaveBeenCalledTimes(1);
//   });
// });
