import type { NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function proxy(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/projects/:path*",
    "/settings/:path*",
    "/api/proposal/:path*",
  ],
};

