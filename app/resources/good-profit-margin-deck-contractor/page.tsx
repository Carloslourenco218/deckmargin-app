import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "What's a Good Profit Margin for a Deck Contractor?",
  description:
    "There's no single 'right' margin for every deck contractor — here's how to actually set your own target, based on your overhead and your market, not a borrowed industry number.",
};

export default function GoodProfitMargin() {
  return (
    <article className="rs-article">
      <div className="rs-breadcrumb">
        <a href="/resources">Resources</a>
        <span>›</span>
        <span>Good Profit Margin</span>
      </div>

      <header className="rs-article-header">
        <h1>What&apos;s a Good Profit Margin for a Deck Contractor?</h1>
        <div className="rs-article-meta">
          <span>DeckMargin</span>
          <span>·</span>
          <span>Pricing</span>
        </div>
      </header>

      <div className="rs-body">
        <p>
          Short answer: there isn&apos;t one universal number — and any page that hands you a flat
          &ldquo;X% is the industry standard&rdquo; figure is giving you a number that fits someone
          else&apos;s business, not necessarily yours.
        </p>

        <h2>Why there&apos;s no single right answer</h2>
        <p>
          Target margin depends on your overhead, your risk on a given job, and your local market —
          three things that vary contractor to contractor. A company with higher fixed overhead needs
          a higher margin just to cover it before any profit starts. A contractor taking on a job
          with real site-condition risk (difficult access, an unusual structural situation) has a
          reason to price in more cushion than a straightforward build. Two contractors in different
          markets can both be &ldquo;right&rdquo; at different margin targets.
        </p>

        <h2>How to actually set your own number</h2>
        <p>
          Start from your overhead, not from a percentage you&apos;ve seen somewhere. Work out what
          it actually costs to run your business in a year, independent of any single job — then
          work out what you need your margin to cover: that overhead, plus the profit you actually
          want to take out of the business. That calculation gives you a target margin that&apos;s
          yours, not borrowed from an average that may not reflect your real costs.
        </p>

        <h2>A margin that&apos;s too low doesn&apos;t show up right away</h2>
        <p>
          The risk with guessing low is that it doesn&apos;t look wrong on any one job — the job
          still closes, the client&apos;s happy, the crew gets paid. It shows up months later, when
          overhead that was never fully covered has quietly eaten the profit a string of
          &ldquo;successful&rdquo; jobs should have produced. A deliberately set target margin is
          what catches that before it happens, not after.
        </p>

        <h2>Checking your number against the job, every time</h2>
        <p>
          Once you&apos;ve set a target margin, the real value is in using it consistently — on
          every bid, not just the ones that feel tight.
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
        <h3>Set your target margin once. Hit it on every job.</h3>
        <p>DeckMargin builds your recommended selling price from the margin you actually want — not a guess.</p>
        <a href="/signup" className="rs-cta-btn">Start your 14-day free trial</a>
        <p className="rs-cta-micro">No card required. Cancel any time.</p>
      </div>
    </article>
  );
}
