// connectToS3.ts
import { S3Client } from "@aws-sdk/client-s3";
import { addCorsHeaders } from "./mock-cors";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner/dist-types";

export const connectToS3Bucket = async() => {
  const s3 = new S3Client({
    region: "us-east-1",
    endpoint: "http://localhost:4566",
    forcePathStyle: true, // bắt buộc khi dùng LocalStack
    credentials: {
      accessKeyId: "test",
      secretAccessKey: "test",
    },
  });
  return s3;
};

