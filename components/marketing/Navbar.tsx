"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { useAuth } from "@clerk/nextjs";

export default function Navbar() {
  const { isSignedIn } = useAuth();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-100 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/">
          <Image src="/logo.png" alt="RoofLead" width={140} height={40} className="h-9 w-auto" priority />
        </Link>
        <nav className="flex items-center gap-3">
          {isSignedIn ? (
            <Button asChild size="sm">
              <Link href="/dashboard">Go to Dashboard</Link>
            </Button>
          ) : (
            <>
              <Link
                href="/sign-in"
                className="hidden sm:inline text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
              >
                Sign In
              </Link>
              <Button asChild size="sm">
                <Link href="/sign-up">Start Free Trial</Link>
              </Button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
