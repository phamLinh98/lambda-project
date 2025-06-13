import {
  connectToS3Bucket,
  createPreUrlUpdateS3,
  getAllContentFromS3Uploaded,
  createNewBucketS3,
  copyItemToNewBucket,
} from "./connectAndUpdateS3";
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  HeadBucketCommand,
  CreateBucketCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { addCorsHeaders } from "../../utils/cors";

jest.mock("@aws-sdk/client-s3", () => {
  const originalModule = jest.requireActual("@aws-sdk/client-s3");
  return {
    ...originalModule,
    S3Client: jest.fn().mockImplementation(() => ({ send: jest.fn() })),
  };
});
jest.mock("@aws-sdk/s3-request-presigner");
jest.mock("../../utils/cors");

describe("connectAndUpdateS3", () => {
  let mockS3: any;
  let mockS3Client: any;
  let mockParams: any;
  let mockBucketDestination:any;
  let mockNewBucket:any;
  let mockNewImageUrl:any;
  let mockPath:any;

  beforeEach(() => {
    mockS3 = new S3Client({ region: "ap-northeast-1" });
    (mockS3.send as jest.Mock).mockReset();
    (getSignedUrl as jest.Mock).mockReset();
    (addCorsHeaders as jest.Mock).mockImplementation((res) => res);
    mockS3Client = {
      send: jest.fn(),
    };
    (S3Client as jest.Mock).mockImplementation(() => mockS3Client); // Mock the constructor
    mockParams = {
      Bucket: "testBucket",
      Key: "testKey",
    };

    // Reset mocks before each test
    mockS3Client.send.mockReset();
  });

  it("connectToS3Bucket should return an S3Client instance", async () => {
    const client = await connectToS3Bucket();
    expect(client).toBeDefined();
    expect(S3Client).toHaveBeenCalledWith({ region: "ap-northeast-1" });
  });

  it("createPreUrlUpdateS3 should return presigned URL", async () => {
    (getSignedUrl as jest.Mock).mockResolvedValue("http://mock-presigned");
    const result = await createPreUrlUpdateS3(
      mockS3,
      "bucket",
      "key.csv",
      3600,
      "fileId"
    );
    expect(getSignedUrl).toHaveBeenCalledWith(
      mockS3,
      expect.any(PutObjectCommand),
      { expiresIn: 3600 }
    );
    expect(result.statusCode).toBe(200);
    const body = JSON.parse(result.body);
    expect(body.presignedUrl).toBe("http://mock-presigned");
    expect(body.id).toBe("fileId");
  });

  it("createPreUrlUpdateS3 should return 500 on error", async () => {
    (getSignedUrl as jest.Mock).mockRejectedValue(new Error("error"));
    const result = await createPreUrlUpdateS3(
      mockS3,
      "bucket",
      "key.csv",
      3600,
      "fileId"
    );
    expect(result.statusCode).toBe(500);
  });

  it("getAllContentFromS3Uploaded should parse CSV", async () => {
    const mockBodyStream = {
      on: (event: string, cb: any) => {
        if (event === "data") cb(Buffer.from("name,age\nAlice,30\nBob,25"));
        if (event === "end") cb();
      },
    };
    (mockS3.send as jest.Mock).mockResolvedValueOnce({ Body: mockBodyStream });
    const data = await getAllContentFromS3Uploaded(
      { Bucket: "bucket", Key: "file.csv" },
      mockS3
    );
    expect(mockS3.send).toHaveBeenCalledWith(expect.any(GetObjectCommand));
    expect(data).toEqual([
      { name: "Alice", age: "30" },
      { name: "Bob", age: "25" },
    ]);
  });

  it("createNewBucketS3 should skip creation if exists", async () => {
    (mockS3.send as jest.Mock).mockResolvedValueOnce({});
    await createNewBucketS3(mockS3, "myBucket");
    expect(mockS3.send).toHaveBeenCalledWith(expect.any(HeadBucketCommand));
  });

  it("createNewBucketS3 should create bucket if not found", async () => {
    (mockS3.send as jest.Mock)
      .mockRejectedValueOnce({ $metadata: { httpStatusCode: 404 } })
      .mockResolvedValueOnce({});
    await createNewBucketS3(mockS3, "myBucket");
    expect(mockS3.send).toHaveBeenNthCalledWith(
      1,
      expect.any(HeadBucketCommand)
    );
    expect(mockS3.send).toHaveBeenNthCalledWith(
      2,
      expect.any(CreateBucketCommand)
    );
  });

  it('createNewBucketS3 should throw an error if HeadBucketCommand fails with a non-404 status', async () => {
    const mockError = new Error('HeadBucket Failed');
    (mockError as any).$metadata = { httpStatusCode: 500 };  // Simulate a non-404 error

    mockS3Client.send.mockRejectedValue(mockError); // Mock HeadBucketCommand rejecting

    await expect(createNewBucketS3(mockS3Client, mockBucketDestination)).rejects.toThrow(mockError); // Assert that the function throws the same error

    expect(mockS3Client.send).toHaveBeenCalledTimes(1); // Ensure HeadBucketCommand is called
    expect(mockS3Client.send).toHaveBeenCalledWith(expect.any(HeadBucketCommand)); // Check it was called with the correct command
  });

  it('createNewBucketS3 should create a bucket if HeadBucketCommand returns 404', async () => {
      const mockError = new Error('Not Found');
      (mockError as any).$metadata = { httpStatusCode: 404 };

      mockS3Client.send.mockRejectedValueOnce(mockError);
      mockS3Client.send.mockResolvedValueOnce({});

      await createNewBucketS3(mockS3Client, mockBucketDestination);

      expect(mockS3Client.send).toHaveBeenCalledTimes(2);
      expect(mockS3Client.send).toHaveBeenCalledWith(expect.any(HeadBucketCommand));
      expect(mockS3Client.send).toHaveBeenCalledWith(expect.any(CreateBucketCommand));
  });

  it('createNewBucketS3 should do nothing if HeadBucketCommand resolves.', async () => {
      mockS3Client.send.mockResolvedValueOnce({});
      await createNewBucketS3(mockS3Client, mockBucketDestination);
      expect(mockS3Client.send).toHaveBeenCalledTimes(1);
      expect(mockS3Client.send).toHaveBeenCalledWith(expect.any(HeadBucketCommand));
  });

  it("getAllContentFromS3Uploaded should throw an error if S3 retrieval fails", async () => {
    const mockError = new Error("S3 GetObject Failed");
    mockS3Client.send.mockRejectedValue(mockError); // Mock S3 GetObjectCommand rejecting

    await expect(
      getAllContentFromS3Uploaded(mockParams, mockS3Client)
    ).rejects.toThrow(mockError); // Assert that the function throws the same error
  });

  it("getAllContentFromS3Uploaded should throw an error if streamToString fails", async () => {
    mockS3Client.send.mockResolvedValueOnce({
      Body: {
        on: jest.fn().mockImplementation((event, callback) => {
          if (event === "error") {
            callback(new Error("Stream Error"));
          }
        }),
      },
    });

    await expect(
      getAllContentFromS3Uploaded(mockParams, mockS3Client)
    ).rejects.toThrow("Stream Error");
  });

  it("copyItemToNewBucket should upload item to new bucket", async () => {
    (mockS3.send as jest.Mock).mockResolvedValueOnce({});
    const result = await copyItemToNewBucket(
      mockS3,
      "newBucket",
      "newKey",
      "pathData"
    );
    expect(mockS3.send).toHaveBeenCalledWith(expect.any(PutObjectCommand));
    expect(result).toBe(true);
  });

  it('copyItemToNewBucket should throw an error if PutObjectCommand fails', async () => {
    const mockError = new Error('PutObject Failed');
    mockS3Client.send.mockRejectedValue(mockError); // Mock PutObjectCommand rejecting

    await expect(copyItemToNewBucket(mockS3Client, mockNewBucket, mockNewImageUrl, mockPath)).rejects.toThrow(mockError); // Assert that the function throws the same error
    expect(mockS3Client.send).toHaveBeenCalledTimes(1);
    expect(mockS3Client.send).toHaveBeenCalledWith(expect.any(PutObjectCommand)); // Check command used
  });

  it('copyItemToNewBucket should return true when PutObjectCommand succeeds', async () => {
    mockS3Client.send.mockResolvedValue({}); // Mock PutObjectCommand resolving successfully
    const result = await copyItemToNewBucket(mockS3Client, mockNewBucket, mockNewImageUrl, mockPath);
    expect(result).toBe(true);
    expect(mockS3Client.send).toHaveBeenCalledTimes(1);
    expect(mockS3Client.send).toHaveBeenCalledWith(expect.any(PutObjectCommand));
  });
});
