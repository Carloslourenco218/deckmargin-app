import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const ACTIVE_STATUSES = new Set(["trialing", "active"]);

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          response.cookies.set({
            name,
            value,
            ...options,
          });
        },
        remove(name: string, options: CookieOptions) {
          response.cookies.set({
            name,
            value: "",
            ...options,
          });
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  const billingExemptPaths = [
    "/login",
    "/signup",
    "/billing",
    "/api/stripe/checkout",
    "/api/stripe/portal",
    "/api/stripe/webhook",
  ];

  if (!user) {
    if (
      pathname.startsWith("/dashboard") ||
      pathname.startsWith("/projects") ||
      pathname.startsWith("/settings")
    ) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      return NextResponse.redirect(url);
    }

    return response;
  }

  const shouldCheckBilling =
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/projects") ||
    pathname.startsWith("/settings") ||
    pathname.startsWith("/api/proposal");

  const isBillingExempt = billingExemptPaths.some((p) =>
    pathname.startsWith(p)
  );

  if (shouldCheckBilling && !isBillingExempt) {
    const { data: billing } = await supabase
      .from("billing_profiles")
      .select("subscription_status")
      .eq("user_id", user.id)
      .maybeSingle();

    const status = billing?.subscription_status ?? null;

    if (!status || !ACTIVE_STATUSES.has(status)) {
      const url = request.nextUrl.clone();
      url.pathname = "/billing";
      return NextResponse.redirect(url);
    }
  }

  return response;
}


