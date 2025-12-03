"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Settings, Shield, Mail, Bell, Database, Zap } from "lucide-react";
import { GeneralSettings } from "@/components/admin/settings/general-settings";
import { SecuritySettings } from "@/components/admin/settings/security-settings";
import { EmailSettings } from "@/components/admin/settings/email-settings";
import { NotificationSettings } from "@/components/admin/settings/notification-settings";
import { DatabaseSettings } from "@/components/admin/settings/database-settings";
import { AdvancedSettings } from "@/components/admin/settings/advanced-settings";

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">System Settings</h1>
          <p className="text-muted-foreground">
            Manage your application configuration and preferences. Changes are
            saved automatically.
          </p>
        </div>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="general">
            <Settings className="h-4 w-4 mr-2" />
            General
          </TabsTrigger>
          <TabsTrigger value="security">
            <Shield className="h-4 w-4 mr-2" />
            Security
          </TabsTrigger>
          <TabsTrigger value="email">
            <Mail className="h-4 w-4 mr-2" />
            Email
          </TabsTrigger>
          <TabsTrigger value="notifications">
            <Bell className="h-4 w-4 mr-2" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="database">
            <Database className="h-4 w-4 mr-2" />
            Database
          </TabsTrigger>
          <TabsTrigger value="advanced">
            <Zap className="h-4 w-4 mr-2" />
            Advanced
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-6">
          <GeneralSettings />
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <SecuritySettings />
        </TabsContent>

        <TabsContent value="email" className="space-y-6">
          <EmailSettings />
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <NotificationSettings />
        </TabsContent>

        <TabsContent value="database" className="space-y-6">
          <DatabaseSettings />
        </TabsContent>

        <TabsContent value="advanced" className="space-y-6">
          <AdvancedSettings />
        </TabsContent>
      </Tabs>
    </div>
  );
}
