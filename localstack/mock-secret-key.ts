import {
  GetSecretValueCommand,
  SecretsManagerClient,
} from "@aws-sdk/client-secrets-manager";

const secret_name = "HitoEnvSecret";
const secretsClient = new SecretsManagerClient({
  region: "ap-northeast-1",
  endpoint: "http://localhost:4566",
  credentials: {
    accessKeyId: "test",
    secretAccessKey: "test",
  },
});

export const getSecretOfKey = async (key: any) => {
  try {
    const response = (await secretsClient.send(
      new GetSecretValueCommand({ SecretId: secret_name })
    )) as any;
    const secrets = JSON.parse(response.SecretString);
    return secrets[key];
  } catch (error) {
    console.error(`Error fetching secret ${key}:`, error);
    throw error;
  }
};
