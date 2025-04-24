"use client";

import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";

interface Contribution {
  id: number;
  transaction_date: string;
  amount: number;
  description: string;
  status: string;
  reference_no: string;
}

export default function ContributionHistoryPage() {
  const [contributions, setContributions] = useState<Contribution[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchContributions = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/members/contributions/history");
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch contributions");
      }
      
      const data = await response.json();
      setContributions(data.contributions);
    } catch (err: unknown) {
      console.error("Error fetching contributions:", err);
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch contribution history";
      setError(errorMessage);
      toast.error("Failed to fetch contributions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContributions();
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'rejected':
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Contribution History</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center space-x-4">
                <Skeleton className="h-4 w-[20%]" />
                <Skeleton className="h-4 w-[15%]" />
                <Skeleton className="h-4 w-[30%]" />
                <Skeleton className="h-4 w-[15%]" />
                <Skeleton className="h-4 w-[10%]" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <p className="text-red-500 mb-4">{error}</p>
            <Button onClick={fetchContributions}>Retry</Button>
          </div>
        ) : contributions.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">No contribution records found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Reference</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {contributions.map((contribution) => (
                  <TableRow key={contribution.id}>
                    <TableCell className="font-medium">
                      {formatDate(contribution.transaction_date)}
                    </TableCell>
                    <TableCell>{contribution.reference_no}</TableCell>
                    <TableCell>{contribution.description}</TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(contribution.amount)}
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(contribution.status)}>
                        {contribution.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 