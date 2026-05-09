"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

const faqs = [
  {
    q: "Do I need to change my website?",
    a: "No major changes needed. You add one small line of code to your site where you want the form to appear. If you're not comfortable doing that, we can walk you through it in under 5 minutes — or do it for you.",
  },
  {
    q: "What if someone texts back in the middle of the night?",
    a: "That's the point. The AI handles it automatically, 24/7, no matter when they reply. You sleep. The AI works.",
  },
  {
    q: "Will the AI say something wrong or embarrassing?",
    a: "The AI only asks qualifying questions — it never quotes prices, makes promises, or represents your business in ways you haven't approved. You can review every conversation in your dashboard.",
  },
  {
    q: "What happens after the AI finishes qualifying?",
    a: "You get an SMS notification with the lead's name, what they need, their urgency level, and a Hot/Warm/Cold score. Then you call them — the AI doesn't schedule appointments or close deals.",
  },
  {
    q: "Is this legal? Can I text people who fill out my form?",
    a: "Yes — the form includes TCPA-compliant consent language. By submitting, the homeowner agrees to receive SMS. We handle the compliance language automatically.",
  },
  {
    q: "What if I already have a CRM?",
    a: "RoofLead works alongside your CRM, not instead of it. We handle the instant first response and qualification. You handle the rest in whatever system you already use.",
  },
];

export default function FAQ() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <section className="bg-gray-50 py-24 px-4 sm:px-6">
      <div className="mx-auto max-w-3xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
            Common questions
          </h2>
        </div>

        <div className="space-y-2">
          {faqs.map((faq, i) => (
            <div
              key={i}
              className="bg-white rounded-xl border border-gray-200 overflow-hidden"
            >
              <button
                onClick={() => setOpen(open === i ? null : i)}
                className="w-full flex items-center justify-between px-6 py-5 text-left gap-4 hover:bg-gray-50 transition-colors"
                aria-expanded={open === i}
              >
                <span className="font-medium text-slate-900 text-sm sm:text-base">
                  {faq.q}
                </span>
                <ChevronDown
                  className={`h-5 w-5 text-gray-400 flex-shrink-0 transition-transform duration-200 ${
                    open === i ? "rotate-180" : ""
                  }`}
                  aria-hidden="true"
                />
              </button>
              {open === i && (
                <div className="px-6 pb-5 text-gray-600 text-sm leading-relaxed border-t border-gray-100 pt-4">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
