"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

const faqs = [
  {
    q: "Can I use this with my existing website form?",
    a: "Yes. The fastest setup is the RoofLead embed snippet, but the product is designed around your existing website lead flow: capture the request, text the homeowner quickly, qualify the job, and show the owner what to do next.",
  },
  {
    q: "Does this replace my CRM?",
    a: "No. RoofLead is the fast first-response and qualification layer before your normal sales process. Use it to catch, score, and summarize leads, then move serious opportunities into whatever CRM or follow-up process you already use.",
  },
  {
    q: "What happens if the AI is unsure?",
    a: "The system can flag a lead for owner review instead of pretending to know. The dashboard keeps the conversation, summary, score, and review reason together so you can take over quickly.",
  },
  {
    q: "Can I take over the conversation?",
    a: "Yes. The dashboard supports manual owner reply, and owner takeover pauses future AI auto-replies for that lead.",
  },
  {
    q: "Do I need a new phone number?",
    a: "RoofLead sends automated intake messages through the configured SMS system. For launch, expect to use the RoofLead-managed SMS flow while keeping your normal business phone for calls and owner follow-up.",
  },
  {
    q: "What does setup involve?",
    a: "Create your account, activate the trial, add business details, choose the service options you want on the form, then test the widget before installing the embed snippet on your website.",
  },
  {
    q: "What if someone texts back after hours?",
    a: "RoofLead can keep the qualification conversation moving automatically, even when nobody is at the desk. You see the summary, priority score, and conversation when you are ready to act.",
  },
  {
    q: "Will the AI quote prices or promise availability?",
    a: "No. The assistant is limited to intake and qualification. It asks about the roof issue, urgency, ownership, and timing, then hands the lead to you.",
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
