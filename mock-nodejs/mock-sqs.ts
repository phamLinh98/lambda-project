import { SQSClient } from "@aws-sdk/client-sqs";

export const connectToSQS = async () => {
  const sqs = new SQSClient({
    region: "ap-northeast-1",
    endpoint: "http://localhost:8001"
  });
  return sqs;
};
