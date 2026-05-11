"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import { LayoutDashboard, Menu, Settings, Users, X } from "lucide-react";
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
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = isActivePath(pathname, href);
          return (
            <Link
              key={href}
              href={href}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                active
                  ? "bg-blue-600 text-white"
                  : "text-slate-400 hover:text-white hover:bg-slate-800"
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
      <header className="sticky top-0 z-40 border-b border-gray-200 bg-white/95 px-4 py-3 backdrop-blur md:hidden">
        <div className="flex items-center justify-between">
          <Link href="/dashboard" className="block">
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
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 text-slate-700 transition-colors hover:bg-gray-50"
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
            className="absolute inset-0 bg-slate-900/50"
            aria-label="Close navigation"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="relative flex h-full w-72 max-w-[85vw] flex-col bg-slate-900 shadow-2xl">
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
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-800 hover:text-white"
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

      <aside className="hidden w-60 flex-col bg-slate-900 h-screen sticky top-0 md:flex">
        <div className="p-6 border-b border-slate-800">
          <Link href="/dashboard" className="block bg-white rounded-lg px-2 py-1">
            <Image
              src="/logo.png"
              alt="RoofLead"
              width={120}
              height={36}
              className="h-7 w-auto"
            />
          </Link>
        </div>

        {renderNav()}

        <div className="p-4 border-t border-slate-800 flex items-center gap-3">
          <UserButton />
          <span className="text-slate-400 text-sm">Account</span>
        </div>
      </aside>
    </>
  );
}
