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
    <Card className={cn("bg-gray-900 text-white border-gray-700 shadow-lg", className)}> {/* Dark theme card */}
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">{title}</CardTitle>
            <Icon className="h-5 w-5 text-purple-400" /> {/* Accent icon color */}
        </CardHeader>
        <CardContent>
            <div className="text-3xl font-bold mb-1">{typeof value === 'number' ? formatCurrency(value) : value}</div>
            {description && (
                <p className="text-xs text-gray-400">{description}</p>
            )}
        </CardContent>
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
        <div>
            <h1 className="text-2xl font-semibold mb-6">Your Dashboard</h1>

            {/* 3-Card Layout */}
            <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-3 mb-6">
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

            {/* Add other member-specific components below */}
            {/* Example: Recent Transactions List, Quick Actions, etc. */}

        </div>
    );
} 