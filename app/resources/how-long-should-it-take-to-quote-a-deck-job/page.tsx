import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "How Long Should It Take to Quote a Deck Job? | DeckMargin",
  description:
    "An honest look at how long manual deck estimating actually takes once stairs, railing, and site conditions are factored in.",
};

export default function HowLongToQuote() {
  return (
    <article className="rs-article">
      <div className="rs-breadcrumb">
        <a href="/resources">Resources</a>
        <span>›</span>
        <span>How Long to Quote a Deck</span>
      </div>

      <header className="rs-article-header">
        <h1>How Long Should It Take to Quote a Deck Job?</h1>
        <div className="rs-article-meta">
          <span>DeckMargin</span>
          <span>·</span>
          <span>Estimating</span>
        </div>
      </header>

      <div className="rs-body">
        <h2>The Honest Answer: Longer Than Most Contractors Think</h2>
        <p>
          Doing it by hand — a spreadsheet for materials, a separate calculator for labor, notes for
          site conditions, a document rebuilt from scratch for the proposal — takes real time. It
          takes longer once stairs, railing, or anything beyond a flat rectangular deck enters the
          picture, because each of those gets its own calculation, usually in its own place.
        </p>

        <h2>Where the Time Actually Goes</h2>
        <p>
          Measurements get taken once, then the same numbers get re-entered for the material
          takeoff, re-entered again for the labor estimate, re-entered again for pricing and margin
          math, and re-entered one more time to build the client-facing proposal. None of those
          steps is slow on its own. Doing all of them separately, for every job, is what adds up.
        </p>

        <h2>What Changes When It&apos;s Connected</h2>
        <p>
          When the job&apos;s information lives in one place and the downstream steps pull from it
          instead of being rebuilt, the time spent isn&apos;t on re-entry — it&apos;s on the
          decisions that actually need a person: what material, what margin, what to tell the
          client.
        </p>
        <p>
          DeckMargin keeps the job&apos;s information in one place, so the estimate, materials,
          labor, and proposal all come from the same source instead of being rebuilt separately.
        </p>

        <div className="rs-related">
          <div className="rs-related-title">Related reading</div>
          <ul>
            <li><a href="/resources/how-to-price-a-deck-job">How to Price a Deck Job</a></li>
            <li><a href="/resources/deck-cost-estimator">Deck Cost Estimator</a></li>
          </ul>
        </div>
      </div>

      <div className="rs-cta">
        <h3>Price a deck job in about 10 minutes.</h3>
        <p>DeckMargin keeps everything in one place so you&apos;re not rebuilding the same numbers four different times.</p>
        <a href="/signup" className="rs-cta-btn">Start your 14-day free trial</a>
        <p className="rs-cta-micro">No card required. Cancel any time.</p>
      </div>
    </article>
  );
}
