"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  Building2,
  CheckCircle2,
  Code2,
  Copy,
  ExternalLink,
  MessageSquareText,
  Phone,
} from "lucide-react";

const STEPS = [
  {
    label: "Business",
    title: "Add the business details",
    description: "Name the roofing company and choose where owner alerts go.",
  },
  {
    label: "Install",
    title: "Copy the lead form snippet",
    description: "Use the embed code on the page where homeowners request estimates.",
  },
  {
    label: "Test",
    title: "Send a real test lead",
    description: "Submit the public form and confirm the SMS intake works.",
  },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [notificationPhone, setNotificationPhone] = useState("");
  const [saving, setSaving] = useState(false);
  const [widgetKey, setWidgetKey] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const load = async () => {
      const res = await fetch("/api/dashboard/onboarding");
      if (!res.ok) return;

      const { business } = await res.json();
      if (business) {
        setName(business.name ?? "");
        setNotificationPhone(business.notification_phone ?? "");
      }
    };
    load();
  }, []);

  async function saveBusinessInfo() {
    if (!name.trim()) return;
    setSaving(true);
    const res = await fetch("/api/dashboard/onboarding", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, notificationPhone }),
    });

    if (res.ok) {
      const { widgetKey: nextWidgetKey } = await res.json();
      setWidgetKey(nextWidgetKey);
      setStep(1);
    }

    setSaving(false);
  }

  async function finishOnboarding() {
    const res = await fetch("/api/dashboard/onboarding", { method: "PATCH" });
    if (res.ok) router.push("/dashboard");
  }

  const origin = typeof window === "undefined" ? "" : window.location.origin;
  const embedCode = widgetKey
    ? `<script src="${origin}/embed.js" data-key="${widgetKey}"></script>`
    : "";
  const activeStep = STEPS[step];

  function copyEmbed() {
    if (!embedCode) return;
    navigator.clipboard.writeText(embedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <main className="min-h-dvh bg-slate-100 px-4 py-5 sm:px-6 lg:px-8 lg:py-8">
      <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[0.85fr_1.15fr] lg:items-center">
        <section className="rounded-2xl border border-slate-800 bg-slate-950 p-6 text-white shadow-xl shadow-slate-300/40 sm:p-8">
          <p className="text-sm font-semibold uppercase tracking-widest text-blue-300">
            Account Setup
          </p>
          <h1 className="mt-4 text-3xl font-bold leading-tight tracking-tight sm:text-4xl">
            Get RoofLead ready before the next web lead arrives.
          </h1>
          <p className="mt-4 text-base leading-7 text-slate-300">
            Finish business details, copy the install snippet, then submit a
            real test lead so you can see the SMS qualification flow end to end.
          </p>

          <div className="mt-7 space-y-3">
            {STEPS.map(({ label, title, description }, i) => {
              const complete = i < step;
              const current = i === step;

              return (
                <div
                  key={label}
                  className={`rounded-xl border p-4 ${
                    current
                      ? "border-blue-400/40 bg-blue-500/10"
                      : complete
                        ? "border-emerald-400/30 bg-emerald-500/10"
                        : "border-white/10 bg-white/[0.04]"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg text-sm font-black ${
                        complete
                          ? "bg-emerald-400 text-slate-950"
                          : current
                            ? "bg-blue-500 text-white"
                            : "bg-white/10 text-slate-300"
                      }`}
                    >
                      {complete ? <CheckCircle2 className="h-4 w-4" aria-hidden="true" /> : i + 1}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white">{title}</p>
                      <p className="mt-1 text-sm leading-6 text-slate-300">
                        {description}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white shadow-xl shadow-slate-200/70">
          <div className="rounded-t-2xl bg-slate-950 p-6 text-white">
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-400/30 bg-blue-500/10 px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-blue-100">
              <span className="h-2 w-2 rounded-full bg-emerald-400" aria-hidden="true" />
              Step {step + 1} of {STEPS.length}
            </div>
            <h2 className="mt-4 text-2xl font-bold leading-tight">
              {activeStep.title}
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-300">
              {activeStep.description}
            </p>
          </div>

          <div className="p-6">
            {step === 0 && (
              <div className="space-y-5">
                <div>
                  <label htmlFor="business-name" className="mb-1.5 block text-sm font-bold text-slate-700">
                    Business Name
                  </label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
                    <input
                      id="business-name"
                      className="min-h-11 w-full rounded-lg border border-slate-200 py-2 pl-9 pr-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="ABC Roofing Co."
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="notification-phone" className="mb-1.5 block text-sm font-bold text-slate-700">
                    Phone Number For Lead Alerts
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
                    <input
                      id="notification-phone"
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

                <Button
                  onClick={saveBusinessInfo}
                  disabled={saving || !name.trim()}
                  className="min-h-12 w-full bg-blue-600 text-base font-bold text-white hover:bg-blue-700"
                >
                  {saving ? "Saving..." : "Continue"}
                  {!saving && <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />}
                </Button>
              </div>
            )}

            {step === 1 && (
              <div className="space-y-5">
                <div className="flex items-start gap-3 rounded-xl border border-blue-100 bg-blue-50 p-4">
                  <Code2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-700" aria-hidden="true" />
                  <p className="text-sm leading-6 text-slate-700">
                    Paste this snippet anywhere on your website where you want
                    the RoofLead intake form to appear.
                  </p>
                </div>

                <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 text-xs leading-6 text-emerald-300 sm:text-sm">
                  <code className="break-all">{embedCode}</code>
                </div>

                <Button variant="outline" onClick={copyEmbed} className="min-h-11 w-full font-bold">
                  <Copy className="mr-2 h-4 w-4" aria-hidden="true" />
                  {copied ? "Copied!" : "Copy Code"}
                </Button>

                <p className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-600">
                  Do not have the website ready yet? You can still test the
                  form and return to Settings later for the install code.
                </p>

                <Button
                  onClick={() => setStep(2)}
                  className="min-h-12 w-full bg-blue-600 text-base font-bold text-white hover:bg-blue-700"
                >
                  Continue
                  <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
                </Button>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-5">
                <div className="flex items-start gap-3 rounded-xl border border-emerald-100 bg-emerald-50 p-4">
                  <MessageSquareText className="mt-0.5 h-5 w-5 flex-shrink-0 text-emerald-700" aria-hidden="true" />
                  <p className="text-sm leading-6 text-slate-700">
                    Open the test form, use your real phone number, and confirm
                    the SMS intake starts correctly.
                  </p>
                </div>

                <Link
                  href={`/test-form/${widgetKey}`}
                  target="_blank"
                  className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-3 text-base font-bold text-white transition-colors hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
                >
                  Open Test Form
                  <ExternalLink className="h-4 w-4" aria-hidden="true" />
                </Link>

                <p className="rounded-xl border border-blue-100 bg-blue-50 p-4 text-xs leading-6 text-slate-700">
                  The test form opens in a new tab. The lead should also appear
                  in your dashboard after submission.
                </p>

                <Button onClick={finishOnboarding} variant="outline" className="min-h-12 w-full font-bold">
                  Finish Setup
                  <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
                </Button>
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
