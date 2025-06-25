import { addCorsHeaders } from "../../utils/cors";
import { connectToDynamoDb, updateTableInDynamoDB } from "../create-update-detele-search-dynamo-sqs-s3/connectAndUpdateDynamoDb";
import { connectToSQS, createNewSQSQueue, getAnSpecificItemFromListSQS, sendNewMessageToSQS } from "../create-update-detele-search-dynamo-sqs-s3/connectAndUpdateSQS";
import { getSecretOfKey } from "../get-secret-key-from-manager";

// localStack
// import { addCorsHeaders, connectToDynamoDb, getSecretOfKey } from "../../../localstack/mock-path";
// import { createNewSQSQueue } from "../create-update-detele-search-dynamo-sqs-s3/connectAndUpdateSQS";
// import { updateTableInDynamoDB } from "../create-update-detele-search-dynamo-sqs-s3/connectAndUpdateDynamoDb";
// import { connectToSQS, getAnSpecificItemFromListSQS, sendNewMessageToSQS } from '../../../localstack/mock-sqs';

// Mock by nodejs
// import { connectToDynamoDb } from "../../../mock-aws/mock-db";
// import { getSecretOfKey } from "../../../mock-aws/mock-secret";
// import { connectToSQS } from "../../../mock-aws/mock-sqs";
// import { updateTableInDynamoDB } from "../create-update-detele-search-dynamo-sqs-s3/connectAndUpdateDynamoDb";
// import { createNewSQSQueue, getAnSpecificItemFromListSQS, sendNewMessageToSQS } from "../create-update-detele-search-dynamo-sqs-s3/connectAndUpdateSQS";
// import { addCorsHeaders } from "../../utils/cors";

// Mock by nodejs
export const handler = async (event:any) => {
      try {
            // Get the secret key from AWS Secrets Manager
            const uploadCsvTable = await getSecretOfKey("uploadCsvTableName");
            const sqsName = await getSecretOfKey("sqsName");
            const prefixQueueUrl = await getSecretOfKey("prefixQueueURL");

            // Connect to DynamoDB and SQS
            const dynamoDb = await connectToDynamoDb();
            const sqsClient = await connectToSQS();

            // Get the bucket name and file name from the S3 event
            const bucketName = event.Records[0].s3.bucket.name;
            const fileNameSavedInS3CsvBucket = event.Records[0].s3.object.key;

            // if Not CSV file, exit
            if (!fileNameSavedInS3CsvBucket.endsWith('.csv')) {
                  return {
                        statusCode: 500,
                        body: JSON.stringify({ message: 'Not a CSV file.  No action taken.' }),
                  };
            }

            // Get the file name without the path and extension
            const fileId = fileNameSavedInS3CsvBucket.split('/').pop().split('.')[0];

            //Update the status in DynamoDB tobe 'Uploaded'
            await updateTableInDynamoDB(dynamoDb, uploadCsvTable, fileId, 'Uploaded');

            // // Check SQS Queue is Exist or Not
            const checkItemSpecificItemInSQSList = await getAnSpecificItemFromListSQS(sqsClient);
            const exitstingQueueUrl = checkItemSpecificItemInSQSList.QueueUrls || [];
            const queueExists = exitstingQueueUrl.some((queueUrl: string) => queueUrl.endsWith(`/${sqsName}`));

            // If the queue does not exist, create it
            if (!queueExists) {
                  // Create a new SQS queue
                  await createNewSQSQueue(sqsClient, sqsName);
            }

            // Send a new message to the SQS queue
            const queryUrl = prefixQueueUrl + sqsName;
            const sqsParams = {
                  QueueUrl: queryUrl, // chỉ định hàng đợi nào nhận message
                  MessageBody: JSON.stringify({ fileId }), // nội dung message
            };

            await sendNewMessageToSQS(sqsClient, sqsParams);

            return addCorsHeaders({
                  statusCode: 200,
                  body: JSON.stringify({ message: 'Message sent to SQS successfully.' }),
            })

      } catch (error) {
            // console.error('Error in handler:', error);
            return {
                  statusCode: 500,
                  body: JSON.stringify({ message: 'Cannot Call this lambda' }),
            }
      }

}