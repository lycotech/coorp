'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  PiggyBank, 
  Landmark, 
  TrendingUp, 
  ArrowUpRight,
  Calendar,
  CreditCard,
  Settings,
  Star,
  Zap,
  Trophy,
  Target,
  Heart,
  Gift,
  Sparkles
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

// Vibrant Balance Card Component with modern gradients
interface BalanceCardProps {
    title: string;
    value: string | number;
    icon: React.ElementType;
    description?: string;
    change?: string;
    changeType?: 'positive' | 'negative' | 'neutral';
    gradient: string;
    iconColor: string;
}

const BalanceCard: React.FC<BalanceCardProps> = ({ 
  title, 
  value, 
  icon: Icon, 
  description, 
  change, 
  changeType = 'neutral',
  gradient,
  iconColor
}) => (
    <Card className={cn(
      "relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 group cursor-pointer",
      gradient
    )}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 relative z-10">
            <CardTitle className="text-sm font-medium text-white/90">{title}</CardTitle>
            <div className={cn("p-3 rounded-full shadow-md", iconColor)}>
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
                      "text-xs border-0 shadow-sm",
                      changeType === 'positive' && "bg-emerald-500/20 text-emerald-100",
                      changeType === 'negative' && "bg-rose-500/20 text-rose-100",
                      changeType === 'neutral' && "bg-white/20 text-white/90"
                    )}>
                        {change}
                    </Badge>
                )}
            </div>
        </CardContent>
        {/* Decorative elements */}
        <div className="absolute top-4 right-4 opacity-10">
            <Icon className="h-16 w-16" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />
    </Card>
);

// Action Card Component
interface ActionCardProps {
    title: string;
    description: string;
    icon: React.ElementType;
    href: string;
    color: string;
    bgColor: string;
}

const ActionCard: React.FC<ActionCardProps> = ({ title, description, icon: Icon, href, color, bgColor }) => (
    <Link href={href}>
        <Card className="border-0 shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-102 group cursor-pointer bg-white">
            <CardContent className="p-6">
                <div className="flex items-center gap-4">
                    <div className={cn("p-3 rounded-xl", bgColor)}>
                        <Icon className={cn("h-6 w-6", color)} />
                    </div>
                    <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 group-hover:text-primary transition-colors">{title}</h3>
                        <p className="text-sm text-gray-600 mt-1">{description}</p>
                    </div>
                    <ArrowUpRight className="h-4 w-4 text-gray-400 group-hover:text-primary transition-colors" />
                </div>
            </CardContent>
        </Card>
    </Link>
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
        <div className="space-y-8">
            {/* Welcome Header with Stats */}
            <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 to-purple-600/5 rounded-3xl"></div>
                <div className="relative p-8 rounded-3xl">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                Welcome Back! 👋
                            </h1>
                            <p className="text-gray-600 text-lg mt-2">Here's your cooperative journey at a glance</p>
                        </div>
                        <div className="flex items-center gap-4">
                            <Badge variant="outline" className="px-4 py-2 text-sm border-blue-200 text-blue-700">
                                <Calendar className="h-4 w-4 mr-2" />
                                Member since {data.memberSince ? new Date(data.memberSince).getFullYear() : 'N/A'}
                            </Badge>
                            <Badge className="px-4 py-2 text-sm bg-gradient-to-r from-emerald-500 to-green-500 text-white">
                                <Trophy className="h-4 w-4 mr-2" />
                                {data.contributionStreak} months streak
                            </Badge>
                        </div>
                    </div>
                </div>
            </div>

            {/* Balance Cards with Vibrant Gradients */}
            <div className="grid gap-6 md:grid-cols-3">
                <BalanceCard
                    title="💰 Savings Balance"
                    value={formatCurrency(data.savingsBalance)}
                    icon={PiggyBank}
                    description="Your total savings"
                    change="+12.5% this month"
                    changeType="positive"
                    gradient="bg-gradient-to-br from-emerald-500 to-green-600"
                    iconColor="bg-emerald-600/20"
                />
                <BalanceCard
                    title="🏦 Active Loans"
                    value={formatCurrency(data.loanBalance)}
                    icon={Landmark}
                    description="Outstanding balance"
                    change="-₦5,000 paid"
                    changeType="positive"
                    gradient="bg-gradient-to-br from-blue-500 to-indigo-600"
                    iconColor="bg-blue-600/20"
                />
                <BalanceCard
                    title="📈 Monthly Goal"
                    value={formatCurrency(data.monthlyContribution)}
                    icon={Target}
                    description="Your contribution target"
                    change="On track"
                    changeType="neutral"
                    gradient="bg-gradient-to-br from-purple-500 to-pink-600"
                    iconColor="bg-purple-600/20"
                />
            </div>

            {/* Quick Actions - Fun and Colorful */}
            <div className="grid gap-6 lg:grid-cols-3">
                <div className="lg:col-span-2">
                    <Card className="border-0 shadow-lg bg-white">
                        <CardHeader className="pb-6">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-gradient-to-r from-orange-400 to-pink-400">
                                    <Zap className="h-5 w-5 text-white" />
                                </div>
                                <div>
                                    <CardTitle className="text-xl font-bold text-gray-900">Quick Actions</CardTitle>
                                    <p className="text-gray-600">Get things done faster</p>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-4 md:grid-cols-2">
                                <ActionCard
                                    title="View Contributions"
                                    description="Check your savings history"
                                    icon={PiggyBank}
                                    href="/dashboard/member-contributions"
                                    color="text-emerald-600"
                                    bgColor="bg-emerald-50"
                                />
                                <ActionCard
                                    title="Apply for Loan"
                                    description="Quick loan application"
                                    icon={Landmark}
                                    href="/dashboard/loan"
                                    color="text-blue-600"
                                    bgColor="bg-blue-50"
                                />
                                <ActionCard
                                    title="Transaction History"
                                    description="View all transactions"
                                    icon={CreditCard}
                                    href="/dashboard/transactions"
                                    color="text-purple-600"
                                    bgColor="bg-purple-50"
                                />
                                <ActionCard
                                    title="Update Profile"
                                    description="Manage your information"
                                    icon={Settings}
                                    href="/dashboard/personal/details"
                                    color="text-orange-600"
                                    bgColor="bg-orange-50"
                                />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Member Achievements & Activity */}
                <div className="space-y-6">
                    <Card className="border-0 shadow-lg bg-gradient-to-br from-yellow-50 to-orange-50">
                        <CardHeader>
                            <CardTitle className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                <Star className="h-5 w-5 text-yellow-500" />
                                Achievements
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-full bg-yellow-100">
                                        <Trophy className="h-4 w-4 text-yellow-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium">Consistent Saver</p>
                                        <p className="text-xs text-gray-600">18 months streak</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-full bg-pink-100">
                                        <Heart className="h-4 w-4 text-pink-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium">Community Helper</p>
                                        <p className="text-xs text-gray-600">Active member</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-full bg-blue-100">
                                        <Gift className="h-4 w-4 text-blue-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium">Goal Crusher</p>
                                        <p className="text-xs text-gray-600">Target achieved</p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-indigo-50">
                        <CardHeader>
                            <CardTitle className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                <Sparkles className="h-5 w-5 text-blue-500" />
                                Recent Activity
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3 text-sm">
                                <div className="flex items-center gap-3">
                                    <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                                    <span>Monthly contribution received</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                                    <span>Loan payment processed</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                                    <span>Profile updated successfully</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
} 