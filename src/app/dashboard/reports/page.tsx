'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  AreaChart,
  Users,
  CreditCard,
  HandCoins,
  ReceiptText,
  TrendingUp,
  FileText,
  Download,
  Calendar,
  Search,
  Filter,
  BarChart3,
  PieChart,
  LineChart,
  ShieldCheck,
  Building2,
  DollarSign,
  UserCheck,
  Timer
} from "lucide-react";

// Report categories and types
const reportCategories = [
  {
    title: "Member Reports",
    description: "Comprehensive member-related reporting",
    icon: Users,
    color: "bg-blue-500",
    reports: [
      { name: "All Members", path: "/dashboard/reports/members", icon: Users, description: "Complete member directory and details" },
      { name: "Guarantors", path: "/dashboard/reports/guarantors", icon: ShieldCheck, description: "Member guarantor relationships and status" },
      { name: "Members Contribution", path: "/dashboard/reports/member-contributions", icon: CreditCard, description: "Individual contribution history and summaries" },
    ]
  },
  {
    title: "Financial Reports", 
    description: "Financial performance and transaction analysis",
    icon: DollarSign,
    color: "bg-green-500",
    reports: [
      { name: "All Transaction Updates", path: "/dashboard/reports/transactions", icon: ReceiptText, description: "Complete transaction history and updates" },
      { name: "All Active Loan Records", path: "/dashboard/reports/loans", icon: HandCoins, description: "Current active loan portfolio" },
      { name: "Income and Expenditure", path: "/dashboard/reports/income-expenditure", icon: TrendingUp, description: "Financial income vs expenditure analysis" },
      { name: "House Scheme", path: "/dashboard/reports/house-scheme", icon: Building2, description: "Housing scheme participation and contributions" },
    ]
  },
  {
    title: "Analytics & Insights",
    description: "Data visualization and business intelligence", 
    icon: BarChart3,
    color: "bg-purple-500",
    reports: [
      { name: "Member Growth Trends", path: "/dashboard/reports/member-trends", icon: LineChart, description: "Member registration and growth patterns" },
      { name: "Loan Performance", path: "/dashboard/reports/loan-performance", icon: PieChart, description: "Loan approval rates and repayment analysis" },
      { name: "Contribution Trends", path: "/dashboard/reports/contribution-trends", icon: AreaChart, description: "Monthly contribution patterns and forecasts" },
    ]
  }
];

// Quick stats data
const quickStats = [
  { title: "Total Members", value: "1,247", icon: Users, color: "text-blue-600", bgColor: "bg-blue-50" },
  { title: "Active Loans", value: "189", icon: HandCoins, color: "text-green-600", bgColor: "bg-green-50" },
  { title: "Monthly Contributions", value: "₦6,235,000", icon: CreditCard, color: "text-purple-600", bgColor: "bg-purple-50" },
  { title: "Total Savings", value: "₦45,680,000", icon: TrendingUp, color: "text-orange-600", bgColor: "bg-orange-50" },
];

export default function ReportsPage() {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredCategories = reportCategories.map(category => ({
    ...category,
    reports: category.reports.filter(report => 
      report.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.description.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })).filter(category => category.reports.length > 0);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Reports & Analytics</h1>
          <p className="text-muted-foreground">
            Comprehensive reporting dashboard for all cooperative activities
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <Calendar className="h-4 w-4 mr-2" />
            Date Range
          </Button>
          <Button variant="outline">
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </Button>
          <Button>
            <Download className="h-4 w-4 mr-2" />
            Export All
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {quickStats.map((stat, index) => (
          <Card key={index} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-full ${stat.bgColor}`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search reports..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              Advanced Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Report Categories */}
      {filteredCategories.map((category, categoryIndex) => (
        <Card key={categoryIndex}>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${category.color} text-white`}>
                <category.icon className="h-5 w-5" />
              </div>
              <div>
                <CardTitle>{category.title}</CardTitle>
                <CardDescription>{category.description}</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {category.reports.map((report, reportIndex) => (
                <Link key={reportIndex} href={report.path}>
                  <Card className="h-full hover:shadow-lg transition-all duration-200 border-2 border-transparent hover:border-primary/20 cursor-pointer group">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-lg bg-muted group-hover:bg-primary/10 transition-colors">
                          <report.icon className="h-5 w-5 text-muted-foreground group-hover:text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-sm group-hover:text-primary transition-colors">
                            {report.name}
                          </h4>
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                            {report.description}
                          </p>
                        </div>
                      </div>
                      <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                        <span>Click to view report</span>
                        <FileText className="h-3 w-3" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Recent Report Activity</CardTitle>
              <CardDescription>Latest report generations and exports</CardDescription>
            </div>
            <Button variant="outline" size="sm">
              <Timer className="h-4 w-4 mr-2" />
              View All
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { report: "Members Contribution Report", user: "Admin User", time: "2 minutes ago", type: "Export" },
              { report: "Active Loan Records", user: "System", time: "15 minutes ago", type: "Generated" },
              { report: "Guarantors Report", user: "Manager", time: "1 hour ago", type: "Viewed" },
              { report: "Income and Expenditure", user: "Admin User", time: "2 hours ago", type: "Export" },
            ].map((activity, index) => (
              <div key={index} className="flex items-center gap-4 p-3 rounded-lg bg-muted/50">
                <div className="p-2 rounded-full bg-background">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm">{activity.report}</p>
                  <p className="text-xs text-muted-foreground">
                    {activity.type} by {activity.user} • {activity.time}
                  </p>
                </div>
                <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                  activity.type === 'Export' ? 'bg-green-100 text-green-700' :
                  activity.type === 'Generated' ? 'bg-blue-100 text-blue-700' :
                  'bg-gray-100 text-gray-700'
                }`}>
                  {activity.type}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Help Section */}
      <Card className="border-dashed">
        <CardContent className="p-6 text-center">
          <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">Need Custom Reports?</h3>
          <p className="text-muted-foreground mb-4">
            Can't find the report you're looking for? Request custom reports or schedule automated reports.
          </p>
          <div className="flex items-center justify-center gap-2">
            <Button variant="outline">
              Request Custom Report
            </Button>
            <Button>
              Schedule Reports
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
