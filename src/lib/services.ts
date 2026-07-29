/** The productised managed-delivery offer catalogue — the core commercial
 *  surface. Static data; each offer has a fixed scope, price, turnaround and
 *  quality guarantee so a buyer can act without a meeting. Figures are
 *  illustrative starting points; final scope is agreed on a call. */

export type Service = {
  slug: string;
  name: string;
  category: string;
  summary: string;
  price: string;
  turnaround: string;
  guarantee: string;
  includes: string[];
};

export const SERVICES: Service[] = [
  {
    slug: "catalogue-cleanup",
    name: "Catalogue Cleanup",
    category: "E-commerce operations",
    summary:
      "Clean, structure and enrich your product catalogue — titles, attributes, categories and images sorted.",
    price: "from $600",
    turnaround: "1,000 SKUs in 10 days",
    guarantee: "99%+ field accuracy, or we rework it free",
    includes: [
      "Standardised titles & attributes",
      "Category mapping to your taxonomy",
      "Image checks & tagging",
      "Reason-coded QA on every record",
    ],
  },
  {
    slug: "annotation-sprint",
    name: "Annotation Sprint",
    category: "AI & ML data operations",
    summary:
      "Labelled, reviewed training data for your models, with inter-annotator agreement you can audit.",
    price: "from ~$1,400",
    turnaround: "10,000 items in 7–14 days",
    guarantee: "98%+ inter-annotator agreement",
    includes: [
      "Guideline design with your team",
      "Human labelling + adjudication",
      "Edge-case escalation",
      "Full quality report",
    ],
  },
  {
    slug: "archive-to-digital",
    name: "Archive to Digital",
    category: "Data operations (Kenya)",
    summary:
      "Turn paper archives into clean, searchable digital records — indexed and quality-checked.",
    price: "from KES 120,000",
    turnaround: "10,000 pages in 15 days",
    guarantee: "Verified capture accuracy, double-keyed where it matters",
    includes: [
      "Scanning & capture",
      "Indexing to your schema",
      "Double-key verification",
      "eTIMS invoice, compliance handled",
    ],
  },
  {
    slug: "support-desk-lite",
    name: "Support Desk Lite",
    category: "Customer support",
    summary:
      "A managed support team handling your email and chat tickets to an agreed SLA.",
    price: "from $1,150 / month",
    turnaround: "Ongoing, SLA-bound",
    guarantee: "Response-time SLA with service credits",
    includes: [
      "Trained-to-your-brand agents",
      "One named delivery lead",
      "Daily digest + monthly review",
      "Coverage across European hours",
    ],
  },
  {
    slug: "lead-engine-500",
    name: "Lead Engine 500",
    category: "Research & lead operations",
    summary:
      "500 verified, enriched leads matched to your ideal-customer profile — checked, not scraped.",
    price: "from $350",
    turnaround: "500 leads in 7 days",
    guarantee: "Verified contacts; replacements for any bad record",
    includes: [
      "ICP definition with you",
      "Sourcing & enrichment",
      "Human verification",
      "Clean, ready-to-use export",
    ],
  },
  {
    slug: "swahili-localisation",
    name: "Swahili Localisation Pack",
    category: "East-African languages",
    summary:
      "Natural Swahili localisation of your product, content or support — by first-language specialists.",
    price: "from $450",
    turnaround: "Scoped per project",
    guarantee: "Reviewed by a second linguist before delivery",
    includes: [
      "Translation & localisation",
      "Tone & terminology guide",
      "Second-linguist review",
      "Somali, Amharic & French on request",
    ],
  },
];
