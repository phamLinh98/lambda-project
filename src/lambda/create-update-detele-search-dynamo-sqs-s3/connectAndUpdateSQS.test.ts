import {
  connectToSQS,
  getAnSpecificItemFromListSQS,
  createNewSQSQueue,
  sendNewMessageToSQS,
  removeMessageFromSQS,
} from "./connectAndUpdateSQS";
import {
  SQSClient,
  ListQueuesCommand,
  CreateQueueCommand,
  SendMessageCommand,
  DeleteMessageCommand,
} from "@aws-sdk/client-sqs";

jest.mock("@aws-sdk/client-sqs", () => {
  const originalModule = jest.requireActual("@aws-sdk/client-sqs");
  return {
    ...originalModule,
    SQSClient: jest.fn().mockImplementation(() => ({
      send: jest.fn(),
    })),
  };
});

describe("connectAndUpdateSQS", () => {
  let mockSqs: any;

  beforeEach(() => {
    mockSqs = new SQSClient({ region: "ap-northeast-1" });
    (mockSqs.send as jest.Mock).mockReset();
  });

  it("connectToSQS should return new SQS client", async () => {
    const sqsClient = await connectToSQS();
    expect(sqsClient).toBeDefined();
    expect(SQSClient).toHaveBeenCalledWith({ region: "ap-northeast-1" });
  });

  it("getAnSpecificItemFromListSQS should call ListQueuesCommand", async () => {
    (mockSqs.send as jest.Mock).mockResolvedValueOnce({ QueueUrls: ["url"] });
    const response = await getAnSpecificItemFromListSQS(mockSqs);
    expect(mockSqs.send).toHaveBeenCalledWith(expect.any(ListQueuesCommand));
    expect(response).toEqual({ QueueUrls: ["url"] });
  });

  describe("createNewSQSQueue", () => {
    it("should create a new SQS queue on success", async () => {
      (mockSqs.send as jest.Mock).mockResolvedValueOnce({});
      await createNewSQSQueue(mockSqs, "testQueue");
      expect(mockSqs.send).toHaveBeenCalledWith(expect.any(CreateQueueCommand));
    });

    it("should retry creating queue if deleted recently", async () => {
      (mockSqs.send as jest.Mock)
        .mockRejectedValueOnce({
          Code: "AWS.SimpleQueueService.QueueDeletedRecently",
        })
        .mockResolvedValueOnce({});
      jest.spyOn(global, "setTimeout").mockImplementation((f) => {
        f();
        return {} as unknown as NodeJS.Timeout; // Return a mock Timeout object
      }); // Mock setTimeout to execute immediately
      await createNewSQSQueue(mockSqs, "testQueue");
      expect(mockSqs.send).toHaveBeenCalledTimes(2);
    });

    it("should rethrow other errors", async () => {
      (mockSqs.send as jest.Mock).mockRejectedValueOnce(() => {
        throw new Error("UnknownError");
      });
      await expect(createNewSQSQueue(mockSqs, "testQueue")).rejects.toThrow();
      expect(mockSqs.send).toHaveBeenCalledTimes(1);
    });
  });

  describe("sendNewMessageToSQS", () => {
    it("should send new message on success", async () => {
      (mockSqs.send as jest.Mock).mockResolvedValueOnce({ MessageId: "123" });
      await sendNewMessageToSQS(mockSqs, { QueueUrl: "url" });
      expect(mockSqs.send).toHaveBeenCalledWith(expect.any(SendMessageCommand));
    });

    it("should throw an error on failure", async () => {
      (mockSqs.send as jest.Mock).mockRejectedValueOnce(new Error("Fail"));
      await expect(
        sendNewMessageToSQS(mockSqs, { QueueUrl: "url" })
      ).rejects.toThrow("Failed to send message to SQS");
    });
  });

  describe("removeMessageFromSQS", () => {
    it("should remove the message successfully", async () => {
      (mockSqs.send as jest.Mock).mockResolvedValueOnce({});
      const event = { Records: [{ receiptHandle: "handle123" }] };
      await removeMessageFromSQS(event, "queueUrl", mockSqs);
      expect(mockSqs.send).toHaveBeenCalledWith(
        expect.any(DeleteMessageCommand)
      );
    });

    it("should throw an error if deletion fails", async () => {
      (mockSqs.send as jest.Mock).mockRejectedValueOnce(new Error("Fail"));
      const event = { Records: [{ receiptHandle: "handle123" }] };
      await expect(
        removeMessageFromSQS(event, "queueUrl", mockSqs)
      ).rejects.toThrow("Failed to remove message from SQS");
    });
  });
});
