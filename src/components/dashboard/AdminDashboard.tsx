'use client'; // Mark as client component for hooks

import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Wallet, // Total Savings
  ShoppingCart, // Total Commodity
  Users, // Total Membership
  UserCheck, // Total Applicant
} from 'lucide-react';

// Helper component for summary cards (copied from original page.tsx)
interface SummaryCardProps {
  title: string;
  value: string | number;
  icon: React.ElementType;
  iconColor?: string;
}

const SummaryCard: React.FC<SummaryCardProps> = ({ title, value, icon: Icon, iconColor = 'bg-primary/10' }) => (
  <Card className="relative overflow-hidden">
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
      <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
      <div className={`p-2.5 rounded-lg ${iconColor} ring-1 ring-border/5`}>
         <Icon className="h-4 w-4 text-primary" />
      </div>
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold text-foreground mb-1">{value}</div>
      <div className="text-xs text-muted-foreground">Updated recently</div>
    </CardContent>
    <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.02] to-transparent pointer-events-none" />
  </Card>
);

// Helper component for loan status bars (copied from original page.tsx)
interface LoanStatusProps {
  label: string;
  value: number;
  percentage: number;
}

const LoanStatus: React.FC<LoanStatusProps> = ({ label, value, percentage }) => (
  <div className="mb-4">
    <div className="flex justify-between text-sm mb-2">
      <span className="font-medium text-foreground">{`${label} (${value})`}</span>
      <span className="text-muted-foreground">{percentage}%</span>
    </div>
    <Progress value={percentage} className="h-2.5" />
  </div>
);

// Interface for fetched dashboard data (copied from original page.tsx)
interface DashboardData {
    totalSavings: number | null;
    totalCommodity: number | null;
    totalActiveMembers: number;
    totalApplicants: number;
    loanCounts: {
        total: number;
        declined: number;
        pending: number;
        active: number;
    };
    memberLoanStats: {
        totalActiveMembers: number;
        membersOnActiveLoan: number;
    };
}

// Helper to safely calculate percentage (copied from original page.tsx)
const calculatePercentage = (part: number, total: number): number => {
    if (total === 0) return 0;
    return Math.round((part / total) * 100);
}

// Helper to format currency (copied from original page.tsx)
const formatCurrency = (value: number | null | undefined): string => {
    if (value === null || value === undefined) return '0.00';
    return value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// This is now the Admin Dashboard Component
export default function AdminDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch('/api/dashboard/summary'); // Admin summary endpoint
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to fetch admin dashboard data');
        }
        const result: DashboardData = await response.json();
        setData(result);
      } catch (err) {
        console.error("Fetch admin dashboard data error:", err);
        setError(err instanceof Error ? err.message : "An unknown error occurred");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Prepare data for components (using data state)
  const summaryData = data ? [
    { title: "Total Savings", value: formatCurrency(data.totalSavings), icon: Wallet, iconColor: "bg-purple-100" },
    { title: "Total Commodity", value: formatCurrency(data.totalCommodity), icon: ShoppingCart, iconColor: "bg-cyan-100" },
    { title: "Total Membership", value: data.totalActiveMembers, icon: Users, iconColor: "bg-orange-100" },
    { title: "Total Applicant", value: data.totalApplicants, icon: UserCheck, iconColor: "bg-red-100" },
  ] : Array(4).fill(null); // Placeholder for loading state

  const loanSummary = data ? {
    totalLoan: {
        value: data.loanCounts.total,
        percentage: 100
    },
    declined: {
        value: data.loanCounts.declined,
        percentage: calculatePercentage(data.loanCounts.declined, data.loanCounts.total)
    },
    pending: {
        value: data.loanCounts.pending,
        percentage: calculatePercentage(data.loanCounts.pending, data.loanCounts.total)
    },
    active: {
        value: data.loanCounts.active,
        percentage: calculatePercentage(data.loanCounts.active, data.loanCounts.total)
    },
    membersOnLoan: {
        value: data.memberLoanStats.membersOnActiveLoan,
        percentage: calculatePercentage(data.memberLoanStats.membersOnActiveLoan, data.memberLoanStats.totalActiveMembers)
    },
    membersWithoutLoan: {
        value: data.memberLoanStats.totalActiveMembers - data.memberLoanStats.membersOnActiveLoan,
        percentage: calculatePercentage(
            data.memberLoanStats.totalActiveMembers - data.memberLoanStats.membersOnActiveLoan,
            data.memberLoanStats.totalActiveMembers
        )
    },
  } : { // Default values for loading
    totalLoan: { value: 0, percentage: 0 },
    declined: { value: 0, percentage: 0 },
    pending: { value: 0, percentage: 0 },
    active: { value: 0, percentage: 0 },
    membersOnLoan: { value: 0, percentage: 0 },
    membersWithoutLoan: { value: 0, percentage: 0 },
  };

  const memberStatusLegend = [
    { color: "bg-blue-400", label: "Pending Members" },
    { color: "bg-red-500", label: "Suspended Members" },
    { color: "bg-green-500", label: "Active Members" },
    { color: "bg-cyan-500", label: "Closed Members" },
    { color: "bg-orange-400", label: "Declined Members" },
  ];

  // Render Logic
  if (isLoading) {
    // You might want a more sophisticated skeleton loader here
    return <div>Loading admin dashboard...</div>;
  }

  if (error) {
    return <div className="text-red-600">Error loading admin dashboard: {error}</div>;
  }

  console.log("AdminDashboard: Rendering UI with fetched data:", data);

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Admin Dashboard</h1>
          <p className="text-muted-foreground">Overview of cooperative activities and member statistics</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {summaryData.map((item, index) => (
          item ? (
            <SummaryCard key={index} {...item} />
          ) : (
            <Card key={index} className="animate-pulse">
              <CardContent className="pt-6 h-24">
                <div className="bg-muted rounded-md h-full"></div>
              </CardContent>
            </Card>
          )
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Switch Member & Status Legend */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Member Management</CardTitle>
            <p className="text-sm text-muted-foreground">Switch to member view or check member statuses</p>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Switch Member Section */}
            <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
              <Input 
                placeholder="Enter Staff Number" 
                className="max-w-xs bg-background border-border" 
              />
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm">
                Switch to Member
              </Button>
            </div>
            
            {/* Member Status Legend */}
            <div className="space-y-3">
              <h4 className="font-medium text-foreground">Member Status Legend</h4>
              <div className="grid grid-cols-2 gap-2">
                {memberStatusLegend.map((item, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm">
                    <span className={`w-3 h-3 rounded-sm ${item.color}`}></span>
                    <span className="text-muted-foreground">{item.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Loan Summary Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Loan Overview</CardTitle>
            <p className="text-sm text-muted-foreground">Current loan statistics</p>
          </CardHeader>
          <CardContent>
             <LoanStatus label="Total Loans" {...loanSummary.totalLoan} />
             <LoanStatus label="Declined" {...loanSummary.declined} />
             <LoanStatus label="Pending" {...loanSummary.pending} />
             <LoanStatus label="Active" {...loanSummary.active} />
             <LoanStatus label="Members on Loan" {...loanSummary.membersOnLoan} />
             <LoanStatus label="Members without Loan" {...loanSummary.membersWithoutLoan} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 