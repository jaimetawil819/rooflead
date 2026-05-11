import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CheckCircle2, Code2, MessageSquareText } from "lucide-react";

export default function SubscribeSuccessPage() {
  return (
    <main className="min-h-dvh bg-slate-100 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl shadow-slate-200/70">
        <section className="bg-slate-950 p-6 text-white sm:p-8">
          <Link
            href="/"
            className="inline-flex rounded-lg bg-white px-2 py-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300"
          >
            <Image src="/logo.png" alt="RoofLead" width={132} height={38} className="h-8 w-auto" />
          </Link>

          <div className="mt-8 inline-flex items-center gap-2 rounded-full border border-emerald-300/30 bg-emerald-300/10 px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-emerald-100">
            <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
            Trial active
          </div>
          <h1 className="mt-4 text-3xl font-bold leading-tight tracking-tight sm:text-4xl">
            Your RoofLead trial is ready.
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-slate-300">
            Head to the dashboard to finish business setup, test the intake
            form, and install the website widget.
          </p>
        </section>

        <section className="grid gap-4 p-6 sm:p-8 md:grid-cols-3">
          {[
            {
              icon: MessageSquareText,
              title: "Set owner alerts",
              copy: "Choose where qualified lead summaries should go.",
            },
            {
              icon: Code2,
              title: "Install the widget",
              copy: "Copy the embed snippet from Lead Form settings.",
            },
            {
              icon: CheckCircle2,
              title: "Submit a test lead",
              copy: "Confirm the SMS intake flow before paid traffic hits it.",
            },
          ].map(({ icon: Icon, title, copy }) => (
            <div key={title} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <Icon className="h-5 w-5 text-blue-600" aria-hidden="true" />
              <h2 className="mt-3 text-sm font-bold text-slate-950">{title}</h2>
              <p className="mt-1 text-sm leading-6 text-slate-600">{copy}</p>
            </div>
          ))}
        </section>

        <div className="border-t border-slate-200 p-6 sm:p-8">
          <Link
            href="/dashboard"
            className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-3 text-base font-bold text-white transition-colors hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 sm:w-auto"
          >
            Go to Dashboard
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </main>
  );
}
