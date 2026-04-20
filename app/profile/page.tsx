import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { MobileShell } from "@/app/_components/mobile-shell";
import { Suspense } from "react";
import { ProfileContent } from "./_components/profile-content";
import ProfileLoading from "./loading";

export default async function ProfilePage() {
  const session = await auth();

  if (!session?.user?.athleteId) {
    redirect("/login");
  }

  return (
    <MobileShell title="Profile" subtitle="Athlete profile">
      <Suspense fallback={<ProfileLoading />}>
        <ProfileContent athleteId={session.user.athleteId} />
      </Suspense>
    </MobileShell>
  );
}
