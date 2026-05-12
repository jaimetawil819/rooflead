"use client";

import { use, useState, useEffect } from "react";
import {
  AlertCircle,
  CheckCircle2,
  Clock3,
  MessageSquareText,
  ShieldCheck,
} from "lucide-react";

interface Service {
  label: string;
  value: string;
}

const inputClass =
  "min-h-11 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 disabled:opacity-60";

export default function TestFormPage({
  params,
}: {
  params: Promise<{ widgetKey: string }>;
}) {
  const { widgetKey } = use(params);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [serviceType, setServiceType] = useState("");
  const [smsConsent, setSmsConsent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  const [services, setServices] = useState<Service[]>([]);
  const [intakeQuestion, setIntakeQuestion] = useState("What type of roofing issue are you dealing with?");
  const [loadingConfig, setLoadingConfig] = useState(true);

  useEffect(() => {
    fetch(`/api/forms/${widgetKey}/config`)
      .then((r) => r.json())
      .then((config) => {
        setServices(config.services ?? []);
        setIntakeQuestion(config.intakeQuestion ?? "What type of roofing issue are you dealing with?");
        setLoadingConfig(false);
      })
      .catch(() => {
        setError("Could not load the form configuration. Please refresh and try again.");
        setLoadingConfig(false);
      });
  }, [widgetKey]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    if (!smsConsent) {
      setError("Please agree to receive SMS messages before submitting.");
      setSubmitting(false);
      return;
    }

    const res = await fetch(`/api/forms/${widgetKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, phone, address, serviceType, smsConsent }),
    });

    if (!res.ok) {
      setError("Could not submit this test lead. Check the fields and try again.");
      setSubmitting(false);
      return;
    }

    setDone(true);
    setSubmitting(false);
  }

  return (
    <main className="min-h-dvh bg-slate-100 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[0.85fr_1.15fr] lg:items-center">
        <section className="rounded-2xl border border-slate-800 bg-slate-950 p-6 text-white shadow-xl shadow-slate-300/40 sm:p-8">
          <p className="text-sm font-semibold uppercase tracking-widest text-amber-300">
            Test Mode
          </p>
          <h1 className="mt-4 text-3xl font-bold leading-tight tracking-tight sm:text-4xl">
            Submit a test lead and watch RoofLead qualify it by SMS.
          </h1>
          <p className="mt-4 text-base leading-7 text-slate-300">
            Use your real phone number. RoofLead will send the same intake text
            a homeowner receives after submitting your form.
          </p>

          <div className="mt-7 grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
            {[
              {
                icon: Clock3,
                title: "Fast first reply",
                copy: "Confirms the SMS flow starts quickly after form submit.",
              },
              {
                icon: MessageSquareText,
                title: "AI qualification",
                copy: "Lets you test service type, urgency, ownership, and timing questions.",
              },
              {
                icon: ShieldCheck,
                title: "Dashboard-ready",
                copy: "The lead appears in the dashboard with conversation history.",
              },
            ].map(({ icon: Icon, title, copy }) => (
              <div key={title} className="rounded-xl border border-white/10 bg-white/[0.04] p-4">
                <Icon className="h-5 w-5 text-blue-300" aria-hidden="true" />
                <h2 className="mt-3 text-sm font-bold text-white">{title}</h2>
                <p className="mt-1 text-sm leading-6 text-slate-300">{copy}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white shadow-xl shadow-slate-200/70">
          <div className="rounded-t-2xl bg-slate-950 p-6 text-white">
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-300/30 bg-amber-300/10 px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-amber-100">
              <span className="h-2 w-2 rounded-full bg-amber-300" aria-hidden="true" />
              Test lead
            </div>
            <h2 className="mt-4 text-2xl font-bold leading-tight">
              Request a roofing estimate
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-300">
              Submit this form to trigger the same AI SMS intake your website
              form will use.
            </p>
          </div>

          <div className="p-6">
            {done ? (
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6 text-center">
                <CheckCircle2 className="mx-auto h-10 w-10 text-emerald-600" aria-hidden="true" />
                <p className="mt-4 text-lg font-bold text-emerald-950">
                  Test lead submitted
                </p>
                <p className="mt-2 text-sm leading-6 text-emerald-800">
                  Check your phone. You should receive an SMS shortly, and the
                  lead should appear in the dashboard.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="flex gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700" role="alert">
                    <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" aria-hidden="true" />
                    {error}
                  </div>
                )}

                <div>
                  <label htmlFor="test-name" className="mb-1.5 block text-sm font-bold text-slate-700">
                    Your Name
                  </label>
                  <input
                    id="test-name"
                    required
                    className={inputClass}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Jane Smith"
                    autoComplete="name"
                  />
                </div>

                <div>
                  <label htmlFor="test-phone" className="mb-1.5 block text-sm font-bold text-slate-700">
                    Phone Number
                  </label>
                  <input
                    id="test-phone"
                    required
                    type="tel"
                    className={inputClass}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+1 555 000 0000"
                    autoComplete="tel"
                    inputMode="tel"
                  />
                </div>

                <div>
                  <label htmlFor="test-address" className="mb-1.5 block text-sm font-bold text-slate-700">
                    Property Address
                  </label>
                  <input
                    id="test-address"
                    className={inputClass}
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="123 Main St, San Diego, CA"
                    autoComplete="street-address"
                  />
                </div>

                <div>
                  <label htmlFor="test-service" className="mb-1.5 block text-sm font-bold text-slate-700">
                    {intakeQuestion}
                  </label>
                  {loadingConfig ? (
                    <input
                      id="test-service"
                      className={inputClass + " text-slate-500"}
                      value="Loading form options..."
                      disabled
                      readOnly
                    />
                  ) : services.length > 0 ? (
                    <select
                      id="test-service"
                      className={inputClass}
                      value={serviceType}
                      onChange={(e) => setServiceType(e.target.value)}
                    >
                      <option value="">Select a service...</option>
                      {services.map((s) => (
                        <option key={s.value} value={s.value}>
                          {s.label}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      id="test-service"
                      className={inputClass}
                      value={serviceType}
                      onChange={(e) => setServiceType(e.target.value)}
                      placeholder="Describe what you need..."
                    />
                  )}
                </div>

                <label
                  htmlFor="test-sms-consent"
                  className="flex cursor-pointer gap-3 rounded-xl border border-blue-100 bg-blue-50 p-4 text-xs leading-6 text-slate-700"
                >
                  <input
                    id="test-sms-consent"
                    type="checkbox"
                    required
                    checked={smsConsent}
                    onChange={(e) => setSmsConsent(e.target.checked)}
                    className="mt-1 h-4 w-4 flex-shrink-0 accent-blue-600"
                    aria-describedby="test-sms-consent-copy"
                  />
                  <span id="test-sms-consent-copy">
                    I agree to receive automated SMS messages from this business
                    about my estimate request. Message and data rates may apply.
                    Reply STOP to opt out or HELP for help.
                  </span>
                </label>

                <button
                  type="submit"
                  disabled={submitting || loadingConfig}
                  className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-3 text-base font-bold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {submitting ? "Sending..." : "Get a Free Estimate"}
                </button>
              </form>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
