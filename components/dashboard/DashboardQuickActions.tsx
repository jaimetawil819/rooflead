"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowRight, Copy, ExternalLink, Settings, Users } from "lucide-react";

type DashboardQuickActionsProps = {
  testFormPath: string | null;
};

export default function DashboardQuickActions({
  testFormPath,
}: DashboardQuickActionsProps) {
  const [copied, setCopied] = useState(false);

  async function copyTestFormLink() {
    if (!testFormPath) return;

    const absoluteUrl = `${window.location.origin}${testFormPath}`;
    await navigator.clipboard.writeText(absoluteUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="mb-8 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
      <div className="mb-4">
        <h2 className="text-sm font-semibold text-slate-900">Demo Actions</h2>
        <p className="mt-1 text-sm text-gray-500">
          Use these during a pilot walkthrough or quick smoke test.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {testFormPath ? (
          <Link
            href={testFormPath}
            target="_blank"
            className="flex items-center justify-between rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm font-semibold text-blue-700 transition-colors hover:bg-blue-100"
          >
            Open Test Form
            <ExternalLink className="h-4 w-4" />
          </Link>
        ) : (
          <div className="rounded-xl border border-gray-100 bg-gray-50 px-4 py-3 text-sm font-medium text-gray-400">
            Test form unavailable
          </div>
        )}

        <button
          type="button"
          onClick={copyTestFormLink}
          disabled={!testFormPath}
          className="flex items-center justify-between rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {copied ? "Copied Link" : "Copy Test Link"}
          <Copy className="h-4 w-4" />
        </button>

        <Link
          href="/dashboard/leads"
          className="flex items-center justify-between rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition-colors hover:bg-gray-50"
        >
          Review Leads
          <Users className="h-4 w-4" />
        </Link>

        <Link
          href="/dashboard/settings"
          className="flex items-center justify-between rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition-colors hover:bg-gray-50"
        >
          Form Settings
          <Settings className="h-4 w-4" />
        </Link>
      </div>

      <p className="mt-4 flex items-center gap-1 text-xs text-gray-400">
        Demo flow: open form, submit lead, qualify by SMS/simulator, open lead,
        show summary and owner reply.
        <ArrowRight className="h-3 w-3" />
      </p>
    </div>
  );
}
