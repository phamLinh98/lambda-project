//import { handler } from "../src/lambda/get-status-from-dynamodb-lambda";
import { handler } from "../src/lambda/create-preurl-s3-update-status-uploading-lambda";

(async () => {
  const event = {
    queryStringParameters: {
      id: "123"
    },
    Records: [
      {
        receiptHandle: "VALID_RECEIPT_HANDLE_FROM_RECEIVE_MESSAGE",
        s3: {
          bucket: {
            name: "1fab83f3-5260-43d7-afb2-f33cc596896c "
          },
          object: {
            key: "1fab83f3-5260-43d7-afb2-f33cc596896c.csv"
          }
        },
        body: JSON.stringify({
          fileId: "1fab83f3-5260-43d7-afb2-f33cc596896c"
        }),
      }
    ],
  };

  const result = await handler(event);
  console.log("🔍 Lambda result:", result);
})();