"use client";

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2">Settings</h1>
        <p className="text-muted-foreground">
          Manage your preferences and configurations
        </p>
      </div>

      {/* Coming Soon */}
      <div className="bg-card border-2 border-border rounded-xl p-6">
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold mb-2">Coming Soon</h2>
          <p className="text-muted-foreground">
            Settings page is under construction
          </p>
        </div>
      </div>
    </div>
  );
}
