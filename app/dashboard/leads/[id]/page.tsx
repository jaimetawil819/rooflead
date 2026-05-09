"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { ArrowLeft, Phone, MapPin, Wrench, Calendar } from "lucide-react";
import { use } from "react";

const STATUSES = ["new", "contacted", "qualified", "appointment_set", "won", "lost", "junk"];

const scoreColors: Record<string, string> = {
  hot: "bg-red-100 text-red-700",
  warm: "bg-orange-100 text-orange-700",
  cold: "bg-blue-100 text-blue-700",
  unqualified: "bg-gray-100 text-gray-600",
};

export default function LeadDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [lead, setLead] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const load = async () => {
      const supabase = createClient();
      const { data: leadData } = await supabase.from("leads").select("*").eq("id", id).single();
      setLead(leadData);
      const { data: msgs } = await supabase
        .from("messages")
        .select("*")
        .eq("lead_id", id)
        .order("sent_at", { ascending: true });
      setMessages(msgs ?? []);
    };
    load();
  }, [id]);

  const updateStatus = async (newStatus: string) => {
    setSaving(true);
    const supabase = createClient();
    await supabase.from("leads").update({ status: newStatus }).eq("id", id);
    setLead((prev: any) => ({ ...prev, status: newStatus }));
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  if (!lead) {
    return (
      <div className="p-8 flex items-center justify-center min-h-64">
        <div className="h-6 w-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const infoItems = [
    {
      icon: Phone,
      label: "Phone",
      value: lead.phone
        ? <a href={`tel:${lead.phone}`} className="text-blue-600 hover:underline font-medium">{lead.phone}</a>
        : "—",
    },
    { icon: MapPin, label: "Address", value: lead.address },
    { icon: Wrench, label: "Service", value: lead.service_type },
    { icon: Calendar, label: "Received", value: new Date(lead.created_at).toLocaleString() },
  ];

  return (
    <div className="p-8 max-w-3xl">
      <Link
        href="/dashboard/leads"
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-slate-900 transition-colors mb-6"
      >
        <ArrowLeft className="h-4 w-4" /> Back to leads
      </Link>

      {/* Header */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-4">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{lead.name ?? "Unknown"}</h1>
            <p className="text-gray-400 text-sm mt-1">
              Lead received {new Date(lead.created_at).toLocaleDateString()}
            </p>
          </div>
          {lead.lead_score && (
            <span className={`text-sm font-bold px-4 py-1.5 rounded-full ${scoreColors[lead.lead_score] ?? "bg-gray-100 text-gray-600"}`}>
              {lead.lead_score.toUpperCase()}
            </span>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3 mt-6">
          {infoItems.map(({ icon: Icon, label, value }) => (
            <div key={label} className="flex items-start gap-2.5">
              <div className="h-8 w-8 rounded-lg bg-gray-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Icon className="h-4 w-4 text-gray-400" aria-hidden="true" />
              </div>
              <div>
                <p className="text-xs text-gray-400">{label}</p>
                <div className="text-sm font-medium text-slate-900">{value ?? "—"}</div>
              </div>
            </div>
          ))}
        </div>

        {lead.phone && (
          <div className="mt-5">
            <a
              href={`tel:${lead.phone}`}
              className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
            >
              <Phone className="h-4 w-4" />
              Call {lead.name?.split(" ")[0] ?? "Lead"}
            </a>
          </div>
        )}
      </div>

      {/* AI Summary */}
      {lead.summary && (
        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6 mb-4">
          <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide mb-2">AI Summary</p>
          <p className="text-slate-700 text-sm leading-relaxed">{lead.summary}</p>
        </div>
      )}

      {/* Status */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-4">
        <p className="text-sm font-semibold text-slate-900 mb-3">Update Status</p>
        <div className="flex items-center gap-3 flex-wrap">
          <select
            value={lead.status}
            onChange={(e) => updateStatus(e.target.value)}
            disabled={saving}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s.replace("_", " ").replace(/\b\w/g, (c) => c.toUpperCase())}
              </option>
            ))}
          </select>
          {saving && <span className="text-sm text-gray-400">Saving…</span>}
          {saved && <span className="text-sm text-green-600 font-medium">Saved!</span>}
        </div>
      </div>

      {/* Conversation */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <p className="text-sm font-semibold text-slate-900 mb-4">Conversation</p>
        {messages.length === 0 ? (
          <p className="text-gray-400 text-sm">No messages yet.</p>
        ) : (
          <div className="space-y-3">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-xs sm:max-w-sm px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                    msg.role === "user"
                      ? "bg-blue-600 text-white rounded-tr-sm"
                      : "bg-gray-100 text-slate-800 rounded-tl-sm"
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
