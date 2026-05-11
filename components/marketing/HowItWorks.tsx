import { Bell, ClipboardList, MessageSquare } from "lucide-react";

const steps = [
  {
    icon: ClipboardList,
    step: "01",
    title: "Connect your lead form",
    description:
      "Use the RoofLead test form or add the embeddable widget to your existing website.",
  },
  {
    icon: MessageSquare,
    step: "02",
    title: "AI qualifies by SMS",
    description:
      "The assistant replies fast, asks about damage, urgency, ownership, and timeline, then records the conversation.",
  },
  {
    icon: Bell,
    step: "03",
    title: "You get the next action",
    description:
      "RoofLead scores the lead and sends you a summary so you can call the best opportunity first.",
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="bg-white px-4 py-20 sm:px-6 lg:px-8 lg:py-24">
      <div className="mx-auto max-w-7xl">
        <div className="mb-14 max-w-3xl">
          <p className="mb-4 text-sm font-semibold uppercase tracking-widest text-blue-600">
            How It Works
          </p>
          <h2 className="text-3xl font-bold leading-tight text-slate-950 sm:text-4xl">
            A simple intake workflow that keeps the owner in control.
          </h2>
          <p className="mt-5 text-lg leading-8 text-slate-600">
            Set it up once. Every qualified web lead gets a fast response, a
            consistent intake path, and a clear owner handoff.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {steps.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.step} className="rounded-xl border border-slate-200 bg-slate-50 p-6">
                <div className="mb-6 flex items-center justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-600 text-white">
                    <Icon className="h-6 w-6" aria-hidden="true" />
                  </div>
                  <span className="text-4xl font-black text-slate-200">{item.step}</span>
                </div>
                <h3 className="text-lg font-semibold text-slate-950">{item.title}</h3>
                <p className="mt-3 text-sm leading-6 text-slate-600">{item.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
