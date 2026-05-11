import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, CalendarCheck, CheckCircle2 } from "lucide-react";

const pilotSetupHref =
  "mailto:jaimetawil819@gmail.com?subject=RoofLead%20pilot%20setup";

export default function FinalCTA() {
  return (
    <section className="bg-slate-950 px-4 py-20 text-white sm:px-6 lg:px-8 lg:py-24">
      <div className="mx-auto max-w-5xl text-center">
        <p className="mb-4 text-sm font-semibold uppercase tracking-widest text-blue-300">
          Ready For The Next Lead?
        </p>
        <h2 className="text-3xl font-bold leading-tight text-white sm:text-4xl lg:text-5xl">
          Give every roofing lead a fast, professional first response.
        </h2>
        <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-slate-300">
          Set up RoofLead once. The next form submission gets an instant SMS
          intake, a clean summary, and a clear owner action.
        </p>

        <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button
            asChild
            size="lg"
            className="min-h-12 bg-blue-600 px-8 text-base font-semibold text-white hover:bg-blue-500"
          >
            <Link href="/sign-up">
              Start Your Free Trial
              <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
            </Link>
          </Button>
          <Button
            asChild
            size="lg"
            variant="outline"
            className="min-h-12 border-white/20 bg-white/5 px-8 text-base font-semibold text-white hover:bg-white/10 hover:text-white"
          >
            <a href={pilotSetupHref}>
              <CalendarCheck className="mr-2 h-4 w-4" aria-hidden="true" />
              Book Pilot Setup
            </a>
          </Button>
        </div>

        <Link
          href="#pricing"
          className="mt-4 inline-flex min-h-10 items-center justify-center text-sm font-bold text-blue-200 transition-colors hover:text-blue-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
        >
          Review pricing
        </Link>

        <div className="mt-7 flex flex-col items-center justify-center gap-3 text-sm text-slate-300 sm:flex-row">
          {["14 days free", "Card required", "Cancel anytime"].map((item) => (
            <span key={item} className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-400" aria-hidden="true" />
              {item}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
