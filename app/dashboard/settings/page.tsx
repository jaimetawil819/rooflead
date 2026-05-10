"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Building2, Phone, Code, Plus, X, CreditCard } from "lucide-react";

interface Service {
  label: string;
  value: string;
}

function labelToValue(label: string): string {
  return label.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "");
}

export default function SettingsPage() {
  const [name, setName] = useState("");
  const [notificationPhone, setNotificationPhone] = useState("");
  const [widgetKey, setWidgetKey] = useState("");
  const [widgetId, setWidgetId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState(false);

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
      body: JSON.stringify({ name, notificationPhone }),
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

  const embedCode = widgetKey
    ? `<script src="${window.location.origin}/embed.js" data-key="${widgetKey}"></script>`
    : "";

  const copyEmbed = () => {
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
    <div className="p-8 max-w-2xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
        <p className="text-gray-500 mt-1">Manage your business info and lead form.</p>
      </div>

      {/* Business info */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-4">
        <h2 className="font-semibold text-slate-900 mb-5">Business Information</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5" htmlFor="biz-name">
              Business Name
            </label>
            <div className="relative">
              <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" aria-hidden="true" />
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
            <label className="block text-sm font-medium text-slate-700 mb-1.5" htmlFor="notif-phone">
              Notification Phone
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" aria-hidden="true" />
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
              You&apos;ll receive an SMS here whenever a lead is qualified.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 mt-6">
          <Button onClick={save} disabled={saving} size="sm">
            {saving ? "Saving…" : "Save Changes"}
          </Button>
          {saved && <span className="text-sm text-green-600 font-medium">Saved!</span>}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-4">
        <div className="flex items-center gap-2 mb-2">
          <CreditCard className="h-4 w-4 text-gray-400" aria-hidden="true" />
          <h2 className="font-semibold text-slate-900">Billing</h2>
        </div>
        <p className="text-sm text-gray-500 mb-4">
          Manage your payment method, invoices, and subscription in Stripe.
        </p>
        <Button variant="outline" size="sm" onClick={openBillingPortal} disabled={billingLoading}>
          {billingLoading ? "Opening..." : "Manage Billing"}
        </Button>
      </div>

      {/* Lead form config */}
      {widgetId && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-4">
          <h2 className="font-semibold text-slate-900 mb-1">Lead Form</h2>
          <p className="text-sm text-gray-500 mb-5">
            Customize what services appear in your form dropdown and the opening question the AI asks.
          </p>

          <div className="mb-5">
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              AI Opening Question
            </label>
            <input
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={intakeQuestion}
              onChange={(e) => setIntakeQuestion(e.target.value)}
              placeholder="What type of roofing issue are you dealing with?"
            />
            <p className="text-xs text-gray-400 mt-1.5">
              This is the first question the AI texts to the lead after form submission.
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
              onClick={addService}
              className="flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              <Plus className="h-4 w-4" />
              Add service
            </button>
          </div>

          <div className="flex items-center gap-3 mt-6">
            <Button onClick={saveFormConfig} disabled={savingForm} size="sm">
              {savingForm ? "Saving…" : "Save Form Settings"}
            </Button>
            {savedForm && <span className="text-sm text-green-600 font-medium">Saved!</span>}
          </div>
        </div>
      )}

      {/* Embed code */}
      {widgetKey && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center gap-2 mb-2">
            <Code className="h-4 w-4 text-gray-400" aria-hidden="true" />
            <h2 className="font-semibold text-slate-900">Your Embed Code</h2>
          </div>
          <p className="text-sm text-gray-500 mb-4">
            Paste this snippet anywhere on your website to show the lead form.
          </p>
          <div className="bg-slate-900 rounded-xl p-4 text-green-400 text-xs font-mono break-all mb-3">
            {embedCode}
          </div>
          <Button variant="outline" size="sm" onClick={copyEmbed}>
            {copied ? "Copied!" : "Copy Code"}
          </Button>
        </div>
      )}
    </div>
  );
}
