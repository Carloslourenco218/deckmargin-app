import Link from "next/link";

const includedItems = [
  "Framing",
  "Decking",
  "Railing",
  "Stairs",
  "Footings",
  "Labor",
  "Overhead",
  "Markup / target margin",
  "Fascia / trim",
  "Demolition / tear-out",
  "Permit allowance",
  "Custom line items",
];

const comparisonSpreadsheets = [
  "Easy to forget line items",
  "Slow to update",
  "Hard to standardize across jobs",
  "Margin isn’t always obvious",
  "Proposals require extra work",
];

const comparisonDeckMargin = [
  "Built for deck estimating workflows",
  "Reusable pricing assumptions",
  "Faster quote turnaround",
  "Margin visibility built in",
  "Proposal generation in the same workflow",
];

// ✅ TESTIMONIALS ADDED
const testimonials = [
  {
    name: "Mario",
    role: "Deck Contractor",
    quote:
      "DeckMargin is definitely quicker than spreadsheets and old quotes. The biggest thing for me is seeing the profit breakdown clearly before I send a price.",
  },
  {
    name: "Brian",
    role: "Deck Builder",
    quote:
      "This helped me tighten up my numbers and stop relying only on gut feel. I like how clearly it breaks down materials, labor, and profit.",
  },
  {
    name: "Antonio",
    role: "Small Crew Owner",
    quote:
      "DeckMargin helped us standardize quoting and keep pricing more consistent across jobs. It makes it easier to know we’re covering costs and hitting the margins we want.",
  },
];

function SectionHeading({
  eyebrow,
  title,
  description,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
}) {
  return (
    <div className="mx-auto mb-12 max-w-3xl text-center">
      {eyebrow && (
        <div className="mb-3 text-sm font-medium uppercase tracking-[0.18em] text-blue-400">
          {eyebrow}
        </div>
      )}
      <h2 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
        {title}
      </h2>
      {description && (
        <p className="mt-4 text-base leading-7 text-gray-400 sm:text-lg">
          {description}
        </p>
      )}
    </div>
  );
}

function PrimaryButton({ href, children }: any) {
  return (
    <Link
      href={href}
      className="inline-flex items-center justify-center rounded-xl bg-blue-500 px-5 py-3 text-sm font-medium text-white hover:bg-blue-600"
    >
      {children}
    </Link>
  );
}

function SecondaryButton({ href, children }: any) {
  return (
    <Link
      href={href}
      className="inline-flex items-center justify-center rounded-xl border border-white/15 bg-white/5 px-5 py-3 text-sm font-medium text-white hover:bg-white/10"
    >
      {children}
    </Link>
  );
}

function CheckItem({ children }: any) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-1 h-2.5 w-2.5 rounded-full bg-blue-400" />
      <span className="text-sm text-gray-300">{children}</span>
    </div>
  );
}

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#0b0d12] text-white">

      {/* HERO */}
      <section className="mx-auto max-w-7xl px-6 py-24">
        <h1 className="text-5xl font-semibold">
          Accurate deck estimates in minutes.
        </h1>

        <p className="mt-6 text-lg text-gray-400 max-w-2xl">
          Protect your profit with estimating software built specifically for deck contractors.
        </p>

        <div className="mt-8 flex gap-4">
          <PrimaryButton href="/signup">Start Free Trial</PrimaryButton>
          <SecondaryButton href="#how-it-works">Watch Demo</SecondaryButton>
        </div>
      </section>

      {/* FEATURES */}
      <section className="mx-auto max-w-7xl px-6 py-20">
        <SectionHeading
          title="Quote with confidence, not spreadsheets"
          description="Everything you need to estimate, price, and send proposals."
        />

        <div className="grid gap-6 lg:grid-cols-3">
          {[
            "Build estimates faster",
            "See profit before sending quotes",
            "Send professional proposals",
          ].map((item) => (
            <div key={item} className="p-6 border border-white/10 rounded-xl">
              {item}
            </div>
          ))}
        </div>
      </section>

      {/* TESTIMONIALS (NEW) */}
      <section className="mx-auto max-w-7xl px-6 py-20">
        <SectionHeading
          eyebrow="Trusted by contractors"
          title="Real builders using DeckMargin"
          description="Contractors use DeckMargin to estimate faster, quote confidently, and protect margin."
        />

        <div className="grid gap-6 lg:grid-cols-3">
          {testimonials.map((item) => (
            <div key={item.name} className="p-6 border border-white/10 rounded-xl">
              <p className="text-gray-300">“{item.quote}”</p>
              <div className="mt-4">
                <div className="text-white font-medium">{item.name}</div>
                <div className="text-gray-500 text-sm">{item.role}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* PRICING */}
      <section className="mx-auto max-w-7xl px-6 py-20">
        <SectionHeading title="Simple pricing" />

        <div className="border p-8 rounded-xl">
          <div className="text-3xl">$100/month</div>
          <div className="text-gray-400 mt-2">14-day free trial</div>

          <div className="mt-6">
            <PrimaryButton href="/signup">Start Free Trial</PrimaryButton>
          </div>
        </div>
      </section>

    </main>
  );
}

