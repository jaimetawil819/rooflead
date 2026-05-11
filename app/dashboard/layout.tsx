import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getAdminClient } from "@/lib/supabase/admin";
import Sidebar from "@/components/dashboard/Sidebar";

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
    .select("subscription_status, onboarding_complete")
    .eq("owner_id", userId)
    .single();

  if (!business || business.subscription_status !== "active") {
    redirect("/subscribe");
  }

  return (
    <div className="min-h-screen bg-gray-50 md:flex">
      <Sidebar />
      <main className="flex-1 min-w-0">{children}</main>
    </div>
  );
}
