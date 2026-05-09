import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

export default async function LeadsPage() {
  const supabase = await createClient();

  const { data: leads } = await supabase
    .from("leads")
    .select("*")
    .order("created_at", { ascending: false });

  const scoreColor = (score: string | null) => {
    if (score === "hot") return "background:#fef2f2;color:#991b1b";
    if (score === "warm") return "background:#fff7ed;color:#9a3412";
    if (score === "cold") return "background:#eff6ff;color:#1e40af";
    return "background:#f9fafb;color:#374151";
  };

  const statusColor = (status: string) => {
    if (status === "new") return "background:#dbeafe;color:#1e40af";
    if (status === "qualified") return "background:#dcfce7;color:#166534";
    if (status === "won") return "background:#d1fae5;color:#065f46";
    if (status === "lost") return "background:#fee2e2;color:#991b1b";
    return "background:#f3f4f6;color:#374151";
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Leads</h1>
      {!leads || leads.length === 0 ? (
        <p className="text-gray-500">No leads yet. Submit your test form to see them here.</p>
      ) : (
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "2px solid #e5e7eb" }}>
              <th style={{ textAlign: "left", padding: "8px", fontWeight: 600 }}>Name</th>
              <th style={{ textAlign: "left", padding: "8px", fontWeight: 600 }}>Phone</th>
              <th style={{ textAlign: "left", padding: "8px", fontWeight: 600 }}>Service</th>
              <th style={{ textAlign: "left", padding: "8px", fontWeight: 600 }}>Score</th>
              <th style={{ textAlign: "left", padding: "8px", fontWeight: 600 }}>Status</th>
              <th style={{ textAlign: "left", padding: "8px", fontWeight: 600 }}>Date</th>
            </tr>
          </thead>
          <tbody>
            {leads.map((lead) => (
              <tr key={lead.id} style={{ borderBottom: "1px solid #e5e7eb" }}>
                <td style={{ padding: "10px 8px" }}>
                  <Link href={`/dashboard/leads/${lead.id}`} style={{ color: "#2563eb", textDecoration: "underline" }}>
                    {lead.name ?? "Unknown"}
                  </Link>
                </td>
                <td style={{ padding: "10px 8px" }}>{lead.phone ?? "—"}</td>
                <td style={{ padding: "10px 8px" }}>{lead.service_type ?? "—"}</td>
                <td style={{ padding: "10px 8px" }}>
                  {lead.lead_score ? (
                    <span style={{ padding: "2px 8px", borderRadius: "9999px", fontSize: "12px", ...Object.fromEntries(scoreColor(lead.lead_score).split(";").map(s => s.split(":"))) }}>
                      {lead.lead_score.toUpperCase()}
                    </span>
                  ) : "—"}
                </td>
                <td style={{ padding: "10px 8px" }}>
                  <span style={{ padding: "2px 8px", borderRadius: "9999px", fontSize: "12px", ...Object.fromEntries(statusColor(lead.status).split(";").map(s => s.split(":"))) }}>
                    {lead.status.toUpperCase()}
                  </span>
                </td>
                <td style={{ padding: "10px 8px", color: "#6b7280", fontSize: "14px" }}>
                  {new Date(lead.created_at).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}