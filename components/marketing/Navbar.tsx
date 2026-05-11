"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { useAuth } from "@clerk/nextjs";
import { ArrowRight } from "lucide-react";

export default function Navbar() {
  const { isSignedIn } = useAuth();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/85">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-4">
          <Image
            src="/logo.png"
            alt="RoofLead"
            width={140}
            height={40}
            className="h-9 w-auto"
            priority
          />
        </Link>
        <nav className="hidden items-center gap-8 md:flex" aria-label="Primary navigation">
          <Link href="#proof" className="text-sm font-medium text-slate-600 transition-colors hover:text-slate-950">
            Product
          </Link>
          <Link href="#use-cases" className="text-sm font-medium text-slate-600 transition-colors hover:text-slate-950">
            Use Cases
          </Link>
          <Link href="#pricing" className="text-sm font-medium text-slate-600 transition-colors hover:text-slate-950">
            Pricing
          </Link>
        </nav>
        <div className="flex items-center gap-3">
          {isSignedIn ? (
            <Button asChild size="sm" className="bg-blue-600 text-white hover:bg-blue-700">
              <Link href="/dashboard">Go to Dashboard</Link>
            </Button>
          ) : (
            <>
              <Link
                href="/sign-in"
                className="hidden text-sm font-medium text-slate-600 transition-colors hover:text-slate-950 sm:inline"
              >
                Sign In
              </Link>
              <Button asChild size="sm" className="min-h-10 bg-blue-600 text-white hover:bg-blue-700">
                <Link href="/sign-up">
                  Start Free Trial
                  <ArrowRight className="ml-1.5 h-4 w-4" aria-hidden="true" />
                </Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
