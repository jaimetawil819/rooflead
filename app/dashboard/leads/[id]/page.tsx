"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";

const STATUSES = ["new", "contacted", "qualified", "appointment_set", "won", "lost", "junk"];

export default function LeadDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const [lead, setLead] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const load = async () => {
      const { id } = await params;
      const supabase = createClient();

      const { data: leadData } = await supabase
        .from("leads")
        .select("*")
        .eq("id", id)
        .single();
      setLead(leadData);

      const { data: msgs } = await supabase
        .from("messages")
        .select("*")
        .eq("lead_id", id)
        .order("sent_at", { ascending: true });
      setMessages(msgs ?? []);
    };
    load();
  }, []);

  const updateStatus = async (newStatus: string) => {
    setSaving(true);
    const supabase = createClient();
    await supabase.from("leads").update({ status: newStatus }).eq("id", lead.id);
    setLead({ ...lead, status: newStatus });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  if (!lead) return <div className="p-8">Loading...</div>;

  return (
    <div className="p-8 max-w-2xl">
      <Link href="/dashboard/leads" className="text-blue-600 text-sm hover:underline">
        ← Back to leads
      </Link>

      <h1 className="text-2xl font-bold mt-4 mb-6">{lead.name ?? "Unknown"}</h1>

      <div className="space-y-3 mb-8">
        <div><span className="font-medium">Phone:</span> {lead.phone ?? "—"}</div>
        <div><span className="font-medium">Address:</span> {lead.address ?? "—"}</div>
        <div><span className="font-medium">Service:</span> {lead.service_type ?? "—"}</div>
        <div><span className="font-medium">Urgency:</span> {lead.urgency ?? "—"}</div>
        <div><span className="font-medium">Score:</span> {lead.lead_score ?? "Not scored yet"}</div>
        <div><span className="font-medium">Received:</span> {new Date(lead.created_at).toLocaleString()}</div>
      </div>

      {lead.summary && (
        <div className="bg-gray-50 border rounded p-4 mb-8">
          <p className="font-medium mb-1">AI Summary</p>
          <p className="text-gray-700">{lead.summary}</p>
        </div>
      )}

      <div className="mb-8">
        <label className="block font-medium mb-2">Status</label>
        <select
          value={lead.status}
          onChange={(e) => updateStatus(e.target.value)}
          className="border rounded px-3 py-2"
        >
          {STATUSES.map((s) => (
            <option key={s} value={s}>{s.replace("_", " ").toUpperCase()}</option>
          ))}
        </select>
        {saved && <span className="ml-3 text-green-600 text-sm">Saved!</span>}
        {saving && <span className="ml-3 text-gray-400 text-sm">Saving...</span>}
      </div>

      <div>
        <h2 className="font-semibold text-lg mb-4">Conversation</h2>
        {messages.length === 0 ? (
          <p className="text-gray-400 text-sm">No messages yet.</p>
        ) : (
          <div className="space-y-3">
            {messages.map((msg: any) => (
              <div
                key={msg.id}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-sm px-4 py-2 rounded-lg text-sm ${
                    msg.role === "user"
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {msg.body}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}