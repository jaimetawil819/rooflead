import { ClipboardList, MessageSquare, Bell } from "lucide-react";

const steps = [
  {
    icon: ClipboardList,
    step: "01",
    title: "Homeowner fills out your form",
    description:
      "Add one line of code to your website. When someone submits the form, RoofLead catches it instantly — day or night.",
  },
  {
    icon: MessageSquare,
    step: "02",
    title: "AI texts them in under 60 seconds",
    description:
      "Our AI sends a friendly, professional SMS, asks qualifying questions about urgency, damage type, and timeline — and keeps the conversation going until it has what it needs.",
  },
  {
    icon: Bell,
    step: "03",
    title: "You get a summary before you call",
    description:
      'You receive an SMS with the lead\'s name, address, situation, and a quality score — Hot, Warm, or Cold — so you know exactly who to call first.',
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="bg-gray-50 py-24 px-4 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
            How it works
          </h2>
          <p className="text-lg text-gray-600 max-w-xl mx-auto">
            Set it up once. Every lead gets a response in under a minute — forever.
          </p>
        </div>

        <div className="grid gap-8 sm:grid-cols-3">
          {steps.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.step}
                className="relative bg-white rounded-2xl p-8 shadow-sm border border-gray-100"
              >
                <div className="text-5xl font-black text-gray-100 absolute top-6 right-6 select-none">
                  {item.step}
                </div>
                <div className="h-12 w-12 rounded-xl bg-blue-600 flex items-center justify-center mb-5">
                  <Icon className="h-6 w-6 text-white" aria-hidden="true" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-3">
                  {item.title}
                </h3>
                <p className="text-gray-600 leading-relaxed text-sm">
                  {item.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
