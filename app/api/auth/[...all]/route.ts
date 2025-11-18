import { toNextJsHandler } from "better-auth/next-js";
import { NextRequest, NextResponse } from "next/server";

import { auth } from "@/lib/auth"; // path to your auth file

// Create handlers with error handling and logging
const handlers = toNextJsHandler(auth);

/**
 * POST handler with comprehensive error logging
 * Handles all Better Auth POST requests (sign-in, sign-up, etc.)
 */
export async function POST(request: NextRequest) {
  try {
    console.log(`[Auth API] POST ${request.url}`);
    const response = await handlers.POST(request);

    // Log unsuccessful responses
    if (response.status >= 400) {
      const body = await response.clone().text();
      console.error(`[Auth API] POST failed with status ${response.status}:`, {
        url: request.url,
        status: response.status,
        body: body.substring(0, 500), // Log first 500 chars
      });
    }

    return response;
  } catch (error) {
    console.error("[Auth API] POST error:", {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      url: request.url,
    });

    // Return a user-friendly error response
    return NextResponse.json(
      {
        error: "internal_server_error",
        message: "Une erreur s'est produite lors de la connexion. Veuillez réessayer.",
        details: process.env.NODE_ENV === "development"
          ? error instanceof Error ? error.message : String(error)
          : undefined,
      },
      { status: 500 }
    );
  }
}

/**
 * GET handler with comprehensive error logging
 * Handles all Better Auth GET requests (session, callback, etc.)
 */
export async function GET(request: NextRequest) {
  try {
    console.log(`[Auth API] GET ${request.url}`);
    const response = await handlers.GET(request);

    // Log unsuccessful responses
    if (response.status >= 400) {
      const body = await response.clone().text();
      console.error(`[Auth API] GET failed with status ${response.status}:`, {
        url: request.url,
        status: response.status,
        body: body.substring(0, 500),
      });
    }

    return response;
  } catch (error) {
    console.error("[Auth API] GET error:", {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      url: request.url,
    });

    // Return a user-friendly error response
    return NextResponse.json(
      {
        error: "internal_server_error",
        message: "Une erreur s'est produite lors de la connexion. Veuillez réessayer.",
        details: process.env.NODE_ENV === "development"
          ? error instanceof Error ? error.message : String(error)
          : undefined,
      },
      { status: 500 }
    );
  }
}
