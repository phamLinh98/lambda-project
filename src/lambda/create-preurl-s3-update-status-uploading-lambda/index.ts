// import { getInstanceDynamoDB } from "../../db/config";
// import { updateTableInDynamoDB } from "../create-update-detele-search-dynamo-sqs-s3/connectAndUpdateDynamoDb";
// import { getSecretOfKey } from "../get-secret-key-from-manager";
// import {
//   connectToS3Bucket,
//   createPreUrlUpdateS3,
// } from "../create-update-detele-search-dynamo-sqs-s3/connectAndUpdateS3";

// LocalStack
// import { getSecretOfKey } from "../../../localstack/mock-secret-key";
// import { connectToS3Bucket } from '../../../localstack/mock-s3';
// import { getInstanceDynamoDB, updateTableInDynamoDB } from "../../../localstack/mock-dynamo-db";
import { getInstanceDynamoDB } from "../../../mock-aws/mock-db";
import { connectToS3Bucket } from "../../../mock-aws/mock-s3";
import { getSecretOfKey } from "../../../mock-aws/mock-secret";
import { updateTableInDynamoDB } from "../create-update-detele-search-dynamo-sqs-s3/connectAndUpdateDynamoDb";
import { createPreUrlUpdateS3 } from "../create-update-detele-search-dynamo-sqs-s3/connectAndUpdateS3";

export const handler = async (event: any) => {
  try {
    console.log("🔍 Check/find error point 1");
    console.log("event", event);
    // 4.1 Lấy bucketName bucketCsvName
    const bucketName = (await getSecretOfKey("bucketCsvName")) as any;

    // 4.2 Lấy tên bảng uploadCsvTableName
    const uploadCsvTable = (await getSecretOfKey("uploadCsvTableName")) as any;
    console.log("🔍 Check/find error point 2");
    const s3Client = await connectToS3Bucket();
    const dynamoDB = await getInstanceDynamoDB();

    console.log("BEBUG #22556(1):");
    // 4.3 Tạo hàm generateUUID để tạo ra một UUID duy nhất
    const generateUUID = () => {
      console.log("BEBUG #22556(2):");
      const result = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(
        /[xy]/g,
        function (c) {
          console.log("BEBUG #22556(2.1):", c);
          const r = (Math.random() * 16) | 0;
          console.log("BEBUG #22556(2.2):", r);
          const v = c === "x" ? r : (r & 0x3) | 0x8;
          console.log("BEBUG #22556(2.3):", v);
          return v.toString(16);
        }
      );
      console.log("BEBUG #22556(2.4):", result);
      return result;
    };

    // 4.4 Tạo tên tệp bằng UUID với hàm generateUUID
    const fileName = generateUUID();
    console.log("BEBUG #22556(3):", fileName);

    console.log("🔍 Check/find error point 3");

    // 4.5 Cập nhật trạng thái của bảng DynamoDB thành "Uploading"
    await updateTableInDynamoDB(
      dynamoDB,
      uploadCsvTable,
      fileName,
      "Uploading"
    );

    // 4.6 Tạo tên tệp CSV để lưu vào S3 bucket với format "csv/{fileName}.csv"
    const nameCsvSaveIntoS3Bucket = "csv/" + fileName + ".csv";

    // 4.7 Đặt thời gian hết hạn của URL đã ký là 3600 giây (1 giờ)
    const timeExpired = 3600;

    // 4.8 Tạo Pre-signed URL để cập nhật tệp CSV vào S3 bucket
    console.log("🔍 Check/find error point 4");
    const data = await createPreUrlUpdateS3(
      s3Client,
      bucketName,
      nameCsvSaveIntoS3Bucket,
      timeExpired,
      fileName
    );

    console.log("🔍 Check/find error point 5");
    // // 4.9 Trả về Pre-signed URL đã tạo
    return data;
  } catch (error) {
    console.error("Call Lambda Fail");
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Call Lambda PreURL fail" }),
    };
  }
};
