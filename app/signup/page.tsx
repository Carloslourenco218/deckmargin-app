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
    <main className="min-h-screen bg-[#0e0e10] text-white flex items-center justify-center p-6">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-white/5 p-8">
        <h1 className="text-3xl font-semibold mb-2">Create Account</h1>
        <p className="text-gray-400 mb-6">
          Start your DeckMargin account and continue to billing.
        </p>

        {err ? (
          <div className="mb-4 rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            {err}
          </div>
        ) : null}

        {success ? (
          <div className="mb-4 rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
            {success}
          </div>
        ) : null}

        <form onSubmit={handleSignup} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm text-gray-300">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full rounded-lg border border-white/10 bg-[#111827] px-3 py-2 text-white outline-none"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm text-gray-300">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full rounded-lg border border-white/10 bg-[#111827] px-3 py-2 text-white outline-none"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm text-gray-300">
              Confirm Password
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="w-full rounded-lg border border-white/10 bg-[#111827] px-3 py-2 text-white outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 disabled:opacity-60"
          >
            {loading ? "Creating account..." : "Create Account"}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-400 space-y-2">
          <div>
            Already have an account?{" "}
            <Link href="/login" className="text-white hover:underline">
              Log in
            </Link>
          </div>

          <div>
            <Link href="/" className="hover:text-white">
              Back to home
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}

