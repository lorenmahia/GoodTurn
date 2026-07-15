import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import PostJobForm from "@/components/PostJobForm";

export default async function PostAJobPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login?callbackUrl=/post-a-job");

  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true, minHourlyRate: true },
  });

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <h1 className="text-3xl font-bold text-brand">Post a Job</h1>
      <p className="mt-1 text-sm text-neutral-600">
        Once you submit, your job is live to freelancers who can start applying.
        Payment is collected when you accept a freelancer (payments launch soon).
      </p>
      <div className="mt-8">
        <PostJobForm categories={categories} />
      </div>
    </div>
  );
}
