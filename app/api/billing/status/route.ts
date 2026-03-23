import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabaseServer";
import { hasPaidAccess, isAdminRole } from "@/lib/subscription";

export async function GET() {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [{ data: profile }, { data: billing }] = await Promise.all([
    supabase
      .from("profiles")
      .select("id, role")
      .eq("id", user.id)
      .maybeSingle(),
    supabase
      .from("billing_profiles")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle(),
  ]);

  const isAdmin = isAdminRole(profile?.role);
  const accessAllowed = isAdmin || hasPaidAccess(billing?.subscription_status);

  return NextResponse.json({
    profile: profile ?? null,
    billing: billing ?? null,
    isAdmin,
    accessAllowed,
  });
}

