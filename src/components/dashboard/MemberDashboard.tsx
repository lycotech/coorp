'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  PiggyBank, 
  Landmark, 
  Percent, 
  TrendingUp, 
  ArrowUpRight,
  Calendar,
  CreditCard,
  Users,
  FileText,
  Settings,
  ChevronRight,
  Activity
} from 'lucide-react'; 
import { cn } from "@/lib/utils";
import Link from 'next/link';

// Interface for member-specific dashboard data (placeholders for now)
interface MemberDashboardData {
    savingsBalance: number | null;
    loanBalance: number | null;
    interestAccrued: number | null;
    monthlyContribution: number | null;
    lastTransactionDate: string | null;
    memberSince: string | null;
    contributionStreak: number | null;
}

// Helper to format currency
const formatCurrency = (value: number | null | undefined): string => {
    if (value === null || value === undefined) return '--.--';
    return `₦${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

// Enhanced Balance Card Component with gradients and animations
interface BalanceCardProps {
    title: string;
    value: string | number;
    icon: React.ElementType;
    description?: string;
    change?: string;
    changeType?: 'positive' | 'negative' | 'neutral';
    gradient: string;
    iconBg: string;
}

const BalanceCard: React.FC<BalanceCardProps> = ({ 
  title, 
  value, 
  icon: Icon, 
  description, 
  change, 
  changeType = 'neutral',
  gradient,
  iconBg
}) => (
    <Card className={cn(
      "relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] group",
      gradient
    )}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
            <CardTitle className="text-sm font-medium text-white/90">{title}</CardTitle>
            <div className={cn("p-3 rounded-xl shadow-lg", iconBg)}>
                <Icon className="h-5 w-5 text-white" />
            </div>
        </CardHeader>
        <CardContent className="relative z-10">
            <div className="text-3xl font-bold mb-2 text-white">
                {typeof value === 'number' ? formatCurrency(value) : value}
            </div>
            <div className="flex items-center justify-between">
                {description && (
                    <p className="text-sm text-white/80">{description}</p>
                )}
                {change && (
                    <Badge variant="secondary" className={cn(
                      "text-xs",
                      changeType === 'positive' && "bg-green-500/20 text-green-300 border-green-500/30",
                      changeType === 'negative' && "bg-red-500/20 text-red-300 border-red-500/30",
                      changeType === 'neutral' && "bg-white/20 text-white/80 border-white/30"
                    )}>
                        {change}
                    </Badge>
                )}
            </div>
        </CardContent>
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
        <div className="absolute -bottom-4 -right-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Icon className="h-24 w-24" />
        </div>
    </Card>
);

export default function MemberDashboard() {
    const [data, setData] = useState<MemberDashboardData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            setError(null);
            try {
                // TODO: Replace with actual API endpoint for member summary
                // const response = await fetch('/api/dashboard/member-summary');
                // if (!response.ok) throw new Error('Failed to fetch member data');
                // const result: MemberDashboardData = await response.json();

                // --- Placeholder Data --- 
                await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate fetch delay
                const result: MemberDashboardData = {
                    savingsBalance: 360896.50,
                    loanBalance: 150000.00,
                    interestAccrued: 1250.75,
                    monthlyContribution: 25000.00,
                    lastTransactionDate: "2025-08-28",
                    memberSince: "2022-03-15",
                    contributionStreak: 18
                };
                // --- End Placeholder --- 

                setData(result);
            } catch (err) {
                console.error("Fetch member dashboard data error:", err);
                setError(err instanceof Error ? err.message : "An unknown error occurred");
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, []);

    // Render Logic
    if (isLoading) {
        // Basic text loader, replace with skeleton cards if preferred
        return <div>Loading member dashboard...</div>;
    }

    if (error) {
        return <div className="text-red-600">Error loading member dashboard: {error}</div>;
    }

    if (!data) {
        return <div>No data available.</div>; // Handle case where data is null after loading
    }

    return (
        <div className="space-y-8 p-1">
            {/* Enhanced Page Header with Member Stats */}
            <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-primary/10 rounded-2xl" />
                <div className="relative p-8 rounded-2xl">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
                                Member Dashboard
                            </h1>
                            <p className="text-muted-foreground text-lg mt-2">Welcome back! Here's your cooperative account overview</p>
                        </div>
                        <div className="flex items-center gap-4">
                            <Badge variant="outline" className="px-4 py-2 text-sm">
                                <Calendar className="h-4 w-4 mr-2" />
                                Member since {data.memberSince ? new Date(data.memberSince).getFullYear() : 'N/A'}
                            </Badge>
                            <Badge variant="secondary" className="px-4 py-2 text-sm bg-green-100 text-green-800 border-green-200">
                                <TrendingUp className="h-4 w-4 mr-2" />
                                {data.contributionStreak} months streak
                            </Badge>
                        </div>
                    </div>
                </div>
            </div>

            {/* Enhanced Balance Cards with Gradients */}
            <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-3">
                <BalanceCard
                    title="Total Savings Balance"
                    value={formatCurrency(data.savingsBalance)}
                    icon={PiggyBank}
                    description="Your accumulated contributions"
                    change="+12.5% this month"
                    changeType="positive"
                    gradient="bg-gradient-emerald"
                    iconBg="bg-green-700/30"
                />
                <BalanceCard
                    title="Outstanding Loan Balance"
                    value={formatCurrency(data.loanBalance)}
                    icon={Landmark}
                    description="Remaining balance on active loans"
                    change="-₦5,000 this month"
                    changeType="positive"
                    gradient="bg-gradient-blue"
                    iconBg="bg-blue-700/30"
                />
                <BalanceCard
                    title="Monthly Contribution"
                    value={formatCurrency(data.monthlyContribution)}
                    icon={TrendingUp}
                    description="Your current monthly contribution"
                    change="Consistent"
                    changeType="neutral"
                    gradient="bg-gradient-purple"
                    iconBg="bg-purple-700/30"
                />
            </div>

            {/* Quick Actions Section - Enhanced */}
            <div className="grid gap-6 lg:grid-cols-3">
                <div className="lg:col-span-2">
                    <Card className="border-0 shadow-lg">
                        <CardHeader className="pb-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle className="text-xl font-semibold flex items-center gap-2">
                                        <Activity className="h-5 w-5 text-primary" />
                                        Quick Actions
                                    </CardTitle>
                                    <p className="text-sm text-muted-foreground mt-1">Access your most used features</p>
                                </div>
                                <Button variant="ghost" size="sm">
                                    View All
                                    <ArrowUpRight className="h-4 w-4 ml-1" />
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-4 md:grid-cols-2">
                                <Link href="/dashboard/member-contributions">
                                    <div className="group flex items-center gap-4 p-4 border border-border/50 rounded-xl hover:bg-accent/50 transition-all duration-200 hover:scale-[1.02] hover:shadow-md cursor-pointer">
                                        <div className="p-3 rounded-lg bg-green-100 group-hover:bg-green-200 transition-colors">
                                            <PiggyBank className="h-5 w-5 text-green-600" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-medium text-sm">View Contributions</p>
                                            <p className="text-xs text-muted-foreground">History & monthly details</p>
                                        </div>
                                        <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                                    </div>
                                </Link>
                                
                                <Link href="/dashboard/loan/apply">
                                    <div className="group flex items-center gap-4 p-4 border border-border/50 rounded-xl hover:bg-accent/50 transition-all duration-200 hover:scale-[1.02] hover:shadow-md cursor-pointer">
                                        <div className="p-3 rounded-lg bg-blue-100 group-hover:bg-blue-200 transition-colors">
                                            <Landmark className="h-5 w-5 text-blue-600" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-medium text-sm">Apply for Loan</p>
                                            <p className="text-xs text-muted-foreground">Submit new application</p>
                                        </div>
                                        <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                                    </div>
                                </Link>
                                
                                <Link href="/dashboard/member-transactions">
                                    <div className="group flex items-center gap-4 p-4 border border-border/50 rounded-xl hover:bg-accent/50 transition-all duration-200 hover:scale-[1.02] hover:shadow-md cursor-pointer">
                                        <div className="p-3 rounded-lg bg-purple-100 group-hover:bg-purple-200 transition-colors">
                                            <CreditCard className="h-5 w-5 text-purple-600" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-medium text-sm">Transaction History</p>
                                            <p className="text-xs text-muted-foreground">View payment records</p>
                                        </div>
                                        <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                                    </div>
                                </Link>
                                
                                <Link href="/dashboard/personal/details">
                                    <div className="group flex items-center gap-4 p-4 border border-border/50 rounded-xl hover:bg-accent/50 transition-all duration-200 hover:scale-[1.02] hover:shadow-md cursor-pointer">
                                        <div className="p-3 rounded-lg bg-orange-100 group-hover:bg-orange-200 transition-colors">
                                            <Settings className="h-5 w-5 text-orange-600" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-medium text-sm">Update Profile</p>
                                            <p className="text-xs text-muted-foreground">Personal information</p>
                                        </div>
                                        <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                                    </div>
                                </Link>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Recent Activity Sidebar */}
                <Card className="border-0 shadow-lg">
                    <CardHeader className="pb-4">
                        <CardTitle className="text-lg font-semibold flex items-center gap-2">
                            <FileText className="h-4 w-4 text-primary" />
                            Recent Activity
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-green-100">
                                    <PiggyBank className="h-4 w-4 text-green-600" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium">Monthly contribution</p>
                                    <p className="text-xs text-muted-foreground">3 days ago</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-blue-100">
                                    <Landmark className="h-4 w-4 text-blue-600" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium">Loan repayment</p>
                                    <p className="text-xs text-muted-foreground">1 week ago</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-orange-100">
                                    <Settings className="h-4 w-4 text-orange-600" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium">Profile updated</p>
                                    <p className="text-xs text-muted-foreground">2 weeks ago</p>
                                </div>
                            </div>
                        </div>
                        <Button variant="ghost" size="sm" className="w-full mt-4">
                            View All Activity
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
} 