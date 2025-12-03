import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Server, Mail } from "lucide-react";
import { SettingToggle } from "../setting-toggle";

export function EmailSettings() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Server className="h-5 w-5" />
            SMTP Configuration
          </CardTitle>
          <CardDescription>
            Configure your email server settings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="smtp-host">SMTP Host</Label>
              <Input id="smtp-host" placeholder="smtp.example.com" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="smtp-port">SMTP Port</Label>
              <Input id="smtp-port" type="number" defaultValue="587" />
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="smtp-user">SMTP Username</Label>
              <Input id="smtp-user" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="smtp-pass">SMTP Password</Label>
              <Input id="smtp-pass" type="password" />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="from-email">From Email Address</Label>
            <Input
              id="from-email"
              type="email"
              placeholder="noreply@example.com"
            />
          </div>
          <SettingToggle
            id="smtp-secure"
            label="Use TLS/SSL"
            description="Secure connection to SMTP server"
            defaultChecked
          />
          <Separator />
          <Button variant="outline" size="sm">
            <Mail className="h-4 w-4 mr-2" />
            Send Test Email
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Email Templates</CardTitle>
          <CardDescription>
            Customize email templates for different events
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="template-type">Template Type</Label>
            <Select defaultValue="welcome">
              <SelectTrigger id="template-type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="welcome">Welcome Email</SelectItem>
                <SelectItem value="reset">Password Reset</SelectItem>
                <SelectItem value="verify">Email Verification</SelectItem>
                <SelectItem value="invite">User Invitation</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="template-subject">Subject Line</Label>
            <Input
              id="template-subject"
              defaultValue="Welcome to Mesa Networks!"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="template-body">Email Body</Label>
            <Textarea
              id="template-body"
              rows={8}
              defaultValue="Welcome {{userName}}! We're excited to have you..."
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
