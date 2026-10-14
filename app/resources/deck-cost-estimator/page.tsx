import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Deck Cost Estimator for Contractors — What Actually Goes Into the Price",
  description:
    "A deck cost estimator built for the person bidding the job, not the person getting a ballpark. See every real cost — materials, labor, permits, overhead, margin — in a worked 24x16 example.",
};

export default function DeckCostEstimator() {
  return (
    <article className="rs-article">
      <div className="rs-breadcrumb">
        <a href="/resources">Resources</a>
        <span>›</span>
        <span>Deck Cost Estimator</span>
      </div>

      <header className="rs-article-header">
        <h1>Deck Cost Estimator for Contractors</h1>
        <div className="rs-article-meta">
          <span>DeckMargin</span>
          <span>·</span>
          <span>Estimating</span>
        </div>
      </header>

      <div className="rs-body">
        <p>
          If you landed here looking for a quick number to hand a homeowner, this isn&apos;t that
          page. Trex&apos;s cost calculator and sites like HomeAdvisor already do that well. This
          page is for the person who has to turn a rough number into a real bid: a deck contractor
          pricing an actual job, with actual costs, that still has to make a profit.
        </p>

        <h2>Why a flat price-per-square-foot doesn&apos;t hold up</h2>
        <p>
          Most of what shows up when you search &ldquo;deck cost estimator&rdquo; gives you one
          number: dollars per square foot. That number assumes every deck is the same deck. It
          isn&apos;t. A 384 sq ft deck on flat, easy-access ground with no stairs and no railing
          costs nothing like a 384 sq ft deck that&apos;s raised, has a 7-step stair run, 40+ linear
          feet of railing, and a site with limited access. Same square footage, two very different
          jobs. If you&apos;re pricing off square footage alone, you&apos;re pricing the easy version
          of every job, and eating the difference on the hard ones.
        </p>

        <h2>What actually goes into pricing a deck job</h2>
        <p>A real bid adds up more than lumber:</p>
        <ul>
          <li>
            <strong>Materials</strong> — decking, framing, structural hardware, fasteners, concrete,
            and waste. Material choice (pressure-treated vs. Trex vs. TimberTech vs. PVC) moves this
            on its own.
          </li>
          <li>
            <strong>Labor</strong> — crew size, hours, and productivity, adjusted for the actual
            site: setup, footings, framing, decking, railing, stairs, and cleanup each take their
            own time.
          </li>
          <li>
            <strong>Site conditions</strong> — pools, trees, slopes, limited access, and existing
            structures add labor hours a flat rate never accounts for.
          </li>
          <li>
            <strong>Permits and engineering</strong> — required on plenty of jobs, and easy to forget
            until it&apos;s too late to add back in.
          </li>
          <li>
            <strong>Equipment and disposal</strong> — equipment rental and a dumpster, when the job
            needs them.
          </li>
          <li>
            <strong>Overhead</strong> — your business&apos;s indirect costs, separate from the
            direct cost of this specific job.
          </li>
          <li>
            <strong>Margin</strong> — profit as a percentage of the selling price, not the same
            thing as{" "}
            <a href="/resources/profit-vs-margin-for-deck-contractors">
              markup
            </a>
            , and not something to guess at after the fact.
          </li>
        </ul>

        <h2>Worked example: pricing a 24&times;16 deck</h2>
        <p>
          Here&apos;s a real job, priced out line by line: raised, attached to the house, Trex
          decking, 42 linear feet of aluminum railing, a 7-step stair run, moderate site
          difficulty, lighting, a dumpster, a building permit, and engineering.
        </p>

        <div className="rs-table-wrap">
          <table className="rs-table">
            <thead>
              <tr>
                <th>Job spec</th>
                <th>Detail</th>
              </tr>
            </thead>
            <tbody>
              <tr><td>Size</td><td>24&prime; &times; 16&prime; (384 sq ft)</td></tr>
              <tr><td>Structure</td><td>Raised, attached</td></tr>
              <tr><td>Decking</td><td>Trex</td></tr>
              <tr><td>Railing</td><td>42 LF, aluminum</td></tr>
              <tr><td>Stairs</td><td>7-step run</td></tr>
              <tr><td>Site</td><td>Moderate difficulty</td></tr>
              <tr><td>Extras</td><td>Lighting, dumpster, building permit, engineering</td></tr>
            </tbody>
          </table>
        </div>

        <div className="rs-table-wrap">
          <table className="rs-table">
            <thead>
              <tr>
                <th>Cost category</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr><td>Materials</td><td>$8,540</td></tr>
              <tr><td>Labor</td><td>$7,200</td></tr>
              <tr><td>Equipment &amp; disposal</td><td>$840</td></tr>
              <tr><td>Permit &amp; engineering</td><td>$1,620</td></tr>
              <tr><td>Overhead</td><td>$2,800</td></tr>
              <tr><td><strong>Total job cost</strong></td><td><strong>$21,000</strong></td></tr>
              <tr><td>Target margin</td><td>25%</td></tr>
              <tr><td><strong>Selling price</strong></td><td><strong>$28,000</strong></td></tr>
            </tbody>
          </table>
        </div>

        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/dm-estimate-screenshot.jpg"
          alt="DeckMargin job cost and margin breakdown for a 24x16 deck"
          style={{ borderRadius: 10, border: "1px solid #1F2937", margin: "24px 0", width: "100%" }}
        />

        <div className="rs-cta">
          <h3>Run your next deck job through this exact process.</h3>
          <p>DeckMargin works through each of these steps automatically so nothing gets missed.</p>
          <a href="/signup" className="rs-cta-btn">Start Your 14-Day Free Trial</a>
          <p className="rs-cta-micro">No card required. Cancel any time.</p>
        </div>

        <h3>Why two identical-looking decks can price completely differently</h3>
        <p>
          Swap the site from moderate to difficult, add a second set of stairs, or upgrade the
          railing from aluminum to glass, and the number above changes, not because the square
          footage changed, but because the job did. That&apos;s the part a per-square-foot estimate
          can&apos;t capture, and it&apos;s the part that actually determines whether a job is
          profitable.
        </p>

        <h3>A faster way to get this right on every job</h3>
        <p>
          Running this math by hand, on a spreadsheet, for every bid is how contractors either
          under-price jobs or spend hours they don&apos;t have getting the number right. DeckMargin
          turns the job&apos;s scope, geometry, materials, railing, stairs, and site conditions into
          the full cost breakdown automatically: material takeoff, labor based on your crew&apos;s
          actual productivity and rates (not a generic average), and a selling price built from your
          target margin, not a guess. You stay in control of every number; the software just stops
          you from rebuilding the math from scratch on every job.
        </p>

        <div className="rs-related">
          <div className="rs-related-title">Related reading</div>
          <ul>
            <li><a href="/resources/how-to-price-a-deck-job">How to Price a Deck Job</a></li>
            <li><a href="/pre-quote-checklist">Deck Estimator&apos;s Pre-Quote Checklist (free download)</a></li>
          </ul>
        </div>
      </div>

      <div className="rs-cta">
        <h3>Price your next deck job in DeckMargin.</h3>
        <p>See the real numbers before you send the proposal. No spreadsheet required.</p>
        <a href="/signup" className="rs-cta-btn">Start Your 14-Day Free Trial</a>
        <p className="rs-cta-micro">No card required. Cancel any time.</p>
      </div>
    </article>
  );
}
