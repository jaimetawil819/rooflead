import { getAdminClient } from "@/lib/supabase/admin";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowRight, Filter, Search } from "lucide-react";
import { Suspense } from "react";
import LeadsFilter from "@/components/dashboard/LeadsFilter";

const PAGE_SIZE = 15;

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
  unresponsive: "bg-slate-100 text-slate-500 ring-slate-200",
};

type LeadRow = {
  id: string;
  name: string | null;
  phone: string | null;
  service_type: string | null;
  lead_score: string | null;
  status: string;
  created_at: string;
  needs_human_review: boolean | null;
  appointment_status: string | null;
};

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

function getDisplayStatus(lead: LeadRow) {
  if (lead.lead_score === "unqualified" && lead.status === "qualified") {
    return "junk";
  }

  return lead.status;
}

function sanitizeSearchTerm(value: string | undefined) {
  if (!value) return "";

  return value
    .replace(/[%_,()]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 80);
}

function formatLeadDate(date: string) {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function LeadBadges({ lead }: { lead: LeadRow }) {
  const displayStatus = getDisplayStatus(lead);

  return (
    <div className="flex flex-wrap items-center gap-2">
      {lead.lead_score && (
        <span className={`rounded-full px-2.5 py-1 text-xs font-bold ring-1 ${scoreColors[lead.lead_score] ?? "bg-slate-100 text-slate-600 ring-slate-200"}`}>
          {lead.lead_score.toUpperCase()}
        </span>
      )}
      <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${statusColors[displayStatus] ?? "bg-slate-100 text-slate-600 ring-slate-200"}`}>
        {titleCase(displayStatus)}
      </span>
      {lead.needs_human_review && (
        <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-bold text-amber-800 ring-1 ring-amber-200">
          Review
        </span>
      )}
      {lead.appointment_status && lead.appointment_status !== "not_requested" && (
        <span className="rounded-full bg-blue-100 px-2.5 py-1 text-xs font-bold text-blue-700 ring-1 ring-blue-200">
          {titleCase(lead.appointment_status)}
        </span>
      )}
    </div>
  );
}

export default async function LeadsPage({
  searchParams,
}: {
  searchParams: Promise<{
    status?: string;
    score?: string;
    review?: string;
    page?: string;
    q?: string;
  }>;
}) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const { status, score, review, page, q } = await searchParams;
  const searchTerm = sanitizeSearchTerm(q);
  const currentPage = Math.max(1, Number.parseInt(page ?? "1", 10) || 1);
  const from = (currentPage - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const supabase = getAdminClient();

  const { data: business } = await supabase
    .from("businesses")
    .select("id")
    .eq("owner_id", userId)
    .single();

  let query = supabase
    .from("leads")
    .select("*", { count: "exact" })
    .eq("business_id", business?.id)
    .order("created_at", { ascending: false })
    .range(from, to);

  if (status && status !== "all") query = query.eq("status", status);
  if (score && score !== "all") query = query.eq("lead_score", score);
  if (review === "needs_review") query = query.eq("needs_human_review", true);
  if (searchTerm) {
    const pattern = `%${searchTerm}%`;
    query = query.or(
      [
        `name.ilike.${pattern}`,
        `phone.ilike.${pattern}`,
        `address.ilike.${pattern}`,
        `service_type.ilike.${pattern}`,
        `summary.ilike.${pattern}`,
      ].join(",")
    );
  }

  const { data: leads, count } = await query;
  const leadRows = (leads ?? []) as LeadRow[];
  const totalLeads = count ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalLeads / PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages);
  const startLead = totalLeads === 0 ? 0 : (safePage - 1) * PAGE_SIZE + 1;
  const endLead = Math.min(safePage * PAGE_SIZE, totalLeads);

  function pageHref(nextPage: number) {
    const params = new URLSearchParams();
    if (status && status !== "all") params.set("status", status);
    if (score && score !== "all") params.set("score", score);
    if (review && review !== "all") params.set("review", review);
    if (searchTerm) params.set("q", searchTerm);
    if (nextPage > 1) params.set("page", String(nextPage));

    const queryString = params.toString();
    return queryString ? `/dashboard/leads?${queryString}` : "/dashboard/leads";
  }

  if (totalLeads > 0 && currentPage > totalPages) {
    redirect(pageHref(totalPages));
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8 lg:py-8">
      <section className="rounded-2xl border border-slate-800 bg-slate-950 p-6 text-white shadow-xl shadow-slate-300/40 sm:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-widest text-blue-300">
              Lead Inbox
            </p>
            <h1 className="mt-4 text-3xl font-bold leading-tight tracking-tight sm:text-4xl">
              Every web lead in one fast triage view.
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-slate-300">
              Search, filter, and open the leads that need a call, a human
              review, or a status update.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <div className="rounded-xl border border-white/10 bg-white/[0.04] p-4">
              <p className="text-2xl font-black">{totalLeads}</p>
              <p className="mt-1 text-xs uppercase tracking-wide text-slate-400">Matching</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/[0.04] p-4">
              <p className="text-2xl font-black">{safePage}</p>
              <p className="mt-1 text-xs uppercase tracking-wide text-slate-400">Page</p>
            </div>
            <div className="col-span-2 rounded-xl border border-blue-400/20 bg-blue-500/10 p-4 sm:col-span-1">
              <p className="text-2xl font-black">{PAGE_SIZE}</p>
              <p className="mt-1 text-xs uppercase tracking-wide text-blue-200">Per page</p>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
        <div className="mb-4 flex items-center gap-2 text-sm font-bold text-slate-950">
          <Filter className="h-4 w-4 text-blue-600" aria-hidden="true" />
          Filter leads
        </div>
        <Suspense>
          <LeadsFilter />
        </Suspense>
      </section>

      <section className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        {leadRows.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <Search className="mx-auto h-8 w-8 text-slate-300" aria-hidden="true" />
            <p className="mt-4 font-semibold text-slate-950">No leads found</p>
            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-600">
              {status || score || review || searchTerm
                ? "Try adjusting your filters or clearing the search."
                : "Submit a test lead using your embed form to see it appear here."}
            </p>
          </div>
        ) : (
          <>
            <div className="grid gap-3 p-4 md:hidden">
              {leadRows.map((lead) => (
                <Link
                  key={lead.id}
                  href={`/dashboard/leads/${lead.id}`}
                  className="rounded-xl border border-slate-200 bg-slate-50 p-4 transition-colors hover:border-blue-200 hover:bg-blue-50/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate font-bold text-slate-950">{lead.name ?? "Unknown"}</p>
                      <p className="mt-1 text-sm text-slate-600">{lead.phone ?? "No phone"}</p>
                    </div>
                    <ArrowRight className="h-4 w-4 flex-shrink-0 text-blue-600" aria-hidden="true" />
                  </div>
                  <p className="mt-3 text-sm font-medium text-slate-700">
                    {formatServiceType(lead.service_type)}
                  </p>
                  <div className="mt-3">
                    <LeadBadges lead={lead} />
                  </div>
                  <p className="mt-3 text-xs text-slate-500">{formatLeadDate(lead.created_at)}</p>
                </Link>
              ))}
            </div>

            <div className="hidden md:block">
              <div className="grid grid-cols-[minmax(220px,1.4fr)_minmax(150px,0.8fr)_minmax(210px,1fr)_120px] gap-4 border-b border-slate-200 bg-slate-50 px-6 py-3">
                {["Lead", "Service", "Status", "Date"].map((heading) => (
                  <span key={heading} className="text-xs font-bold uppercase tracking-wide text-slate-500">
                    {heading}
                  </span>
                ))}
              </div>

              <div className="divide-y divide-slate-100">
                {leadRows.map((lead) => (
                  <Link
                    key={lead.id}
                    href={`/dashboard/leads/${lead.id}`}
                    className="group grid grid-cols-[minmax(220px,1.4fr)_minmax(150px,0.8fr)_minmax(210px,1fr)_120px] items-center gap-4 px-6 py-4 transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-inset"
                  >
                    <div className="min-w-0">
                      <p className="flex items-center gap-1 truncate text-sm font-bold text-slate-950 transition-colors group-hover:text-blue-700">
                        {lead.name ?? "Unknown"}
                        <ArrowRight className="h-3.5 w-3.5 shrink-0 opacity-0 transition-opacity group-hover:opacity-100" aria-hidden="true" />
                      </p>
                      <p className="mt-1 truncate text-xs text-slate-500">{lead.phone ?? "No phone"}</p>
                    </div>

                    <span className="truncate text-sm text-slate-700">
                      {formatServiceType(lead.service_type)}
                    </span>

                    <LeadBadges lead={lead} />

                    <span className="whitespace-nowrap text-xs text-slate-500">
                      {formatLeadDate(lead.created_at)}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          </>
        )}
      </section>

      {totalLeads > 0 && (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-slate-600">
            Showing {startLead}-{endLead} of {totalLeads} leads
          </p>

          <div className="flex items-center gap-2">
            {safePage > 1 ? (
              <Link
                href={pageHref(safePage - 1)}
                className="inline-flex min-h-10 items-center rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-slate-700 transition-colors hover:bg-slate-50"
              >
                Previous
              </Link>
            ) : (
              <span className="inline-flex min-h-10 items-center rounded-lg border border-slate-200 bg-slate-100 px-3 py-2 text-sm font-bold text-slate-400">
                Previous
              </span>
            )}

            <span className="text-sm text-slate-600">
              Page {safePage} of {totalPages}
            </span>

            {safePage < totalPages ? (
              <Link
                href={pageHref(safePage + 1)}
                className="inline-flex min-h-10 items-center rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-slate-700 transition-colors hover:bg-slate-50"
              >
                Next
              </Link>
            ) : (
              <span className="inline-flex min-h-10 items-center rounded-lg border border-slate-200 bg-slate-100 px-3 py-2 text-sm font-bold text-slate-400">
                Next
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
