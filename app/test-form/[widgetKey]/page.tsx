"use client";

import { use, useState, useEffect } from "react";

interface Service {
  label: string;
  value: string;
}

const inputClass =
  "w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white";

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
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [services, setServices] = useState<Service[]>([]);
  const [loadingConfig, setLoadingConfig] = useState(true);

  useEffect(() => {
    fetch(`/api/forms/${widgetKey}/config`)
      .then((r) => r.json())
      .then((config) => {
        setServices(config.services ?? []);
        setLoadingConfig(false);
      });
  }, [widgetKey]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    await fetch(`/api/forms/${widgetKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, phone, address, serviceType }),
    });
    setDone(true);
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 w-full max-w-md p-8">

        <div className="mb-6">
          <span className="text-xs bg-yellow-100 text-yellow-800 px-2.5 py-1 rounded-full font-medium">
            Test Mode
          </span>
          <h1 className="text-xl font-bold text-slate-900 mt-3 mb-1">Submit a Test Lead</h1>
          <p className="text-sm text-gray-500">
            Use your real phone number — the AI will text you to qualify the lead.
          </p>
        </div>

        {done ? (
          <div className="bg-green-50 border border-green-100 text-green-800 rounded-xl p-5 text-center">
            <p className="font-semibold text-base">Submitted!</p>
            <p className="text-sm mt-1 text-green-700">Check your phone — you should receive an SMS shortly.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Your Name</label>
              <input
                required
                className={inputClass}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Jane Smith"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Phone Number</label>
              <input
                required
                type="tel"
                className={inputClass}
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1 555 000 0000"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Property Address</label>
              <input
                className={inputClass}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="123 Main St, San Diego, CA"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">What do you need?</label>
              {loadingConfig ? (
                <div className={inputClass + " text-gray-400"}>Loading...</div>
              ) : services.length > 0 ? (
                <select
                  className={inputClass}
                  value={serviceType}
                  onChange={(e) => setServiceType(e.target.value)}
                >
                  <option value="">Select a service...</option>
                  {services.map((s) => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </select>
              ) : (
                <input
                  className={inputClass}
                  value={serviceType}
                  onChange={(e) => setServiceType(e.target.value)}
                  placeholder="Describe what you need..."
                />
              )}
            </div>

            <p className="text-xs text-gray-400">
              By submitting, you agree to receive SMS messages from this business. Reply STOP to opt out.
            </p>

            <button
              type="submit"
              disabled={submitting || loadingConfig}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? "Sending…" : "Get a Free Estimate"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
