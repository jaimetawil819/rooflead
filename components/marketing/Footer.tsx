import Link from "next/link";
import Image from "next/image";

export default function Footer() {
  return (
    <footer className="bg-slate-900 py-10 px-4 sm:px-6">
      <div className="mx-auto max-w-6xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="bg-white rounded-lg px-2 py-1">
          <Image src="/logo.png" alt="RoofLead" width={120} height={36} className="h-7 w-auto" />
        </div>
        <nav className="flex gap-6 text-sm text-slate-400">
          <Link href="#how-it-works" className="hover:text-white transition-colors">How It Works</Link>
          <Link href="#pricing" className="hover:text-white transition-colors">Pricing</Link>
          <Link href="/sign-in" className="hover:text-white transition-colors">Sign In</Link>
        </nav>
        <p className="text-slate-500 text-xs">
          © {new Date().getFullYear()} RoofLead. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
