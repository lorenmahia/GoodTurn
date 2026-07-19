export type ContactHit = { kind: "email" | "phone" | "url"; match: string };

export const CONTACT_BLOCK_MESSAGE =
  "Keep it on Goodturn — remove the email, phone number, or link. " +
  "You'll connect through Goodturn Connect once you're accepted.";

const EMAIL = /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/gi;

// "jane at gmail dot com", "jane(at)yahoo(dot)co(dot)ke"
const EMAIL_SPELLED =
  /\b[\w.%+-]{2,}\s*(?:\(at\)|\[at\]|\bat\b)\s*[\w-]{2,}(?:\s*(?:\(dot\)|\[dot\]|\bdot\b)\s*[a-z]{2,}){1,3}\b/gi;

// Digit runs that look like phone numbers once separators are stripped.
// >= 9 digits (Kenyan mobiles are 10; internationals 11-13). Plain amounts,
// years, and hour counts stay far below 9 digits.
const PHONE_CANDIDATE = /\+?\d(?:[\s\-().]{0,3}\d){6,}/g;

const URL_EXPLICIT = /\b(?:https?:\/\/|www\.)[^\s,;]+/gi;

// Bare domains on common TLDs. ".js"/".NET" style tech names are not in the
// list, so "Node.js" never matches.
const URL_BARE =
  /\b[a-z0-9-]{2,}\.(?:com|net|org|io|co(?:\.[a-z]{2})?|ke|me|app|dev|info|biz|xyz|link)(?:\/[^\s,;]*)?\b/gi;

// A platform name with an @handle nearby.
const MESSENGER = /\b(?:whatsapp|telegram|signal|discord|skype|wechat|imo)\b[^.!?\n]{0,30}@[a-z0-9_.]{3,}/gi;

function digitCount(s: string): number {
  return (s.match(/\d/g) ?? []).length;
}

export function findContactInfo(text: string): ContactHit[] {
  const hits: ContactHit[] = [];

  for (const m of text.matchAll(EMAIL)) hits.push({ kind: "email", match: m[0] });
  for (const m of text.matchAll(EMAIL_SPELLED)) hits.push({ kind: "email", match: m[0] });

  for (const m of text.matchAll(PHONE_CANDIDATE)) {
    if (digitCount(m[0]) >= 9) hits.push({ kind: "phone", match: m[0].trim() });
  }

  for (const m of text.matchAll(URL_EXPLICIT)) hits.push({ kind: "url", match: m[0] });
  for (const m of text.matchAll(URL_BARE)) {
    // Skip if already covered by an explicit URL hit.
    if (!hits.some((h) => h.kind === "url" && h.match.includes(m[0]))) {
      hits.push({ kind: "url", match: m[0] });
    }
  }
  for (const m of text.matchAll(MESSENGER)) hits.push({ kind: "url", match: m[0] });

  return hits;
}
