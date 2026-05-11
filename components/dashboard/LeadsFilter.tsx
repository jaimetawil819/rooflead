"use client";

import { FormEvent } from "react";
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
  const currentQuery = searchParams.get("q") ?? "";

  function pushParams(params: URLSearchParams) {
    const queryString = params.toString();
    router.push(queryString ? `${pathname}?${queryString}` : pathname);
  }

  function update(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "all") {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    params.delete("page");
    pushParams(params);
  }

  function applySearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const params = new URLSearchParams(searchParams.toString());
    const formData = new FormData(event.currentTarget);
    const cleanQuery = String(formData.get("q") ?? "").trim();

    if (cleanQuery) {
      params.set("q", cleanQuery);
    } else {
      params.delete("q");
    }

    params.delete("page");
    pushParams(params);
  }

  function clearSearch() {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("q");
    params.delete("page");
    pushParams(params);
  }

  return (
    <div className="flex items-center gap-3 flex-wrap">
      <form onSubmit={applySearch} className="flex items-center gap-2">
        <label htmlFor="lead-search" className="text-xs font-medium text-gray-500">
          Search
        </label>
        <input
          id="lead-search"
          name="q"
          defaultValue={currentQuery}
          className="w-56 rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Name, phone, address..."
          maxLength={80}
        />
        <button
          type="submit"
          className="rounded-lg bg-slate-900 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-slate-700"
        >
          Search
        </button>
        {currentQuery && (
          <button
            type="button"
            onClick={clearSearch}
            className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-600 transition-colors hover:bg-gray-50"
          >
            Clear
          </button>
        )}
      </form>

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
