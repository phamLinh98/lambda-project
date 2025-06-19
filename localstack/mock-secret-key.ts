// get-secret-key-from-manager.ts
import { SecretsManagerClient, GetSecretValueCommand } from "@aws-sdk/client-secrets-manager";

// const secretsClient = new SecretsManagerClient({
//   region: "us-east-1",
//   endpoint: "http://localhost:4566",
//   credentials: { accessKeyId: "test", secretAccessKey: "test" },
// });

// (async () => {
//   try {
//     const command = new GetSecretValueCommand({ SecretId: "UploadCsvTableName" });
//     const data = await secretsClient.send(command);
//     console.log("Secret:", data.SecretString);
//   } catch (error) {
//     console.error("Error fetching secret:", error);
//   }
// })();


export const getSecretOfKey = async (key: string): Promise<string> => {
  try {
    const command = new GetSecretValueCommand({ SecretId: key });
    //const data = await secretsClient.send(command);
    const data = command.input;
    return data.SecretId || "";
  } catch (error) {
    console.error(`Error fetching secret ${key}:`, error);
    throw error;
  }
};

