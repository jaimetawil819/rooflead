"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Building2,
  CalendarDays,
  Clock,
  Code,
  Copy,
  CreditCard,
  DollarSign,
  ExternalLink,
  Phone,
  Plus,
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
    description: "Availability the AI can use for inspection intent",
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
    <div className="p-8 max-w-5xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
        <p className="text-gray-500 mt-1">
          Manage the parts of RoofLead that affect intake, alerts, scheduling,
          and billing.
        </p>
      </div>

      <div className="mb-6 overflow-x-auto">
        <div
          role="tablist"
          aria-label="Settings sections"
          className="grid min-w-[720px] grid-cols-4 gap-2 rounded-2xl border border-gray-100 bg-white p-2 shadow-sm"
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
                className={`flex items-start gap-3 rounded-xl px-4 py-3 text-left transition-colors ${
                  selected
                    ? "bg-slate-900 text-white"
                    : "text-slate-600 hover:bg-gray-50"
                }`}
              >
                <Icon
                  className={`mt-0.5 h-4 w-4 flex-shrink-0 ${
                    selected ? "text-white" : "text-gray-400"
                  }`}
                  aria-hidden="true"
                />
                <span>
                  <span className="block text-sm font-semibold">{label}</span>
                  <span
                    className={`mt-0.5 block text-xs leading-relaxed ${
                      selected ? "text-slate-300" : "text-gray-400"
                    }`}
                  >
                    {description}
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="max-w-3xl">
        {activeTab === "business" && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h2 className="font-semibold text-slate-900 mb-1">
              Business Information
            </h2>
            <p className="text-sm text-gray-500 mb-6">
              These details power owner alerts and simple ROI estimates.
            </p>

            <div className="space-y-4">
              <div>
                <label
                  className="block text-sm font-medium text-slate-700 mb-1.5"
                  htmlFor="biz-name"
                >
                  Business Name
                </label>
                <div className="relative">
                  <Building2
                    className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400"
                    aria-hidden="true"
                  />
                  <input
                    id="biz-name"
                    className="w-full border border-gray-200 rounded-lg pl-9 pr-3 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="ABC Roofing Co."
                  />
                </div>
              </div>

              <div>
                <label
                  className="block text-sm font-medium text-slate-700 mb-1.5"
                  htmlFor="notif-phone"
                >
                  Notification Phone
                </label>
                <div className="relative">
                  <Phone
                    className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400"
                    aria-hidden="true"
                  />
                  <input
                    id="notif-phone"
                    type="tel"
                    className="w-full border border-gray-200 rounded-lg pl-9 pr-3 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={notificationPhone}
                    onChange={(e) => setNotificationPhone(e.target.value)}
                    placeholder="+1 555 000 0000"
                  />
                </div>
                <p className="text-xs text-gray-400 mt-1.5">
                  You will receive an SMS here whenever a lead is qualified.
                </p>
              </div>

              <div>
                <label
                  className="block text-sm font-medium text-slate-700 mb-1.5"
                  htmlFor="avg-job-value"
                >
                  Average Job Value
                </label>
                <div className="relative">
                  <DollarSign
                    className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400"
                    aria-hidden="true"
                  />
                  <input
                    id="avg-job-value"
                    type="number"
                    min="0"
                    max="1000000"
                    step="100"
                    className="w-full border border-gray-200 rounded-lg pl-9 pr-3 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={averageJobValue}
                    onChange={(e) => setAverageJobValue(e.target.value)}
                    placeholder="8000"
                  />
                </div>
                <p className="text-xs text-gray-400 mt-1.5">
                  Used for simple ROI estimates on the dashboard.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 mt-6">
              <Button onClick={save} disabled={saving} size="sm">
                {saving ? "Saving..." : "Save Business Settings"}
              </Button>
              {saved && (
                <span className="text-sm text-green-600 font-medium">
                  Saved!
                </span>
              )}
            </div>
          </div>
        )}

        {activeTab === "lead-form" && (
          <div className="space-y-4">
            {widgetId ? (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <h2 className="font-semibold text-slate-900 mb-1">
                  Lead Form
                </h2>
                <p className="text-sm text-gray-500 mb-5">
                  Customize the services shown on your form and the opening
                  question the AI uses after submission.
                </p>

                <div className="mb-5">
                  <label
                    className="block text-sm font-medium text-slate-700 mb-1.5"
                    htmlFor="intake-question"
                  >
                    AI Opening Question
                  </label>
                  <input
                    id="intake-question"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={intakeQuestion}
                    onChange={(e) => setIntakeQuestion(e.target.value)}
                    placeholder="What type of roofing issue are you dealing with?"
                  />
                  <p className="text-xs text-gray-400 mt-1.5">
                    This is the first question the AI texts to the lead after
                    form submission.
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Services
                  </label>
                  <div className="space-y-2 mb-3">
                    {services.map((service, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <input
                          className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          value={service.label}
                          onChange={(e) => updateService(i, e.target.value)}
                          placeholder="e.g. Roof Repair"
                        />
                        <button
                          type="button"
                          onClick={() => removeService(i)}
                          className="text-gray-400 hover:text-red-500 transition-colors p-1"
                          aria-label="Remove service"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={addService}
                    className="flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-700 font-medium"
                  >
                    <Plus className="h-4 w-4" />
                    Add service
                  </button>
                </div>

                <div className="flex items-center gap-3 mt-6">
                  <Button
                    onClick={saveFormConfig}
                    disabled={savingForm}
                    size="sm"
                  >
                    {savingForm ? "Saving..." : "Save Form Settings"}
                  </Button>
                  {savedForm && (
                    <span className="text-sm text-green-600 font-medium">
                      Saved!
                    </span>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <h2 className="font-semibold text-slate-900 mb-1">
                  Lead form unavailable
                </h2>
                <p className="text-sm text-gray-500">
                  Complete onboarding to create your embeddable lead form.
                </p>
              </div>
            )}

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <div className="flex items-center gap-2 mb-2">
                <Code
                  className="h-4 w-4 text-gray-400"
                  aria-hidden="true"
                />
                <h2 className="font-semibold text-slate-900">
                  Installation
                </h2>
              </div>
              <p className="text-sm text-gray-500 mb-4">
                Paste this snippet anywhere on your website to show the lead
                form.
              </p>

              {embedCode ? (
                <>
                  <div className="bg-slate-900 rounded-xl p-4 text-green-400 text-xs font-mono break-all mb-3">
                    {embedCode}
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    <Button variant="outline" size="sm" onClick={copyEmbed}>
                      <Copy className="mr-2 h-4 w-4" />
                      {copied ? "Copied!" : "Copy Code"}
                    </Button>
                    {testFormPath && (
                      <Button asChild variant="outline" size="sm">
                        <Link href={testFormPath} target="_blank">
                          <ExternalLink className="mr-2 h-4 w-4" />
                          Open Test Form
                        </Link>
                      </Button>
                    )}
                  </div>
                </>
              ) : (
                <div className="rounded-xl border border-gray-100 bg-gray-50 p-4 text-sm text-gray-500">
                  Your embed code will appear after the form widget is created.
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "scheduling" && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-center gap-2 mb-2">
              <CalendarDays
                className="h-4 w-4 text-gray-400"
                aria-hidden="true"
              />
              <h2 className="font-semibold text-slate-900">Scheduling</h2>
            </div>
            <p className="text-sm text-gray-500 mb-5">
              Set the basic inspection availability the AI can use when asking
              for preferred times.
            </p>

            <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-5">
              <input
                type="checkbox"
                checked={schedulingEnabled}
                onChange={(e) => setSchedulingEnabled(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              Ask leads for preferred inspection times
            </label>

            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Available Days
                </label>
                <div className="flex flex-wrap gap-2">
                  {DAYS.map((day) => {
                    const selected = schedulingAvailableDays.includes(
                      day.value
                    );

                    return (
                      <button
                        key={day.value}
                        type="button"
                        onClick={() => toggleAvailableDay(day.value)}
                        className={`rounded-lg border px-3 py-2 text-sm font-semibold transition-colors ${
                          selected
                            ? "border-blue-200 bg-blue-50 text-blue-700"
                            : "border-gray-200 bg-white text-gray-500 hover:bg-gray-50"
                        }`}
                      >
                        {day.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label
                    className="block text-sm font-medium text-slate-700 mb-1.5"
                    htmlFor="start-time"
                  >
                    Start Time
                  </label>
                  <div className="relative">
                    <Clock
                      className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400"
                      aria-hidden="true"
                    />
                    <input
                      id="start-time"
                      type="time"
                      className="w-full border border-gray-200 rounded-lg pl-9 pr-3 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={schedulingStartTime}
                      onChange={(e) => setSchedulingStartTime(e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <label
                    className="block text-sm font-medium text-slate-700 mb-1.5"
                    htmlFor="end-time"
                  >
                    End Time
                  </label>
                  <div className="relative">
                    <Clock
                      className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400"
                      aria-hidden="true"
                    />
                    <input
                      id="end-time"
                      type="time"
                      className="w-full border border-gray-200 rounded-lg pl-9 pr-3 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={schedulingEndTime}
                      onChange={(e) => setSchedulingEndTime(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label
                    className="block text-sm font-medium text-slate-700 mb-1.5"
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
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={inspectionDurationMinutes}
                    onChange={(e) =>
                      setInspectionDurationMinutes(e.target.value)
                    }
                  />
                </div>

                <div>
                  <label
                    className="block text-sm font-medium text-slate-700 mb-1.5"
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
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={schedulingBufferMinutes}
                    onChange={(e) =>
                      setSchedulingBufferMinutes(e.target.value)
                    }
                  />
                </div>

                <div>
                  <label
                    className="block text-sm font-medium text-slate-700 mb-1.5"
                    htmlFor="timezone"
                  >
                    Timezone
                  </label>
                  <select
                    id="timezone"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={schedulingTimezone}
                    onChange={(e) => setSchedulingTimezone(e.target.value)}
                  >
                    {TIMEZONES.map((timezone) => (
                      <option key={timezone.value} value={timezone.value}>
                        {timezone.label}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-400 mt-1.5">
                    Used only to interpret preferred inspection times.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 mt-6">
              <Button onClick={save} disabled={saving} size="sm">
                {saving ? "Saving..." : "Save Scheduling"}
              </Button>
              {saved && (
                <span className="text-sm text-green-600 font-medium">
                  Saved!
                </span>
              )}
            </div>
          </div>
        )}

        {activeTab === "billing" && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-center gap-2 mb-2">
              <CreditCard
                className="h-4 w-4 text-gray-400"
                aria-hidden="true"
              />
              <h2 className="font-semibold text-slate-900">Billing</h2>
            </div>
            <p className="text-sm text-gray-500 mb-4">
              Manage your payment method, invoices, and subscription in Stripe.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={openBillingPortal}
              disabled={billingLoading}
            >
              {billingLoading ? "Opening..." : "Manage Billing"}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
