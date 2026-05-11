import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export default function FinalCTA() {
  return (
    <section className="bg-blue-600 py-24 px-4 sm:px-6">
      <div className="mx-auto max-w-3xl text-center">
        <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4 leading-tight">
          Stop losing leads to slow response times.
        </h2>
        <p className="text-blue-100 text-lg mb-10 max-w-xl mx-auto">
          Set up takes under 10 minutes. Your next form submission gets a reply
          in under 60 seconds.
        </p>
        <Button
          asChild
          size="lg"
          variant="secondary"
          className="text-base h-12 px-8 font-semibold"
        >
          <Link href="/sign-up">
            Start Your Free Trial <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
        <p className="text-blue-200 text-sm mt-4">
          14 days free · Card required · Cancel anytime
        </p>
      </div>
    </section>
  );
}
