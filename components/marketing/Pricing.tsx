import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";

const plan = {
  name: "Starter",
  price: "$149",
  period: "/month",
  description:
    "For owner-operated roofing companies that need every web lead answered fast.",
  features: [
    "1 business location",
    "Up to 200 AI lead conversations/month",
    "Lead dashboard + summaries",
    "SMS score alerts to your phone",
    "Embeddable form widget",
    "14-day free trial with card required",
    "Cancel before day 14 and pay nothing",
  ],
  cta: "Start Free Trial",
};

export default function Pricing() {
  return (
    <section id="pricing" className="bg-white py-24 px-4 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
            Simple, predictable pricing
          </h2>
          <p className="text-lg text-gray-600 max-w-xl mx-auto">
            One recovered job can pay for a full year. Start with a 14-day free
            trial, enter your card to activate, and cancel before day 14 to pay
            nothing.
          </p>
        </div>

        <div className="max-w-md mx-auto">
          <div className="rounded-2xl p-8 border-2 border-blue-600 bg-blue-600 text-white shadow-xl shadow-blue-200 flex flex-col">
            <div className="mb-6">
              <span className="inline-block bg-white/20 text-white text-xs font-semibold px-3 py-1 rounded-full mb-3">
                Launch Plan
              </span>
              <h3 className="text-xl font-bold mb-1 text-white">
                {plan.name}
              </h3>
              <p className="text-sm mb-4 text-blue-100">{plan.description}</p>
              <div className="flex items-end gap-1">
                <span className="text-4xl font-black text-white">
                  {plan.price}
                </span>
                <span className="text-sm mb-1.5 text-blue-200">
                  {plan.period}
                </span>
              </div>
            </div>

            <ul className="space-y-3 mb-8 flex-1">
              {plan.features.map((feature) => (
                <li key={feature} className="flex items-start gap-2.5 text-sm">
                  <Check
                    className="h-4 w-4 flex-shrink-0 mt-0.5 text-blue-200"
                    aria-hidden="true"
                  />
                  <span className="text-blue-50">{feature}</span>
                </li>
              ))}
            </ul>

            <Button
              asChild
              variant="secondary"
              className="w-full h-11 text-sm font-semibold"
            >
              <Link href="/sign-up">{plan.cta}</Link>
            </Button>
          </div>
        </div>

        <p className="text-center text-sm text-gray-400 mt-8">
          Need more than 200 conversations/month? Email us at{" "}
          <a
            href="mailto:jaimetawil819@gmail.com"
            className="text-blue-600 hover:underline"
          >
            jaimetawil819@gmail.com
          </a>
        </p>
      </div>
    </section>
  );
}
