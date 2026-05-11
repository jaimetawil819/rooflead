"use client";

import Link from "next/link";
import { useState } from "react";
import { Copy, ExternalLink, Settings, TestTube2, Users } from "lucide-react";

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
    <details className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
            <TestTube2 className="h-4 w-4" aria-hidden="true" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-950">
              Setup & test tools
            </h2>
            <p className="mt-0.5 text-sm leading-6 text-slate-600">
              Use these when installing the form or checking the intake flow.
            </p>
          </div>
        </div>
        <span className="text-xs font-bold uppercase tracking-wide text-slate-400">
          Optional
        </span>
      </summary>

      <div className="border-t border-slate-200 px-5 pb-5 pt-4">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {testFormPath ? (
            <Link
              href={testFormPath}
              target="_blank"
              className="flex min-h-12 items-center justify-between rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm font-bold text-blue-700 transition-colors hover:bg-blue-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
            >
              Open Test Form
              <ExternalLink className="h-4 w-4" />
            </Link>
          ) : (
            <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-400">
              Test form unavailable
            </div>
          )}

          <button
            type="button"
            onClick={copyTestFormLink}
            disabled={!testFormPath}
            className="flex min-h-12 items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {copied ? "Copied Link" : "Copy Test Link"}
            <Copy className="h-4 w-4" />
          </button>

          <Link
            href="/dashboard/leads"
            className="flex min-h-12 items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
          >
            Review Leads
            <Users className="h-4 w-4" />
          </Link>

          <Link
            href="/dashboard/settings"
            className="flex min-h-12 items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
          >
            Form Settings
            <Settings className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </details>
  );
}
