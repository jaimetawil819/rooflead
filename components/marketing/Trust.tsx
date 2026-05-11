import { BadgeCheck, CreditCard, ShieldCheck, UserCheck } from "lucide-react";

const trustItems = [
  {
    icon: ShieldCheck,
    title: "SMS consent built in",
    description:
      "Every RoofLead form includes opt-in language so homeowners know they are agreeing to receive lead qualification texts.",
  },
  {
    icon: BadgeCheck,
    title: "STOP handling",
    description:
      "Opt-outs are handled automatically. When a homeowner replies STOP, messages stop and the opt-out is recorded.",
  },
  {
    icon: UserCheck,
    title: "Owner takeover",
    description:
      "The AI handles intake, but the business owner can step in and send a manual SMS when a lead needs a human touch.",
  },
  {
    icon: CreditCard,
    title: "Secure account and billing",
    description:
      "Authentication runs through Clerk, subscription checkout runs through Stripe, and dashboard data stays behind protected routes.",
  },
];

export default function Trust() {
  return (
    <section className="bg-white px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-12 grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
          <div>
            <p className="mb-4 text-sm font-semibold uppercase tracking-widest text-blue-600">
              Built For Real Lead Intake
            </p>
            <h2 className="text-3xl font-bold leading-tight text-slate-950 sm:text-4xl">
              Trust matters when AI is texting your customers.
            </h2>
          </div>
          <p className="text-lg leading-8 text-slate-600">
            RoofLead is designed around a narrow job: respond quickly, qualify
            carefully, and hand the owner a clean summary. The system includes
            the guardrails a roofing business needs before putting SMS intake in
            front of real homeowners.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {trustItems.map(({ icon: Icon, title, description }) => (
            <div
              key={title}
              className="rounded-xl border border-slate-200 bg-white p-6"
            >
              <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-lg bg-blue-50 text-blue-600 ring-1 ring-blue-100">
                <Icon className="h-5 w-5" aria-hidden="true" />
              </div>
              <h3 className="mb-2 font-semibold text-slate-950">{title}</h3>
              <p className="text-sm leading-6 text-slate-600">
                {description}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-8 rounded-xl border border-blue-100 bg-blue-50 p-6">
          <div className="grid gap-4 lg:grid-cols-[0.75fr_1.25fr] lg:items-center">
            <p className="text-sm font-semibold uppercase tracking-wide text-blue-700">
              Pilot-ready, not overbuilt
            </p>
            <p className="text-sm leading-6 text-slate-700">
              RoofLead is already structured for live demos and early customers:
              test form, embeddable widget, protected dashboard, Stripe trial
              checkout, legal pages, owner notifications, lead summaries, and
              manual owner reply.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
