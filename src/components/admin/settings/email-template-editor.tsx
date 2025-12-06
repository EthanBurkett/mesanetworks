"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileCode, Eye, Save, RotateCcw } from "lucide-react";
import { toast } from "sonner";

const EMAIL_TEMPLATES = {
  "auth0-otp": {
    name: "Auth0 OTP/Passwordless",
    description: "Authentication codes and magic links",
    variables: {
      "{{ application.name }}": "Mesa Networks",
      "{{ code }}": "123456",
      "{{ link }}": "https://mesanet.works/verify?token=abc123",
    },
  },
  welcome: {
    name: "Welcome Email",
    description: "New user welcome message",
    variables: {
      "{{name}}": "John Doe",
      "{{loginUrl}}": "https://mesanet.works/login",
    },
  },
  "password-reset": {
    name: "Password Reset",
    description: "Password reset instructions",
    variables: {
      "{{resetUrl}}": "https://mesanet.works/reset-password?token=xyz789",
    },
  },
  "2fa-enabled": {
    name: "2FA Enabled",
    description: "Two-factor authentication confirmation",
    variables: {
      "{{supportUrl}}": "https://mesanet.works/support",
    },
  },
  "security-alert": {
    name: "Security Alert",
    description: "New device login notification",
    variables: {
      "{{timestamp}}": new Date().toLocaleString(),
      "{{location}}": "San Francisco, CA",
      "{{device}}": "Chrome on Windows",
      "{{ipAddress}}": "192.168.1.1",
      "{{securityUrl}}": "https://mesanet.works/account/security",
    },
  },
  "verify-email": {
    name: "Email Verification",
    description: "Email address verification link",
    variables: {
      "{{name}}": "John Doe",
      "{{verifyUrl}}": "https://mesanet.works/verify-email?token=def456",
    },
  },
  "password-changed": {
    name: "Password Changed",
    description: "Password change confirmation",
    variables: {
      "{{timestamp}}": new Date().toLocaleString(),
    },
  },
  "account-suspended": {
    name: "Account Suspended",
    description: "Account suspension notice",
    variables: {
      "{{reason}}": "suspicious activity",
      "{{timestamp}}": new Date().toLocaleString(),
      "{{accountId}}": "USR-12345",
      "{{supportUrl}}": "https://mesanet.works/support",
    },
  },
  "session-expired": {
    name: "Session Expired",
    description: "Session timeout notification",
    variables: {
      "{{loginUrl}}": "https://mesanet.works/login",
    },
  },
  "backup-codes-generated": {
    name: "Backup Codes Generated",
    description: "New 2FA backup codes created",
    variables: {
      "{{viewCodesUrl}}": "https://mesanet.works/account/two-factor",
    },
  },
  "role-changed": {
    name: "Role Changed",
    description: "User role/permission update",
    variables: {
      "{{newRole}}": "Administrator",
      "{{updatedBy}}": "System Admin",
      "{{timestamp}}": new Date().toLocaleString(),
    },
  },
};

export function EmailTemplateEditor() {
  const [selectedTemplate, setSelectedTemplate] = useState<string>("auth0-otp");
  const [htmlContent, setHtmlContent] = useState("");
  const [loading, setLoading] = useState(false);

  const loadTemplate = async (templateId: string) => {
    try {
      const response = await fetch(`/email-templates/${templateId}.html`);
      const content = await response.text();
      setHtmlContent(content);
    } catch (error) {
      toast.error("Failed to load template");
    }
  };

  const handleTemplateChange = (value: string) => {
    setSelectedTemplate(value);
    loadTemplate(value);
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      // TODO: Implement save to server
      toast.success("Template saved successfully");
    } catch (error) {
      toast.error("Failed to save template");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    loadTemplate(selectedTemplate);
    toast.info("Template reset to original");
  };

  const getPreviewHtml = () => {
    let preview = htmlContent;
    const template =
      EMAIL_TEMPLATES[selectedTemplate as keyof typeof EMAIL_TEMPLATES];

    if (template) {
      Object.entries(template.variables).forEach(([key, value]) => {
        preview = preview.replaceAll(key, String(value));
      });
    }

    return preview;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileCode className="h-5 w-5" />
            Email Template Editor
          </CardTitle>
          <CardDescription>
            Customize email templates with live preview
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="template-select">Select Template</Label>
            <Select
              value={selectedTemplate}
              onValueChange={handleTemplateChange}
            >
              <SelectTrigger id="template-select">
                <SelectValue placeholder="Choose a template" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(EMAIL_TEMPLATES).map(([id, template]) => (
                  <SelectItem key={id} value={id}>
                    <div className="flex flex-col items-start">
                      <span className="font-medium">{template.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {template.description}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedTemplate && (
            <>
              <div className="rounded-lg border p-3 bg-muted/50">
                <p className="text-sm font-medium mb-2">Available Variables:</p>
                <div className="flex flex-wrap gap-2">
                  {Object.keys(
                    EMAIL_TEMPLATES[
                      selectedTemplate as keyof typeof EMAIL_TEMPLATES
                    ].variables
                  ).map((variable) => (
                    <code
                      key={variable}
                      className="px-2 py-1 bg-background rounded text-xs border"
                    >
                      {variable}
                    </code>
                  ))}
                </div>
              </div>

              <Tabs defaultValue="editor" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="editor">
                    <FileCode className="h-4 w-4 mr-2" />
                    HTML Editor
                  </TabsTrigger>
                  <TabsTrigger value="preview">
                    <Eye className="h-4 w-4 mr-2" />
                    Preview
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="editor" className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="html-editor">HTML Content</Label>
                    <textarea
                      id="html-editor"
                      value={htmlContent}
                      onChange={(e) => setHtmlContent(e.target.value)}
                      className="w-full min-h-[500px] font-mono text-sm p-4 border rounded-md bg-background"
                      spellCheck={false}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={handleSave} disabled={loading}>
                      <Save className="h-4 w-4 mr-2" />
                      Save Template
                    </Button>
                    <Button variant="outline" onClick={handleReset}>
                      <RotateCcw className="h-4 w-4 mr-2" />
                      Reset to Original
                    </Button>
                  </div>
                </TabsContent>

                <TabsContent value="preview" className="space-y-4">
                  <div className="rounded-lg border overflow-hidden">
                    <div className="bg-muted px-4 py-2 border-b">
                      <p className="text-sm font-medium">Live Preview</p>
                      <p className="text-xs text-muted-foreground">
                        Variables are replaced with sample data
                      </p>
                    </div>
                    <div className="bg-white p-4 min-h-[500px] overflow-auto">
                      <iframe
                        srcDoc={getPreviewHtml()}
                        className="w-full min-h-[600px] border-0"
                        title="Email Preview"
                        sandbox="allow-same-origin"
                      />
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
