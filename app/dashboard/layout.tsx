import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getAdminClient } from "@/lib/supabase/admin";
import Sidebar from "@/components/dashboard/Sidebar";
import { hasDashboardAccess } from "@/lib/billing";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const supabase = getAdminClient();
  const { data: business } = await supabase
    .from("businesses")
    .select("subscription_status, stripe_subscription_id, onboarding_complete")
    .eq("owner_id", userId)
    .single();

  if (
    !business ||
    !hasDashboardAccess(
      business.subscription_status,
      business.stripe_subscription_id
    )
  ) {
    redirect("/subscribe");
  }

  return (
    <div className="min-h-dvh bg-slate-100 md:flex">
      <Sidebar />
      <main className="min-w-0 flex-1">{children}</main>
    </div>
  );
}
