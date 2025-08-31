'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PiggyBank, Landmark, Percent } from 'lucide-react'; // Icons for Savings, Loan, Interest
import { cn } from "@/lib/utils";

// Interface for member-specific dashboard data (placeholders for now)
interface MemberDashboardData {
    savingsBalance: number | null;
    loanBalance: number | null;
    interestAccrued: number | null; // Or whatever represents 'Interest Balance'
}

// Helper to format currency
const formatCurrency = (value: number | null | undefined): string => {
    if (value === null || value === undefined) return '--.--'; // Placeholder for loading/null
    // Add currency symbol (e.g., $) if desired
    return `₦${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

// Reusable Balance Card Component styled like the example
interface BalanceCardProps {
    title: string;
    value: string | number;
    icon: React.ElementType;
    description?: string;
    className?: string;
}

const BalanceCard: React.FC<BalanceCardProps> = ({ title, value, icon: Icon, description, className }) => (
    <Card className={cn("relative overflow-hidden border-border/40 hover:shadow-lg transition-shadow", className)}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
            <div className="p-2.5 rounded-lg bg-primary/10">
                <Icon className="h-5 w-5 text-primary" />
            </div>
        </CardHeader>
        <CardContent>
            <div className="text-3xl font-bold mb-2 text-foreground">
                {typeof value === 'number' ? formatCurrency(value) : value}
            </div>
            {description && (
                <p className="text-sm text-muted-foreground">{description}</p>
            )}
        </CardContent>
        <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.02] to-transparent pointer-events-none" />
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
                    interestAccrued: 1250.75
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
            {/* Page Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">Member Dashboard</h1>
                    <p className="text-muted-foreground">Your personal cooperative account overview</p>
                </div>
            </div>

            {/* Balance Cards */}
            <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-3">
                <BalanceCard
                    title="Total Savings Balance"
                    value={formatCurrency(data.savingsBalance)}
                    icon={PiggyBank}
                    description="Your current savings contribution total"
                />
                <BalanceCard
                    title="Outstanding Loan Balance"
                    value={formatCurrency(data.loanBalance)}
                    icon={Landmark}
                    description="Remaining balance on active loans"
                />
                <BalanceCard
                    title="Accrued Loan Interest"
                    value={formatCurrency(data.interestAccrued)}
                    icon={Percent}
                    description="Interest accumulated this period"
                />
            </div>

            {/* Quick Actions Section */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg font-semibold">Quick Actions</CardTitle>
                    <p className="text-sm text-muted-foreground">Access your most used features</p>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        <div className="flex items-center gap-3 p-4 border border-border/50 rounded-lg hover:bg-accent transition-colors cursor-pointer">
                            <div className="p-2 rounded-md bg-primary/10">
                                <PiggyBank className="h-4 w-4 text-primary" />
                            </div>
                            <div>
                                <p className="font-medium text-sm">View Contributions</p>
                                <p className="text-xs text-muted-foreground">History & details</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 p-4 border border-border/50 rounded-lg hover:bg-accent transition-colors cursor-pointer">
                            <div className="p-2 rounded-md bg-primary/10">
                                <Landmark className="h-4 w-4 text-primary" />
                            </div>
                            <div>
                                <p className="font-medium text-sm">Apply for Loan</p>
                                <p className="text-xs text-muted-foreground">New application</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 p-4 border border-border/50 rounded-lg hover:bg-accent transition-colors cursor-pointer">
                            <div className="p-2 rounded-md bg-primary/10">
                                <Percent className="h-4 w-4 text-primary" />
                            </div>
                            <div>
                                <p className="font-medium text-sm">View Transactions</p>
                                <p className="text-xs text-muted-foreground">Payment history</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 p-4 border border-border/50 rounded-lg hover:bg-accent transition-colors cursor-pointer">
                            <div className="p-2 rounded-md bg-primary/10">
                                <PiggyBank className="h-4 w-4 text-primary" />
                            </div>
                            <div>
                                <p className="font-medium text-sm">Update Profile</p>
                                <p className="text-xs text-muted-foreground">Personal details</p>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
} 