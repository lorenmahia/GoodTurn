export type ContactHit = { kind: "email" | "phone" | "url"; match: string };

export const CONTACT_BLOCK_MESSAGE =
  "Keep it on Goodturn — remove the email, phone number, or link. " +
  "You'll connect through Goodturn Connect once you're accepted.";

const EMAIL = /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/gi;

// "jane at gmail dot com", "jane(at)yahoo(dot)co(dot)ke"
// Bracket/paren forms ((at), [at], (dot), [dot]) are deliberate obfuscation
// and match any domain. The fully bare-word "at"/"dot" form is also how
// ordinary prose reads ("aim at high dot accuracy targets"), so it only
// counts as an email when the domain is a well-known mail provider or the
// dot-chain is 2+ segments ending in a real TLD — see isSpelledEmailPlausible.
// Capture groups: 1=local, 2=atTok, 3=domain, 4=tail (dot-chain).
const EMAIL_SPELLED =
  /\b([\w.%+-]{2,})\s*(\(at\)|\[at\]|\bat\b)\s*([\w-]{2,})((?:\s*(?:\(dot\)|\[dot\]|\bdot\b)\s*[a-z]{2,}){1,3})\b/gi;

const KNOWN_MAIL_PROVIDERS = new Set([
  "gmail",
  "yahoo",
  "hotmail",
  "outlook",
  "proton",
  "protonmail",
  "icloud",
  "zoho",
  "gmx",
  "aol",
  "mail",
]);

const REAL_TLDS = new Set(["com", "net", "org", "io", "co", "ke", "me", "app", "dev", "info", "biz", "xyz", "link"]);

function isSpelledEmailPlausible(m: RegExpMatchArray): boolean {
  const atTok = m[2];
  const domain = m[3];
  const tail = m[4];
  const isBareAt = /^at$/i.test(atTok);
  const dotTokens = [...tail.matchAll(/(\(dot\)|\[dot\]|\bdot\b)\s*([a-z]{2,})/gi)];
  const allBareDot = dotTokens.every((d) => /^dot$/i.test(d[1]));

  // Any bracket/paren form used anywhere is deliberate obfuscation: allow any domain.
  if (!isBareAt || !allBareDot) return true;

  // Fully bare "at"/"dot" form: gate on a known provider or a real multi-segment TLD chain.
  if (KNOWN_MAIL_PROVIDERS.has(domain.toLowerCase())) return true;

  const lastSegment = dotTokens[dotTokens.length - 1]?.[2]?.toLowerCase();
  return dotTokens.length >= 2 && !!lastSegment && REAL_TLDS.has(lastSegment);
}

// Digit runs that look like phone numbers once separators are stripped.
// >= 9 digits (Kenyan mobiles are 10; internationals 11-13). Plain amounts,
// years, and hour counts stay far below 9 digits.
const PHONE_CANDIDATE = /\+?\d(?:[\s\-().]{0,3}\d){6,}/g;

const URL_EXPLICIT = /\b(?:https?:\/\/|www\.)[^\s,;]+/gi;

// Bare domains on common TLDs. ".js" style tech names are not in the TLD
// list, so "Node.js" never matches. ".NET" style acronym tech names
// (ASP.NET, VB.NET) DO share a listed TLD ("net"), so a bare-domain match is
// treated as a tech term (not a url) only when the label before the dot is
// itself one of a short, known language/framework acronym (asp, vb) AND the
// TLD is "net" — NOT based on casing (a real domain like JANE.COM or
// HIREME.IO must still flag regardless of how it's cased). See
// isTechTermNotUrl.
// Capture groups: 1=domain label, 2=tld, 3=path.
const URL_BARE =
  /\b([a-z0-9-]{2,})\.(com|net|org|io|co(?:\.[a-z]{2})?|ke|me|app|dev|info|biz|xyz|link)(\/[^\s,;]*)?\b/gi;

const TECH_ACRONYM_DOMAIN_LABELS = new Set(["asp", "vb"]);

function isTechTermNotUrl(m: RegExpMatchArray): boolean {
  const domainLabel = m[1];
  const tld = m[2];
  const path = m[3];
  if (path) return false;
  if (tld.toLowerCase() !== "net") return false;
  return TECH_ACRONYM_DOMAIN_LABELS.has(domainLabel.toLowerCase());
}

// A platform name with an @handle nearby.
const MESSENGER = /\b(?:whatsapp|telegram|signal|discord|skype|wechat|imo)\b[^.!?\n]{0,30}@[a-z0-9_.]{3,}/gi;

function digitCount(s: string): number {
  return (s.match(/\d/g) ?? []).length;
}

export function findContactInfo(text: string): ContactHit[] {
  const hits: ContactHit[] = [];

  for (const m of text.matchAll(EMAIL)) hits.push({ kind: "email", match: m[0] });
  for (const m of text.matchAll(EMAIL_SPELLED)) {
    if (isSpelledEmailPlausible(m)) hits.push({ kind: "email", match: m[0] });
  }

  for (const m of text.matchAll(PHONE_CANDIDATE)) {
    if (digitCount(m[0]) >= 9) hits.push({ kind: "phone", match: m[0].trim() });
  }

  for (const m of text.matchAll(URL_EXPLICIT)) hits.push({ kind: "url", match: m[0] });
  for (const m of text.matchAll(URL_BARE)) {
    if (isTechTermNotUrl(m)) continue;
    // Skip if already covered by an explicit URL hit.
    if (!hits.some((h) => h.kind === "url" && h.match.includes(m[0]))) {
      hits.push({ kind: "url", match: m[0] });
    }
  }
  for (const m of text.matchAll(MESSENGER)) hits.push({ kind: "url", match: m[0] });

  return hits;
}
