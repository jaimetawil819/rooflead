"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  CheckCircle2,
  CreditCard,
  MessageSquareText,
  ShieldCheck,
} from "lucide-react";

const trialFeatures = [
  "AI SMS lead qualification responds in under 60 seconds",
  "Lead score and summary sent to your phone",
  "Embeddable web form widget",
  "Lead dashboard with full conversation history",
  "Cancel before day 14 and pay nothing",
];

export default function SubscribePage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubscribe() {
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/billing/checkout", { method: "POST" });
      const data = await res.json();

      if (data.url) {
        window.location.href = data.url;
        return;
      }

      setError("Checkout could not be started. Please try again.");
    } catch {
      setError("Checkout could not be started. Please try again.");
    } finally {
      setLoading(false);
    }
  }

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
            Activate Starter
          </p>
          <h1 className="mt-4 text-3xl font-bold leading-tight tracking-tight sm:text-4xl">
            Start the 14-day RoofLead trial with card-backed checkout.
          </h1>
          <p className="mt-4 text-base leading-7 text-slate-300">
            Stripe stores your payment method securely. You get 14 days to test
            lead intake, owner alerts, and the dashboard before Starter begins
            at $149/month.
          </p>

          <div className="mt-7 grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
            {[
              {
                icon: CreditCard,
                title: "Card required",
                copy: "Required to activate the trial, not charged today.",
              },
              {
                icon: MessageSquareText,
                title: "Test real intake",
                copy: "Submit a form and verify the SMS qualification flow.",
              },
              {
                icon: ShieldCheck,
                title: "Cancel anytime",
                copy: "Cancel before day 14 from the billing portal.",
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

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/70 sm:p-8">
          <div className="inline-flex rounded-full bg-blue-50 px-3 py-1 text-xs font-bold uppercase tracking-wide text-blue-700">
            Starter Plan
          </div>
          <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-3xl font-bold text-slate-950">14 days free</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Then $149/month for one roofing business location.
              </p>
            </div>
            <p className="text-sm font-bold text-slate-500">Card required</p>
          </div>

          <div className="mt-7 space-y-3">
            {trialFeatures.map((feature) => (
              <div key={feature} className="flex items-start gap-3 text-sm text-slate-700">
                <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-emerald-600" aria-hidden="true" />
                <span>{feature}</span>
              </div>
            ))}
          </div>

          {error && (
            <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700" role="alert">
              {error}
            </div>
          )}

          <Button
            onClick={handleSubscribe}
            disabled={loading}
            className="mt-8 min-h-12 w-full bg-blue-600 text-base font-bold text-white hover:bg-blue-700"
          >
            {loading ? "Redirecting to checkout..." : "Start Free Trial"}
            {!loading && <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />}
          </Button>

          <p className="mt-4 rounded-xl border border-blue-100 bg-blue-50 p-4 text-xs leading-6 text-slate-700">
            Your card is required for activation, but you will not be charged
            during the 14-day trial. Stripe handles payment details securely.
          </p>
        </section>
      </div>
    </main>
  );
}
