"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Calendar,
  CheckCircle2,
  Clock,
  Home,
  MapPin,
  MessageSquareText,
  Phone,
  Send,
  ShieldCheck,
  Trash2,
  Wrench,
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

const APPOINTMENT_STATUSES = [
  "not_requested",
  "requested",
  "scheduled",
  "completed",
  "canceled",
];

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
  junk: "bg-slate-100 text-slate-600 ring-slate-200",
  unresponsive: "bg-slate-100 text-slate-600 ring-slate-200",
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
  appointment_status: string;
  preferred_appointment_time: string | null;
  appointment_notes: string | null;
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

function getPrimaryAction(lead: Lead) {
  if (lead.needs_human_review) return "Review conversation before replying";
  if (lead.lead_score === "hot") return "Call this lead first";
  if (lead.status === "new") return "Make first owner contact";
  if (lead.status === "appointment_set") return "Confirm inspection details";
  if (lead.status === "won") return "Won lead, keep record updated";
  if (lead.status === "lost" || lead.status === "junk") return "No active action";
  return "Review and update next step";
}

function formatMessageTime(sentAt?: string) {
  if (!sentAt) return null;

  return new Date(sentAt).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
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
  const [appointmentStatus, setAppointmentStatus] = useState("not_requested");
  const [preferredAppointmentTime, setPreferredAppointmentTime] = useState("");
  const [appointmentNotes, setAppointmentNotes] = useState("");
  const [savingAppointment, setSavingAppointment] = useState(false);

  useEffect(() => {
    const load = async () => {
      const res = await fetch(`/api/dashboard/leads/${id}`);
      if (!res.ok) return;

      const data = await res.json();
      setLead(data.lead);
      setMessages(data.messages ?? []);
      setAppointmentStatus(data.lead.appointment_status ?? "not_requested");
      setPreferredAppointmentTime(data.lead.preferred_appointment_time ?? "");
      setAppointmentNotes(data.lead.appointment_notes ?? "");
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

  const updateAppointment = async () => {
    setSavingAppointment(true);
    const res = await fetch(`/api/dashboard/leads/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        status: appointmentStatus === "scheduled" ? "appointment_set" : undefined,
        appointmentStatus,
        preferredAppointmentTime,
        appointmentNotes,
      }),
    });

    if (res.ok) {
      setLead((prev) =>
        prev
          ? {
              ...prev,
              appointment_status: appointmentStatus,
              preferred_appointment_time: preferredAppointmentTime || null,
              appointment_notes: appointmentNotes || null,
              status:
                appointmentStatus === "scheduled" &&
                prev.status !== "appointment_set"
                  ? "appointment_set"
                  : prev.status,
            }
          : prev
      );
    }

    setSavingAppointment(false);
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
      <div className="flex min-h-64 items-center justify-center p-8">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
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
          className="font-bold text-blue-700 hover:underline"
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
    <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8 lg:py-8">
      <Link
        href="/dashboard/leads"
        className="mb-5 inline-flex min-h-10 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-slate-700 transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Back to leads
      </Link>

      <section className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-950 text-white shadow-xl shadow-slate-300/40">
        <div className="grid gap-0 xl:grid-cols-[1fr_0.42fr]">
          <div className="p-6 sm:p-8">
            <p className="text-sm font-semibold uppercase tracking-widest text-blue-300">
              Lead Detail
            </p>
            <div className="mt-4 flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
              <div className="min-w-0">
                <h1 className="text-3xl font-bold leading-tight tracking-tight sm:text-4xl">
                  {lead.name ?? "Unknown Lead"}
                </h1>
                <p className="mt-3 max-w-2xl text-base leading-7 text-slate-300">
                  {getPrimaryAction(lead)}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {lead.lead_score && (
                  <span className={`rounded-full px-3 py-1.5 text-xs font-black uppercase ring-1 ${scoreColors[lead.lead_score] ?? "bg-slate-100 text-slate-600 ring-slate-200"}`}>
                    {lead.lead_score}
                  </span>
                )}
                <span className={`rounded-full px-3 py-1.5 text-xs font-bold ring-1 ${statusColors[lead.status] ?? "bg-slate-100 text-slate-600 ring-slate-200"}`}>
                  {titleCase(lead.status)}
                </span>
              </div>
            </div>

            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              {lead.phone ? (
                <a
                  href={`tel:${lead.phone}`}
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-emerald-500 px-5 py-3 text-sm font-black text-slate-950 transition-colors hover:bg-emerald-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
                >
                  <Phone className="h-4 w-4" aria-hidden="true" />
                  Call {lead.name?.split(" ")[0] ?? "Lead"}
                </a>
              ) : (
                <span className="inline-flex min-h-11 items-center justify-center rounded-lg border border-white/10 bg-white/5 px-5 py-3 text-sm font-bold text-slate-400">
                  No phone number
                </span>
              )}
              <a
                href="#manual-reply"
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-white/15 bg-white/5 px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
              >
                <MessageSquareText className="h-4 w-4" aria-hidden="true" />
                Owner Reply
              </a>
            </div>
          </div>

          <div className="border-t border-slate-800 bg-white/[0.03] p-6 sm:p-8 xl:border-l xl:border-t-0">
            <div className="rounded-xl border border-white/10 bg-white/[0.04] p-4">
              <div className="flex items-start gap-3">
                {lead.needs_human_review ? (
                  <AlertTriangle className="mt-0.5 h-5 w-5 flex-shrink-0 text-amber-300" aria-hidden="true" />
                ) : (
                  <ShieldCheck className="mt-0.5 h-5 w-5 flex-shrink-0 text-emerald-300" aria-hidden="true" />
                )}
                <div>
                  <p className="text-sm font-bold text-white">
                    {lead.needs_human_review ? "Owner review needed" : "AI intake captured"}
                  </p>
                  <p className="mt-1 text-sm leading-6 text-slate-300">
                    {lead.needs_human_review
                      ? lead.handoff_reason ?? "Review this lead before the AI continues."
                      : lead.owner_takeover_at
                        ? "Owner takeover is active for this lead."
                        : "No owner handoff is currently requested."}
                  </p>
                </div>
              </div>
            </div>

            {saved && (
              <div className="mt-3 rounded-xl border border-emerald-400/20 bg-emerald-500/10 p-3 text-sm font-bold text-emerald-100">
                Saved
              </div>
            )}
          </div>
        </div>
      </section>

      <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_420px]">
        <main className="space-y-6">
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="mb-5 flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-bold uppercase tracking-wide text-blue-700">
                  AI Summary
                </p>
                <h2 className="mt-1 text-xl font-bold text-slate-950">
                  Qualification snapshot
                </h2>
              </div>
              <ArrowRight className="h-5 w-5 text-blue-600" aria-hidden="true" />
            </div>
            {lead.summary ? (
              <>
                <p className="text-sm leading-7 text-slate-700">{lead.summary}</p>
                {lead.qualification_reason && (
                  <p className="mt-4 rounded-xl border border-blue-100 bg-blue-50 p-4 text-sm leading-6 text-slate-700">
                    <span className="font-bold text-slate-950">Why this score: </span>
                    {lead.qualification_reason}
                  </p>
                )}
              </>
            ) : (
              <p className="text-sm leading-6 text-slate-500">
                No AI summary yet. It will appear after the intake conversation
                has enough information.
              </p>
            )}
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="mb-5">
              <p className="text-sm font-bold uppercase tracking-wide text-blue-700">
                Lead Facts
              </p>
              <h2 className="mt-1 text-xl font-bold text-slate-950">
                Details needed before the call
              </h2>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {infoItems.map(({ icon: Icon, label, value }) => (
                <div key={label} className="flex min-w-0 items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <div className="mt-0.5 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-white text-blue-600 ring-1 ring-slate-200">
                    <Icon className="h-4 w-4" aria-hidden="true" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                      {label}
                    </p>
                    <div className="mt-1 break-words text-sm font-semibold text-slate-950">
                      {value ?? "-"}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="grid gap-5 lg:grid-cols-2">
              <div>
                <p className="text-sm font-bold uppercase tracking-wide text-blue-700">
                  Pipeline Status
                </p>
                <h2 className="mt-1 text-xl font-bold text-slate-950">
                  Update the sales stage
                </h2>
                <div className="mt-4 flex flex-wrap items-center gap-3">
                  <select
                    aria-label="Pipeline status"
                    value={lead.status}
                    onChange={(e) => updateStatus(e.target.value)}
                    disabled={saving || deleting}
                    className="min-h-11 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 disabled:opacity-50"
                  >
                    {STATUSES.map((status) => (
                      <option key={status} value={status}>
                        {titleCase(status)}
                      </option>
                    ))}
                  </select>
                  {saving && <span className="text-sm text-slate-500">Saving...</span>}
                </div>
              </div>

              <div className={lead.needs_human_review ? "rounded-xl border border-amber-200 bg-amber-50 p-4" : "rounded-xl border border-slate-200 bg-slate-50 p-4"}>
                <div className="flex items-start gap-3">
                  {lead.needs_human_review ? (
                    <AlertTriangle className="mt-0.5 h-5 w-5 flex-shrink-0 text-amber-700" aria-hidden="true" />
                  ) : (
                    <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-slate-500" aria-hidden="true" />
                  )}
                  <div>
                    <p className="font-bold text-slate-950">
                      {lead.needs_human_review ? "Review needed" : "Owner handoff"}
                    </p>
                    <p className="mt-1 text-sm leading-6 text-slate-600">
                      {lead.needs_human_review
                        ? lead.handoff_reason ?? "A person should review this lead."
                        : "Flag this lead when it needs human judgment."}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => updateHumanReview(!lead.needs_human_review)}
                  disabled={saving || deleting}
                  className="mt-4 inline-flex min-h-10 items-center rounded-lg border border-amber-200 bg-white px-3 py-2 text-sm font-bold text-amber-800 transition-colors hover:bg-amber-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 disabled:opacity-50"
                >
                  {lead.needs_human_review ? "Mark Reviewed" : "Flag For Owner"}
                </button>
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-sm font-bold uppercase tracking-wide text-blue-700">
                  Scheduling
                </p>
                <h2 className="mt-1 text-xl font-bold text-slate-950">
                  Track inspection intent
                </h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Save preferred timing and notes without promising automatic booking.
                </p>
              </div>
              <span className="inline-flex w-fit rounded-full bg-blue-50 px-3 py-1 text-xs font-bold uppercase tracking-wide text-blue-700">
                {titleCase(appointmentStatus)}
              </span>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="appointment-status" className="mb-1.5 block text-sm font-bold text-slate-700">
                  Appointment Status
                </label>
                <select
                  id="appointment-status"
                  value={appointmentStatus}
                  onChange={(e) => setAppointmentStatus(e.target.value)}
                  disabled={savingAppointment || deleting}
                  className="min-h-11 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 disabled:opacity-50"
                >
                  {APPOINTMENT_STATUSES.map((status) => (
                    <option key={status} value={status}>
                      {titleCase(status)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="preferred-time" className="mb-1.5 block text-sm font-bold text-slate-700">
                  Preferred Time
                </label>
                <input
                  id="preferred-time"
                  value={preferredAppointmentTime}
                  onChange={(e) =>
                    setPreferredAppointmentTime(e.target.value.slice(0, 120))
                  }
                  disabled={savingAppointment || deleting}
                  className="min-h-11 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 disabled:opacity-50"
                  placeholder="e.g. Tomorrow afternoon"
                />
              </div>
            </div>

            <div className="mt-4">
              <label htmlFor="appointment-notes" className="mb-1.5 block text-sm font-bold text-slate-700">
                Appointment Notes
              </label>
              <textarea
                id="appointment-notes"
                value={appointmentNotes}
                onChange={(e) => setAppointmentNotes(e.target.value.slice(0, 500))}
                disabled={savingAppointment || deleting}
                rows={3}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 disabled:opacity-50"
                placeholder="Add confirmation details, access notes, or timing constraints."
              />
              <p className="mt-1.5 text-xs text-slate-500">
                {appointmentNotes.length}/500 characters
              </p>
            </div>

            <div className="mt-5 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={updateAppointment}
                disabled={savingAppointment || deleting}
                className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-blue-600 px-4 py-3 text-sm font-bold text-white transition-colors hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {savingAppointment ? "Saving..." : "Save Scheduling"}
              </button>
              {lead.preferred_appointment_time && (
                <span className="text-xs text-slate-500">
                  Saved preference: {lead.preferred_appointment_time}
                </span>
              )}
            </div>
          </section>

          <section className="rounded-2xl border border-red-200 bg-red-50 p-5 sm:p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-sm font-bold uppercase tracking-wide text-red-700">
                  Danger Zone
                </p>
                <h2 className="mt-1 text-lg font-bold text-slate-950">
                  Delete test or unwanted lead
                </h2>
                <p className="mt-2 text-sm leading-6 text-slate-700">
                  This permanently removes the lead and its conversation. Use it
                  only for test data or records you no longer need.
                </p>
              </div>
              <button
                type="button"
                onClick={deleteLead}
                disabled={deleting}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-red-200 bg-white px-4 py-3 text-sm font-bold text-red-700 transition-colors hover:bg-red-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 disabled:opacity-50"
              >
                <Trash2 className="h-4 w-4" aria-hidden="true" />
                {deleting ? "Deleting..." : "Delete Lead"}
              </button>
            </div>
          </section>
        </main>

        <aside className="space-y-6 xl:sticky xl:top-8 xl:self-start">
          <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 px-5 py-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-bold uppercase tracking-wide text-blue-700">
                    Conversation
                  </p>
                  <h2 className="mt-1 text-xl font-bold text-slate-950">
                    SMS timeline
                  </h2>
                  {lead.owner_takeover_at && (
                    <p className="mt-1 text-xs font-semibold text-emerald-700">
                      Owner takeover active
                    </p>
                  )}
                </div>
                <MessageSquareText className="h-5 w-5 text-blue-600" aria-hidden="true" />
              </div>
            </div>

            <div className="max-h-[520px] space-y-3 overflow-y-auto px-5 py-5">
              {messages.length === 0 ? (
                <p className="text-sm leading-6 text-slate-500">No messages yet.</p>
              ) : (
                messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[88%] rounded-2xl px-4 py-2.5 text-sm leading-6 ${
                        msg.role === "user"
                          ? "rounded-tr-sm bg-blue-600 text-white"
                          : msg.role === "owner"
                            ? "rounded-tl-sm border border-emerald-100 bg-emerald-50 text-emerald-950"
                            : "rounded-tl-sm bg-slate-100 text-slate-800"
                      }`}
                    >
                      {msg.role === "owner" && (
                        <p className="mb-1 text-[10px] font-bold uppercase tracking-wide text-emerald-700">
                          Owner
                        </p>
                      )}
                      <p>{msg.body}</p>
                      {formatMessageTime(msg.sent_at) && (
                        <p className={`mt-1 text-[10px] ${msg.role === "user" ? "text-blue-100" : "text-slate-500"}`}>
                          {formatMessageTime(msg.sent_at)}
                        </p>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>

          <section id="manual-reply" className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <label htmlFor="manual-reply-input" className="text-sm font-bold uppercase tracking-wide text-blue-700">
              Send manual SMS
            </label>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Sending pauses AI replies for this lead so the owner can take over.
            </p>
            <textarea
              id="manual-reply-input"
              value={manualReply}
              onChange={(e) => {
                setManualReply(e.target.value.slice(0, 500));
                setReplyError("");
              }}
              disabled={sendingReply || deleting || !lead.phone}
              rows={4}
              className="mt-4 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 disabled:opacity-50"
              placeholder={
                lead.phone
                  ? "Type a reply to send from your RoofLead number..."
                  : "This lead has no phone number."
              }
            />
            <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
              <span className="text-xs text-slate-500">
                {manualReply.length}/500 characters
              </span>
              <button
                type="button"
                onClick={sendManualReply}
                disabled={sendingReply || manualReply.trim().length < 2 || !lead.phone}
                className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-blue-600 px-4 py-3 text-sm font-bold text-white transition-colors hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Send className="h-4 w-4" aria-hidden="true" />
                {sendingReply ? "Sending..." : "Send SMS"}
              </button>
            </div>
            {replyError && (
              <p className="mt-3 text-sm font-bold text-red-600">{replyError}</p>
            )}
          </section>
        </aside>
      </div>
    </div>
  );
}
