import {
  SecretsManagerClient,
  GetSecretValueCommand,
} from "@aws-sdk/client-secrets-manager";

// Secrets Manager configuration
const secret_name = "HitoEnvSecret";
const secretsClient = new SecretsManagerClient({ region: "ap-northeast-1" });

export const getSecretOfKey = async (key: any) => {
  try {
    const response = (await secretsClient.send(
      new GetSecretValueCommand({
        SecretId: secret_name,
        VersionStage: "AWSCURRENT", // VersionStage defaults to AWSCURRENT if unspecified
      })
    )) as any;
    const secrets = JSON.parse(response.SecretString);
    return secrets[key];
  } catch (error) {
    console.error("Error fetching secret of key:", error);
    throw error;
  }
};
