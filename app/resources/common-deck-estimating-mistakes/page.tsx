import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Common Deck Estimating Mistakes That Cost Contractors Money | DeckMargin",
  description:
    "One missed line item routinely costs $3,000 or more on a deck job. Here are the mistakes that cause it, and what to check instead.",
};

export default function CommonEstimatingMistakes() {
  return (
    <article className="rs-article">
      <div className="rs-breadcrumb">
        <a href="/resources">Resources</a>
        <span>›</span>
        <span>Estimating Mistakes</span>
      </div>

      <header className="rs-article-header">
        <h1>Common Deck Estimating Mistakes That Cost Contractors Money</h1>
        <div className="rs-article-meta">
          <span>DeckMargin</span>
          <span>·</span>
          <span>Estimating</span>
        </div>
      </header>

      <div className="rs-body">
        <p>
          One missed line item. $3,000. Every time, give or take. These are the mistakes that cause
          it most often.
        </p>

        <h2>1. Skipping Site Conditions</h2>
        <p>
          A pool, a slope, a fence that limits access — each adds real labor hours a flat estimate
          never sees. Treating site difficulty as a vague &ldquo;add a little for the tough
          ones&rdquo; habit, instead of pricing each obstacle on its own, is one of the most common
          ways a job quietly loses money.
        </p>

        <h2>2. Forgetting Permits and Engineering</h2>
        <p>
          Permit fees and, where triggered, engineering review are real costs tied to the specific
          job&apos;s size, height, and jurisdiction. Leaving them out of the estimate because they
          feel like a formality later means absorbing them after the price is already sent.
        </p>

        <h2>3. Pricing Off a Flat $/Sq Ft Number</h2>
        <p>
          A flat per-square-foot number ignores everything that actually drives cost on a given job:
          material choice, railing, stairs, site conditions, labor productivity. It&apos;s a fast
          way to estimate and a reliable way to be wrong.
        </p>

        <h2>4. Confusing Margin with Markup</h2>
        <p>
          Margin is profit divided by selling price. Markup is profit divided by cost. They are not
          the same number — and using markup math while thinking it&apos;s margin routinely leaves a
          contractor with a lower actual margin than intended. Full breakdown:{" "}
          <a href="/resources/profit-vs-margin-for-deck-contractors">
            Profit vs. Margin for Deck Contractors
          </a>.
        </p>

        <h2>5. Not Accounting for Waste</h2>
        <p>
          Estimating the theoretical material quantity instead of what actually gets bought —
          offcuts, mistakes, pattern loss — creates a gap between the estimate and the real purchase
          order. That gap comes straight out of profit.
        </p>

        <h2>6. Treating Stairs and Railing as an Afterthought</h2>
        <p>
          Stairs and railing each carry their own materials and labor. Folding them into a flat
          add-on percentage instead of pricing them as their own line items is one of the most
          common ways a quote under-prices a job with real complexity in it.
        </p>

        <hr />

        <p>
          DeckMargin is built around catching exactly these line items automatically, so none of
          them get left out of the number you send.
        </p>

        <div className="rs-related">
          <div className="rs-related-title">Related reading</div>
          <ul>
            <li><a href="/resources/how-to-price-a-deck-job">How to Price a Deck Job</a></li>
            <li><a href="/resources/profit-vs-margin-for-deck-contractors">Profit vs. Margin for Deck Contractors</a></li>
            <li><a href="/resources/site-conditions-pricing-a-deck">How to Account for Site Conditions When Pricing a Deck</a></li>
          </ul>
        </div>
      </div>

      <div className="rs-cta">
        <h3>Stop absorbing costs that should be in the bid.</h3>
        <p>DeckMargin catches the line items contractors most often miss — automatically, on every job.</p>
        <a href="/signup" className="rs-cta-btn">Start your 14-day free trial</a>
        <p className="rs-cta-micro">No card required. Cancel any time.</p>
      </div>
    </article>
  );
}
