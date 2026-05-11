"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, CalendarCheck, CheckCircle2, Clock3, MessageSquareText, PhoneCall } from "lucide-react";
import { useAuth } from "@clerk/nextjs";

const pilotSetupHref =
  "mailto:jaimetawil819@gmail.com?subject=RoofLead%20pilot%20setup";

const proofPoints = [
  "14-day free trial",
  "Card required",
  "Cancel before day 14 and pay nothing",
];

export default function Hero() {
  const { isSignedIn } = useAuth();
  const ctaHref = isSignedIn ? "/dashboard" : "/sign-up";
  const ctaLabel = isSignedIn ? "Go to Dashboard" : "Start Free Trial";

  return (
    <section className="relative overflow-hidden bg-slate-950 px-4 pb-20 pt-16 text-white sm:px-6 lg:px-8 lg:pb-24 lg:pt-20">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-blue-400/60 to-transparent" />
      <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
        <div className="max-w-3xl">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-400/30 bg-blue-500/10 px-4 py-2 text-sm font-semibold text-blue-100">
            <span className="h-2 w-2 rounded-full bg-emerald-400" aria-hidden="true" />
            AI lead response for roofing companies
          </div>

          <h1 className="max-w-4xl text-4xl font-bold leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl">
            Stop losing paid roofing leads because nobody replied fast enough.
          </h1>

          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300 sm:text-xl">
            RoofLead texts every new form submission in under 60 seconds, asks
            the right qualification questions, then gives you a scored summary
            so you know who to call first.
          </p>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Button
              asChild
              size="lg"
              className="min-h-12 bg-blue-600 px-7 text-base font-semibold text-white hover:bg-blue-500"
            >
              <Link href={ctaHref}>
                {ctaLabel}
                <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="min-h-12 border-white/20 bg-white/5 px-7 text-base font-semibold text-white hover:bg-white/10 hover:text-white"
            >
              <a href={pilotSetupHref}>
                <CalendarCheck className="mr-2 h-4 w-4" aria-hidden="true" />
                Book Pilot Setup
              </a>
            </Button>
          </div>

          <Link
            href="#proof"
            className="mt-4 inline-flex min-h-10 items-center gap-2 text-sm font-bold text-blue-200 transition-colors hover:text-blue-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
          >
            View product preview
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>

          {!isSignedIn && (
            <div className="mt-7 flex flex-col gap-3 text-sm text-slate-300 sm:flex-row sm:flex-wrap">
              {proofPoints.map((item) => (
                <span key={item} className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" aria-hidden="true" />
                  {item}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="relative">
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3 shadow-2xl shadow-blue-950/50">
            <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-900">
              <div className="flex items-center justify-between border-b border-slate-800 bg-slate-950 px-4 py-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Next lead to call
                  </p>
                  <p className="mt-1 text-sm font-semibold text-white">
                    Sarah Martinez
                  </p>
                </div>
                <span className="rounded-full bg-red-500/15 px-3 py-1 text-xs font-bold text-red-200">
                  HOT
                </span>
              </div>

              <div className="grid gap-0 md:grid-cols-[0.9fr_1.1fr]">
                <div className="border-b border-slate-800 p-5 md:border-b-0 md:border-r">
                  <div className="rounded-xl border border-blue-400/20 bg-blue-500/10 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-blue-200">
                      AI summary
                    </p>
                    <p className="mt-2 text-sm leading-6 text-slate-200">
                      Hail damage after last night&apos;s storm. Water is
                      actively leaking into a bedroom. Homeowner wants an
                      inspection today.
                    </p>
                  </div>

                  <div className="mt-5 space-y-3 text-sm">
                    <div className="flex items-center gap-3 text-slate-300">
                      <Clock3 className="h-4 w-4 text-amber-300" aria-hidden="true" />
                      Active leak, today if possible
                    </div>
                    <div className="flex items-center gap-3 text-slate-300">
                      <MessageSquareText className="h-4 w-4 text-blue-300" aria-hidden="true" />
                      4 minute SMS intake completed
                    </div>
                    <div className="flex items-center gap-3 text-slate-300">
                      <PhoneCall className="h-4 w-4 text-emerald-300" aria-hidden="true" />
                      Call first, estimate likely
                    </div>
                  </div>

                  <a
                    href="tel:+16195550182"
                    className="mt-6 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg bg-emerald-500 px-4 py-3 text-sm font-bold text-slate-950 transition-colors hover:bg-emerald-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
                  >
                    <PhoneCall className="h-4 w-4" aria-hidden="true" />
                    Call Sarah Now
                  </a>
                </div>

                <div className="p-5">
                  <div className="mb-4 flex items-center justify-between">
                    <p className="text-sm font-semibold text-white">SMS intake</p>
                    <span className="text-xs font-medium text-slate-500">Just now</span>
                  </div>
                  <div className="space-y-3 text-sm">
                    <div className="max-w-[88%] rounded-2xl rounded-tl-sm bg-slate-800 px-4 py-2.5 leading-6 text-slate-200">
                      Hi Sarah, what happened with the roof?
                    </div>
                    <div className="ml-auto max-w-[88%] rounded-2xl rounded-tr-sm bg-blue-600 px-4 py-2.5 leading-6 text-white">
                      Hail last night. Water is leaking in the bedroom.
                    </div>
                    <div className="max-w-[88%] rounded-2xl rounded-tl-sm bg-slate-800 px-4 py-2.5 leading-6 text-slate-200">
                      Do you own the home, and is water still coming in?
                    </div>
                    <div className="ml-auto max-w-[88%] rounded-2xl rounded-tr-sm bg-blue-600 px-4 py-2.5 leading-6 text-white">
                      Yes, I own it. It is still dripping.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-3 gap-3 text-center">
            {[
              ["<60s", "first reply"],
              ["24/7", "lead intake"],
              ["Hot", "priority score"],
            ].map(([value, label]) => (
              <div key={label} className="rounded-xl border border-white/10 bg-white/[0.04] px-3 py-4">
                <p className="text-lg font-black text-white">{value}</p>
                <p className="mt-1 text-xs text-slate-400">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
