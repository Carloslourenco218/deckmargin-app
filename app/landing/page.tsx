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

const proofBullets = [
  "Designed specifically for deck estimating, not general contracting",
  "Built to help small deck builders quote faster and protect margin",
  "Focused on real pricing inputs contractors use every week",
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
      {eyebrow ? (
        <div className="mb-3 text-sm font-medium uppercase tracking-[0.18em] text-blue-400">
          {eyebrow}
        </div>
      ) : null}
      <h2 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
        {title}
      </h2>
      {description ? (
        <p className="mt-4 text-base leading-7 text-gray-400 sm:text-lg">
          {description}
        </p>
      ) : null}
    </div>
  );
}

function PrimaryButton({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="inline-flex items-center justify-center rounded-xl bg-blue-500 px-5 py-3 text-sm font-medium text-white transition hover:bg-blue-600"
    >
      {children}
    </Link>
  );
}

function SecondaryButton({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="inline-flex items-center justify-center rounded-xl border border-white/15 bg-white/5 px-5 py-3 text-sm font-medium text-white transition hover:bg-white/10"
    >
      {children}
    </Link>
  );
}
function CheckItem({ children }: { children: React.ReactNode }) {
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
      <header className="sticky top-0 z-50 border-b border-white/8 bg-[#0b0d12]/85 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-8">
          <Link href="/" className="text-xl font-semibold tracking-tight text-white">
            DeckMargin
          </Link>

          <div className="hidden items-center gap-6 md:flex">
            <Link
              href="#how-it-works"
              className="text-sm text-gray-300 transition hover:text-white"
            >
              See How It Works
            </Link>
            <Link
              href="/login"
              className="text-sm text-gray-400 transition hover:text-white"
            >
              Login
            </Link>
            <PrimaryButton href="/signup">Start Free 14-Day Trial</PrimaryButton>
          </div>

          <div className="flex items-center gap-3 md:hidden">
            <Link href="/login" className="text-sm text-gray-400">
              Login
            </Link>
            <PrimaryButton href="/signup">Start Trial</PrimaryButton>
          </div>
        </div>
      </header>

      <section className="relative overflow-hidden border-b border-white/8">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.22),transparent_28%),radial-gradient(circle_at_85%_20%,rgba(59,130,246,0.14),transparent_24%)]" />
        <div className="relative mx-auto grid max-w-7xl gap-14 px-6 py-20 lg:grid-cols-[1.05fr_.95fr] lg:items-center lg:px-8 lg:py-24">
          <div>
            <div className="mb-5 inline-flex rounded-full border border-blue-400/20 bg-blue-400/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.16em] text-blue-300">
              Built for deck contractors
            </div>

            <h1 className="max-w-3xl text-4xl font-semibold leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl">
              Accurate deck estimates in minutes.
            </h1>

            <p className="mt-5 max-w-2xl text-lg leading-8 text-gray-300">
              Protect your profit with estimating software built specifically for
              deck contractors.
            </p>

            <p className="mt-4 max-w-2xl text-base leading-7 text-gray-400">
              DeckMargin helps small deck builders calculate costs, catch missed
              line items, hit target margins, and send professional proposals
              without relying on spreadsheets.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <PrimaryButton href="/signup">Start Free 14-Day Trial</PrimaryButton>
              <SecondaryButton href="#how-it-works">Watch Demo</SecondaryButton>
            </div>

            <div className="mt-8 grid max-w-xl gap-3 sm:grid-cols-1">
              <CheckItem>Built for deck contractors</CheckItem>
              <CheckItem>
                Includes labor, materials, overhead, and margin
              </CheckItem>
              <CheckItem>
                Create estimates and proposals in one workflow
              </CheckItem>
            </div>
          </div>

          <div className="relative">
            <div className="rounded-3xl border border-white/10 bg-[#11141b] p-4 shadow-[0_20px_80px_rgba(0,0,0,0.45)]">
              <div className="rounded-2xl border border-white/10 bg-[#0f131a] p-5">
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium text-white">
                      Estimate Summary
                    </div>
                    <div className="mt-1 text-xs text-gray-400">
                      Smith Residence • 320 sq ft
                    </div>
                  </div>
                  <div className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs font-medium text-emerald-300">
                    Margin protected
                  </div>
                </div>

                <div className="grid gap-4 lg:grid-cols-[1.05fr_.95fr]">
                  <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                    <div className="mb-3 text-xs uppercase tracking-[0.14em] text-gray-500">
                      Deck Inputs
                    </div>
                    <div className="space-y-3 text-sm">
                      {[
                        ["Deck Size", "16 ft × 20 ft"],
                        ["Material", "Trex composite"],
                        ["Railing", "Aluminum"],
                        ["Stairs", "2 sections"],
                        ["Height Tier", "Raised"],
                      ].map(([label, value]) => (
                        <div
                          key={label}
                          className="flex items-center justify-between rounded-xl border border-white/8 bg-black/20 px-3 py-2"
                        >
                          <span className="text-gray-400">{label}</span>
                          <span className="font-medium text-white">{value}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                      <div className="mb-3 text-xs uppercase tracking-[0.14em] text-gray-500">
                        Cost Breakdown
                      </div>
                      <div className="space-y-3 text-sm">
                        {[
                          ["Materials", "$12,480"],
                          ["Labor", "$7,900"],
                          ["Overhead", "$1,450"],
                          ["Total Job Cost", "$21,830"],
                        ].map(([label, value]) => (
                          <div key={label} className="flex items-center justify-between">
                            <span className="text-gray-400">{label}</span>
                            <span className="font-medium text-white">{value}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="rounded-2xl border border-blue-400/20 bg-blue-400/10 p-4">
                      <div className="mb-3 text-xs uppercase tracking-[0.14em] text-blue-200/80">
                        Margin View
                      </div>
                      <div className="flex items-end justify-between">
                        <div>
                          <div className="text-sm text-blue-100/80">
                            Final Price
                          </div>
                          <div className="mt-1 text-3xl font-semibold text-white">
                            $31,185
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-blue-100/80">Target Margin</div>
                          <div className="mt-1 text-2xl font-semibold text-white">
                            30%
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                      <div className="mb-2 text-xs uppercase tracking-[0.14em] text-gray-500">
                        Proposal Preview
                      </div>
                      <div className="rounded-xl border border-white/8 bg-black/20 p-3 text-sm text-gray-300">
                        Clean scope, client-ready pricing, branded presentation,
                        signature lines.
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-white/8 bg-[#0e1117]">
        <div className="mx-auto max-w-7xl px-6 py-6 lg:px-8">
          <div className="flex flex-col gap-4 text-sm text-gray-300 md:flex-row md:items-center md:justify-between">
            <div className="font-medium text-white">Built for:</div>
            <div className="flex flex-wrap gap-3">
              {[
                "Owner-operators",
                "Small deck companies",
                "Teams quoting multiple jobs per week",
                "Contractors still using spreadsheets or manual estimating",
              ].map((item) => (
                <div
                  key={item}
                  className="rounded-full border border-white/10 bg-white/5 px-4 py-2"
                >
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-20 lg:px-8">
        <SectionHeading
          eyebrow="What DeckMargin helps you do"
          title="Quote with confidence, not spreadsheets."
          description="Every part of the workflow is built around helping deck builders price jobs faster, protect margin, and present quotes professionally."
        />

        <div className="grid gap-6 lg:grid-cols-3">
          {[
            {
              title: "Build accurate estimates faster",
              body: "Use deck size, material type, stairs, railing, height, labor, and overhead to generate realistic job pricing in minutes.",
            },
            {
              title: "See your numbers before you send the quote",
              body: "View total cost, target margin, markup, and expected profit before the homeowner ever sees a price.",
            },
            {
              title: "Send professional proposals",
              body: "Generate clean, client-facing proposals that clearly explain the job and help move projects forward faster.",
            },
          ].map((card) => (
            <div
              key={card.title}
              className="rounded-3xl border border-white/10 bg-white/[0.03] p-7"
            >
              <div className="mb-4 h-11 w-11 rounded-2xl bg-blue-400/15 ring-1 ring-blue-400/20" />
              <h3 className="text-xl font-semibold text-white">{card.title}</h3>
              <p className="mt-3 text-sm leading-7 text-gray-400">{card.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="border-y border-white/8 bg-[#0e1117]">
        <div className="mx-auto max-w-7xl px-6 py-20 lg:px-8">
          <SectionHeading
            eyebrow="The cost of guessing"
            title="Why deck builders underprice jobs"
            description="Manual estimating feels manageable until one missed line item, one rushed quote, or one hidden cost wipes out the margin."
          />

          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {[
              "Estimating from memory leads to inconsistent pricing",
              "Spreadsheets make it easy to miss labor, stairs, framing, and overhead",
              "Slow quote turnaround can cost you jobs",
              "One missed cost can wipe out profit on the entire project",
            ].map((item) => (
              <div
                key={item}
                className="rounded-3xl border border-white/10 bg-[#11141b] p-6"
              >
                <div className="mb-4 h-2 w-16 rounded-full bg-blue-400" />
                <p className="text-base leading-7 text-gray-300">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="how-it-works" className="mx-auto max-w-7xl px-6 py-20 lg:px-8">
        <SectionHeading
          eyebrow="Workflow"
          title="How DeckMargin works"
          description="Set your pricing rules once, build the estimate, review margin, and generate a client-ready proposal from the same workflow."
        />

        <div className="grid gap-6 lg:grid-cols-3">
          {[
            {
              step: "01",
              title: "Save your pricing rules once",
              body: "Set your labor rates, material assumptions, overhead, and markup targets.",
            },
            {
              step: "02",
              title: "Build the estimate",
              body: "Enter deck size, materials, stairs, railing, height, and job details to calculate cost automatically.",
            },
            {
              step: "03",
              title: "Review margin and send proposal",
              body: "See cost, profit, and target margin instantly, then generate a professional proposal for the homeowner.",
            },
          ].map((item) => (
            <div
              key={item.step}
              className="rounded-3xl border border-white/10 bg-white/[0.03] p-7"
            >
              <div className="mb-5 text-sm font-medium uppercase tracking-[0.16em] text-blue-400">
                Step {item.step}
              </div>
              <h3 className="text-xl font-semibold text-white">{item.title}</h3>
              <p className="mt-3 text-sm leading-7 text-gray-400">{item.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="border-y border-white/8 bg-[#0e1117]">
        <div className="mx-auto max-w-7xl px-6 py-20 lg:px-8">
          <SectionHeading
            eyebrow="Estimate coverage"
            title="What DeckMargin helps you account for"
            description="DeckMargin is built to feel operationally real, not generic. It helps you account for the pricing inputs that actually shape job profitability."
          />

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {includedItems.map((item) => (
              <div
                key={item}
                className="rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-4 text-sm text-gray-300"
              >
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-20 lg:px-8">
        <div className="space-y-20">
          <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
            <div className="rounded-3xl border border-white/10 bg-[#11141b] p-5">
              <div className="rounded-2xl border border-white/10 bg-[#0f131a] p-5">
                <div className="mb-4 text-xs uppercase tracking-[0.16em] text-gray-500">
                  Estimate Builder
                </div>
                <div className="grid gap-3">
                  {[
                    "Deck size",
                    "Material type",
                    "Height tier",
                    "Railing",
                    "Stairs",
                    "Custom line items",
                  ].map((item) => (
                    <div
                      key={item}
                      className="rounded-xl border border-white/8 bg-black/20 px-4 py-3 text-sm text-gray-300"
                    >
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <div className="mb-3 text-sm font-medium uppercase tracking-[0.16em] text-blue-400">
                Estimate workflow
              </div>
              <h3 className="text-3xl font-semibold tracking-tight text-white">
                Estimate faster without relying on spreadsheets
              </h3>
              <p className="mt-5 text-base leading-8 text-gray-400">
                Build accurate deck estimates using real job inputs like deck
                size, materials, stairs, railing, and height tiers. No more
                piecing together old quotes or guessing from memory.
              </p>
            </div>
          </div>

          <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
            <div className="order-2 lg:order-1">
              <div className="mb-3 text-sm font-medium uppercase tracking-[0.16em] text-blue-400">
                Margin protection
              </div>
              <h3 className="text-3xl font-semibold tracking-tight text-white">
                Catch missed costs before they hit your margin
              </h3>
              <p className="mt-5 text-base leading-8 text-gray-400">
                See total job cost, markup, expected profit, and target margin
                before the quote goes out. DeckMargin helps reduce underpricing
                and gives you more confidence in every number.
              </p>
            </div>

            <div className="order-1 rounded-3xl border border-white/10 bg-[#11141b] p-5 lg:order-2">
              <div className="rounded-2xl border border-white/10 bg-[#0f131a] p-5">
                <div className="mb-4 text-xs uppercase tracking-[0.16em] text-gray-500">
                  Margin View
                </div>
                <div className="space-y-4">
                  {[
                    ["Total cost", "$21,830"],
                    ["Expected profit", "$9,355"],
                    ["Target margin", "30%"],
                    ["Final quote", "$31,185"],
                  ].map(([label, value]) => (
                    <div
                      key={label}
                      className="flex items-center justify-between rounded-xl border border-white/8 bg-black/20 px-4 py-3"
                    >
                      <span className="text-sm text-gray-400">{label}</span>
                      <span className="text-sm font-medium text-white">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
            <div className="rounded-3xl border border-white/10 bg-[#11141b] p-5">
              <div className="rounded-2xl border border-white/10 bg-[#0f131a] p-5">
                <div className="mb-4 text-xs uppercase tracking-[0.16em] text-gray-500">
                  Proposal Preview
                </div>
                <div className="rounded-2xl border border-white/8 bg-black/20 p-5">
                  <div className="mb-4 text-lg font-semibold text-white">
                    Deck Project Proposal
                  </div>
                  <div className="space-y-3 text-sm text-gray-300">
                    <div>Prepared for: Homeowner</div>
                    <div>Scope of work: Decking, railing, stairs, framing</div>
                    <div>Total investment: $31,185</div>
                    <div>Signature lines and terms included</div>
                  </div>
                </div>
              </div>
            </div>
            <div>
              <div className="mb-3 text-sm font-medium uppercase tracking-[0.16em] text-blue-400">
                Proposal workflow
              </div>
              <h3 className="text-3xl font-semibold tracking-tight text-white">
                Deliver professional quotes homeowners can understand
              </h3>
              <p className="mt-5 text-base leading-8 text-gray-400">
                Turn your estimate into a clean proposal that looks credible,
                explains the scope clearly, and helps move the sale forward
                faster.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-white/8 bg-[#0e1117]">
        <div className="mx-auto max-w-7xl px-6 py-20 lg:px-8">
          <SectionHeading
            eyebrow="Spreadsheet replacement"
            title="Why not just use a spreadsheet?"
            description="DeckMargin is built to replace disconnected quoting workflows with a standardized estimating system made for deck builders."
          />

          <div className="overflow-hidden rounded-3xl border border-white/10">
            <div className="grid md:grid-cols-2">
              <div className="border-b border-white/10 bg-[#11141b] p-8 md:border-b-0 md:border-r">
                <h3 className="text-2xl font-semibold text-white">Spreadsheets</h3>
                <div className="mt-6 space-y-4">
                  {comparisonSpreadsheets.map((item) => (
                    <div key={item} className="text-sm text-gray-400">
                      • {item}
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white/[0.03] p-8">
                <h3 className="text-2xl font-semibold text-white">DeckMargin</h3>
                <div className="mt-6 space-y-4">
                  {comparisonDeckMargin.map((item) => (
                    <div key={item} className="text-sm text-gray-300">
                      • {item}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-20 lg:px-8">
        <SectionHeading
          eyebrow="Trusted by contractors"
          title="Real builders using DeckMargin"
          description="Contractors use DeckMargin to estimate faster, quote with more confidence, and protect margin without relying on spreadsheets."
        />

        <div className="grid gap-6 lg:grid-cols-3">
          {testimonials.map((item) => (
            <div
              key={item.name}
              className="rounded-3xl border border-white/10 bg-white/[0.03] p-7"
            >
              <div className="mb-5 text-4xl leading-none text-blue-400">“</div>
              <p className="text-sm leading-7 text-gray-300">{item.quote}</p>

              <div className="mt-6 border-t border-white/10 pt-4">
                <div className="font-medium text-white">{item.name}</div>
                <div className="text-sm text-gray-500">{item.role}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="mx-auto mt-10 max-w-4xl rounded-3xl border border-white/10 bg-[#11141b] p-8 text-center">
          <p className="text-base leading-8 text-gray-300">
            DeckMargin was built to solve a simple problem: too many deck
            builders are still estimating from spreadsheets, memory, and
            disconnected tools.
          </p>
        </div>
      </section>

      <section className="border-y border-white/8 bg-[#0e1117]">
        <div className="mx-auto max-w-7xl px-6 py-20 lg:px-8">
          <SectionHeading
            eyebrow="Pricing"
            title="Simple pricing"
            description="One plan, one workflow, built specifically for deck contractors."
          />

          <div className="mx-auto max-w-xl">
            <div className="rounded-[28px] border border-blue-400/20 bg-gradient-to-b from-blue-500/12 to-white/[0.03] p-8 shadow-[0_20px_80px_rgba(0,0,0,0.35)]">
              <div className="mb-2 text-sm font-medium uppercase tracking-[0.16em] text-blue-300">
                DeckMargin
              </div>
              <div className="text-4xl font-semibold text-white">
                $99<span className="text-lg text-gray-400">/month</span>
              </div>
              <div className="mt-3 text-base text-gray-300">14-day free trial</div>
              <div className="mt-6 h-px bg-white/10" />

              <div className="mt-6 space-y-3">
                {[
                  "Full estimating workflow",
                  "Margin and profit visibility",
                  "Proposal generation",
                  "Saved pricing inputs",
                  "Cancel anytime",
                  "Built specifically for deck contractors",
                ].map((item) => (
                  <CheckItem key={item}>{item}</CheckItem>
                ))}
              </div>

              <div className="mt-8">
                <PrimaryButton href="/signup">Start Free Trial</PrimaryButton>
              </div>

              <p className="mt-4 text-sm text-gray-400">
                Need help getting set up?{" "}
                <a href="mailto:Carlos.lourenco@deckmargin.com" className="text-white hover:underline">
                  Contact us
                </a>
                .
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-20 lg:px-8">
        <div className="rounded-[32px] border border-white/10 bg-[#11141b] px-8 py-14 text-center sm:px-12">
          <h2 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            Start building more accurate deck estimates today
          </h2>
          <p className="mx-auto mt-4 max-w-3xl text-base leading-8 text-gray-400 sm:text-lg">
            Try DeckMargin free for 14 days and see your costs, margin, and
            proposal workflow in one place.
          </p>

          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <PrimaryButton href="/signup">Start Free Trial</PrimaryButton>
            <SecondaryButton href="#how-it-works">Watch Demo</SecondaryButton>
          </div>

          <p className="mt-5 text-sm text-gray-500">
            No long-term contract. Cancel anytime.
          </p>
        </div>
      </section>
    </main>
  );
}