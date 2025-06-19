import { handler } from "../src/lambda/get-status-from-dynamodb-lambda";
//import { handler } from "../src/lambda/create-preurl-s3-update-status-uploading-lambda";

(async () => {
  const event = {
    queryStringParameters: {
      id: "123"
    }
  };

  const result = await handler(event);
  console.log("🔍 Lambda result:", result);
})();
