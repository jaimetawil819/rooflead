import { SignIn } from "@clerk/nextjs";
import Image from "next/image";
import Link from "next/link";
import { CheckCircle2, MessageSquareText, ShieldCheck } from "lucide-react";

export default function SignInPage() {
  return (
    <main className="min-h-dvh bg-slate-100 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
        <section className="rounded-2xl border border-slate-800 bg-slate-950 p-6 text-white shadow-xl shadow-slate-300/40 sm:p-8">
          <Link
            href="/"
            className="inline-flex rounded-lg bg-white px-2 py-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300"
          >
            <Image src="/logo.png" alt="RoofLead" width={132} height={38} className="h-8 w-auto" />
          </Link>
          <p className="mt-8 text-sm font-semibold uppercase tracking-widest text-blue-300">
            Welcome back
          </p>
          <h1 className="mt-4 text-3xl font-bold leading-tight tracking-tight sm:text-4xl">
            Sign in to review qualified roofing leads.
          </h1>
          <p className="mt-4 text-base leading-7 text-slate-300">
            Get back to the owner dashboard, review hot leads, and take over
            any SMS conversation that needs human judgment.
          </p>

          <div className="mt-7 grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
            {[
              { icon: MessageSquareText, title: "SMS history", copy: "Review the full intake timeline." },
              { icon: CheckCircle2, title: "Lead priority", copy: "See hot, warm, and review-needed leads." },
              { icon: ShieldCheck, title: "Protected app", copy: "Dashboard routes require a signed-in account." },
            ].map(({ icon: Icon, title, copy }) => (
              <div key={title} className="rounded-xl border border-white/10 bg-white/[0.04] p-4">
                <Icon className="h-5 w-5 text-blue-300" aria-hidden="true" />
                <h2 className="mt-3 text-sm font-bold text-white">{title}</h2>
                <p className="mt-1 text-sm leading-6 text-slate-300">{copy}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="flex justify-center rounded-2xl border border-slate-200 bg-white p-4 shadow-xl shadow-slate-200/70 sm:p-8">
          <SignIn />
        </section>
      </div>
    </main>
  );
}
