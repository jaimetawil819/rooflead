"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Building2,
  CalendarDays,
  CheckCircle2,
  Clock,
  Code,
  Copy,
  CreditCard,
  DollarSign,
  ExternalLink,
  Phone,
  Plus,
  ShieldCheck,
  X,
} from "lucide-react";

interface Service {
  label: string;
  value: string;
}

const DAYS = [
  { label: "Mon", value: "monday" },
  { label: "Tue", value: "tuesday" },
  { label: "Wed", value: "wednesday" },
  { label: "Thu", value: "thursday" },
  { label: "Fri", value: "friday" },
  { label: "Sat", value: "saturday" },
  { label: "Sun", value: "sunday" },
];

const TIMEZONES = [
  { label: "Pacific Time", value: "America/Los_Angeles" },
  { label: "Mountain Time", value: "America/Denver" },
  { label: "Central Time", value: "America/Chicago" },
  { label: "Eastern Time", value: "America/New_York" },
];

const SETTINGS_TABS = [
  {
    id: "business",
    label: "Business",
    description: "Company info, alerts, and ROI defaults",
    icon: Building2,
  },
  {
    id: "lead-form",
    label: "Lead Form",
    description: "Services, AI question, and embed code",
    icon: Code,
  },
  {
    id: "scheduling",
    label: "Scheduling",
    description: "Inspection availability and timing",
    icon: CalendarDays,
  },
  {
    id: "billing",
    label: "Billing",
    description: "Subscription and payment settings",
    icon: CreditCard,
  },
] as const;

type SettingsTab = (typeof SETTINGS_TABS)[number]["id"];

function labelToValue(label: string): string {
  return label.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "");
}

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<SettingsTab>("business");
  const [name, setName] = useState("");
  const [notificationPhone, setNotificationPhone] = useState("");
  const [averageJobValue, setAverageJobValue] = useState("8000");
  const [widgetKey, setWidgetKey] = useState("");
  const [widgetId, setWidgetId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState(false);
  const [schedulingEnabled, setSchedulingEnabled] = useState(true);
  const [schedulingTimezone, setSchedulingTimezone] = useState(
    "America/Los_Angeles"
  );
  const [schedulingAvailableDays, setSchedulingAvailableDays] = useState<
    string[]
  >(["monday", "tuesday", "wednesday", "thursday", "friday"]);
  const [schedulingStartTime, setSchedulingStartTime] = useState("08:00");
  const [schedulingEndTime, setSchedulingEndTime] = useState("17:00");
  const [inspectionDurationMinutes, setInspectionDurationMinutes] =
    useState("60");
  const [schedulingBufferMinutes, setSchedulingBufferMinutes] = useState("15");

  const [services, setServices] = useState<Service[]>([]);
  const [intakeQuestion, setIntakeQuestion] = useState("");
  const [savingForm, setSavingForm] = useState(false);
  const [savedForm, setSavedForm] = useState(false);
  const [billingLoading, setBillingLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      const res = await fetch("/api/dashboard/settings");
      if (!res.ok) return;

      const { business, widget } = await res.json();
      if (business) {
        setName(business.name ?? "");
        setNotificationPhone(business.notification_phone ?? "");
        setAverageJobValue(
          String(Math.round((business.average_job_value_cents ?? 800000) / 100))
        );
        setSchedulingEnabled(business.scheduling_enabled ?? true);
        setSchedulingTimezone(
          business.scheduling_timezone ?? "America/Los_Angeles"
        );
        setSchedulingAvailableDays(
          Array.isArray(business.scheduling_available_days)
            ? business.scheduling_available_days
            : ["monday", "tuesday", "wednesday", "thursday", "friday"]
        );
        setSchedulingStartTime(business.scheduling_start_time ?? "08:00");
        setSchedulingEndTime(business.scheduling_end_time ?? "17:00");
        setInspectionDurationMinutes(
          String(business.inspection_duration_minutes ?? 60)
        );
        setSchedulingBufferMinutes(
          String(business.scheduling_buffer_minutes ?? 15)
        );
      }

      if (widget) {
        setWidgetKey(widget.widget_key);
        setWidgetId(widget.id);
        setServices(widget.services ?? []);
        setIntakeQuestion(widget.intake_question ?? "");
      }
    };
    load();
  }, []);

  const save = async () => {
    setSaving(true);
    await fetch("/api/dashboard/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        notificationPhone,
        averageJobValue,
        schedulingEnabled,
        schedulingTimezone,
        schedulingAvailableDays,
        schedulingStartTime,
        schedulingEndTime,
        inspectionDurationMinutes,
        schedulingBufferMinutes,
      }),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const saveFormConfig = async () => {
    if (!widgetId) return;
    setSavingForm(true);
    await fetch("/api/dashboard/form-widget", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ widgetId, services, intakeQuestion }),
    });
    setSavingForm(false);
    setSavedForm(true);
    setTimeout(() => setSavedForm(false), 3000);
  };

  const addService = () => {
    setServices([...services, { label: "", value: "" }]);
  };

  const updateService = (index: number, label: string) => {
    const updated = [...services];
    updated[index] = { label, value: labelToValue(label) };
    setServices(updated);
  };

  const removeService = (index: number) => {
    setServices(services.filter((_, i) => i !== index));
  };

  const toggleAvailableDay = (day: string) => {
    setSchedulingAvailableDays((current) =>
      current.includes(day)
        ? current.filter((value) => value !== day)
        : [...current, day]
    );
  };

  const appOrigin = typeof window === "undefined" ? "" : window.location.origin;
  const embedCode =
    widgetKey && appOrigin
      ? `<script src="${appOrigin}/embed.js" data-key="${widgetKey}"></script>`
      : "";
  const testFormPath = widgetKey ? `/test-form/${widgetKey}` : null;
  const activeTabConfig = SETTINGS_TABS.find((tab) => tab.id === activeTab);
  const ActiveTabIcon = activeTabConfig?.icon;

  const copyEmbed = () => {
    if (!embedCode) return;
    navigator.clipboard.writeText(embedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const openBillingPortal = async () => {
    setBillingLoading(true);
    const res = await fetch("/api/billing/portal", { method: "POST" });
    const data = await res.json().catch(() => null);

    if (res.ok && data?.url) {
      window.location.href = data.url;
      return;
    }

    setBillingLoading(false);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8 lg:py-8">
      <section className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-950 text-white shadow-xl shadow-slate-300/40">
        <div className="grid gap-0 lg:grid-cols-[1fr_0.42fr]">
          <div className="p-6 sm:p-8">
            <p className="text-sm font-semibold uppercase tracking-widest text-blue-300">
              Settings
            </p>
            <h1 className="mt-4 text-3xl font-bold leading-tight tracking-tight sm:text-4xl">
              Configure how RoofLead captures, qualifies, and routes leads.
            </h1>
            <p className="mt-4 max-w-3xl text-base leading-7 text-slate-300 sm:text-lg">
              Keep owner alerts, lead form behavior, inspection timing, and
              billing details organized in one control surface.
            </p>
          </div>

          <div className="border-t border-slate-800 bg-white/[0.03] p-6 sm:p-8 lg:border-l lg:border-t-0">
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-white/10 bg-white/[0.04] p-4">
                <p className="text-2xl font-black text-white">{services.length}</p>
                <p className="mt-1 text-xs font-medium uppercase tracking-wide text-slate-400">
                  Services
                </p>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/[0.04] p-4">
                <p className="text-2xl font-black text-white">
                  {schedulingAvailableDays.length}
                </p>
                <p className="mt-1 text-xs font-medium uppercase tracking-wide text-slate-400">
                  Active days
                </p>
              </div>
            </div>
            <div className="mt-4 rounded-xl border border-emerald-400/20 bg-emerald-500/10 p-4">
              <div className="flex items-start gap-3">
                <ShieldCheck className="mt-0.5 h-5 w-5 flex-shrink-0 text-emerald-300" aria-hidden="true" />
                <p className="text-sm leading-6 text-emerald-50">
                  Form, SMS intake, and billing settings stay behind protected
                  dashboard routes.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="mt-6 grid gap-6 lg:grid-cols-[300px_minmax(0,1fr)]">
        <aside className="lg:sticky lg:top-8 lg:self-start">
          <div
            role="tablist"
            aria-label="Settings sections"
            className="grid gap-2 rounded-2xl border border-slate-200 bg-white p-2 shadow-sm sm:grid-cols-2 lg:grid-cols-1"
          >
            {SETTINGS_TABS.map(({ id, label, description, icon: Icon }) => {
              const selected = activeTab === id;
              return (
                <button
                  key={id}
                  type="button"
                  role="tab"
                  aria-selected={selected}
                  onClick={() => setActiveTab(id)}
                  className={`flex min-h-16 items-start gap-3 rounded-xl px-4 py-3 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 ${
                    selected
                      ? "bg-slate-950 text-white shadow-lg shadow-slate-200"
                      : "text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  <Icon
                    className={`mt-0.5 h-5 w-5 flex-shrink-0 ${
                      selected ? "text-blue-300" : "text-blue-600"
                    }`}
                    aria-hidden="true"
                  />
                  <span>
                    <span className="block text-sm font-bold">{label}</span>
                    <span
                      className={`mt-1 block text-xs leading-5 ${
                        selected ? "text-slate-300" : "text-slate-500"
                      }`}
                    >
                      {description}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        </aside>

        <main className="min-w-0 space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="flex items-start gap-3">
              {ActiveTabIcon && (
                <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600 ring-1 ring-blue-100">
                  <ActiveTabIcon className="h-5 w-5" aria-hidden="true" />
                </div>
              )}
              <div>
                <p className="text-sm font-bold uppercase tracking-wide text-blue-700">
                  {activeTabConfig?.label}
                </p>
                <h2 className="mt-1 text-2xl font-bold text-slate-950">
                  {activeTabConfig?.description}
                </h2>
              </div>
            </div>
          </div>

          {activeTab === "business" && (
            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <div className="mb-6">
                <h3 className="text-xl font-bold text-slate-950">
                  Business information
                </h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  These details power owner alerts and simple ROI estimates.
                </p>
              </div>

              <div className="grid gap-5">
                <div>
                  <label
                    className="mb-1.5 block text-sm font-bold text-slate-700"
                    htmlFor="biz-name"
                  >
                    Business Name
                  </label>
                  <div className="relative">
                    <Building2
                      className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                      aria-hidden="true"
                    />
                    <input
                      id="biz-name"
                      className="min-h-11 w-full rounded-lg border border-slate-200 py-2 pl-9 pr-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="ABC Roofing Co."
                    />
                  </div>
                </div>

                <div>
                  <label
                    className="mb-1.5 block text-sm font-bold text-slate-700"
                    htmlFor="notif-phone"
                  >
                    Notification Phone
                  </label>
                  <div className="relative">
                    <Phone
                      className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                      aria-hidden="true"
                    />
                    <input
                      id="notif-phone"
                      type="tel"
                      className="min-h-11 w-full rounded-lg border border-slate-200 py-2 pl-9 pr-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                      value={notificationPhone}
                      onChange={(e) => setNotificationPhone(e.target.value)}
                      placeholder="+1 555 000 0000"
                    />
                  </div>
                  <p className="mt-1.5 text-xs leading-5 text-slate-500">
                    You will receive an SMS here whenever a lead is qualified.
                  </p>
                </div>

                <div>
                  <label
                    className="mb-1.5 block text-sm font-bold text-slate-700"
                    htmlFor="avg-job-value"
                  >
                    Average Job Value
                  </label>
                  <div className="relative">
                    <DollarSign
                      className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                      aria-hidden="true"
                    />
                    <input
                      id="avg-job-value"
                      type="number"
                      min="0"
                      max="1000000"
                      step="100"
                      className="min-h-11 w-full rounded-lg border border-slate-200 py-2 pl-9 pr-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                      value={averageJobValue}
                      onChange={(e) => setAverageJobValue(e.target.value)}
                      placeholder="8000"
                    />
                  </div>
                  <p className="mt-1.5 text-xs leading-5 text-slate-500">
                    Used for simple ROI estimates on the dashboard.
                  </p>
                </div>
              </div>

              <div className="mt-6 flex flex-wrap items-center gap-3">
                <Button
                  onClick={save}
                  disabled={saving}
                  className="min-h-11 bg-blue-600 px-4 font-bold text-white hover:bg-blue-700"
                >
                  {saving ? "Saving..." : "Save Business Settings"}
                </Button>
                {saved && (
                  <span className="inline-flex items-center gap-1.5 text-sm font-bold text-emerald-700">
                    <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                    Saved
                  </span>
                )}
              </div>
            </section>
          )}

          {activeTab === "lead-form" && (
            <div className="space-y-6">
              {widgetId ? (
                <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                  <div className="mb-6">
                    <h3 className="text-xl font-bold text-slate-950">
                      Lead form behavior
                    </h3>
                    <p className="mt-2 text-sm leading-6 text-slate-600">
                      Customize the services shown on your form and the opening
                      question the AI uses after submission.
                    </p>
                  </div>

                  <div className="mb-6">
                    <label
                      className="mb-1.5 block text-sm font-bold text-slate-700"
                      htmlFor="intake-question"
                    >
                      AI Opening Question
                    </label>
                    <input
                      id="intake-question"
                      className="min-h-11 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                      value={intakeQuestion}
                      onChange={(e) => setIntakeQuestion(e.target.value)}
                      placeholder="What type of roofing issue are you dealing with?"
                    />
                    <p className="mt-1.5 text-xs leading-5 text-slate-500">
                      This is the first question the AI texts to the lead after
                      form submission.
                    </p>
                  </div>

                  <div>
                    <div className="mb-3 flex items-center justify-between gap-4">
                      <label className="block text-sm font-bold text-slate-700">
                        Services
                      </label>
                      <button
                        type="button"
                        onClick={addService}
                        className="inline-flex min-h-10 items-center gap-1.5 rounded-lg border border-blue-100 bg-blue-50 px-3 py-2 text-sm font-bold text-blue-700 transition-colors hover:bg-blue-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
                      >
                        <Plus className="h-4 w-4" aria-hidden="true" />
                        Add service
                      </button>
                    </div>
                    <div className="space-y-2">
                      {services.length === 0 ? (
                        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                          Add at least one service to make the form easier for
                          homeowners to complete.
                        </div>
                      ) : (
                        services.map((service, i) => (
                          <div key={i} className="flex items-center gap-2">
                            <input
                              aria-label={`Service ${i + 1} name`}
                              className="min-h-11 flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                              value={service.label}
                              onChange={(e) => updateService(i, e.target.value)}
                              placeholder="e.g. Roof Repair"
                            />
                            <button
                              type="button"
                              onClick={() => removeService(i)}
                              className="inline-flex h-11 w-11 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition-colors hover:border-red-200 hover:bg-red-50 hover:text-red-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600"
                              aria-label={`Remove ${service.label || `service ${i + 1}`}`}
                            >
                              <X className="h-4 w-4" aria-hidden="true" />
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  <div className="mt-6 flex flex-wrap items-center gap-3">
                    <Button
                      onClick={saveFormConfig}
                      disabled={savingForm}
                      className="min-h-11 bg-blue-600 px-4 font-bold text-white hover:bg-blue-700"
                    >
                      {savingForm ? "Saving..." : "Save Form Settings"}
                    </Button>
                    {savedForm && (
                      <span className="inline-flex items-center gap-1.5 text-sm font-bold text-emerald-700">
                        <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                        Saved
                      </span>
                    )}
                  </div>
                </section>
              ) : (
                <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                  <h3 className="text-xl font-bold text-slate-950">
                    Lead form unavailable
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    Complete onboarding to create your embeddable lead form.
                  </p>
                </section>
              )}

              <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                <div className="mb-5 flex items-start gap-3">
                  <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-lg bg-slate-950 text-blue-300">
                    <Code className="h-5 w-5" aria-hidden="true" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-950">
                      Installation
                    </h3>
                    <p className="mt-2 text-sm leading-6 text-slate-600">
                      Paste this snippet anywhere on your website to show the
                      lead form.
                    </p>
                  </div>
                </div>

                {embedCode ? (
                  <>
                    <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 text-xs leading-6 text-emerald-300 sm:text-sm">
                      <code className="break-all">{embedCode}</code>
                    </div>
                    <div className="mt-4 flex flex-wrap items-center gap-3">
                      <Button
                        variant="outline"
                        className="min-h-11 font-bold"
                        onClick={copyEmbed}
                      >
                        <Copy className="mr-2 h-4 w-4" aria-hidden="true" />
                        {copied ? "Copied!" : "Copy Code"}
                      </Button>
                      {testFormPath && (
                        <Button asChild variant="outline" className="min-h-11 font-bold">
                          <Link href={testFormPath} target="_blank">
                            <ExternalLink className="mr-2 h-4 w-4" aria-hidden="true" />
                            Open Test Form
                          </Link>
                        </Button>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                    Your embed code will appear after the form widget is created.
                  </div>
                )}
              </section>
            </div>
          )}

          {activeTab === "scheduling" && (
            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <div className="mb-6">
                <h3 className="text-xl font-bold text-slate-950">
                  Scheduling preferences
                </h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Set basic inspection availability the AI can use when asking
                  for preferred times.
                </p>
              </div>

              <label className="mb-6 flex items-start gap-3 rounded-xl border border-blue-100 bg-blue-50 p-4 text-sm font-bold text-slate-800">
                <input
                  type="checkbox"
                  checked={schedulingEnabled}
                  onChange={(e) => setSchedulingEnabled(e.target.checked)}
                  className="mt-1 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-600"
                />
                <span>
                  Ask leads for preferred inspection times
                  <span className="mt-1 block text-xs font-medium leading-5 text-slate-600">
                    RoofLead records timing intent, but the owner still confirms
                    actual availability.
                  </span>
                </span>
              </label>

              <div className="space-y-6">
                <div>
                  <label className="mb-2 block text-sm font-bold text-slate-700">
                    Available Days
                  </label>
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-7">
                    {DAYS.map((day) => {
                      const selected = schedulingAvailableDays.includes(
                        day.value
                      );

                      return (
                        <button
                          key={day.value}
                          type="button"
                          onClick={() => toggleAvailableDay(day.value)}
                          className={`min-h-11 rounded-lg border px-3 py-2 text-sm font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 ${
                            selected
                              ? "border-blue-200 bg-blue-50 text-blue-700"
                              : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                          }`}
                        >
                          {day.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label
                      className="mb-1.5 block text-sm font-bold text-slate-700"
                      htmlFor="start-time"
                    >
                      Start Time
                    </label>
                    <div className="relative">
                      <Clock
                        className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                        aria-hidden="true"
                      />
                      <input
                        id="start-time"
                        type="time"
                        className="min-h-11 w-full rounded-lg border border-slate-200 py-2 pl-9 pr-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                        value={schedulingStartTime}
                        onChange={(e) => setSchedulingStartTime(e.target.value)}
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      className="mb-1.5 block text-sm font-bold text-slate-700"
                      htmlFor="end-time"
                    >
                      End Time
                    </label>
                    <div className="relative">
                      <Clock
                        className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                        aria-hidden="true"
                      />
                      <input
                        id="end-time"
                        type="time"
                        className="min-h-11 w-full rounded-lg border border-slate-200 py-2 pl-9 pr-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                        value={schedulingEndTime}
                        onChange={(e) => setSchedulingEndTime(e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <div>
                    <label
                      className="mb-1.5 block text-sm font-bold text-slate-700"
                      htmlFor="duration"
                    >
                      Inspection Minutes
                    </label>
                    <input
                      id="duration"
                      type="number"
                      min="15"
                      max="240"
                      step="15"
                      className="min-h-11 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                      value={inspectionDurationMinutes}
                      onChange={(e) =>
                        setInspectionDurationMinutes(e.target.value)
                      }
                    />
                  </div>

                  <div>
                    <label
                      className="mb-1.5 block text-sm font-bold text-slate-700"
                      htmlFor="buffer"
                    >
                      Buffer Minutes
                    </label>
                    <input
                      id="buffer"
                      type="number"
                      min="0"
                      max="120"
                      step="5"
                      className="min-h-11 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                      value={schedulingBufferMinutes}
                      onChange={(e) =>
                        setSchedulingBufferMinutes(e.target.value)
                      }
                    />
                  </div>

                  <div>
                    <label
                      className="mb-1.5 block text-sm font-bold text-slate-700"
                      htmlFor="timezone"
                    >
                      Timezone
                    </label>
                    <select
                      id="timezone"
                      className="min-h-11 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                      value={schedulingTimezone}
                      onChange={(e) => setSchedulingTimezone(e.target.value)}
                    >
                      {TIMEZONES.map((timezone) => (
                        <option key={timezone.value} value={timezone.value}>
                          {timezone.label}
                        </option>
                      ))}
                    </select>
                    <p className="mt-1.5 text-xs leading-5 text-slate-500">
                      Used only to interpret preferred inspection times.
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex flex-wrap items-center gap-3">
                <Button
                  onClick={save}
                  disabled={saving}
                  className="min-h-11 bg-blue-600 px-4 font-bold text-white hover:bg-blue-700"
                >
                  {saving ? "Saving..." : "Save Scheduling"}
                </Button>
                {saved && (
                  <span className="inline-flex items-center gap-1.5 text-sm font-bold text-emerald-700">
                    <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                    Saved
                  </span>
                )}
              </div>
            </section>
          )}

          {activeTab === "billing" && (
            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <div className="grid gap-5 lg:grid-cols-[1fr_auto] lg:items-start">
                <div>
                  <div className="mb-5 flex items-start gap-3">
                    <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-lg bg-slate-950 text-blue-300">
                      <CreditCard className="h-5 w-5" aria-hidden="true" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-slate-950">
                        Billing portal
                      </h3>
                      <p className="mt-2 text-sm leading-6 text-slate-600">
                        Manage your payment method, invoices, and subscription
                        in Stripe.
                      </p>
                    </div>
                  </div>
                  <div className="rounded-xl border border-blue-100 bg-blue-50 p-4 text-sm leading-6 text-slate-700">
                    The public plan is currently the Starter plan with a
                    14-day trial and card required at checkout.
                  </div>
                </div>
                <Button
                  variant="outline"
                  className="min-h-11 font-bold"
                  onClick={openBillingPortal}
                  disabled={billingLoading}
                >
                  {billingLoading ? "Opening..." : "Manage Billing"}
                </Button>
              </div>
            </section>
          )}
        </main>
      </div>
    </div>
  );
}
