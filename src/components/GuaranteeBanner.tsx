import Link from "next/link";

export default function GuaranteeBanner() {
  return (
    <div className="rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-900 dark:border-green-900 dark:bg-green-950/40 dark:text-green-200">
      <p className="font-semibold">A delivery guarantee we stand behind.</p>
      <p className="mt-1">
        Verified fair pay, compliance handled, and work reworked at our cost if we miss the standard we
        agreed.{" "}
        <Link href="/how-it-works" className="font-semibold underline underline-offset-2">See how it works</Link>.
      </p>
    </div>
  );
}
