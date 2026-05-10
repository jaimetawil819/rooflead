import { getAdminClient } from "@/lib/supabase/admin";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Suspense } from "react";
import LeadsFilter from "@/components/dashboard/LeadsFilter";

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

export default async function LeadsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; score?: string }>;
}) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const { status, score } = await searchParams;

  const supabase = getAdminClient();

  const { data: business } = await supabase
    .from("businesses")
    .select("id")
    .eq("owner_id", userId)
    .single();

  let query = supabase
    .from("leads")
    .select("*")
    .eq("business_id", business?.id)
    .order("created_at", { ascending: false });

  if (status && status !== "all") query = query.eq("status", status);
  if (score && score !== "all") query = query.eq("lead_score", score);

  const { data: leads } = await query;
  const leadRows = (leads ?? []) as LeadRow[];

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
              {status || score
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
    </div>
  );
}
