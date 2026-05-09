import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Sidebar from "@/components/dashboard/Sidebar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const supabase = await createClient();
  const { data: business } = await supabase
    .from("businesses")
    .select("subscription_status, onboarding_complete")
    .eq("owner_id", userId)
    .single();

  if (!business || business.subscription_status !== "active") {
    redirect("/subscribe");
  }

  return (
    <div className="min-h-screen flex bg-gray-50">
      <Sidebar />
      <main className="flex-1 min-w-0">{children}</main>
    </div>
  );
}
