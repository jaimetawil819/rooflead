import { Building2, CloudLightning, Headset, Moon, Search } from "lucide-react";

const useCases = [
  {
    icon: Search,
    title: "Google Ads lead forms",
    description: "Protect expensive clicks by starting the conversation before a competitor does.",
  },
  {
    icon: Moon,
    title: "After-hours emergencies",
    description: "Handle evening leaks, storm damage, and urgent repair requests while your office is closed.",
  },
  {
    icon: CloudLightning,
    title: "Storm season surges",
    description: "Keep every new homeowner moving through intake when submissions spike at once.",
  },
  {
    icon: Headset,
    title: "Owner-operated teams",
    description: "Give owners a clean summary instead of another inbox they have to babysit.",
  },
];

const comparison = [
  ["First response", "Hours later or next morning", "Under 60 seconds"],
  ["Qualification", "Manual call notes", "AI asks urgency, ownership, timeline"],
  ["Owner action", "Dig through email and texts", "Hot score, summary, call action"],
  ["After-hours coverage", "Missed or delayed", "24/7 SMS intake"],
];

export default function UseCases() {
  return (
    <section id="use-cases" className="bg-slate-950 px-4 py-20 text-white sm:px-6 lg:px-8 lg:py-24">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-end">
          <div>
            <p className="mb-4 text-sm font-semibold uppercase tracking-widest text-blue-300">
              Where It Pays Off
            </p>
            <h2 className="text-3xl font-bold leading-tight text-white sm:text-4xl">
              Built for the moments where slow follow-up costs real money.
            </h2>
          </div>
          <p className="max-w-3xl text-lg leading-8 text-slate-300">
            RoofLead is not trying to replace your crew, sales process, or CRM.
            It owns the most fragile part of the funnel: the first response and
            the first qualification pass.
          </p>
        </div>

        <div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {useCases.map(({ icon: Icon, title, description }) => (
            <div key={title} className="rounded-xl border border-white/10 bg-white/[0.04] p-6">
              <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-lg bg-blue-500/15 text-blue-200 ring-1 ring-blue-400/20">
                <Icon className="h-5 w-5" aria-hidden="true" />
              </div>
              <h3 className="font-semibold text-white">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-300">{description}</p>
            </div>
          ))}
        </div>

        <div className="mt-12 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04]">
          <div className="grid border-b border-white/10 bg-white/[0.04] px-5 py-4 text-sm font-semibold text-slate-300 md:grid-cols-3">
            <span className="hidden md:block">Workflow</span>
            <span>Without RoofLead</span>
            <span className="mt-2 text-blue-200 md:mt-0">With RoofLead</span>
          </div>
          <div className="divide-y divide-white/10">
            {comparison.map(([workflow, before, after]) => (
              <div key={workflow} className="grid gap-3 px-5 py-5 text-sm md:grid-cols-3 md:items-center">
                <p className="font-semibold text-white">{workflow}</p>
                <p className="text-slate-400">{before}</p>
                <p className="font-medium text-blue-100">{after}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-8 flex items-center gap-3 rounded-xl border border-emerald-400/20 bg-emerald-500/10 p-5 text-sm text-emerald-100">
          <Building2 className="h-5 w-5 flex-shrink-0 text-emerald-300" aria-hidden="true" />
          <p>
            Best fit: owner-operated roofing companies that spend money on web
            leads and need a faster first response without hiring a full-time
            coordinator.
          </p>
        </div>
      </div>
    </section>
  );
}
