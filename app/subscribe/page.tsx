"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

export default function SubscribePage() {
  const [loading, setLoading] = useState(false);

  async function handleSubscribe() {
    setLoading(true);
    const res = await fetch("/api/billing/checkout", { method: "POST" });
    const data = await res.json();
    if (data.url) {
      window.location.href = data.url;
    } else {
      alert("Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white rounded-2xl shadow-md p-10 max-w-md w-full text-center">
        <h1 className="text-3xl font-bold mb-2">Start Your Free Trial</h1>
        <p className="text-gray-500 mb-6">
          Enter your card to activate 14 days free. After that, Starter is
          $149/month.
        </p>

        <ul className="text-left space-y-2 mb-8 text-sm text-gray-700">
          <li>✓ AI SMS lead qualification responds in under 60 seconds</li>
          <li>✓ Lead score and summary sent to your phone</li>
          <li>✓ Embeddable web form widget</li>
          <li>✓ Lead dashboard with full conversation history</li>
          <li>✓ Cancel before day 14 and pay nothing</li>
        </ul>

        <Button
          onClick={handleSubscribe}
          disabled={loading}
          className="w-full text-base py-6"
        >
          {loading ? "Redirecting to checkout..." : "Start Free Trial"}
        </Button>

        <p className="text-xs text-gray-400 mt-4">
          Your card is required for activation, but you will not be charged
          during the trial.
        </p>
      </div>
    </div>
  );
}
