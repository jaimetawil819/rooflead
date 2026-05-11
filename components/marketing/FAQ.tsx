"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

const faqs = [
  {
    q: "Do I need to change my website?",
    a: "No major rebuild is needed. You can use the RoofLead test form or add one small embed snippet where you want the lead form to appear.",
  },
  {
    q: "What if someone texts back in the middle of the night?",
    a: "RoofLead keeps the qualification conversation moving automatically, even after hours. You see the summary when you are ready to act.",
  },
  {
    q: "Will the AI quote prices or promise availability?",
    a: "No. The assistant is limited to intake and qualification. It asks about the roof issue, urgency, ownership, and timing, then hands the lead to you.",
  },
  {
    q: "Can I take over the conversation?",
    a: "Yes. The dashboard supports manual owner reply, and owner takeover pauses future AI auto-replies for that lead.",
  },
  {
    q: "Can I use RoofLead with my current CRM?",
    a: "Yes. RoofLead is meant to handle fast first response and qualification before the lead moves into your normal sales process.",
  },
  {
    q: "Is SMS consent handled?",
    a: "The RoofLead form includes SMS opt-in language and supports STOP handling. You should still review your own compliance obligations before running paid traffic.",
  },
];

export default function FAQ() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section className="bg-white px-4 py-20 sm:px-6 lg:px-8 lg:py-24">
      <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.75fr_1.25fr]">
        <div>
          <p className="mb-4 text-sm font-semibold uppercase tracking-widest text-blue-600">
            FAQ
          </p>
          <h2 className="text-3xl font-bold leading-tight text-slate-950 sm:text-4xl">
            Questions roofers ask before trusting AI with lead intake.
          </h2>
          <p className="mt-5 text-lg leading-8 text-slate-600">
            Clear answers beat clever copy. These are the operational concerns
            that matter before putting SMS automation in front of real leads.
          </p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <div key={faq.q} className="overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
              <button
                type="button"
                onClick={() => setOpen(open === i ? null : i)}
                className="flex min-h-14 w-full items-center justify-between gap-4 px-5 py-4 text-left transition-colors hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-inset"
                aria-expanded={open === i}
              >
                <span className="text-sm font-semibold text-slate-950 sm:text-base">{faq.q}</span>
                <ChevronDown
                  className={`h-5 w-5 flex-shrink-0 text-slate-500 transition-transform duration-200 ${
                    open === i ? "rotate-180" : ""
                  }`}
                  aria-hidden="true"
                />
              </button>
              {open === i && (
                <div className="border-t border-slate-200 bg-white px-5 py-4 text-sm leading-6 text-slate-600">
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
