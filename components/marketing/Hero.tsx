"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle } from "lucide-react";
import { useAuth } from "@clerk/nextjs";

export default function Hero() {
  const { isSignedIn } = useAuth();
  const ctaHref = isSignedIn ? "/dashboard" : "/sign-up";
  const ctaLabel = isSignedIn ? "Go to Dashboard" : "Start Free Trial";

  return (
    <section className="bg-white pt-20 pb-24 px-4 sm:px-6">
      <div className="mx-auto max-w-4xl text-center">
        <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-4 py-1.5 text-sm font-medium text-blue-700 mb-8">
          <span className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
          AI Lead Qualification for Roofing Companies
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-slate-900 leading-tight mb-6">
          Respond to every roofing lead
          <span className="text-blue-600"> in under 60 seconds.</span>
        </h1>

        <p className="text-lg sm:text-xl text-gray-600 leading-relaxed max-w-2xl mx-auto mb-10">
          A homeowner fills out your form at 10 PM. Before you even see the notification,
          our AI has already texted them, asked the right questions, and sent you a summary
          with a lead quality score.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center mb-8">
          <Button asChild size="lg" className="text-base h-12 px-8">
            <Link href={ctaHref}>
              {ctaLabel} <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="text-base h-12 px-8">
            <Link href="#how-it-works">See How It Works</Link>
          </Button>
        </div>

        {!isSignedIn && (
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-sm text-gray-500">
            {["14-day free trial", "Cancel before day 14, pay nothing", "Cancel anytime"].map((item) => (
              <span key={item} className="flex items-center gap-1.5">
                <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                {item}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Mock SMS preview */}
      <div className="mx-auto mt-16 max-w-sm">
        <div className="rounded-2xl bg-slate-900 p-4 shadow-2xl">
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-700">
            <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold">RL</div>
            <div>
              <p className="text-white text-sm font-medium">RoofLead AI</p>
              <p className="text-slate-400 text-xs">Just now</p>
            </div>
          </div>
          <div className="space-y-3 text-sm">
            <div className="bg-slate-700 rounded-2xl rounded-tl-sm px-4 py-2.5 text-white max-w-[85%]">
              Hi Sarah! Thanks for reaching out to ABC Roofing. I&apos;m their automated assistant — can you tell me a bit about what&apos;s going on with your roof?
            </div>
            <div className="bg-blue-600 rounded-2xl rounded-tr-sm px-4 py-2.5 text-white max-w-[85%] ml-auto">
              We had hail yesterday and now there&apos;s a leak in the bedroom
            </div>
            <div className="bg-slate-700 rounded-2xl rounded-tl-sm px-4 py-2.5 text-white max-w-[85%]">
              That sounds urgent! Is water actively coming in right now, or was it leaking during the storm?
            </div>
          </div>
        </div>
        <p className="text-center text-xs text-gray-400 mt-3">This conversation happens automatically — without you lifting a finger</p>
      </div>
    </section>
  );
}
