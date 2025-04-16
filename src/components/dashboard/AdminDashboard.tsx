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
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      <div className={`p-2 rounded-md ${iconColor}`}>
         <Icon className="h-4 w-4 text-muted-foreground" />
      </div>
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
    </CardContent>
  </Card>
);

// Helper component for loan status bars (copied from original page.tsx)
interface LoanStatusProps {
  label: string;
  value: number;
  percentage: number;
}

const LoanStatus: React.FC<LoanStatusProps> = ({ label, value, percentage }) => (
  <div className="mb-3">
    <div className="flex justify-between text-sm mb-1">
      <span>{`${label} (${value})`}</span>
      <span>{percentage}%</span>
    </div>
    <Progress value={percentage} className="h-2" />
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
    <div>
      <h1 className="text-2xl font-semibold mb-6">Admin Home</h1>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
        {summaryData.map((item, index) => (
          item ? <SummaryCard key={index} {...item} /> : <Card key={index}><CardContent className="pt-6 h-24 animate-pulse bg-muted rounded-md"></CardContent></Card> // Skeleton
        ))}
      </div>

      {/* Middle Section: Switch Member & Loan Summary */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-6">
        {/* Switch Member Card */}
        <Card className="lg:col-span-2">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-4 mb-6">
              <Input placeholder="Staff Number" className="max-w-xs" />
              <Button className="bg-purple-600 hover:bg-purple-700 text-white">
                Switch to member
              </Button>
            </div>
            {/* Member Status Legend */}
            <div>
              {memberStatusLegend.map((item, index) => (
                <div key={index} className="flex items-center space-x-2 text-sm mb-1">
                  <span className={`inline-block w-3 h-3 ${item.color}`}></span>
                  <span>{item.label}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Loan Summary Card */}
        <Card>
          <CardContent className="pt-6">
             <LoanStatus label="Total Loan" {...loanSummary.totalLoan} />
             <LoanStatus label="Total Loan Declined" {...loanSummary.declined} />
             <LoanStatus label="Total Loan Pending" {...loanSummary.pending} />
             <LoanStatus label="Total Loan Active" {...loanSummary.active} />
             <LoanStatus label="Total Members on Loan" {...loanSummary.membersOnLoan} />
             <LoanStatus label="Total Members without Loan" {...loanSummary.membersWithoutLoan} />
          </CardContent>
        </Card>
      </div>

      {/* Add other admin-specific components/charts here */}
    </div>
  );
} 