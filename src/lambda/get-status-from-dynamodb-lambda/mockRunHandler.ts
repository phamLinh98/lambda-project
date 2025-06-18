import { handler } from "./index"; // hoặc đổi thành tên file handler thực tế nếu khác

(async () => {
  const event = {
    queryStringParameters: {
      id: "abc123"
    }
  };

  const result = await handler(event);
  console.log("🔍 Lambda result:", result);
})();
