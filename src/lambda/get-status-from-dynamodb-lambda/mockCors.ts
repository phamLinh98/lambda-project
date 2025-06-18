// cors.ts
export const addCorsHeaders = (response: any) => ({
      ...response,
      headers: {
        "Access-Control-Allow-Origin": "*",
      },
    });
    