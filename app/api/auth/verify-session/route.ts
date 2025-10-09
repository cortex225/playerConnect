import { NextResponse } from "next/server";
import { toNextJsHandler } from "better-auth/next-js";

import { auth } from "@/lib/auth";

const handler = auth.handler;
export const { GET } = toNextJsHandler(handler);
