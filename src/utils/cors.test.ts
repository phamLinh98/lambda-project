import { addCorsHeaders } from "./cors";

describe("addCorsHeaders", () => {
  afterEach(() => {
    // reset env
    delete process.env.CORS_ORIGIN;
  });

  it("should add default CORS headers when no CORS_ORIGIN is set", () => {
    const originalResponse = {
      statusCode: 200,
      body: "Hello World",
    };
    const expectedHeaders = {
      "Access-Control-Allow-Origin": "http://localhost:5173",
      "Access-Control-Allow-Headers": "Content-Type,Authorization,X-Api-Key",
      "Access-Control-Allow-Methods": "OPTIONS,GET,POST,PUT,DELETE",
      "Access-Control-Allow-Credentials": "true",
    };

    const modifiedResponse = addCorsHeaders(originalResponse);

    expect(modifiedResponse).toMatchObject({
      statusCode: 200,
      body: "Hello World",
      headers: expectedHeaders,
    });
  });

  it("should use CORS_ORIGIN from environment if set", () => {
    process.env.CORS_ORIGIN = "https://example.com";

    const originalResponse = {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
      },
    };

    const modifiedResponse = addCorsHeaders(originalResponse);
    expect(modifiedResponse.headers["Access-Control-Allow-Origin"]).toBe(
      "https://example.com"
    );
  });

  it("should preserve existing headers", () => {
    const originalResponse = {
      statusCode: 200,
      headers: {
        "X-Custom-Header": "custom",
      },
    };
    const modifiedResponse = addCorsHeaders(originalResponse);
    expect(modifiedResponse.headers["X-Custom-Header"]).toBe("custom");
  });
});
