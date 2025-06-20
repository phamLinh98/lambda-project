import { ListQueuesCommand, SendMessageCommand, SQSClient } from "@aws-sdk/client-sqs";

// Lý do cần dòng này vì:
// Bởi vì AWS SDK trong code không biết bạn đang dùng LocalStack, nên nó mặc định sẽ cố gắng kết nối AWS thật, trừ khi bạn chỉ rõ endpoint và credentials giả.
// SDK sẽ cố kết nối đến AWS thật tại: https://sqs.ap-northeast-1.amazonaws.com
export const connectToSQS = async() => {
  const sqs = new SQSClient({
      region: "ap-northeast-1", // ✅ KHỚP VỚI queue bạn tạo
      endpoint: "http://localhost:4566",
      credentials: {
        accessKeyId: "test",
        secretAccessKey: "test",
      },
    });
    return sqs;
}

export const getAnSpecificItemFromListSQS = async (client: SQSClient) => {
  try {
    const result = await client.send(new ListQueuesCommand({}));
    console.log("✅ Queue URLs:", result.QueueUrls);
    return result;
  } catch (err) {
    console.error("❌ Error listing queues:", err);
    throw err;
  }
};

export const sendNewMessageToSQS = async (sqsClient:any, sqsParams:any) => {
  try {
        const sendMessageCommand = new SendMessageCommand(sqsParams);
        const sqsResponse = await sqsClient.send(sendMessageCommand);
        console.log(`Message sent to SQS with ID: ${sqsResponse.MessageId}`);
  } catch (error) {
        throw new Error('Failed to send message to SQS');
  }
}
