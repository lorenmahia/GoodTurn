import Link from "next/link";

export default function GuaranteeBanner() {
  return (
    <div className="rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-900 dark:border-green-900 dark:bg-green-950/40 dark:text-green-200">
      <p className="font-semibold">Goodturn never charges you to work.</p>
      <p className="mt-1">
        You never pay to apply or to work — money only ever flows to you. If anyone asks you for money or to move off
        Goodturn, <Link href="/safety" className="font-semibold underline underline-offset-2">report it</Link>.
      </p>
    </div>
  );
}
