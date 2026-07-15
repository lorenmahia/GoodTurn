import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import ProfileForm from "@/components/ProfileForm";

export default async function ProfilePage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login?callbackUrl=/profile");

  const user = await prisma.user.findUniqueOrThrow({
    where: { id: session.user.id },
    select: { displayName: true, bio: true, skills: true, hourlyRate: true },
  });

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <h1 className="text-3xl font-bold text-brand">My Profile</h1>
      <p className="mt-1 text-sm text-neutral-600">
        Your skills power the Find Best Match ranking — keep them current.
      </p>
      <div className="mt-8">
        <ProfileForm user={user} />
      </div>
    </div>
  );
}
