"use client";

import { Card } from "@/components/ui/card";
import { Users, Shield, Activity, TrendingUp } from "lucide-react";
import { motion } from "motion/react";

const stats = [
  {
    title: "Total Users",
    value: "2,345",
    change: "+12.5%",
    icon: Users,
    color: "from-blue-500 to-cyan-500",
  },
  {
    title: "Active Roles",
    value: "8",
    change: "+2",
    icon: Shield,
    color: "from-purple-500 to-pink-500",
  },
  {
    title: "Sessions Today",
    value: "1,234",
    change: "+8.2%",
    icon: Activity,
    color: "from-green-500 to-emerald-500",
  },
  {
    title: "System Health",
    value: "98.5%",
    change: "+0.5%",
    icon: TrendingUp,
    color: "from-orange-500 to-red-500",
  },
];

export default function AdminDashboard() {
  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Welcome to the admin panel. Monitor your system at a glance.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="p-6 border-2 hover:border-accent/50 transition-colors">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      {stat.title}
                    </p>
                    <p className="text-2xl font-bold mt-2">{stat.value}</p>
                    <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                      {stat.change}
                    </p>
                  </div>
                  <div
                    className={`h-12 w-12 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center`}
                  >
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                </div>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <Card className="p-6 border-2">
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="p-4 border-2 border-dashed border-border rounded-lg hover:border-accent/50 hover:bg-accent/5 transition-colors text-left">
            <Users className="h-5 w-5 mb-2" />
            <h3 className="font-medium">Add User</h3>
            <p className="text-sm text-muted-foreground">
              Create a new user account
            </p>
          </button>
          <button className="p-4 border-2 border-dashed border-border rounded-lg hover:border-accent/50 hover:bg-accent/5 transition-colors text-left">
            <Shield className="h-5 w-5 mb-2" />
            <h3 className="font-medium">Create Role</h3>
            <p className="text-sm text-muted-foreground">
              Define a new custom role
            </p>
          </button>
          <button className="p-4 border-2 border-dashed border-border rounded-lg hover:border-accent/50 hover:bg-accent/5 transition-colors text-left">
            <Activity className="h-5 w-5 mb-2" />
            <h3 className="font-medium">View Logs</h3>
            <p className="text-sm text-muted-foreground">
              Check system activity
            </p>
          </button>
        </div>
      </Card>
    </div>
  );
}
