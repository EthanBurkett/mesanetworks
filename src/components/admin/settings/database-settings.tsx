import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Database } from "lucide-react";
import { SettingToggle } from "../setting-toggle";

export function DatabaseSettings() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Database Configuration
          </CardTitle>
          <CardDescription>
            Manage database connection and optimization
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <p className="font-medium">Connection Status</p>
                  <Badge variant="default" className="bg-green-500">
                    Connected
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  MongoDB Atlas • cluster0.mongodb.net
                </p>
              </div>
              <Button variant="outline" size="sm">
                Test Connection
              </Button>
            </div>
          </div>
          <Separator />
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="pool-size">Connection Pool Size</Label>
              <Input id="pool-size" type="number" defaultValue="10" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="timeout">Connection Timeout (ms)</Label>
              <Input id="timeout" type="number" defaultValue="5000" />
            </div>
          </div>
          <SettingToggle
            id="auto-index"
            label="Auto-create Indexes"
            description="Automatically create database indexes"
            defaultChecked
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Database Maintenance</CardTitle>
          <CardDescription>Backup and optimization tools</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="space-y-1">
              <p className="font-medium">Last Backup</p>
              <p className="text-sm text-muted-foreground">
                December 1, 2025 at 3:00 AM
              </p>
            </div>
            <Button variant="outline" size="sm">
              <Database className="h-4 w-4 mr-2" />
              Create Backup
            </Button>
          </div>
          <div className="grid gap-2">
            <Button variant="outline" size="sm">
              Optimize Database
            </Button>
            <Button variant="outline" size="sm">
              Clear Audit Logs (90+ days)
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
