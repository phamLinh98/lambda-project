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

  beforeEach(() => {
    mockS3 = new S3Client({ region: "ap-northeast-1" });
    (mockS3.send as jest.Mock).mockReset();
    (getSignedUrl as jest.Mock).mockReset();
    (addCorsHeaders as jest.Mock).mockImplementation((res) => res);
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
});
