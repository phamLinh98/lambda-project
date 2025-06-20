// connectToS3.ts
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
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

// export const createPreUrlUpdateS3 = async (s3Client: any, bucketName: any, nameCsvSaveIntoS3Bucket: any, expiration: any, fileName: any) => {
//   try {
//       const command = new PutObjectCommand({
//           Bucket: bucketName,
//           Key: nameCsvSaveIntoS3Bucket,
//           ContentType: 'text/csv',
//       });
//       const presignedUrl = await getSignedUrl(s3Client, command, { expiresIn: expiration });

//       // Debug 4
//       console.log('4. presignedUrl:', presignedUrl);

//       return addCorsHeaders({
//           statusCode: 200,
//           body: JSON.stringify({
//               presignedUrl,
//               id: fileName,
//           }),
//       });
//   } catch (err) {
//       return {
//           statusCode: 500,
//           body: JSON.stringify({ error: 'Đã xảy ra lỗi khi tạo presigned URL' }),
//       };
//   }
// }
