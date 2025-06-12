import { getInstanceDynamoDB } from "../../db/config";
import { updateTableInDynamoDB } from "../create-update-detele-search-dynamo-sqs-s3/connectAndUpdateDynamoDb";
import {
  connectToS3Bucket,
  createPreUrlUpdateS3,
} from "../create-update-detele-search-dynamo-sqs-s3/connectAndUpdateS3";
import { getSecretOfKey } from "../get-secret-key-from-manager";

export const handler = async (event: any) => {
  try {
    const bucketName = (await getSecretOfKey("bucketCsvName")) as any;
    const uploadCsvTable = (await getSecretOfKey("uploadCsvTableName")) as any;
    const s3Client = await connectToS3Bucket();
    const dynamoDB = await getInstanceDynamoDB();

    // Create a random UUID
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

    const fileName = generateUUID();

    // Update Table 'Upload-csv' In DynamoDB tobe 'Uploading'
    await updateTableInDynamoDB(
      dynamoDB,
      uploadCsvTable,
      fileName,
      "Uploading"
    );

    // Set name csv saved in S3 bucket
    const nameCsvSaveIntoS3Bucket = "csv/" + fileName + ".csv";

    // Set the time expired for the presigned URL
    const timeExpired = 3600;

    // Create new Presigned URL to Access S3 bucket
    const data = await createPreUrlUpdateS3(
      s3Client,
      bucketName,
      nameCsvSaveIntoS3Bucket,
      timeExpired,
      fileName
    );

    // trong Jest lý do gán ngay url cho hàm createPreUrlUpdateS3 , đúng ra nếu chuẩn phải dùng data cho 1 step nữa mới hợp lý
    // nhưng ở trường hợp data này đã xong việc của lambda rồi nên việc mock dữ liệu cho hàm createPreUrlUpdateS3 có thể nói là ko cần thiết
    return data;
  } catch (error) {
    // console.error("Call Lambda Fail");
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Call Lambda PreURL fail" }),
    };
  }
};
