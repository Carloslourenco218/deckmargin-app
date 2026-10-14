"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabaseClient";

export default function SignupPage() {
  const supabase = useMemo(() => createClient(), []);
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [success, setSuccess] = useState("");

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErr("");
    setSuccess("");

    if (password.length < 6) {
      setErr("Password must be at least 6 characters.");
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setErr("Passwords do not match.");
      setLoading(false);
      return;
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      setErr(error.message);
      setLoading(false);
      return;
    }

    // If Supabase requires email confirmation, session may be null.
    // If confirmation is off, they may be signed in immediately.
    if (data.session) {
      router.refresh();
      router.push("/billing");
      return;
    }

    setSuccess(
      "Account created. Check your email to confirm your account, then log in."
    );
    setLoading(false);
  }

  return (
    <main className="min-h-screen bg-[#FAFAF8] text-[#1D2C4B] flex items-center justify-center p-6">
      <div className="w-full max-w-md rounded-2xl border border-[#E7E5E0] bg-white p-8">
        <h1 className="text-3xl font-semibold mb-2 text-[#1D2C4B]">Create Account</h1>
        <p className="text-[#6B7280] mb-6">
          Start your DeckMargin account and continue to billing.
        </p>

        {err ? (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {err}
          </div>
        ) : null}

        {success ? (
          <div className="mb-4 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
            {success}
          </div>
        ) : null}

        <form onSubmit={handleSignup} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm text-[#6B7280]">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full rounded-lg border border-[#E7E5E0] bg-white px-3 py-2 text-[#2A2E36] outline-none focus:border-[#1D2C4B]"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm text-[#6B7280]">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full rounded-lg border border-[#E7E5E0] bg-white px-3 py-2 text-[#2A2E36] outline-none focus:border-[#1D2C4B]"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm text-[#6B7280]">
              Confirm Password
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="w-full rounded-lg border border-[#E7E5E0] bg-white px-3 py-2 text-[#2A2E36] outline-none focus:border-[#1D2C4B]"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-[#FBB944] px-4 py-2 text-[#1D2C4B] font-bold hover:bg-[#E8A730] disabled:opacity-60"
          >
            {loading ? "Creating account..." : "Create Account"}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-[#6B7280] space-y-2">
          <div>
            Already have an account?{" "}
            <Link href="/login" className="text-[#1D2C4B] font-medium hover:underline">
              Log in
            </Link>
          </div>

          <div>
            <Link href="/" className="hover:text-[#1D2C4B]">
              Back to home
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
