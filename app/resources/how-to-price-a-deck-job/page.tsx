import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "How to Price a Deck Job: A Step-by-Step Guide for Contractors",
  description:
    "The full process for pricing a deck job, step by step, scope through proposal, including the line items contractors most often forget to charge for.",
};

export default function HowToPriceADeckJob() {
  return (
    <article className="rs-article">
      <div className="rs-breadcrumb">
        <a href="/resources">Resources</a>
        <span>›</span>
        <span>How to Price a Deck Job</span>
      </div>

      <header className="rs-article-header">
        <h1>How to Price a Deck Job</h1>
        <div className="rs-article-meta">
          <span>DeckMargin</span>
          <span>·</span>
          <span>Estimating</span>
        </div>
      </header>

      <div className="rs-body">
        <p>
          Pricing a deck job right means working through the same sequence every time, not
          re-deriving it from scratch on each bid. Here&apos;s the full process, step by step,
          from the first measurement to the proposal in the client&apos;s hands.
        </p>

        <h2>1. Start with scope and measurements</h2>
        <p>
          Before anything else: what&apos;s the job, actually? New build, resurface, railing-only,
          repair, or addition, and the real dimensions. Everything downstream is built on this, so
          get it right here rather than correcting it three steps later.
        </p>

        <h2>2. Estimate the materials</h2>
        <p>
          Decking, framing, structural hardware, fasteners, and concrete, priced out based on the
          material you&apos;re actually using (pressure-treated, Trex, TimberTech, PVC), including
          waste. Waste matters: pricing only the theoretical quantity is how you end up short
          on-site and buying more at the worst possible time.
        </p>

        <h2>3. Estimate the labor</h2>
        <p>
          Labor isn&apos;t a flat rate, it&apos;s your crew, your productivity, and the hours this
          specific job actually takes: setup, footings, framing, decking, railing, stairs, cleanup.
          A generic industry number isn&apos;t your number.
        </p>

        <h2>4. Account for site conditions</h2>
        <p>
          This is the step that gets skipped most often, and it&apos;s expensive when it does. A
          pool, mature trees, a retaining wall, limited access, a steep grade, any of these adds
          real labor hours a flat estimate never sees. One missed line item here routinely costs
          $3,000 or more on a job. Price the site, not just the deck.
        </p>

        <h2>5. Add permits, equipment, and other costs</h2>
        <p>
          The second most commonly skipped step. Building permits, engineering (when the job calls
          for it), equipment rental, a dumpster, these are real costs that belong in the bid, not
          expenses you discover after you&apos;ve already quoted the price.
        </p>

        <h2>6. Add it up: total job cost</h2>
        <p>
          Materials plus labor plus site adjustments plus permits, equipment, and other costs, plus
          your overhead, your business&apos;s indirect operating costs, separate from what this
          specific job costs to build. This total is your real number before any profit is added.
        </p>

        <h2>7. Apply your target margin, not markup</h2>
        <p>
          Margin and markup aren&apos;t the same thing, and mixing them up is one of the most
          common ways contractors end up underpriced. Margin is profit as a percentage of the
          selling price; markup is profit as a percentage of cost. Set a target margin, and your
          selling price follows from it rather than from a guess. (Full breakdown:{" "}
          <a href="/resources/profit-vs-margin-for-deck-contractors">
            Profit vs. Margin for Deck Contractors
          </a>.)
        </p>

        <h2>8. Set the selling price</h2>
        <p>
          Selling price = total job cost ÷ (1 − target margin). That&apos;s the recommended number.
          You can still override it, the goal is to know exactly what you&apos;re giving up or
          gaining when you do, not to hand pricing over to a formula.
        </p>

        <h2>9. Turn it into a proposal</h2>
        <p>
          The client doesn&apos;t need to see your costs, labor rates, overhead, or margin, they
          need the scope, what&apos;s included, what&apos;s excluded, any allowances, the price, and
          the terms, presented clearly. The estimate and the proposal should come from the same job
          information, not be rebuilt separately.
        </p>

        <hr />

        <p>
          Run this same sequence on the 24×16 deck used throughout this site, raised, attached,
          Trex decking, 42 LF aluminum railing, 7-step stairs, moderate site, lighting, dumpster,
          permit, and engineering, and see the full line-by-line cost breakdown worked out on the{" "}
          <a href="/resources/deck-cost-estimator">Deck Cost Estimator</a> page.
        </p>

        <div className="rs-related">
          <div className="rs-related-title">Related reading</div>
          <ul>
            <li><a href="/resources/profit-vs-margin-for-deck-contractors">Profit vs. Margin for Deck Contractors</a></li>
            <li><a href="/resources/how-much-to-charge-for-deck-labor">How Much Should I Charge for Deck Labor?</a></li>
            <li><a href="/pre-quote-checklist">Deck Material Takeoff Checklist (free download)</a></li>
          </ul>
        </div>
      </div>

      <div className="rs-cta">
        <h3>Run your next deck job through this exact process.</h3>
        <p>DeckMargin works through each of these steps automatically so nothing gets missed.</p>
        <a href="/signup" className="rs-cta-btn">Start your 14-day free trial</a>
        <p className="rs-cta-micro">No card required. Cancel any time.</p>
      </div>
    </article>
  );
}
