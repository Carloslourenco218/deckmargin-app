import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Resources for Deck Contractors | DeckMargin",
  description:
    "Guides on deck estimating, pricing, margin, labor, site conditions, and more, written for the contractor doing the actual bidding.",
  robots: { index: true, follow: true },
};

/**
 * PUBLISHING CONTROL
 * Add article slugs to this array ONE AT A TIME as you're ready to publish.
 * Articles not in this list are still built and live at their URL but will
 * not appear in this index and won't be linked from anywhere on the site.
 *
 * Week 1: how-to-price-a-deck-job
 * Week 2: (add next slug here)
 * ...
 */
const published = [
  "deck-cost-estimator",
];

const allArticles = [
  {
    slug: "deck-cost-estimator",
    title: "Deck Cost Estimator for Contractors: What Actually Goes Into the Price",
    description:
      "A deck cost estimator built for the person bidding the job. See every real cost, materials, labor, permits, overhead, margin, in a worked 24x16 example.",
  },
  {
    slug: "how-to-price-a-deck-job",
    title: "How to Price a Deck Job: A Step-by-Step Guide for Contractors",
    description:
      "The full process for pricing a deck job, step by step, scope through proposal, including the line items contractors most often forget to charge for.",
  },
  {
    slug: "profit-vs-margin-for-deck-contractors",
    title: "Profit vs. Margin for Deck Contractors (and Why Markup Is Not the Same Thing)",
    description:
      "Profit, margin, and markup get used interchangeably. They are not the same number. Here is the exact difference, with a side-by-side calculation showing what mixing them up actually costs.",
  },
  {
    slug: "good-profit-margin-deck-contractor",
    title: "What's a Good Profit Margin for a Deck Contractor?",
    description:
      "There's no single right margin for every deck contractor. Here's how to actually set your own target based on your overhead and your market.",
  },
  {
    slug: "deck-quote-vs-deck-estimate",
    title: "Deck Quote vs. Deck Estimate: What's the Difference?",
    description:
      "Quote and estimate aren't the same thing. Here's the clean distinction, and why blurring them costs contractors money.",
  },
  {
    slug: "how-much-to-charge-for-deck-labor",
    title: "How Much Should I Charge for Deck Labor?",
    description:
      "Deck labor isn't a flat industry rate. Here's how crew size, productivity, and your real loaded labor cost should actually drive what you charge.",
  },
  {
    slug: "how-to-quote-a-deck-with-stairs-and-railing",
    title: "How to Quote a Deck with Stairs and Railing",
    description:
      "Stairs and railing aren't a flat add-on percentage. They're their own line items. Here's what to price separately when a deck job includes either.",
  },
  {
    slug: "deck-permit-costs-by-region",
    title: "Deck Permit Costs by Region: What Actually Drives the Price",
    description:
      "Permit costs vary a lot by region, but not for mysterious reasons. Here's what actually determines what you'll pay.",
  },
  {
    slug: "site-conditions-pricing-a-deck",
    title: "How to Account for Site Conditions When Pricing a Deck",
    description:
      "A pool, a fence, a slope, rock in the ground, each adds real labor hours a flat estimate misses. Here's how to price site conditions instead of guessing.",
  },
  {
    slug: "deck-builder-overhead",
    title: "Deck Builder Overhead: How to Find Your Real Number",
    description:
      "Overhead isn't a flat percentage, it's a number specific to your business. Here's how to work out your own overhead-per-job number before you price the next deck.",
  },
  {
    slug: "common-deck-estimating-mistakes",
    title: "Common Deck Estimating Mistakes That Cost Contractors Money",
    description:
      "One missed line item routinely costs $3,000 or more on a deck job. Here are the mistakes that cause it, and what to check instead.",
  },
  {
    slug: "deck-material-takeoff-checklist",
    title: "Deck Material Takeoff Checklist",
    description:
      "A quick checklist for pricing deck materials correctly, measurements through final price, plus the full downloadable version.",
  },
  {
    slug: "how-long-should-it-take-to-quote-a-deck-job",
    title: "How Long Should It Take to Quote a Deck Job?",
    description:
      "An honest look at how long manual deck estimating actually takes once stairs, railing, and site conditions are factored in.",
  },
];

// Only show articles that are in the published list, in that order
const visibleArticles = published
  .map((slug) => allArticles.find((a) => a.slug === slug))
  .filter(Boolean) as typeof allArticles;

export default function ResourcesIndex() {
  return (
    <div className="rs-index">
      <div className="rs-index-header">
        <h1>Resources for Deck Contractors</h1>
        <p>
          Guides on estimating, pricing, margin, labor, and site conditions,
          written for the contractor doing the actual bidding.
        </p>
      </div>

      <div className="rs-article-list">
        {visibleArticles.map((a) => (
          <a key={a.slug} href={`/resources/${a.slug}`} className="rs-article-card">
            <div className="rs-article-card-title">{a.title}</div>
            <div className="rs-article-card-desc">{a.description}</div>
          </a>
        ))}
      </div>
    </div>
  );
}
