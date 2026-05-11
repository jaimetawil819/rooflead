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
    <div className="flex flex-col gap-3 lg:flex-row lg:flex-wrap lg:items-end">
      <form onSubmit={applySearch} className="grid gap-2 sm:grid-cols-[auto_1fr_auto_auto] sm:items-center">
        <label htmlFor="lead-search" className="text-xs font-bold uppercase tracking-wide text-slate-500">
          Search
        </label>
        <input
          id="lead-search"
          name="q"
          defaultValue={currentQuery}
          className="min-h-11 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600 sm:w-72"
          placeholder="Name, phone, address..."
          maxLength={80}
        />
        <button
          type="submit"
          className="min-h-11 rounded-lg bg-blue-600 px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
        >
          Search
        </button>
        {currentQuery && (
          <button
            type="button"
            onClick={clearSearch}
            className="min-h-11 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
          >
            Clear
          </button>
        )}
      </form>

      <div className="grid gap-2 sm:grid-cols-[auto_1fr] sm:items-center">
        <span className="text-xs font-bold uppercase tracking-wide text-slate-500">Status</span>
        <select
          value={currentStatus}
          onChange={(e) => update("status", e.target.value)}
          className="min-h-11 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600"
        >
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s === "all" ? "All statuses" : s.replace("_", " ").replace(/\b\w/g, (c) => c.toUpperCase())}
            </option>
          ))}
        </select>
      </div>

      <div className="grid gap-2 sm:grid-cols-[auto_1fr] sm:items-center">
        <span className="text-xs font-bold uppercase tracking-wide text-slate-500">Score</span>
        <select
          value={currentScore}
          onChange={(e) => update("score", e.target.value)}
          className="min-h-11 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600"
        >
          {SCORES.map((s) => (
            <option key={s} value={s}>
              {s === "all" ? "All scores" : s.charAt(0).toUpperCase() + s.slice(1)}
            </option>
          ))}
        </select>
      </div>

      <div className="grid gap-2 sm:grid-cols-[auto_1fr] sm:items-center">
        <span className="text-xs font-bold uppercase tracking-wide text-slate-500">Review</span>
        <select
          value={currentReview}
          onChange={(e) => update("review", e.target.value)}
          className="min-h-11 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600"
        >
          <option value="all">All leads</option>
          <option value="needs_review">Needs review</option>
        </select>
      </div>
    </div>
  );
}
