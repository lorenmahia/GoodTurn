import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { categoryMedianRates } from "@/lib/pricing";
import PostJobForm from "@/components/PostJobForm";

export default async function PostAJobPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login?callbackUrl=/post-a-job");

  const [categories, medians] = await Promise.all([
    prisma.category.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
    categoryMedianRates(),
  ]);

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-accent">Post a Job</p>
      <h1 className="mt-2 text-3xl font-extrabold text-brand dark:text-accent">
        Describe it, price it, post it
      </h1>
      <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
        Your job goes live to freelancers immediately. You set the price — we&apos;ll
        show you what similar jobs pay so you can pitch it right.
      </p>
      <div className="mt-8">
        <PostJobForm categories={categories} medians={medians} />
      </div>
    </div>
  );
}
