"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";

const STEPS = ["Business Info", "Embed Code", "Send Test Lead"];

export default function OnboardingPage() {
  const { user } = useUser();
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [notificationPhone, setNotificationPhone] = useState("");
  const [saving, setSaving] = useState(false);
  const [widgetKey, setWidgetKey] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      const supabase = createClient();
      const { data: business } = await supabase
        .from("businesses")
        .select("name, notification_phone")
        .eq("owner_id", user.id)
        .single();
      if (business) {
        setName(business.name ?? "");
        setNotificationPhone(business.notification_phone ?? "");
      }
    };
    load();
  }, [user]);

  async function saveBusinessInfo() {
    if (!user || !name.trim()) return;
    setSaving(true);
    const supabase = createClient();

    await supabase
      .from("businesses")
      .upsert({ owner_id: user.id, name, notification_phone: notificationPhone });

    const { data: business } = await supabase
      .from("businesses")
      .select("id")
      .eq("owner_id", user.id)
      .single();

    if (business) {
      const { data: existingWidget } = await supabase
        .from("form_widgets")
        .select("widget_key")
        .eq("business_id", business.id)
        .single();

      if (existingWidget) {
        setWidgetKey(existingWidget.widget_key);
      } else {
        const { data: newWidget } = await supabase
          .from("form_widgets")
          .insert({ business_id: business.id })
          .select("widget_key")
          .single();
        if (newWidget) setWidgetKey(newWidget.widget_key);
      }
    }

    setSaving(false);
    setStep(1);
  }

  async function finishOnboarding() {
    if (!user) return;
    const supabase = createClient();
    await supabase
      .from("businesses")
      .update({ onboarding_complete: true })
      .eq("owner_id", user.id);
    router.push("/dashboard");
  }

  const embedCode = `<script src="${window.location.origin}/embed.js" data-key="${widgetKey}"></script>`;

  function copyEmbed() {
    navigator.clipboard.writeText(embedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl shadow-md w-full max-w-lg p-8">

        {/* Progress bar */}
        <div className="flex items-center gap-2 mb-8">
          {STEPS.map((label, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-1">
              <div className={`w-full h-2 rounded-full ${i <= step ? "bg-blue-600" : "bg-gray-200"}`} />
              <span className={`text-xs ${i === step ? "text-blue-600 font-semibold" : "text-gray-400"}`}>
                {label}
              </span>
            </div>
          ))}
        </div>

        {/* Step 1: Business Info */}
        {step === 0 && (
          <div className="space-y-4">
            <div className="mb-2">
              <h2 className="text-xl font-bold text-slate-900">Tell us about your business</h2>
              <p className="text-sm text-gray-500 mt-1">This takes about 2 minutes.</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Business Name</label>
              <input
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="ABC Roofing Co."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Your phone number for lead alerts
              </label>
              <input
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={notificationPhone}
                onChange={(e) => setNotificationPhone(e.target.value)}
                placeholder="+1 555 000 0000"
              />
              <p className="text-xs text-gray-400 mt-1.5">
                You&apos;ll get an SMS here whenever a lead is qualified.
              </p>
            </div>
            <Button
              onClick={saveBusinessInfo}
              disabled={saving || !name.trim()}
              className="w-full"
            >
              {saving ? "Saving..." : "Continue →"}
            </Button>
          </div>
        )}

        {/* Step 2: Embed Code */}
        {step === 1 && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold">Add the form to your website</h2>
            <p className="text-gray-500 text-sm">
              Paste this code snippet anywhere on your website where you want the lead form to appear.
            </p>
            <div className="bg-gray-900 text-green-400 rounded-lg p-4 text-xs font-mono break-all">
              {embedCode}
            </div>
            <Button variant="outline" onClick={copyEmbed} className="w-full">
              {copied ? "Copied!" : "Copy Code"}
            </Button>
            <p className="text-xs text-gray-400">
              Don&apos;t have a website yet? No problem — you can still test the form in the next step.
            </p>
            <Button onClick={() => setStep(2)} className="w-full">
              Continue →
            </Button>
          </div>
        )}

        {/* Step 3: Test Lead */}
        {step === 2 && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold">Send a test lead</h2>
            <p className="text-gray-500 text-sm">
              Try the full flow — submit a test lead and watch the AI qualify it via SMS.
            </p>
            <a
              href={`/test-form/${widgetKey}`}
              target="_blank"
              rel="noreferrer"
              className="block w-full text-center bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 font-medium"
            >
              Open Test Form →
            </a>
            <p className="text-xs text-gray-400">
              Opens in a new tab. Use your real phone number so you receive the SMS.
            </p>
            <Button onClick={finishOnboarding} variant="outline" className="w-full">
              I&apos;ll test it later →
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
