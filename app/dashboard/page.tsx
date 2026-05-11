import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getAdminClient } from "@/lib/supabase/admin";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  DollarSign,
  Flame,
  PhoneCall,
  Trophy,
  TrendingUp,
  Users,
} from "lucide-react";
import DashboardQuickActions from "@/components/dashboard/DashboardQuickActions";

const scoreColors: Record<string, string> = {
  hot: "bg-red-100 text-red-700 ring-red-200",
  warm: "bg-amber-100 text-amber-800 ring-amber-200",
  cold: "bg-blue-100 text-blue-700 ring-blue-200",
  unqualified: "bg-slate-100 text-slate-600 ring-slate-200",
};

const statusColors: Record<string, string> = {
  new: "bg-blue-100 text-blue-700 ring-blue-200",
  contacted: "bg-violet-100 text-violet-700 ring-violet-200",
  qualified: "bg-emerald-100 text-emerald-700 ring-emerald-200",
  appointment_set: "bg-amber-100 text-amber-800 ring-amber-200",
  won: "bg-emerald-100 text-emerald-700 ring-emerald-200",
  lost: "bg-red-100 text-red-700 ring-red-200",
  junk: "bg-slate-100 text-slate-500 ring-slate-200",
};

function formatCurrency(cents: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

function titleCase(value: string) {
  return value
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function formatServiceType(serviceType: string | null) {
  if (!serviceType) return "No service type";

  const labels: Record<string, string> = {
    repair: "Roof Repair",
    replacement: "Full Replacement",
    inspection: "Inspection",
    storm_damage: "Storm Damage",
  };

  return labels[serviceType] ?? titleCase(serviceType);
}

function formatLeadDate(date: string) {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

export default async function DashboardPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const supabase = getAdminClient();

  const { data: business } = await supabase
    .from("businesses")
    .select("id, name, onboarding_complete, average_job_value_cents")
    .eq("owner_id", userId)
    .single();

  if (!business?.onboarding_complete) redirect("/dashboard/onboarding");

  const [{ data: leads }, { data: widget }] = await Promise.all([
    supabase
      .from("leads")
      .select("*")
      .eq("business_id", business.id)
      .order("created_at", { ascending: false }),
    supabase
      .from("form_widgets")
      .select("widget_key")
      .eq("business_id", business.id)
      .single(),
  ]);

  const total = leads?.length ?? 0;
  const hot = leads?.filter((l) => l.lead_score === "hot").length ?? 0;
  const qualified =
    leads?.filter((l) => l.status === "qualified" || l.status === "won").length ?? 0;
  const needsReview = leads?.filter((l) => l.needs_human_review).length ?? 0;
  const won = leads?.filter((l) => l.status === "won").length ?? 0;
  const averageJobValueCents = business.average_job_value_cents ?? 800000;
  const estimatedRevenueCents = won * averageJobValueCents;
  const recent = leads?.slice(0, 5) ?? [];
  const priorityLeads =
    leads
      ?.filter((lead) => {
        if (["won", "lost", "junk"].includes(lead.status)) return false;
        return (
          lead.needs_human_review ||
          lead.lead_score === "hot" ||
          lead.status === "new"
        );
      })
      .slice(0, 4) ?? [];
  const testFormPath = widget?.widget_key
    ? `/test-form/${widget.widget_key}`
    : null;

  const stats = [
    { label: "Total Leads", value: total, icon: Users, tone: "text-blue-700", bg: "bg-blue-50" },
    { label: "Hot Leads", value: hot, icon: Flame, tone: "text-red-700", bg: "bg-red-50" },
    { label: "Qualified", value: qualified, icon: TrendingUp, tone: "text-emerald-700", bg: "bg-emerald-50" },
    { label: "Needs Review", value: needsReview, icon: AlertTriangle, tone: "text-amber-700", bg: "bg-amber-50" },
    { label: "Won Leads", value: won, icon: Trophy, tone: "text-emerald-700", bg: "bg-emerald-50" },
    {
      label: "Est. Revenue",
      value: formatCurrency(estimatedRevenueCents),
      icon: DollarSign,
      tone: "text-slate-700",
      bg: "bg-slate-100",
    },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8 lg:py-8">
      <section className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-950 text-white shadow-xl shadow-slate-300/40">
        <div className="grid gap-0 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="p-6 sm:p-8">
            <p className="text-sm font-semibold uppercase tracking-widest text-blue-300">
              Dashboard
            </p>
            <h1 className="mt-4 max-w-3xl text-3xl font-bold leading-tight tracking-tight sm:text-4xl">
              {business.name ? `${business.name} lead command center` : "Lead command center"}
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-slate-300 sm:text-lg">
              Start with urgent leads, then review pipeline performance. RoofLead
              keeps the highest-priority opportunities at the top.
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/dashboard/leads"
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-blue-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
              >
                Review All Leads <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
              {testFormPath && (
                <Link
                  href={testFormPath}
                  target="_blank"
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-white/15 bg-white/5 px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
                >
                  Send Test Lead <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              )}
            </div>
          </div>

          <div className="border-t border-slate-800 bg-white/[0.03] p-6 sm:p-8 lg:border-l lg:border-t-0">
            <div className="grid grid-cols-2 gap-3">
              {[
                ["Urgent", priorityLeads.length],
                ["Hot", hot],
                ["Review", needsReview],
                ["Won", won],
              ].map(([label, value]) => (
                <div key={label} className="rounded-xl border border-white/10 bg-white/[0.04] p-4">
                  <p className="text-2xl font-black text-white">{value}</p>
                  <p className="mt-1 text-xs font-medium uppercase tracking-wide text-slate-400">
                    {label}
                  </p>
                </div>
              ))}
            </div>
            <div className="mt-4 rounded-xl border border-emerald-400/20 bg-emerald-500/10 p-4">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-emerald-300" aria-hidden="true" />
                <p className="text-sm leading-6 text-emerald-50">
                  Estimated won value:{" "}
                  <span className="font-bold">{formatCurrency(estimatedRevenueCents)}</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-6 rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-slate-200 px-5 py-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-950">Next Leads To Work</h2>
            <p className="mt-1 text-sm leading-6 text-slate-600">
              Hot, new, or review-needed leads appear here first.
            </p>
          </div>
          <span className="inline-flex w-fit rounded-full bg-blue-50 px-3 py-1 text-xs font-bold uppercase tracking-wide text-blue-700">
            {priorityLeads.length} active
          </span>
        </div>

        {priorityLeads.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <p className="font-semibold text-slate-950">No urgent leads waiting</p>
            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-600">
              When a hot, new, or review-needed lead arrives, it will show up
              here so you know who to handle first.
            </p>
          </div>
        ) : (
          <div className="grid gap-3 p-4 lg:grid-cols-2">
            {priorityLeads.map((lead) => {
              const actionLabel = lead.needs_human_review
                ? "Review needed"
                : lead.lead_score === "hot"
                  ? "Call first"
                  : "New lead";
              const actionColor = lead.needs_human_review
                ? "bg-amber-100 text-amber-800 ring-amber-200"
                : lead.lead_score === "hot"
                  ? "bg-red-100 text-red-700 ring-red-200"
                  : "bg-blue-100 text-blue-700 ring-blue-200";

              return (
                <Link
                  key={lead.id}
                  href={`/dashboard/leads/${lead.id}`}
                  className="group rounded-xl border border-slate-200 bg-slate-50 p-4 transition-colors hover:border-blue-200 hover:bg-blue-50/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-bold text-slate-950">
                          {lead.name ?? "Unknown Lead"}
                        </p>
                        <span className={`rounded-full px-2.5 py-1 text-xs font-bold ring-1 ${actionColor}`}>
                          {actionLabel}
                        </span>
                      </div>
                      <p className="mt-2 text-sm leading-6 text-slate-600">
                        {formatServiceType(lead.service_type)} - {formatLeadDate(lead.created_at)}
                      </p>
                    </div>
                    <PhoneCall className="h-5 w-5 flex-shrink-0 text-blue-600" aria-hidden="true" />
                  </div>
                  <div className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-blue-700">
                    Open Lead
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>

      <section className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-6">
        {stats.map(({ label, value, icon: Icon, tone, bg }) => (
          <div key={label} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm xl:col-span-1">
            <div className={`mb-4 flex h-11 w-11 items-center justify-center rounded-lg ${bg} ${tone}`}>
              <Icon className="h-5 w-5" aria-hidden="true" />
            </div>
            <p className="text-2xl font-black tracking-tight text-slate-950">{value}</p>
            <p className="mt-1 text-sm font-medium text-slate-600">{label}</p>
            {label === "Est. Revenue" && (
              <p className="mt-2 text-xs leading-5 text-slate-500">
                {won} won at {formatCurrency(averageJobValueCents)} average job value.
              </p>
            )}
          </div>
        ))}
      </section>

      <section className="mt-6 rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between gap-4 border-b border-slate-200 px-5 py-5">
          <div>
            <h2 className="font-bold text-slate-950">Recent Leads</h2>
            <p className="mt-1 text-sm text-slate-600">Latest form submissions and SMS intakes.</p>
          </div>
          <Link
            href="/dashboard/leads"
            className="inline-flex min-h-10 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-blue-700 transition-colors hover:bg-blue-50"
          >
            View all <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
          </Link>
        </div>

        {recent.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <p className="font-semibold text-slate-950">No leads yet</p>
            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-600">
              Once your form is installed, new submissions will appear here.
              Send a test lead to confirm the flow.
            </p>
            {testFormPath && (
              <Link
                href={testFormPath}
                target="_blank"
                className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-lg bg-blue-600 px-4 py-3 text-sm font-bold text-white transition-colors hover:bg-blue-700"
              >
                Send a Test Lead <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
              </Link>
            )}
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {recent.map((lead) => (
              <Link
                key={lead.id}
                href={`/dashboard/leads/${lead.id}`}
                className="grid gap-3 px-5 py-4 transition-colors hover:bg-slate-50 sm:grid-cols-[1fr_auto] sm:items-center"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-slate-950">{lead.name ?? "Unknown"}</p>
                  <p className="mt-1 text-xs text-slate-500">
                    {formatServiceType(lead.service_type)} - {formatLeadDate(lead.created_at)}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {lead.lead_score && (
                    <span className={`rounded-full px-2.5 py-1 text-xs font-bold ring-1 ${scoreColors[lead.lead_score] ?? "bg-slate-100 text-slate-600 ring-slate-200"}`}>
                      {lead.lead_score.toUpperCase()}
                    </span>
                  )}
                  <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${statusColors[lead.status] ?? "bg-slate-100 text-slate-600 ring-slate-200"}`}>
                    {titleCase(lead.status)}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      <div className="mt-6">
        <DashboardQuickActions testFormPath={testFormPath} />
      </div>
    </div>
  );
}
