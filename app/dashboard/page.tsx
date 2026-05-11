import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getAdminClient } from "@/lib/supabase/admin";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  DollarSign,
  Flame,
  Trophy,
  TrendingUp,
  Users,
} from "lucide-react";
import DashboardQuickActions from "@/components/dashboard/DashboardQuickActions";

const scoreColors: Record<string, string> = {
  hot: "bg-red-100 text-red-700",
  warm: "bg-orange-100 text-orange-700",
  cold: "bg-blue-100 text-blue-700",
  unqualified: "bg-gray-100 text-gray-600",
};

const statusColors: Record<string, string> = {
  new: "bg-blue-100 text-blue-700",
  contacted: "bg-purple-100 text-purple-700",
  qualified: "bg-green-100 text-green-700",
  appointment_set: "bg-yellow-100 text-yellow-700",
  won: "bg-emerald-100 text-emerald-700",
  lost: "bg-red-100 text-red-700",
  junk: "bg-gray-100 text-gray-500",
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
  const qualified = leads?.filter((l) => l.status === "qualified" || l.status === "won").length ?? 0;
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
    { label: "Total Leads", value: total, icon: Users, color: "bg-blue-50 text-blue-600" },
    { label: "Hot Leads", value: hot, icon: Flame, color: "bg-red-50 text-red-600" },
    { label: "Qualified", value: qualified, icon: TrendingUp, color: "bg-green-50 text-green-600" },
    { label: "Needs Review", value: needsReview, icon: AlertTriangle, color: "bg-amber-50 text-amber-600" },
    { label: "Won Leads", value: won, icon: Trophy, color: "bg-emerald-50 text-emerald-600" },
    {
      label: "Estimated Revenue",
      value: formatCurrency(estimatedRevenueCents),
      icon: DollarSign,
      color: "bg-slate-100 text-slate-700",
    },
  ];

  return (
    <div className="p-8 max-w-5xl">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Welcome back{business.name ? `, ${business.name}` : ""}
          </h1>
          <p className="text-gray-500 mt-1">
            Start with the leads that need action now.
          </p>
        </div>
        <Link
          href="/dashboard/leads"
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-slate-700"
        >
          Review All Leads <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      {/* Priority queue */}
      <div className="mb-8 rounded-2xl border border-gray-100 bg-white shadow-sm">
        <div className="flex items-center justify-between gap-4 border-b border-gray-100 px-6 py-4">
          <div>
            <h2 className="font-semibold text-slate-900">Next Leads To Work</h2>
            <p className="mt-1 text-sm text-gray-500">
              Hot, new, or review-needed leads appear here first.
            </p>
          </div>
          <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
            {priorityLeads.length} active
          </span>
        </div>

        {priorityLeads.length === 0 ? (
          <div className="px-6 py-10 text-center">
            <p className="font-medium text-slate-900">No urgent leads waiting</p>
            <p className="mx-auto mt-1 max-w-md text-sm text-gray-500">
              When a hot, new, or review-needed lead arrives, it will show up
              here so you know who to handle first.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {priorityLeads.map((lead) => {
              const actionLabel = lead.needs_human_review
                ? "Review needed"
                : lead.lead_score === "hot"
                  ? "Call first"
                  : "New lead";
              const actionColor = lead.needs_human_review
                ? "bg-amber-100 text-amber-700"
                : lead.lead_score === "hot"
                  ? "bg-red-100 text-red-700"
                  : "bg-blue-100 text-blue-700";

              return (
                <Link
                  key={lead.id}
                  href={`/dashboard/leads/${lead.id}`}
                  className="flex flex-col gap-3 px-6 py-4 transition-colors hover:bg-gray-50 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold text-slate-900">
                        {lead.name ?? "Unknown Lead"}
                      </p>
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-semibold ${actionColor}`}
                      >
                        {actionLabel}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-gray-500">
                      {formatServiceType(lead.service_type)} -{" "}
                      {new Date(lead.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 text-sm font-semibold text-blue-600">
                    Open Lead <ArrowRight className="h-4 w-4" />
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {stats.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <div className={`h-10 w-10 rounded-xl flex items-center justify-center mb-4 ${color}`}>
              <Icon className="h-5 w-5" aria-hidden="true" />
            </div>
            <p className="text-3xl font-bold text-slate-900">{value}</p>
            <p className="text-sm text-gray-500 mt-1">{label}</p>
            {label === "Estimated Revenue" && (
              <p className="text-xs text-gray-400 mt-2">
                Based on {won} won lead{won === 1 ? "" : "s"} at{" "}
                {formatCurrency(averageJobValueCents)} average job value.
              </p>
            )}
          </div>
        ))}
      </div>

      {/* Recent leads */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-slate-900">Recent Leads</h2>
          <Link href="/dashboard/leads" className="text-sm text-blue-600 hover:underline flex items-center gap-1">
            View all <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {recent.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <p className="text-gray-500 font-medium">No leads yet</p>
            <p className="text-gray-400 text-sm mt-1 mb-4">
              Once your form is installed, new submissions will appear here.
              You can also send a test lead to confirm the flow.
            </p>
            {testFormPath && (
              <Link
                href={testFormPath}
                target="_blank"
                className="inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
              >
                Send a Test Lead <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            )}
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {recent.map((lead) => (
              <Link
                key={lead.id}
                href={`/dashboard/leads/${lead.id}`}
                className="flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors"
              >
                <div>
                  <p className="font-medium text-slate-900 text-sm">{lead.name ?? "Unknown"}</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {formatServiceType(lead.service_type)} - {new Date(lead.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {lead.lead_score && (
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${scoreColors[lead.lead_score] ?? "bg-gray-100 text-gray-600"}`}>
                      {lead.lead_score.toUpperCase()}
                    </span>
                  )}
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${statusColors[lead.status] ?? "bg-gray-100 text-gray-600"}`}>
                    {lead.status.replace("_", " ")}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      <div className="mt-8">
        <DashboardQuickActions testFormPath={testFormPath} />
      </div>
    </div>
  );
}
