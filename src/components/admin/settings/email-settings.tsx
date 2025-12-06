"use client";

import { useState, useEffect } from "react";
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
import { Button } from "@/components/ui/button";
import { Server, Mail, Loader2, CheckCircle, FileCode } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import {
  getEmailSettings,
  updateEmailSettings,
  testEmailConnection,
  sendTestEmail,
  type EmailSettingsFormData,
} from "@/app/actions/email-settings";
import { EmailTemplateEditor } from "./email-template-editor";

export function EmailSettings() {
  const [loading, setLoading] = useState(false);
  const [testing, setTesting] = useState(false);
  const [sending, setSending] = useState(false);
  const [testEmail, setTestEmail] = useState("");
  const [formData, setFormData] = useState<EmailSettingsFormData>({
    smtpHost: "",
    smtpPort: 587,
    smtpSecure: false,
    smtpUser: "",
    smtpPassword: "",
    fromEmail: "",
    fromName: "Mesa Networks",
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setLoading(true);
    try {
      const result = await getEmailSettings();
      if (result.success && result.data) {
        setFormData({
          ...result.data,
          smtpPassword: "", // Don't populate password field
        });
      } else {
        toast.error("Failed to load email settings");
      }
    } catch (error) {
      toast.error("Failed to load email settings");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const result = await updateEmailSettings(formData);
      if (result.success) {
        toast.success(result.message || "Settings saved successfully");
      } else {
        toast.error(result.error || "Failed to save settings");
      }
    } catch (error) {
      toast.error("Failed to save settings");
    } finally {
      setLoading(false);
    }
  };

  const handleTestConnection = async () => {
    setTesting(true);
    try {
      const result = await testEmailConnection();
      if (result.success) {
        toast.success(result.message || "Connection successful");
      } else {
        toast.error(result.error || result.message || "Connection failed");
      }
    } catch (error) {
      toast.error("Connection test failed");
    } finally {
      setTesting(false);
    }
  };

  const handleSendTest = async () => {
    if (!testEmail) {
      toast.error("Please enter an email address");
      return;
    }

    setSending(true);
    try {
      const result = await sendTestEmail(testEmail);
      if (result.success) {
        toast.success(result.message || "Test email sent successfully");
        setTestEmail("");
      } else {
        toast.error(result.error || "Failed to send test email");
      }
    } catch (error) {
      toast.error("Failed to send test email");
    } finally {
      setSending(false);
    }
  };

  return (
    <Tabs defaultValue="smtp" className="space-y-6">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="smtp">
          <Server className="h-4 w-4 mr-2" />
          SMTP Configuration
        </TabsTrigger>
        <TabsTrigger value="templates">
          <FileCode className="h-4 w-4 mr-2" />
          Email Templates
        </TabsTrigger>
      </TabsList>

      <TabsContent value="smtp">
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
                  <Input
                    id="smtp-host"
                    placeholder="smtp.example.com"
                    value={formData.smtpHost}
                    onChange={(e) =>
                      setFormData({ ...formData, smtpHost: e.target.value })
                    }
                    disabled={loading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="smtp-port">SMTP Port</Label>
                  <Input
                    id="smtp-port"
                    type="number"
                    value={formData.smtpPort}
                    disabled
                    className="bg-muted"
                  />
                  <p className="text-xs text-muted-foreground">
                    Port is automatically set based on TLS/SSL setting
                  </p>
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="smtp-user">SMTP Username</Label>
                  <Input
                    id="smtp-user"
                    value={formData.smtpUser}
                    onChange={(e) =>
                      setFormData({ ...formData, smtpUser: e.target.value })
                    }
                    disabled={loading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="smtp-pass">SMTP Password</Label>
                  <Input
                    id="smtp-pass"
                    type="password"
                    placeholder="Leave blank to keep current password"
                    value={formData.smtpPassword}
                    onChange={(e) =>
                      setFormData({ ...formData, smtpPassword: e.target.value })
                    }
                    disabled={loading}
                  />
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="from-email">From Email Address</Label>
                  <Input
                    id="from-email"
                    type="email"
                    placeholder="noreply@example.com"
                    value={formData.fromEmail}
                    onChange={(e) =>
                      setFormData({ ...formData, fromEmail: e.target.value })
                    }
                    disabled={loading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="from-name">From Name</Label>
                  <Input
                    id="from-name"
                    placeholder="Mesa Networks"
                    value={formData.fromName}
                    onChange={(e) =>
                      setFormData({ ...formData, fromName: e.target.value })
                    }
                    disabled={loading}
                  />
                </div>
              </div>
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <Label htmlFor="smtp-secure">Use TLS/SSL</Label>
                  <p className="text-sm text-muted-foreground">
                    Port 465 (SSL) vs Port 587 (STARTTLS)
                  </p>
                </div>
                <Switch
                  id="smtp-secure"
                  checked={formData.smtpSecure}
                  onCheckedChange={(checked) =>
                    setFormData({
                      ...formData,
                      smtpSecure: checked,
                      smtpPort: checked ? 465 : 587,
                    })
                  }
                  disabled={loading}
                />
              </div>{" "}
              <Separator />
              <div className="flex flex-wrap gap-2">
                <Button onClick={handleSave} disabled={loading}>
                  {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Save Settings
                </Button>
                <Button
                  variant="outline"
                  onClick={handleTestConnection}
                  disabled={testing || loading}
                >
                  {testing ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <CheckCircle className="h-4 w-4 mr-2" />
                  )}
                  Test Connection
                </Button>
              </div>
              <Separator />
              <div className="space-y-2">
                <Label htmlFor="test-email">Send Test Email</Label>
                <div className="flex gap-2">
                  <Input
                    id="test-email"
                    type="email"
                    placeholder="Enter email address"
                    value={testEmail}
                    onChange={(e) => setTestEmail(e.target.value)}
                    disabled={sending || loading}
                  />
                  <Button
                    variant="outline"
                    onClick={handleSendTest}
                    disabled={sending || loading || !testEmail}
                  >
                    {sending ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Mail className="h-4 w-4 mr-2" />
                    )}
                    Send
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </TabsContent>

      <TabsContent value="templates">
        <EmailTemplateEditor />
      </TabsContent>
    </Tabs>
  );
}
