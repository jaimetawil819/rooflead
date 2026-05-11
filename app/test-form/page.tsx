import Link from "next/link";
import {
  CheckCircle2,
  Clock3,
  MessageSquareText,
  ShieldCheck,
} from "lucide-react";

const inputClass =
  "min-h-11 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600";

export default function SampleTestFormPage() {
  return (
    <main className="min-h-dvh bg-slate-100 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[0.85fr_1.15fr] lg:items-center">
        <section className="rounded-2xl border border-slate-800 bg-slate-950 p-6 text-white shadow-xl shadow-slate-300/40 sm:p-8">
          <p className="text-sm font-semibold uppercase tracking-widest text-blue-300">
            Public Test Form
          </p>
          <h1 className="mt-4 text-3xl font-bold leading-tight tracking-tight sm:text-4xl">
            See the homeowner opt-in experience before installing RoofLead.
          </h1>
          <p className="mt-4 text-base leading-7 text-slate-300">
            This static sample shows the consent language, fields, and trust
            cues a homeowner sees when requesting a roofing estimate.
          </p>

          <div className="mt-7 grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
            {[
              {
                icon: Clock3,
                title: "Fast response",
                copy: "Sets the expectation that SMS follow-up happens quickly.",
              },
              {
                icon: MessageSquareText,
                title: "Clear SMS consent",
                copy: "Explains automated texts, message rates, STOP, and HELP.",
              },
              {
                icon: ShieldCheck,
                title: "Professional handoff",
                copy: "Feels like a credible roofing intake, not a generic form.",
              },
            ].map(({ icon: Icon, title, copy }) => (
              <div key={title} className="rounded-xl border border-white/10 bg-white/[0.04] p-4">
                <Icon className="h-5 w-5 text-blue-300" aria-hidden="true" />
                <h2 className="mt-3 text-sm font-bold text-white">{title}</h2>
                <p className="mt-1 text-sm leading-6 text-slate-300">{copy}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white shadow-xl shadow-slate-200/70">
          <div className="rounded-t-2xl bg-slate-950 p-6 text-white">
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-400/30 bg-blue-500/10 px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-blue-100">
              <span className="h-2 w-2 rounded-full bg-emerald-400" aria-hidden="true" />
              Sample opt-in form
            </div>
            <h2 className="mt-4 text-2xl font-bold leading-tight">
              Request a roofing estimate
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-300">
              Submit the form and the roofing company follows up by SMS to
              qualify your request.
            </p>
          </div>

          <form className="space-y-4 p-6">
            <div>
              <label htmlFor="sample-name" className="mb-1.5 block text-sm font-bold text-slate-700">
                Your Name
              </label>
              <input id="sample-name" className={inputClass} placeholder="Jane Smith" readOnly />
            </div>

            <div>
              <label htmlFor="sample-phone" className="mb-1.5 block text-sm font-bold text-slate-700">
                Phone Number
              </label>
              <input
                id="sample-phone"
                type="tel"
                className={inputClass}
                placeholder="+1 555 000 0000"
                readOnly
              />
            </div>

            <div>
              <label htmlFor="sample-address" className="mb-1.5 block text-sm font-bold text-slate-700">
                Property Address
              </label>
              <input
                id="sample-address"
                className={inputClass}
                placeholder="123 Main St, San Diego, CA"
                readOnly
              />
            </div>

            <div>
              <label htmlFor="sample-service" className="mb-1.5 block text-sm font-bold text-slate-700">
                What do you need?
              </label>
              <select id="sample-service" className={inputClass} defaultValue="repair">
                <option value="repair">Roof Repair</option>
                <option value="replacement">Full Replacement</option>
                <option value="inspection">Inspection</option>
                <option value="storm_damage">Storm Damage</option>
              </select>
            </div>

            <p className="rounded-xl border border-blue-100 bg-blue-50 p-4 text-xs leading-6 text-slate-700">
              By submitting, you agree to receive automated SMS messages from
              this roofing business about your estimate request. Message and
              data rates may apply. Message frequency varies. Reply STOP to opt
              out or HELP for help. See our{" "}
              <Link href="/privacy" className="font-bold text-blue-700 hover:underline">
                Privacy Policy
              </Link>{" "}
              and{" "}
              <Link href="/terms" className="font-bold text-blue-700 hover:underline">
                Terms
              </Link>
              .
            </p>

            <button
              type="button"
              className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-3 text-base font-bold text-white transition-colors hover:bg-blue-700"
            >
              <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
              Get a Free Estimate
            </button>
          </form>
        </section>
      </div>
    </main>
  );
}
