import { createClient } from "@/lib/supabaseServer";

export function hasPaidAccess(status: string | null | undefined) {
  return status === "trialing" || status === "active";
}

export function isAdminRole(role: string | null | undefined) {
  return role === "admin";
}

export async function getAccessContextForCurrentUserServer() {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return {
      user: null,
      profile: null,
      billing: null,
      accessAllowed: false,
      isAdmin: false,
    };
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

  const admin = isAdminRole(profile?.role);
  const paid = hasPaidAccess(billing?.subscription_status);
  const accessAllowed = admin || paid;

  return {
    user,
    profile: profile ?? null,
    billing: billing ?? null,
    accessAllowed,
    isAdmin: admin,
  };
}

