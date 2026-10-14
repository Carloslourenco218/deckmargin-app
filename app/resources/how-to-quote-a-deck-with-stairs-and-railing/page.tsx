import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "How to Quote a Deck with Stairs and Railing | DeckMargin",
  description:
    "Stairs and railing aren't a flat add-on percentage. They're their own line items. Here's what to price separately when a deck job includes either.",
};

export default function StairsAndRailing() {
  return (
    <article className="rs-article">
      <div className="rs-breadcrumb">
        <a href="/resources">Resources</a>
        <span>›</span>
        <span>Stairs and Railing</span>
      </div>

      <header className="rs-article-header">
        <h1>How to Quote a Deck with Stairs and Railing</h1>
        <div className="rs-article-meta">
          <span>DeckMargin</span>
          <span>·</span>
          <span>Estimating</span>
        </div>
      </header>

      <div className="rs-body">
        <h2>Stairs Are Their Own Line Item</h2>
        <p>
          A flight of stairs isn&apos;t a rounding error on a deck quote, it&apos;s a second small
          project stacked on top of the first. Flights, width, risers, landing, and stair railing
          all add their own materials and their own labor. None of that is covered by the framing
          and decking numbers you already calculated for the deck itself, so stairs need to be
          priced as a distinct line item, not folded into a flat &ldquo;add 10% for stairs&rdquo;
          habit.
        </p>

        <h2>Railing Is Priced by Type and Length</h2>
        <p>
          Railing works the same way. What it costs depends on type (wood, composite, aluminum,
          cable, or glass), total linear footage, and the material itself, and those three things
          interact: glass and cable panels price and install very differently than wood balusters,
          even at the same linear footage. Treating railing as a flat add-on percentage of the
          deck&apos;s price hides those differences and tends to under-price the jobs that actually
          have the most expensive railing on them.
        </p>

        <h2>What Changes When You Add Both</h2>
        <p>
          Compare a flat deck with no stairs and no railing to the same footprint with both added,
          and the difference isn&apos;t small. Stairs add their own footings, stringers, treads,
          risers, hardware, and labor hours. Railing adds posts, sections, hardware, and its own
          labor, plus stair railing on top of that if the stairs need it. A quote that treats
          &ldquo;deck with stairs and railing&rdquo; as a markup on &ldquo;deck&rdquo; is quietly
          absorbing real cost it never actually accounted for.
        </p>

        <h2>A Worked Example</h2>
        <p>
          The 24&apos; × 16&apos; job referenced throughout this site includes a 7-step stair run
          and 42 LF of aluminum railing on top of the base deck. See the stairs and railing lines
          broken out separately in the{" "}
          <a href="/resources/deck-cost-estimator">Deck Cost Estimator</a>.
        </p>
        <p>
          DeckMargin prices stairs and railing as their own assemblies, materials and labor
          included, so they show up as real line items in the estimate instead of a
          guessed-at percentage.
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
        <h3>Stairs and railing as real line items, every time.</h3>
        <p>DeckMargin prices stairs and railing as their own assemblies so nothing gets absorbed into a percentage guess.</p>
        <a href="/signup" className="rs-cta-btn">Start your 14-day free trial</a>
        <p className="rs-cta-micro">No card required. Cancel any time.</p>
      </div>
    </article>
  );
}
