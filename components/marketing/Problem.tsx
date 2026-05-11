import { Clock, DollarSign, TrendingDown } from "lucide-react";

const stats = [
  {
    icon: Clock,
    value: "5-47 hrs",
    label: "Average roofer response time to a web form submission",
  },
  {
    icon: TrendingDown,
    value: "80%",
    label: "Drop in lead qualification odds if you wait more than 5 minutes",
  },
  {
    icon: DollarSign,
    value: "$4,200",
    label: "Gross profit from one recovered job at average margins",
  },
];

export default function Problem() {
  return (
    <section className="bg-white px-4 py-20 sm:px-6 lg:px-8 lg:py-24">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div>
            <p className="mb-4 text-sm font-semibold uppercase tracking-widest text-blue-600">
              The Missed-Lead Problem
            </p>
            <h2 className="max-w-2xl text-3xl font-bold leading-tight text-slate-950 sm:text-4xl">
              Roofers do not lose leads because they are bad at roofing. They
              lose them because they reply too late.
            </h2>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
              When a homeowner fills out your form at 7 PM after a hailstorm,
              they&apos;re also filling out your competitor&apos;s form. The roofer who
              responds first usually owns the conversation.
            </p>
            <p className="mt-4 max-w-2xl text-lg leading-8 text-slate-600">
              You&apos;re on a roof. In a truck. Managing your crew. You&apos;re not
              watching your email. RoofLead is.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
            {stats.map((stat) => {
              const Icon = stat.icon;
              return (
                <div
                  key={stat.value}
                  className="flex items-start gap-4 rounded-xl border border-slate-200 bg-slate-50 p-5"
                >
                  <div className="mt-0.5 flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-lg bg-white text-blue-600 ring-1 ring-slate-200">
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-slate-950">{stat.value}</p>
                    <p className="mt-0.5 text-sm leading-relaxed text-slate-600">
                      {stat.label}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
