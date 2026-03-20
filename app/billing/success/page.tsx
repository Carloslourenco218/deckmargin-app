import Link from "next/link";

export default function BillingSuccessPage() {
  return (
    <main className="min-h-screen bg-[#0e0e10] p-10 text-white">
      <div className="mx-auto max-w-2xl rounded-2xl border border-white/10 bg-white/5 p-8">
        <h1 className="text-3xl font-semibold">Trial Started</h1>
        <p className="mt-3 text-gray-400">
          Your DeckMargin subscription is being activated. If the dashboard
          doesn’t unlock immediately, give it a few seconds and refresh.
        </p>

        <div className="mt-6">
          <Link
            href="/dashboard"
            className="rounded bg-white px-5 py-3 text-black hover:bg-white/90"
          >
            Go to Dashboard
          </Link>
        </div>
      </div>
    </main>
  );
}

