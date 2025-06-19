import { handler } from "../src/lambda/get-status-from-dynamodb-lambda";

(async () => {
  const event = {
    queryStringParameters: {
      id: "abc123"
    }
  };

  const result = await handler(event);
  console.log("🔍 Lambda result:", result);
})();
