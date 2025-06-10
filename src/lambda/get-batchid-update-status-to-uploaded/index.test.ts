import { handler } from "./index";
import * as corsUtils from "../../utils/cors";
import * as dynamoDbModule from "../create-update-detele-search-dynamo-sqs-s3/connectAndUpdateDynamoDb";
import * as sqsModule from "../create-update-detele-search-dynamo-sqs-s3/connectAndUpdateSQS";
import * as secretsManager from "../get-secret-key-from-manager";

// Mock path to the modules
jest.mock("../../utils/cors");
jest.mock(
  "../create-update-detele-search-dynamo-sqs-s3/connectAndUpdateDynamoDb"
);
jest.mock("../create-update-detele-search-dynamo-sqs-s3/connectAndUpdateSQS");
jest.mock("../get-secret-key-from-manager");

describe("Lambda Handler", () => {
  // Mock event for testing, sự kiện s3 kèm file .csv
  const mockEvent = {
    Records: [
      {
        s3: {
          bucket: { name: "test-bucket" },
          object: { key: "test-folder/test-file.csv" },
        },
      },
    ],
  };

  beforeEach(() => {
     // Clear all mocks before each test
    jest.clearAllMocks();
  });

  it("should process a CSV file and send a message to SQS successfully", async () => {
    // nó sẽ trả về một Promise được resolve với giá trị "TestTable".
    (secretsManager.getSecretOfKey as jest.Mock).mockResolvedValueOnce(
      "TestTable"
    ); // nó sẽ trả về một Promise được resolve với giá trị "TestQueue".
    (secretsManager.getSecretOfKey as jest.Mock).mockResolvedValueOnce(
      "TestQueue"
    ); // sqsName
    (secretsManager.getSecretOfKey as jest.Mock).mockResolvedValueOnce(
      "https://sqs.mock.aws/"
    ); // prefixQueueUrl

    // Mock DynamoDB
    (dynamoDbModule.connectToDynamoDb as jest.Mock).mockResolvedValue(
      "mockDynamoDBClient"
    );
    (dynamoDbModule.updateTableInDynamoDB as jest.Mock).mockResolvedValue(true);

    // Mock SQS
    (sqsModule.connectToSQS as jest.Mock).mockResolvedValue("mockSQSClient");
    (sqsModule.getAnSpecificItemFromListSQS as jest.Mock).mockResolvedValue({
      QueueUrls: [], // simulate no queue exists
    });
    (sqsModule.createNewSQSQueue as jest.Mock).mockResolvedValue(true);
    (sqsModule.sendNewMessageToSQS as jest.Mock).mockResolvedValue(true);

    // Mock CORS
    (corsUtils.addCorsHeaders as jest.Mock).mockImplementation((res) => res);

    // gọi hàm handler truyền vào s3 1 file .csv
    const result = await handler(mockEvent);

     // Expect the mocks to have been called with correct parameters
    expect(secretsManager.getSecretOfKey).toHaveBeenCalledTimes(3);

    // Expect DynamoDB operations
    expect(dynamoDbModule.updateTableInDynamoDB).toHaveBeenCalledWith(
      "mockDynamoDBClient",
      "TestTable",
      "test-file",
      "Uploaded"
    );

    // Expect SQS operations
    expect(sqsModule.createNewSQSQueue).toHaveBeenCalledWith(
      "mockSQSClient",
      "TestQueue"
    );

    // Expect sending a message to SQS
    expect(sqsModule.sendNewMessageToSQS).toHaveBeenCalledWith(
      "mockSQSClient",
      {
        QueueUrl: "https://sqs.mock.aws/TestQueue",
        MessageBody: JSON.stringify({ fileId: "test-file" }),
      }
    );

    // Expect CORS headers to be added
    expect(result.statusCode).toBe(200);

    // Expect the response body to contain the success message
    expect(JSON.parse(result.body).message).toBe(
      "Message sent to SQS successfully."
    );
  });

  it("should exit early for non-CSV file", async () => {

    // Gọi handler với một sự kiện không phải là file CSV
    const nonCsvEvent = {
      Records: [
        {
          s3: {
            bucket: { name: "test-bucket" },
            object: { key: "test-folder/test-file.txt" },
          },
        },
      ],
    };

    // Mock event for testing, sự kiện s3 không phải file .csv
    const result = await handler(nonCsvEvent);
    // Expect the handler to return early with a 200 status code
    expect(result.statusCode).toBe(500);

    // Expect the response body to indicate no action taken
    expect(JSON.parse(result.body).message).toBe('Not a CSV file.  No action taken.');
  });

  it("should return 500 on error", async () => {
      // Mock Secrets Manager to throw an error
    (secretsManager.getSecretOfKey as jest.Mock).mockRejectedValue(
      new Error("Secret error")
    );

    const result = await handler(mockEvent);
      // Expect the handler to return a 500 status code
    expect(result.statusCode).toBe(500);
      // Expect the response body to contain the error message
    expect(JSON.parse(result.body).message).toBe("Cannot Call this lambda");
  });
});
