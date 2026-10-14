import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Deck Material Takeoff Checklist | DeckMargin",
  description:
    "A quick checklist for pricing deck materials correctly — measurements through final price — plus the full downloadable version.",
};

export default function DeckMaterialTakeoffChecklist() {
  return (
    <article className="rs-article">
      <div className="rs-breadcrumb">
        <a href="/resources">Resources</a>
        <span>›</span>
        <span>Material Takeoff Checklist</span>
      </div>

      <header className="rs-article-header">
        <h1>Deck Material Takeoff Checklist</h1>
        <div className="rs-article-meta">
          <span>DeckMargin</span>
          <span>·</span>
          <span>Estimating</span>
        </div>
      </header>

      <div className="rs-body">
        <p>
          A quick version of the checklist, on this page. The full downloadable version has room to
          work the numbers for your own job.
        </p>

        <h2>Measure the Deck</h2>
        <p>
          Footprint dimensions, height off grade, and attachment type (attached or freestanding)
          before anything else gets calculated.
        </p>

        <h2>Check the Site</h2>
        <p>
          Note any obstacles — a pool, a slope, a fence, limited access — that will add labor hours
          beyond the base framing and decking work.
        </p>

        <h2>Decide the Build</h2>
        <p>
          Decking material, railing type and length, and stair configuration — each of these changes
          the material list and the labor underneath it.
        </p>

        <h2>Don&apos;t Forget</h2>
        <p>
          Hardware, fasteners, concrete for footings, and any permit or engineering requirement
          triggered by the project&apos;s size or height.
        </p>

        <h2>Price It Right</h2>
        <p>
          Material cost, labor at your crew&apos;s real rate, overhead, and target margin — in that
          order — before a selling price goes out.
        </p>

        <hr />

        <p>
          That&apos;s the short version. The full downloadable checklist (&ldquo;The Deck
          Estimator&apos;s Pre-Quote Checklist&rdquo;) walks through each step with room to write
          in your own numbers.
        </p>

        <div className="rs-related">
          <div className="rs-related-title">Related reading</div>
          <ul>
            <li><a href="/resources/how-to-price-a-deck-job">How to Price a Deck Job</a></li>
          </ul>
        </div>
      </div>

      {/* This page's CTA points to the lead magnet, not the trial */}
      <div className="rs-cta">
        <h3>Get the full checklist — free.</h3>
        <p>The Deck Estimator&apos;s Pre-Quote Checklist walks through every step with room to work the numbers for your own job.</p>
        <a href="/pre-quote-checklist" className="rs-cta-btn">Download the Free Checklist</a>
        <p className="rs-cta-micro">Enter your email and get it instantly.</p>
      </div>
    </article>
  );
}
