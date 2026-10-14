import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Deck Quote vs. Deck Estimate: What's the Difference?",
  description:
    "Quote and estimate aren't the same thing — here's the clean distinction, and why blurring them costs contractors money.",
};

export default function DeckQuoteVsEstimate() {
  return (
    <article className="rs-article">
      <div className="rs-breadcrumb">
        <a href="/resources">Resources</a>
        <span>›</span>
        <span>Deck Quote vs. Deck Estimate</span>
      </div>

      <header className="rs-article-header">
        <h1>Deck Quote vs. Deck Estimate — What&apos;s the Difference?</h1>
        <div className="rs-article-meta">
          <span>DeckMargin</span>
          <span>·</span>
          <span>Estimating</span>
        </div>
      </header>

      <div className="rs-body">
        <p>
          Most contractors use &ldquo;quote&rdquo; and &ldquo;estimate&rdquo; interchangeably in
          conversation, and that&apos;s fine day to day. But the two numbers actually do different
          jobs — and mixing them up is how a contractor ends up either underselling scope or
          promising a price they can&apos;t hold.
        </p>

        <h2>What an estimate actually is</h2>
        <p>
          Your internal, cost-based working number — materials, labor, site conditions, permits,
          equipment, and overhead — added up before any margin or client-facing presentation.
          It&apos;s built for you, not handed to anyone yet.
        </p>

        <h2>What a quote actually is</h2>
        <p>
          What gets communicated to the client: the price they&apos;ll pay, built from your estimate
          plus your target margin, and presented with the scope, exclusions, assumptions, and terms
          they need to say yes. It&apos;s the outward-facing version of the same job, not a separate
          calculation.
        </p>

        <h2>Why the difference matters</h2>
        <p>
          Hand a client your raw estimate as if it were the quote, and you&apos;ve skipped margin
          entirely. Build a &ldquo;quote&rdquo; without a real estimate underneath it, and
          you&apos;re guessing at a price with no cost basis to back it up. Both mistakes come from
          treating one number as if it were the other.
        </p>
        <p>
          In everyday conversation, &ldquo;quote&rdquo; gets used loosely to mean either one —
          that&apos;s fine casually. Internally, it&apos;s worth being precise, so nothing gets
          missed between the two steps.
        </p>

        <h2>How they connect</h2>
        <p>
          One job, one source of truth: the estimate is step one, and the quote is what that
          estimate becomes once margin and presentation are added — not two documents built from
          scratch, twice.
        </p>

        <div className="rs-related">
          <div className="rs-related-title">Related reading</div>
          <ul>
            <li><a href="/resources/how-to-price-a-deck-job">How to Price a Deck Job</a></li>
            <li><a href="/pre-quote-checklist">Deck Material Takeoff Checklist (free download)</a></li>
          </ul>
        </div>
      </div>

      <div className="rs-cta">
        <h3>From estimate to client-ready proposal — without rebuilding it twice.</h3>
        <p>DeckMargin keeps the job&apos;s information in one place so the estimate and proposal always match.</p>
        <a href="/signup" className="rs-cta-btn">Start your 14-day free trial</a>
        <p className="rs-cta-micro">No card required. Cancel any time.</p>
      </div>
    </article>
  );
}
