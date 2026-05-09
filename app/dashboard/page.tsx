import { UserButton } from "@clerk/nextjs";

export default function DashboardPage() {
  return (
    <div className="p-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">RoofLead Dashboard</h1>
        <UserButton />
      </div>
      <p className="mt-4 text-gray-500">Your dashboard is being built.</p>
    </div>
  );
}