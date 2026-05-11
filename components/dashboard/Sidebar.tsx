"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import { LayoutDashboard, Menu, Settings, Sparkles, Users, X } from "lucide-react";
import { useState } from "react";

const navItems = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/leads", label: "Leads", icon: Users },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

function isActivePath(pathname: string, href: string) {
  return pathname === href || (href !== "/dashboard" && pathname.startsWith(href));
}

export default function Sidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  function renderNav() {
    return (
      <nav className="flex-1 space-y-1 p-4" aria-label="Dashboard navigation">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = isActivePath(pathname, href);
          return (
            <Link
              key={href}
              href={href}
              onClick={() => setMobileOpen(false)}
              className={`flex min-h-11 items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 ${
                active
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-950/25"
                  : "text-slate-400 hover:bg-white/5 hover:text-white"
              }`}
            >
              <Icon className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
              {label}
            </Link>
          );
        })}
      </nav>
    );
  }

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-slate-800 bg-slate-950 px-4 py-3 text-white md:hidden">
        <div className="flex items-center justify-between">
          <Link href="/dashboard" className="block rounded-md bg-white px-2 py-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300">
            <Image
              src="/logo.png"
              alt="RoofLead"
              width={132}
              height={38}
              className="h-8 w-auto"
              priority
            />
          </Link>
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="inline-flex h-11 w-11 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-white transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300"
            aria-label="Open navigation"
            aria-expanded={mobileOpen}
          >
            <Menu className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>
      </header>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-slate-950/70"
            aria-label="Close navigation"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="relative flex h-full w-72 max-w-[85vw] flex-col bg-slate-950 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 p-4">
              <Link
                href="/dashboard"
                onClick={() => setMobileOpen(false)}
                className="block rounded-lg bg-white px-2 py-1"
              >
                <Image
                  src="/logo.png"
                  alt="RoofLead"
                  width={120}
                  height={36}
                  className="h-7 w-auto"
                />
              </Link>
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                className="inline-flex h-11 w-11 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-white/5 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300"
                aria-label="Close navigation"
              >
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>

            {renderNav()}

            <div className="flex items-center gap-3 border-t border-slate-800 p-4">
              <UserButton />
              <span className="text-sm text-slate-400">Account</span>
            </div>
          </aside>
        </div>
      )}

      <aside className="sticky top-0 hidden h-screen w-64 flex-col border-r border-slate-800 bg-slate-950 md:flex">
        <div className="border-b border-slate-800 p-6">
          <Link href="/dashboard" className="block rounded-lg bg-white px-2 py-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300">
            <Image
              src="/logo.png"
              alt="RoofLead"
              width={120}
              height={36}
              className="h-7 w-auto"
            />
          </Link>
          <div className="mt-5 rounded-xl border border-blue-400/20 bg-blue-500/10 p-3">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-blue-200">
              <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
              Lead command center
            </div>
            <p className="mt-2 text-xs leading-5 text-slate-400">
              Start with urgent leads, then review the pipeline.
            </p>
          </div>
        </div>

        {renderNav()}

        <div className="flex items-center gap-3 border-t border-slate-800 p-4">
          <UserButton />
          <span className="text-sm text-slate-400">Account</span>
        </div>
      </aside>
    </>
  );
}
