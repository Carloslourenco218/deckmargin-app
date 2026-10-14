import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Profit vs. Margin for Deck Contractors (and Why Markup Isn't the Same Thing)",
  description:
    "Profit, margin, and markup get used interchangeably, they're not the same number. Here's the exact difference, with a side-by-side calculation showing what mixing them up actually costs.",
};

export default function ProfitVsMargin() {
  return (
    <article className="rs-article">
      <div className="rs-breadcrumb">
        <a href="/resources">Resources</a>
        <span>›</span>
        <span>Profit vs. Margin</span>
      </div>

      <header className="rs-article-header">
        <h1>Profit vs. Margin for Deck Contractors</h1>
        <div className="rs-article-meta">
          <span>DeckMargin</span>
          <span>·</span>
          <span>Pricing</span>
        </div>
      </header>

      <div className="rs-body">
        <p>
          Three numbers get used almost interchangeably when contractors talk about pricing a job:
          profit, margin, and markup. They&apos;re related, but they&apos;re not the same number,           and the gap between them is exactly where a &ldquo;profitable-looking&rdquo; deck job
          quietly loses money.
        </p>

        <h2>The three numbers, defined</h2>
        <ul>
          <li><strong>Profit</strong> is a dollar amount: selling price minus total job cost. Nothing complicated here, it&apos;s what&apos;s left over.</li>
          <li><strong>Margin</strong> is profit as a percentage of the selling price: profit ÷ selling price.</li>
          <li><strong>Markup</strong> is profit as a percentage of cost: profit ÷ total job cost.</li>
        </ul>
        <p>
          Same profit dollar amount, two different percentages, because margin divides by the
          selling price and markup divides by the cost, and those are two different numbers.
        </p>

        <h2>Why they&apos;re never equal on the same job</h2>
        <p>
          Say a deck job costs $30,000 to build, and you price it at $37,500. Profit is $7,500.
          Markup is $7,500 ÷ $30,000 = <strong>25%</strong>. Margin is $7,500 ÷ $37,500 = <strong>20%</strong>.
          Same job, same $7,500 profit, a 25% markup and a 20% margin, five points apart.
          The gap gets wider as the percentage goes up: a 50% markup is only a 33% margin, not 50%.
        </p>

        <h2>The mistake this causes</h2>
        <p>
          A contractor aiming for &ldquo;20% margin&rdquo; who adds a 20% markup instead
          isn&apos;t hitting their target, they&apos;re underpricing it. Using the same $30,000
          job: a 20% markup prices the job at $36,000, for a profit of $6,000, which is actually a
          16.7% margin, not 20%. Treating markup and margin as interchangeable means consistently
          pricing below your real target, job after job, without ever seeing it on paper.
        </p>

        <h2>Setting a price from the margin you actually want</h2>
        <p>
          If margin is the number that matters, build the price from margin directly:
        </p>
        <p>
          <strong>Selling price = total job cost ÷ (1 − target margin)</strong>
        </p>
        <p>
          For a $30,000 job at a true 20% margin, that&apos;s $30,000 ÷ 0.80 = $37,500, not
          $36,000. The formula guarantees the margin you&apos;re actually aiming for, instead of
          approximating it with a markup percentage that doesn&apos;t map to it.
        </p>

        <h2>Why this isn&apos;t just semantics</h2>
        <p>
          A few points of difference between margin and markup, repeated across every job in a
          year, adds up to real money left on the table, money that looks like it was priced in,
          but never actually was. Knowing which number you&apos;re working with, and pricing from it
          directly rather than approximating, is the difference between a target margin you actually
          hit and one you only think you hit.
        </p>

        <div className="rs-related">
          <div className="rs-related-title">Related reading</div>
          <ul>
            <li><a href="/resources/how-to-price-a-deck-job">How to Price a Deck Job (Step 7)</a></li>
            <li><a href="/resources/good-profit-margin-deck-contractor">What&apos;s a Good Profit Margin for a Deck Contractor?</a></li>
          </ul>
        </div>
      </div>

      <div className="rs-cta">
        <h3>See your real margin, automatically.</h3>
        <p>DeckMargin calculates your target margin and recommended selling price on every job, so you&apos;re never approximating from a markup guess.</p>
        <a href="/signup" className="rs-cta-btn">Start your 14-day free trial</a>
        <p className="rs-cta-micro">No card required. Cancel any time.</p>
      </div>
    </article>
  );
}
