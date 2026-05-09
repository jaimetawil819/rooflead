import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";

const plans = [
  {
    name: "Starter",
    price: "$149",
    period: "/month",
    description: "For small operators and single-crew roofers.",
    features: [
      "1 business location",
      "Up to 200 AI lead conversations/month",
      "Lead dashboard + summaries",
      "SMS score alerts to your phone",
      "Embeddable form widget",
      "Email support",
    ],
    cta: "Start Free Trial",
    highlighted: false,
  },
  {
    name: "Pro",
    price: "$299",
    period: "/month",
    description: "For growing companies with active ad spend.",
    features: [
      "Everything in Starter",
      "Unlimited AI lead conversations",
      "Automated follow-up for unresponsive leads",
      "Priority support",
      "Onboarding call included",
    ],
    cta: "Start Free Trial",
    highlighted: true,
  },
];

export default function Pricing() {
  return (
    <section id="pricing" className="bg-white py-24 px-4 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
            Simple, predictable pricing
          </h2>
          <p className="text-lg text-gray-600 max-w-xl mx-auto">
            One recovered job pays for a full year. Start with a 14-day free trial — cancel before day 14 and pay nothing.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 max-w-3xl mx-auto">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`rounded-2xl p-8 border-2 flex flex-col ${
                plan.highlighted
                  ? "border-blue-600 bg-blue-600 text-white shadow-xl shadow-blue-200"
                  : "border-gray-200 bg-white text-slate-900"
              }`}
            >
              <div className="mb-6">
                {plan.highlighted && (
                  <span className="inline-block bg-white/20 text-white text-xs font-semibold px-3 py-1 rounded-full mb-3">
                    Most Popular
                  </span>
                )}
                <h3 className={`text-xl font-bold mb-1 ${plan.highlighted ? "text-white" : "text-slate-900"}`}>
                  {plan.name}
                </h3>
                <p className={`text-sm mb-4 ${plan.highlighted ? "text-blue-100" : "text-gray-500"}`}>
                  {plan.description}
                </p>
                <div className="flex items-end gap-1">
                  <span className={`text-4xl font-black ${plan.highlighted ? "text-white" : "text-slate-900"}`}>
                    {plan.price}
                  </span>
                  <span className={`text-sm mb-1.5 ${plan.highlighted ? "text-blue-200" : "text-gray-500"}`}>
                    {plan.period}
                  </span>
                </div>
              </div>

              <ul className="space-y-3 mb-8 flex-1">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2.5 text-sm">
                    <Check
                      className={`h-4 w-4 flex-shrink-0 mt-0.5 ${plan.highlighted ? "text-blue-200" : "text-blue-600"}`}
                      aria-hidden="true"
                    />
                    <span className={plan.highlighted ? "text-blue-50" : "text-gray-700"}>
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>

              <Button
                asChild
                variant={plan.highlighted ? "secondary" : "default"}
                className="w-full h-11 text-sm font-semibold"
              >
                <Link href="/sign-up">{plan.cta}</Link>
              </Button>
            </div>
          ))}
        </div>

        <p className="text-center text-sm text-gray-400 mt-8">
          Questions? Email us at{" "}
          <a href="mailto:jaimetawil819@gmail.com" className="text-blue-600 hover:underline">
            jaimetawil819@gmail.com
          </a>
        </p>
      </div>
    </section>
  );
}
