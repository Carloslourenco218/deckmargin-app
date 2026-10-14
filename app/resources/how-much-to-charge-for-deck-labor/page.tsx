import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "How Much Should I Charge for Deck Labor? | DeckMargin",
  description:
    "Deck labor isn't a flat industry rate. Here's how crew size, productivity, and your real loaded labor cost should actually drive what you charge.",
};

export default function HowMuchToChargeForDeckLabor() {
  return (
    <article className="rs-article">
      <div className="rs-breadcrumb">
        <a href="/resources">Resources</a>
        <span>›</span>
        <span>Deck Labor Pricing</span>
      </div>

      <header className="rs-article-header">
        <h1>How Much Should I Charge for Deck Labor?</h1>
        <div className="rs-article-meta">
          <span>DeckMargin</span>
          <span>·</span>
          <span>Labor &amp; Pricing</span>
        </div>
      </header>

      <div className="rs-body">
        <h2>Labor Isn&apos;t a Flat Industry Rate</h2>
        <p>
          There&apos;s no single number that tells you what to charge for deck labor, because labor
          cost isn&apos;t really about the deck. It&apos;s about your crew. Two contractors building
          the identical deck can land on completely different labor costs depending on crew size, how
          fast that crew actually works, and what it costs to keep them on the job. Site difficulty,
          stairs, and railing all add hours on top of base framing and decking, and none of that
          shows up in a generic &ldquo;$X per square foot for labor&rdquo; number pulled from an
          industry blog post.
        </p>

        <h2>What a Loaded Labor Rate Actually Means</h2>
        <p>
          Start with what the crew costs you, not what they get paid. A loaded labor rate includes
          the hourly wage plus the burden on top of it: payroll taxes, workers&apos; comp,
          insurance, any benefits. That&apos;s the cost that doesn&apos;t show up on a pay stub but
          absolutely shows up in what the job costs to run. That loaded rate, multiplied by the
          hours the job actually takes at your crew&apos;s real productivity, is your labor cost.
          What you charge the client is a separate number, built on top of labor cost once overhead
          and your target margin are added in.
        </p>

        <h2>The Mistake: Pricing Off a Generic Hourly Number</h2>
        <p>
          The fastest way to lose money on labor is pricing it off a number you didn&apos;t build
          yourself: an industry average, a figure from a forum post, a rate a supplier happened to
          mention. Your crew&apos;s productivity is specific to your crew, how many decks
          they&apos;ve built, how well they work together, how your site conditions tend to run. A
          contractor using someone else&apos;s labor rate is pricing someone else&apos;s business.
        </p>

        <h2>A Worked Example</h2>
        <p>
          On the standing 24&apos; × 16&apos; job used throughout this site (raised, attached, Trex,
          7-step stairs, 42 LF aluminum railing), the labor line breaks into setup, footings,
          framing, decking, railing, stairs, and cleanup hours, each priced at the crew&apos;s own
          loaded rate, before overhead or margin are added on top.
        </p>
        <p>
          DeckMargin builds this calculation from your own crew&apos;s rate and productivity, not an
          industry guess, and keeps it separate from your selling price so you always know your real
          labor cost before you send a number.
        </p>

        <div className="rs-related">
          <div className="rs-related-title">Related reading</div>
          <ul>
            <li><a href="/resources/profit-vs-margin-for-deck-contractors">Profit vs. Margin for Deck Contractors</a></li>
            <li><a href="/resources/how-to-price-a-deck-job">How to Price a Deck Job</a></li>
            <li><a href="/pre-quote-checklist">Deck Material Takeoff Checklist (free download)</a></li>
          </ul>
        </div>
      </div>

      <div className="rs-cta">
        <h3>Price labor from your crew&apos;s real rate, not an industry guess.</h3>
        <p>DeckMargin uses your own crew rates and productivity so your labor number is actually yours.</p>
        <a href="/signup" className="rs-cta-btn">Start your 14-day free trial</a>
        <p className="rs-cta-micro">No card required. Cancel any time.</p>
      </div>
    </article>
  );
}
