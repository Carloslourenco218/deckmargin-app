import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "How to Account for Site Conditions When Pricing a Deck | DeckMargin",
  description:
    "A pool, a fence, a slope, rock in the ground, each adds real labor hours a flat estimate misses. Here's how to price site conditions instead of guessing.",
};

export default function SiteConditions() {
  return (
    <article className="rs-article">
      <div className="rs-breadcrumb">
        <a href="/resources">Resources</a>
        <span>›</span>
        <span>Site Conditions</span>
      </div>

      <header className="rs-article-header">
        <h1>How to Account for Site Conditions When Pricing a Deck</h1>
        <div className="rs-article-meta">
          <span>DeckMargin</span>
          <span>·</span>
          <span>Estimating</span>
        </div>
      </header>

      <div className="rs-body">
        <h2>Site Conditions Aren&apos;t a Flat Percentage</h2>
        <p>
          &ldquo;Add 10% for a tough site&rdquo; is the kind of rule of thumb that feels careful
          and isn&apos;t. A pool in the way, a fence that limits access, a slope under the
          footprint, rock where a footing needs to go, these each add real labor hours, and they
          add different amounts of labor depending on what the actual obstacle is. A flat percentage
          bundles all of that into one guess, which means it&apos;s wrong for almost every job
          it&apos;s applied to.
        </p>

        <h2>Treat Each Obstacle as Its Own Line</h2>
        <p>
          The more reliable approach is to go through the obstacles on a given site one at a time:
          a pool that limits equipment access, a fence that means material has to be carried
          further, a slope that adds excavation or footing depth, rock that slows digging down to a
          crawl, limited access that turns a half-day setup into a full day. Each one is worth
          pricing on its own rather than folded into a single difficulty multiplier.
        </p>

        <h2>Suggested Adjustment, Not a Silent One</h2>
        <p>
          The right way to handle this isn&apos;t to silently insert a number and move on. A
          suggested adjustment should be visible, something the contractor can apply, edit, or
          ignore based on what they actually know about the site. The goal is surfacing the
          adjustment so it gets a decision, not hiding it inside a bigger total where it&apos;s
          never questioned.
        </p>

        <h2>A Worked Example</h2>
        <p>
          The 24&apos; × 16&apos; job referenced throughout this site is priced at a moderate site
          difficulty, reflecting the specific conditions on that job rather than a flat add-on.
          See the full breakdown on the{" "}
          <a href="/resources/deck-cost-estimator">Deck Cost Estimator</a> page.
        </p>
        <p>
          DeckMargin surfaces site-condition adjustments as a suggested line you can apply, edit,
          or ignore, never a silent number baked into the total.
        </p>

        <div className="rs-related">
          <div className="rs-related-title">Related reading</div>
          <ul>
            <li><a href="/resources/deck-cost-estimator">Deck Cost Estimator</a></li>
            <li><a href="/resources/how-to-price-a-deck-job">How to Price a Deck Job</a></li>
          </ul>
        </div>
      </div>

      <div className="rs-cta">
        <h3>Site conditions as a visible line, not a silent guess.</h3>
        <p>DeckMargin surfaces site difficulty as an adjustment you control, so it&apos;s never quietly missing from the number you send.</p>
        <a href="/signup" className="rs-cta-btn">Start your 14-day free trial</a>
        <p className="rs-cta-micro">No card required. Cancel any time.</p>
      </div>
    </article>
  );
}
