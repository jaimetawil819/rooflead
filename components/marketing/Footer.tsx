import Link from "next/link";
import Image from "next/image";

export default function Footer() {
  return (
    <footer className="bg-slate-950 px-4 pb-10 text-slate-400 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl border-t border-white/10 pt-8">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="rounded-lg bg-white px-2 py-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
            >
              <Image src="/logo.png" alt="RoofLead" width={120} height={36} className="h-7 w-auto" />
            </Link>
            <p className="max-w-sm text-sm leading-6">
              AI SMS lead intake for roofing companies that need faster first response.
            </p>
          </div>
          <nav className="flex flex-wrap gap-x-6 gap-y-3 text-sm" aria-label="Footer navigation">
            <Link href="#proof" className="transition-colors hover:text-white">
              Product
            </Link>
            <Link href="#use-cases" className="transition-colors hover:text-white">
              Use Cases
            </Link>
            <Link href="#pricing" className="transition-colors hover:text-white">
              Pricing
            </Link>
            <Link href="/privacy" className="transition-colors hover:text-white">
              Privacy
            </Link>
            <Link href="/terms" className="transition-colors hover:text-white">
              Terms
            </Link>
            <Link href="/sign-in" className="transition-colors hover:text-white">
              Sign In
            </Link>
          </nav>
        </div>
        <p className="mt-8 text-xs">
          Copyright {new Date().getFullYear()} RoofLead. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
