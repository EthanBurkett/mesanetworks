import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Bell } from "lucide-react";
import { SettingToggle } from "../setting-toggle";

export function NotificationSettings() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Notification Preferences
        </CardTitle>
        <CardDescription>
          Configure system notification settings
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <SettingToggle
          id="notify-new-user"
          label="New User Registration"
          description="Notify admins when new users register"
          defaultChecked
        />
        <SettingToggle
          id="notify-failed-login"
          label="Failed Login Attempts"
          description="Alert on suspicious login activity"
          defaultChecked
        />
        <SettingToggle
          id="notify-role-change"
          label="Role Changes"
          description="Notify users when their roles are updated"
        />
        <SettingToggle
          id="notify-system"
          label="System Alerts"
          description="Important system notifications and updates"
          defaultChecked
        />
      </CardContent>
    </Card>
  );
}
