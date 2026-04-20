import { redirect } from "next/navigation";
import Image from "next/image";

import { auth } from "@/auth";
import { signInWithStrava } from "@/app/login/actions";
import { Button } from "@/components/ui/button";

export default async function LoginPage() {
  const session = await auth();

  if (session?.user?.athleteId) {
    redirect("/feed");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,#fff7ed,white_40%,#ffe4c7_100%)] px-6 py-12">
      <div className="w-full max-w-md rounded-3xl border border-orange-100 bg-white/90 p-8 shadow-[0_30px_120px_-30px_rgba(234,88,12,0.45)] backdrop-blur">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-xl border border-orange-100 shadow-sm">
              <Image
                src="/logo.png"
                alt="Pacer Logo"
                fill
                className="object-cover"
              />
            </div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-orange-600">
              Pacer
            </p>
          </div>
          <h1 className="font-sans text-4xl font-semibold tracking-tight text-slate-950">
            Train with your data, not guesses.
          </h1>
          <p className="text-base leading-7 text-slate-600">
            Sign in with Strava to sync your activities, store tokens securely,
            and unlock the AI coach foundation.
          </p>
        </div>

        <form action={signInWithStrava} className="mt-8">
          <Button
            type="submit"
            size="lg"
            className="w-full rounded-xl text-white"
          >
            Continue with Strava
          </Button>
        </form>
      </div>
    </main>
  );
}
