import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Deck Builder Overhead: How to Find Your Real Number | DeckMargin",
  description:
    "Overhead isn't a flat percentage, it's a number specific to your business. Here's how to work out your own overhead-per-job number before you price the next deck.",
};

export default function DeckBuilderOverhead() {
  return (
    <article className="rs-article">
      <div className="rs-breadcrumb">
        <a href="/resources">Resources</a>
        <span>›</span>
        <span>Overhead</span>
      </div>

      <header className="rs-article-header">
        <h1>Deck Builder Overhead: How to Find Your Real Number</h1>
        <div className="rs-article-meta">
          <span>DeckMargin</span>
          <span>·</span>
          <span>Pricing</span>
        </div>
      </header>

      <div className="rs-body">
        <h2>Direct Job Costs vs. Overhead</h2>
        <p>
          Materials, labor, equipment, permits, and engineering are direct job costs, they&apos;re
          tied to this specific deck. Overhead is different: it&apos;s the indirect cost of running
          the business at all, the truck payment, insurance, the office, the software, whatever
          keeps the lights on regardless of which job is on the schedule this week. A job cost that
          only counts the direct costs is missing a real piece of what that job actually costs you
          to run.
        </p>

        <h2>Why &ldquo;Overhead Is Typically X%&rdquo; Is a Myth</h2>
        <p>
          There&apos;s no verified, universal overhead percentage for deck builders, and any number
          presented as one is a guess dressed up as a benchmark. Overhead depends on your specific
          business: how many jobs you run in a year, what your fixed costs actually are, how big
          your crew is. A one-person operation and a five-crew company do not carry the same
          overhead load, so a flat industry figure tells you very little about your own number.
        </p>

        <h2>How to Work Out Your Own Overhead-Per-Job Number</h2>
        <p>
          Start with your total fixed annual costs, the ones that exist whether or not a given job
          happens: insurance, vehicles, office or shop costs, software, admin time. Divide that by
          how many jobs you realistically expect to run in a year. That gives you a rough
          overhead-per-job figure to add on top of direct costs before you get to target margin and
          selling price. It won&apos;t be perfectly precise on the first pass, but it will be closer
          to real than skipping the step entirely.
        </p>

        <h2>A Worked Example</h2>
        <p>
          The 24&apos; × 16&apos; job referenced throughout this site carries its own overhead
          line, calculated the same way, before target margin is applied to arrive at a selling
          price. See the full breakdown on the{" "}
          <a href="/resources/deck-cost-estimator">Deck Cost Estimator</a> page.
        </p>
        <p>
          DeckMargin keeps overhead as its own line, separate from direct job cost, so it&apos;s
          never silently missing from the number you send.
        </p>

        <div className="rs-related">
          <div className="rs-related-title">Related reading</div>
          <ul>
            <li><a href="/resources/profit-vs-margin-for-deck-contractors">Profit vs. Margin for Deck Contractors</a></li>
            <li><a href="/resources/how-to-price-a-deck-job">How to Price a Deck Job</a></li>
          </ul>
        </div>
      </div>

      <div className="rs-cta">
        <h3>Overhead as its own line, never missing from your number.</h3>
        <p>DeckMargin separates overhead from direct costs so you always know what the job actually costs before margin is added.</p>
        <a href="/signup" className="rs-cta-btn">Start your 14-day free trial</a>
        <p className="rs-cta-micro">No card required. Cancel any time.</p>
      </div>
    </article>
  );
}
