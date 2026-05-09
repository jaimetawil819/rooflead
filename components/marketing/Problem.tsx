import { TrendingDown, Clock, DollarSign } from "lucide-react";

const stats = [
  {
    icon: Clock,
    value: "5–47 hrs",
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
    label: "Gross profit from one recovered job at avg margins",
  },
];

export default function Problem() {
  return (
    <section className="bg-slate-900 py-24 px-4 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <p className="text-blue-400 font-semibold text-sm uppercase tracking-widest mb-4">
              The Problem
            </p>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6 leading-tight">
              You&apos;re spending thousands on ads.
              <br />
              <span className="text-slate-400">And losing 40% of those leads.</span>
            </h2>
            <p className="text-slate-300 text-lg leading-relaxed mb-6">
              When a homeowner fills out your form at 7 PM after a hailstorm,
              they&apos;re also filling out your competitor&apos;s form. The roofer who
              responds first wins the job. That&apos;s rarely you.
            </p>
            <p className="text-slate-300 text-lg leading-relaxed">
              You&apos;re on a roof. In a truck. Managing your crew. You&apos;re not
              watching your email. RoofLead is.
            </p>
          </div>

          <div className="space-y-4">
            {stats.map((stat) => {
              const Icon = stat.icon;
              return (
                <div
                  key={stat.value}
                  className="flex items-start gap-4 bg-slate-800 rounded-xl p-5 border border-slate-700"
                >
                  <div className="h-10 w-10 rounded-lg bg-blue-600/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Icon className="h-5 w-5 text-blue-400" aria-hidden="true" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white">{stat.value}</p>
                    <p className="text-slate-400 text-sm leading-relaxed mt-0.5">
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
