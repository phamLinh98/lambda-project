import { getInstanceDynamoDB } from "../../db/config";
import { updateTableInDynamoDB } from "../create-update-detele-search-dynamo-sqs-s3/connectAndUpdateDynamoDb";
import {
  connectToS3Bucket,
  createPreUrlUpdateS3,
} from "../create-update-detele-search-dynamo-sqs-s3/connectAndUpdateS3";
import { getSecretOfKey } from "../get-secret-key-from-manager";

export const handler = async (event: any) => {
  try {
    console.log('event', event);
    // 4.1 Lấy bucketName bucketCsvName
    const bucketName = (await getSecretOfKey("bucketCsvName")) as any;

    // 4.2 Lấy tên bảng uploadCsvTableName
    const uploadCsvTable = (await getSecretOfKey("UploadCsvTableName")) as any;
    const s3Client = await connectToS3Bucket();
    const dynamoDB = await getInstanceDynamoDB();

    // 4.3 Tạo hàm generateUUID để tạo ra một UUID duy nhất
    const generateUUID = () => {
      return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(
        /[xy]/g,
        function (c) {
          const r = (Math.random() * 16) | 0;
          const v = c === "x" ? r : (r & 0x3) | 0x8;
          return v.toString(16);
        }
      );
    };

    // 4.4 Tạo tên tệp bằng UUID với hàm generateUUID
    const fileName = generateUUID();

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
    const data = await createPreUrlUpdateS3(
      s3Client,
      bucketName,
      nameCsvSaveIntoS3Bucket,
      timeExpired,
      fileName
    );

    // 4.9 Trả về Pre-signed URL đã tạo
    return data;
  } catch (error) {
    // console.error("Call Lambda Fail");
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Call Lambda PreURL fail" }),
    };
  }
};
