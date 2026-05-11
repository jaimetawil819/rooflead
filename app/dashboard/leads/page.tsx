import { getAdminClient } from "@/lib/supabase/admin";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Suspense } from "react";
import LeadsFilter from "@/components/dashboard/LeadsFilter";

const PAGE_SIZE = 15;

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
  unresponsive: "bg-gray-100 text-gray-500",
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
};

function titleCase(value: string) {
  return value
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function formatServiceType(serviceType: string | null) {
  if (!serviceType) return "-";

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
    <div className="p-8 max-w-6xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Leads</h1>
        <p className="text-gray-500 mt-1">
          Every lead that has come through your form.
        </p>
      </div>

      <div className="mb-4">
        <Suspense>
          <LeadsFilter />
        </Suspense>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {leadRows.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <p className="text-gray-400 font-medium">No leads found</p>
            <p className="text-gray-400 text-sm mt-1">
              {status || score || review || searchTerm
                ? "Try adjusting your filters."
                : "Submit a test lead using your embed form to see it appear here."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <div className="min-w-[720px] grid grid-cols-[minmax(220px,1.4fr)_minmax(150px,0.8fr)_110px_130px_110px] gap-4 px-6 py-3 border-b border-gray-100 bg-gray-50">
              {["Name", "Service", "Score", "Status", "Date"].map((heading) => (
                <span
                  key={heading}
                  className="text-xs font-semibold text-gray-500 uppercase tracking-wide"
                >
                  {heading}
                </span>
              ))}
            </div>

            <div className="divide-y divide-gray-50">
              {leadRows.map((lead) => {
                const displayStatus = getDisplayStatus(lead);

                return (
                  <Link
                    key={lead.id}
                    href={`/dashboard/leads/${lead.id}`}
                    className="min-w-[720px] grid grid-cols-[minmax(220px,1.4fr)_minmax(150px,0.8fr)_110px_130px_110px] gap-4 items-center px-6 py-4 hover:bg-gray-50 transition-colors group"
                  >
                    <div className="min-w-0">
                      <p className="font-medium text-slate-900 text-sm group-hover:text-blue-600 transition-colors flex items-center gap-1 truncate">
                        {lead.name ?? "Unknown"}
                        {lead.needs_human_review && (
                          <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-700">
                            Needs Review
                          </span>
                        )}
                        <ArrowRight className="h-3.5 w-3.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5 truncate">
                        {lead.phone ?? "-"}
                      </p>
                    </div>

                    <span className="text-sm text-gray-600 truncate">
                      {formatServiceType(lead.service_type)}
                    </span>

                    <span
                      className={`justify-self-start text-xs font-semibold px-2.5 py-1 rounded-full whitespace-nowrap ${scoreColors[lead.lead_score ?? ""] ?? "bg-gray-100 text-gray-500"}`}
                    >
                      {lead.lead_score ? lead.lead_score.toUpperCase() : "-"}
                    </span>

                    <span
                      className={`justify-self-start text-xs font-medium px-2.5 py-1 rounded-full whitespace-nowrap ${statusColors[displayStatus] ?? "bg-gray-100 text-gray-600"}`}
                    >
                      {titleCase(displayStatus)}
                    </span>

                    <span className="text-xs text-gray-400 whitespace-nowrap">
                      {new Date(lead.created_at).toLocaleDateString()}
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {totalLeads > 0 && (
        <div className="mt-4 flex items-center justify-between gap-3 flex-wrap">
          <p className="text-sm text-gray-500">
            Showing {startLead}-{endLead} of {totalLeads} leads
          </p>

          <div className="flex items-center gap-2">
            {safePage > 1 ? (
              <Link
                href={pageHref(safePage - 1)}
                className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-gray-50"
              >
                Previous
              </Link>
            ) : (
              <span className="rounded-lg border border-gray-100 bg-gray-50 px-3 py-2 text-sm font-medium text-gray-300">
                Previous
              </span>
            )}

            <span className="text-sm text-gray-500">
              Page {safePage} of {totalPages}
            </span>

            {safePage < totalPages ? (
              <Link
                href={pageHref(safePage + 1)}
                className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-gray-50"
              >
                Next
              </Link>
            ) : (
              <span className="rounded-lg border border-gray-100 bg-gray-50 px-3 py-2 text-sm font-medium text-gray-300">
                Next
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
