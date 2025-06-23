import {
  GetSecretValueCommand,
  SecretsManagerClient,
} from "@aws-sdk/client-secrets-manager";

const secret_name = "HitoEnvSecret";

export const secretsClient = new SecretsManagerClient({
      region: "ap-northeast-1", // Có thể tùy ý
      endpoint: "http://localhost:8001", // Giả sử bạn chạy mock server ở cổng 8002
      credentials: {
        accessKeyId: "fake",
        secretAccessKey: "fake",
      },
    });

export const getSecretOfKey = async (key: string) => {
  try {
    const response = (await secretsClient.send(
      new GetSecretValueCommand({
        SecretId: secret_name,
        VersionStage: "AWSCURRENT",
      })
    )) as any;

    const secretString = response.SecretString;
    if (!secretString) {
      console.error("❌ No SecretString returned");
      return undefined;
    }

    const secrets = JSON.parse(secretString);
    console.log("🔐 Secrets:", secrets);

    if (!(key in secrets)) {
      console.warn(`⚠️ Key "${key}" not found in secrets`);
      return undefined;
    }

    return secrets[key];
  } catch (error) {
    console.error("❌ Error getting secret:", error);
    throw error;
  }
};
