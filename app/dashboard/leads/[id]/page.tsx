"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Phone,
  MapPin,
  Wrench,
  Calendar,
  Clock,
  Home,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  Send,
} from "lucide-react";

const STATUSES = [
  "new",
  "contacted",
  "qualified",
  "appointment_set",
  "won",
  "lost",
  "junk",
  "unresponsive",
];

const scoreColors: Record<string, string> = {
  hot: "bg-red-100 text-red-700",
  warm: "bg-orange-100 text-orange-700",
  cold: "bg-blue-100 text-blue-700",
  unqualified: "bg-gray-100 text-gray-600",
};

type Lead = {
  id: string;
  name: string | null;
  phone: string | null;
  address: string | null;
  service_type: string | null;
  created_at: string;
  status: string;
  lead_score: string | null;
  summary: string | null;
  urgency: string | null;
  timeline: string | null;
  is_homeowner: boolean | null;
  qualification_reason: string | null;
  needs_human_review: boolean | null;
  handoff_reason: string | null;
  owner_takeover_at: string | null;
};

type Message = {
  id: string;
  role: string;
  body: string;
  sent_at?: string;
};

function titleCase(value: string) {
  return value
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function formatServiceType(serviceType: string | null) {
  if (!serviceType) return null;

  const labels: Record<string, string> = {
    repair: "Roof Repair",
    replacement: "Full Replacement",
    inspection: "Inspection",
    storm_damage: "Storm Damage",
  };

  return labels[serviceType] ?? titleCase(serviceType);
}

export default function LeadDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [lead, setLead] = useState<Lead | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [manualReply, setManualReply] = useState("");
  const [sendingReply, setSendingReply] = useState(false);
  const [replyError, setReplyError] = useState("");

  useEffect(() => {
    const load = async () => {
      const res = await fetch(`/api/dashboard/leads/${id}`);
      if (!res.ok) return;

      const data = await res.json();
      setLead(data.lead);
      setMessages(data.messages ?? []);
    };
    load();
  }, [id]);

  const updateStatus = async (newStatus: string) => {
    setSaving(true);
    const res = await fetch(`/api/dashboard/leads/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });

    if (res.ok) {
      setLead((prev) => (prev ? { ...prev, status: newStatus } : prev));
    }

    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const deleteLead = async () => {
    const confirmed = window.confirm(
      "Delete this lead and its conversation? This cannot be undone."
    );

    if (!confirmed) return;

    setDeleting(true);
    const res = await fetch(`/api/dashboard/leads/${id}`, {
      method: "DELETE",
    });

    if (res.ok) {
      router.push("/dashboard/leads");
      router.refresh();
      return;
    }

    setDeleting(false);
    window.alert("Could not delete this lead. Please try again.");
  };

  const updateHumanReview = async (needsReview: boolean) => {
    setSaving(true);
    const res = await fetch(`/api/dashboard/leads/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        needsHumanReview: needsReview,
        handoffReason: needsReview ? "Marked for review by owner." : null,
      }),
    });

    if (res.ok) {
      setLead((prev) =>
        prev
          ? {
              ...prev,
              needs_human_review: needsReview,
              handoff_reason: needsReview ? "Marked for review by owner." : null,
            }
          : prev
      );
    }

    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const sendManualReply = async () => {
    const body = manualReply.trim();
    if (body.length < 2) return;

    setSendingReply(true);
    setReplyError("");

    const res = await fetch(`/api/dashboard/leads/${id}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ body }),
    });

    const data = await res.json().catch(() => null);

    if (res.ok && data?.message) {
      setMessages((prev) => [...prev, data.message]);
      setManualReply("");
      setLead((prev) =>
        prev
          ? {
              ...prev,
              status: prev.status === "new" ? "contacted" : prev.status,
              needs_human_review: false,
              handoff_reason: null,
              owner_takeover_at: new Date().toISOString(),
            }
          : prev
      );
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } else {
      setReplyError(data?.error ?? "Could not send this reply.");
    }

    setSendingReply(false);
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
      value: lead.phone ? (
        <a
          href={`tel:${lead.phone}`}
          className="text-blue-600 hover:underline font-medium"
        >
          {lead.phone}
        </a>
      ) : null,
    },
    { icon: MapPin, label: "Address", value: lead.address },
    { icon: Wrench, label: "Service", value: formatServiceType(lead.service_type) },
    { icon: Clock, label: "Urgency", value: lead.urgency },
    { icon: Calendar, label: "Timeline", value: lead.timeline },
    {
      icon: Home,
      label: "Homeowner",
      value: lead.is_homeowner === null ? null : lead.is_homeowner ? "Yes" : "No",
    },
    {
      icon: Calendar,
      label: "Received",
      value: new Date(lead.created_at).toLocaleString(),
    },
  ];

  return (
    <div className="p-8 max-w-3xl">
      <Link
        href="/dashboard/leads"
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-slate-900 transition-colors mb-6"
      >
        <ArrowLeft className="h-4 w-4" /> Back to leads
      </Link>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-4">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              {lead.name ?? "Unknown"}
            </h1>
            <p className="text-gray-400 text-sm mt-1">
              Lead received {new Date(lead.created_at).toLocaleDateString()}
            </p>
          </div>
          {lead.lead_score && (
            <span
              className={`text-sm font-bold px-4 py-1.5 rounded-full ${scoreColors[lead.lead_score] ?? "bg-gray-100 text-gray-600"}`}
            >
              {lead.lead_score.toUpperCase()}
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-6">
          {infoItems.map(({ icon: Icon, label, value }) => (
            <div key={label} className="flex items-start gap-2.5 min-w-0">
              <div className="h-8 w-8 rounded-lg bg-gray-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Icon className="h-4 w-4 text-gray-400" aria-hidden="true" />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-gray-400">{label}</p>
                <div className="text-sm font-medium text-slate-900 break-words">
                  {value ?? "-"}
                </div>
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

      {lead.summary && (
        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6 mb-4">
          <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide mb-2">
            AI Summary
          </p>
          <p className="text-slate-700 text-sm leading-relaxed">{lead.summary}</p>
          {lead.qualification_reason && (
            <p className="text-slate-500 text-sm leading-relaxed mt-3">
              <span className="font-medium text-slate-700">Why this score:</span>{" "}
              {lead.qualification_reason}
            </p>
          )}
        </div>
      )}

      <div
        className={`rounded-2xl border p-6 mb-4 ${
          lead.needs_human_review
            ? "bg-amber-50 border-amber-100"
            : "bg-white border-gray-100 shadow-sm"
        }`}
      >
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex gap-3">
            <div
              className={`h-9 w-9 rounded-lg flex items-center justify-center ${
                lead.needs_human_review ? "bg-amber-100" : "bg-gray-50"
              }`}
            >
              {lead.needs_human_review ? (
                <AlertTriangle className="h-4 w-4 text-amber-700" />
              ) : (
                <CheckCircle2 className="h-4 w-4 text-gray-400" />
              )}
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900">
                {lead.needs_human_review ? "Needs Human Review" : "AI Handling"}
              </p>
              <p className="text-sm text-slate-600 mt-1">
                {lead.needs_human_review
                  ? lead.handoff_reason ?? "This lead should be reviewed by a person."
                  : lead.owner_takeover_at
                    ? "Owner takeover is active. New homeowner replies will be saved without AI auto-replying."
                    : "No handoff has been requested for this lead."}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => updateHumanReview(!lead.needs_human_review)}
            disabled={saving || deleting}
            className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold transition-colors disabled:opacity-50 ${
              lead.needs_human_review
                ? "bg-white border border-amber-200 text-amber-700 hover:bg-amber-100"
                : "bg-amber-50 border border-amber-100 text-amber-700 hover:bg-amber-100"
            }`}
          >
            {lead.needs_human_review ? "Resolve Review" : "Mark Needs Review"}
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-4">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <p className="text-sm font-semibold text-slate-900 mb-3">
              Update Status
            </p>
            <div className="flex items-center gap-3 flex-wrap">
              <select
                value={lead.status}
                onChange={(e) => updateStatus(e.target.value)}
                disabled={saving || deleting}
                className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {titleCase(status)}
                  </option>
                ))}
              </select>
              {saving && <span className="text-sm text-gray-400">Saving...</span>}
              {saved && (
                <span className="text-sm text-green-600 font-medium">Saved!</span>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={deleteLead}
            disabled={deleting}
            className="inline-flex items-center gap-2 rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-sm font-semibold text-red-600 transition-colors hover:bg-red-100 disabled:opacity-50"
          >
            <Trash2 className="h-4 w-4" />
            {deleting ? "Deleting..." : "Delete Lead"}
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-start justify-between gap-3 mb-4">
          <div>
            <p className="text-sm font-semibold text-slate-900">Conversation</p>
            {lead.owner_takeover_at && (
              <p className="text-xs text-gray-400 mt-1">
                Owner takeover active
              </p>
            )}
          </div>
        </div>
        {messages.length === 0 ? (
          <p className="text-gray-400 text-sm">No messages yet.</p>
        ) : (
          <div className="space-y-3">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-xs sm:max-w-sm px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                    msg.role === "user"
                      ? "bg-blue-600 text-white rounded-tr-sm"
                      : msg.role === "owner"
                        ? "bg-emerald-50 text-emerald-900 border border-emerald-100 rounded-tl-sm"
                      : "bg-gray-100 text-slate-800 rounded-tl-sm"
                  }`}
                >
                  {msg.role === "owner" && (
                    <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-emerald-600">
                      Owner
                    </p>
                  )}
                  {msg.body}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-6 border-t border-gray-100 pt-4">
          <label
            htmlFor="manual-reply"
            className="text-sm font-semibold text-slate-900"
          >
            Send manual SMS
          </label>
          <p className="text-xs text-gray-400 mt-1">
            Sending pauses AI replies for this lead so the owner can take over.
          </p>
          <textarea
            id="manual-reply"
            value={manualReply}
            onChange={(e) => {
              setManualReply(e.target.value.slice(0, 500));
              setReplyError("");
            }}
            disabled={sendingReply || deleting || !lead.phone}
            rows={3}
            className="mt-3 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            placeholder={
              lead.phone
                ? "Type a reply to send from your RoofLead number..."
                : "This lead has no phone number."
            }
          />
          <div className="mt-3 flex items-center justify-between gap-3 flex-wrap">
            <span className="text-xs text-gray-400">
              {manualReply.length}/500 characters
            </span>
            <button
              type="button"
              onClick={sendManualReply}
              disabled={sendingReply || manualReply.trim().length < 2 || !lead.phone}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Send className="h-4 w-4" />
              {sendingReply ? "Sending..." : "Send SMS"}
            </button>
          </div>
          {replyError && (
            <p className="mt-2 text-sm font-medium text-red-600">{replyError}</p>
          )}
        </div>
      </div>
    </div>
  );
}
