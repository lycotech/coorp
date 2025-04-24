'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Card, 
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";

// Types
interface LoanDetail {
  id: number;
  ref_no: string;
  staff_no: string;
  reg_no: string;
  transaction_type_id: number;
  loan_type: string;
  amount_requested: number;
  monthly_repayment: number;
  repayment_period: number;
  interest_rate: number;
  purpose: string;
  status: string;
  date_applied: string;
  date_approved: string | null;
  next_repayment_date: string | null;
  remaining_balance: number | null;
  rejection_reason: string | null;
  guarantors: Guarantor[];
}

interface Guarantor {
  id: number;
  ref_no: string;
  applicant_reg_no: string;
  guarantor_staff_no: string;
  guarantor_name: string;
  guaranteed_amount: number;
  status: string;
  request_date: string;
  response_date: string | null;
  guarantor_comment: string | null;
}

export default function LoanDetailPage({ params }: { params: { loanRef: string } }) {
  const [loan, setLoan] = useState<LoanDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { loanRef } = params;

  // Fetch loan details
  useEffect(() => {
    fetchLoanDetails();
  }, [loanRef]);

  const fetchLoanDetails = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/loans/member?ref=${loanRef}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch loan details');
      }
      const data = await response.json();
      const loanData = data.loans?.find((loan: LoanDetail) => loan.ref_no === loanRef);
      
      if (!loanData) {
        throw new Error('Loan not found');
      }
      
      setLoan(loanData);
    } catch (error) {
      console.error("Error fetching loan details:", error);
      const message = error instanceof Error ? error.message : "An error occurred";
      setError(message);
      toast.error("Error", { description: message });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle authentication errors
  useEffect(() => {
    if (error && (error.includes('session') || error.includes('login') || error.includes('credentials') || error.includes('token'))) {
      // Session related error, redirect to login
      toast.error("Authentication Required", { description: "Please login again to continue" });
      router.push('/login');
    }
  }, [error, router]);

  // Format currency
  const formatCurrency = (amount: number | null) => {
    if (amount === null) return '₦0.00';
    return new Intl.NumberFormat('en-NG', { 
      style: 'currency', 
      currency: 'NGN',
      minimumFractionDigits: 2
    }).format(amount);
  };

  // Format date
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-NG', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  // Status badge color mapper
  const getStatusBadgeColor = (status: string) => {
    const statusMap: Record<string, string> = {
      'Approved': 'bg-green-100 text-green-800',
      'Declined': 'bg-red-100 text-red-800',
      'Pending': 'bg-yellow-100 text-yellow-800',
      'Closed': 'bg-gray-100 text-gray-800',
      'Active': 'bg-blue-100 text-blue-800'
    };
    return statusMap[status] || 'bg-gray-100 text-gray-800';
  };

  // Calculate total amount to repay
  const calculateTotalRepayment = () => {
    if (!loan) return '₦0.00';
    const monthlyRepayment = loan.monthly_repayment || 0;
    const repaymentPeriod = loan.repayment_period || 0;
    return formatCurrency(monthlyRepayment * repaymentPeriod);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="text-lg font-semibold">Loading loan details...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center space-y-4">
          <div className="text-lg font-semibold text-red-500">{error}</div>
          {error.includes('session') || error.includes('login') || error.includes('credentials') || error.includes('token') ? (
            <Button 
              variant="default" 
              onClick={() => router.push('/login')}
            >
              Go to Login
            </Button>
          ) : (
            <Button 
              variant="outline" 
              onClick={() => router.push('/dashboard/personal/loans')}
            >
              Go Back to Loans
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Loan Details</h1>
        <Button 
          variant="outline" 
          onClick={() => router.push('/dashboard/personal/loans')}
        >
          Back to Loans
        </Button>
      </div>

      {loan && (
        <>
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Loan Application {loan.ref_no}</CardTitle>
                  <CardDescription>
                    Applied on {formatDate(loan.date_applied)}
                  </CardDescription>
                </div>
                <Badge className={getStatusBadgeColor(loan.status)}>
                  {loan.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-8">
              {/* Loan Summary */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Loan Type</p>
                  <p className="font-medium">{loan.loan_type || 'General Loan'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Amount Requested</p>
                  <p className="font-medium">{formatCurrency(loan.amount_requested)}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Repayment Period</p>
                  <p className="font-medium">{loan.repayment_period} months</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Monthly Repayment</p>
                  <p className="font-medium">{formatCurrency(loan.monthly_repayment)}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Interest Rate</p>
                  <p className="font-medium">{loan.interest_rate}%</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Total to Repay</p>
                  <p className="font-medium">{calculateTotalRepayment()}</p>
                </div>
              </div>

              <Separator />

              {/* Loan Purpose */}
              <div>
                <h3 className="text-lg font-semibold mb-2">Purpose</h3>
                <p>{loan.purpose || 'No purpose specified'}</p>
              </div>

              {/* Approval Details */}
              {loan.status === 'Approved' || loan.status === 'Active' ? (
                <>
                  <Separator />
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Approval Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Date Approved</p>
                        <p className="font-medium">{formatDate(loan.date_approved)}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Next Repayment Date</p>
                        <p className="font-medium">{formatDate(loan.next_repayment_date)}</p>
                      </div>
                      {loan.remaining_balance !== null && (
                        <div className="space-y-1">
                          <p className="text-sm text-muted-foreground">Remaining Balance</p>
                          <p className="font-medium">{formatCurrency(loan.remaining_balance)}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </>
              ) : loan.status === 'Declined' && loan.rejection_reason ? (
                <>
                  <Separator />
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Reason for Rejection</h3>
                    <p className="text-red-500">{loan.rejection_reason}</p>
                  </div>
                </>
              ) : null}

              {/* Guarantors Section */}
              {loan.guarantors && loan.guarantors.length > 0 && (
                <>
                  <Separator />
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Guarantors</h3>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Amount Guaranteed</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Request Date</TableHead>
                          <TableHead>Response Date</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {loan.guarantors.map((guarantor) => (
                          <TableRow key={guarantor.id}>
                            <TableCell className="font-medium">{guarantor.guarantor_name}</TableCell>
                            <TableCell>{formatCurrency(guarantor.guaranteed_amount)}</TableCell>
                            <TableCell>
                              <Badge className={getStatusBadgeColor(guarantor.status)}>
                                {guarantor.status}
                              </Badge>
                            </TableCell>
                            <TableCell>{formatDate(guarantor.request_date)}</TableCell>
                            <TableCell>{formatDate(guarantor.response_date)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </>
              )}
            </CardContent>
            <CardFooter className="flex justify-end border-t pt-6">
              <Button 
                variant="outline" 
                onClick={() => router.push('/dashboard/personal/loans')}
              >
                Back to Loans
              </Button>
            </CardFooter>
          </Card>
        </>
      )}
    </div>
  );
} 