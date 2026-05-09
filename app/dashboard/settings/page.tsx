"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { createClient } from "@/lib/supabase/client";

export default function SettingsPage() {
  const { user } = useUser();
  const [name, setName] = useState("");
  const [notificationPhone, setNotificationPhone] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from("businesses")
        .select("*")
        .eq("owner_id", user.id)
        .single();
      if (data) {
        setName(data.name);
        setNotificationPhone(data.notification_phone ?? "");
      }
    };
    load();
  }, [user]);

  const save = async () => {
    if (!user) return;
    setSaving(true);
    const supabase = createClient();
    await supabase.from("businesses").upsert({
      owner_id: user.id,
      name,
      notification_phone: notificationPhone,
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="p-8 max-w-lg">
      <h1 className="text-2xl font-bold mb-6">Business Settings</h1>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Business Name</label>
          <input
            className="w-full border rounded px-3 py-2"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="ABC Roofing Co."
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">
            Notification Phone (your number for lead alerts)
          </label>
          <input
            className="w-full border rounded px-3 py-2"
            value={notificationPhone}
            onChange={(e) => setNotificationPhone(e.target.value)}
            placeholder="+1 555 000 0000"
          />
        </div>
        <button
          onClick={save}
          disabled={saving}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save Settings"}
        </button>
        {saved && <p className="text-green-600 text-sm">Settings saved!</p>}
      </div>
    </div>
  );
}