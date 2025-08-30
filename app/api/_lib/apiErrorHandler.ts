import { NextRequest, NextResponse } from "next/server";

type ApiHandler = (request: NextRequest, params?: any) => Promise<NextResponse>;

export function withErrorHandler(handler: ApiHandler): ApiHandler {
  return async (request: NextRequest, params?: any) => {
    try {
      return await handler(request, params);
    } catch (error) {
      // In a real production app, you'd log this to a service like Sentry, Datadog, etc.
      console.error("Unhandled API Error:", error);

      // You can also check for specific error types here if needed
      // For example: if (error instanceof CustomError) { ... }

      return NextResponse.json(
        { error: "An internal server error occurred" },
        { status: 500 }
      );
    }
  };
}
