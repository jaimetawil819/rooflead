import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Check, CreditCard, ShieldCheck } from "lucide-react";
import { pilotSetupHref } from "@/lib/contact";

const plan = {
  name: "Starter",
  price: "$149",
  period: "/month",
  description:
    "For owner-operated roofing companies that need every web lead answered fast.",
  features: [
    "1 business location",
    "Up to 200 AI lead conversations/month",
    "Lead dashboard with hot/warm/cold scoring",
    "SMS owner alerts and AI summaries",
    "Embeddable website form",
    "Manual owner takeover by SMS",
    "Billing portal and cancel anytime",
  ],
  cta: "Start Free Trial",
};

export default function Pricing() {
  return (
    <section id="pricing" className="bg-slate-50 px-4 py-20 sm:px-6 lg:px-8 lg:py-24">
      <div className="mx-auto max-w-7xl">
        <div className="mx-auto mb-12 max-w-3xl text-center">
          <p className="mb-4 text-sm font-semibold uppercase tracking-widest text-blue-600">
            Pricing
          </p>
          <h2 className="text-3xl font-bold leading-tight text-slate-950 sm:text-4xl">
            Simple enough to decide today. Valuable enough to pay for itself
            with one recovered job.
          </h2>
          <p className="mt-5 text-lg leading-8 text-slate-600">
            Start with a 14-day free trial. Enter your card to activate the
            trial, cancel before day 14, and pay nothing.
          </p>
        </div>

        <div className="mx-auto grid max-w-5xl gap-6 lg:grid-cols-[1fr_0.72fr] lg:items-stretch">
          <div className="rounded-2xl border-2 border-blue-600 bg-white p-6 shadow-xl shadow-blue-100 sm:p-8">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <span className="inline-flex rounded-full bg-blue-50 px-3 py-1 text-xs font-bold uppercase tracking-wide text-blue-700">
                  Launch Plan
                </span>
                <h3 className="mt-4 text-2xl font-bold text-slate-950">{plan.name}</h3>
                <p className="mt-2 max-w-xl text-sm leading-6 text-slate-600">{plan.description}</p>
              </div>
              <div className="sm:text-right">
                <div className="flex items-end gap-1 sm:justify-end">
                  <span className="text-5xl font-black tracking-tight text-slate-950">{plan.price}</span>
                  <span className="mb-2 text-sm font-medium text-slate-500">{plan.period}</span>
                </div>
                <p className="mt-2 text-sm text-slate-500">14 days free, card required</p>
              </div>
            </div>

            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              {plan.features.map((feature) => (
                <div key={feature} className="flex items-start gap-3 text-sm text-slate-700">
                  <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-emerald-600" aria-hidden="true" />
                  <span>{feature}</span>
                </div>
              ))}
            </div>

            <Button
              asChild
              className="mt-8 min-h-12 w-full bg-blue-600 text-base font-semibold text-white hover:bg-blue-700 sm:w-auto sm:px-8"
            >
              <Link href="/sign-up">{plan.cta}</Link>
            </Button>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-950 p-6 text-white sm:p-8">
            <p className="text-sm font-semibold uppercase tracking-wide text-blue-200">
              What happens during trial
            </p>
            <div className="mt-6 space-y-5">
              <div className="flex gap-3">
                <CreditCard className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-300" aria-hidden="true" />
                <div>
                  <h4 className="font-semibold text-white">Card required</h4>
                  <p className="mt-1 text-sm leading-6 text-slate-300">
                    Stripe stores billing details securely and starts the paid
                    subscription only after the trial ends.
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <ShieldCheck className="mt-0.5 h-5 w-5 flex-shrink-0 text-emerald-300" aria-hidden="true" />
                <div>
                  <h4 className="font-semibold text-white">Cancel anytime</h4>
                  <p className="mt-1 text-sm leading-6 text-slate-300">
                    Cancel before day 14 from the billing portal and you will
                    not be charged.
                  </p>
                </div>
              </div>
            </div>
            <p className="mt-8 border-t border-white/10 pt-6 text-sm leading-6 text-slate-300">
              Need more than 200 conversations/month?{" "}
              <a
                href={pilotSetupHref}
                className="font-semibold text-blue-200 hover:text-blue-100"
              >
                Book a pilot setup conversation
              </a>
              .
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
