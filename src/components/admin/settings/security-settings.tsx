import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Lock, Users } from "lucide-react";
import { SettingToggle } from "../setting-toggle";

export function SecuritySettings() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            Authentication
          </CardTitle>
          <CardDescription>
            Configure authentication and access control
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <SettingToggle
              id="mfa"
              label="Two-Factor Authentication"
              description="Require 2FA for all users"
            />
            <SettingToggle
              id="email-verification"
              label="Email Verification"
              description="Require users to verify their email"
              defaultChecked
            />
            <SettingToggle
              id="strong-passwords"
              label="Strong Passwords"
              description="Enforce password complexity requirements"
              defaultChecked
            />
          </div>
          <Separator />
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="session-timeout">Session Timeout (minutes)</Label>
              <Input id="session-timeout" type="number" defaultValue="60" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="max-attempts">Max Login Attempts</Label>
              <Input id="max-attempts" type="number" defaultValue="5" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Role & Permissions
          </CardTitle>
          <CardDescription>
            Manage default roles and permissions
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="default-role">Default User Role</Label>
            <Select defaultValue="user">
              <SelectTrigger id="default-role">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="user">User</SelectItem>
                <SelectItem value="member">Member</SelectItem>
                <SelectItem value="guest">Guest</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <SettingToggle
            id="auto-approve"
            label="Auto-approve New Users"
            description="Automatically activate new user accounts"
            defaultChecked
          />
        </CardContent>
      </Card>
    </div>
  );
}
