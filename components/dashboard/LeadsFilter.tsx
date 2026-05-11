"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";

const STATUSES = ["all", "new", "contacted", "qualified", "appointment_set", "won", "lost", "junk", "unresponsive"];
const SCORES = ["all", "hot", "warm", "cold", "unqualified"];

export default function LeadsFilter() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentStatus = searchParams.get("status") ?? "all";
  const currentScore = searchParams.get("score") ?? "all";
  const currentReview = searchParams.get("review") ?? "all";

  function update(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "all") {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    params.delete("page");
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <div className="flex items-center gap-3 flex-wrap">
      <div className="flex items-center gap-2">
        <span className="text-xs font-medium text-gray-500">Status</span>
        <select
          value={currentStatus}
          onChange={(e) => update("status", e.target.value)}
          className="border border-gray-200 rounded-lg px-2.5 py-1.5 text-sm text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s === "all" ? "All statuses" : s.replace("_", " ").replace(/\b\w/g, (c) => c.toUpperCase())}
            </option>
          ))}
        </select>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-xs font-medium text-gray-500">Score</span>
        <select
          value={currentScore}
          onChange={(e) => update("score", e.target.value)}
          className="border border-gray-200 rounded-lg px-2.5 py-1.5 text-sm text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {SCORES.map((s) => (
            <option key={s} value={s}>
              {s === "all" ? "All scores" : s.charAt(0).toUpperCase() + s.slice(1)}
            </option>
          ))}
        </select>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-xs font-medium text-gray-500">Review</span>
        <select
          value={currentReview}
          onChange={(e) => update("review", e.target.value)}
          className="border border-gray-200 rounded-lg px-2.5 py-1.5 text-sm text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All leads</option>
          <option value="needs_review">Needs review</option>
        </select>
      </div>
    </div>
  );
}
