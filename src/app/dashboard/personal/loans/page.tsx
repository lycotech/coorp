'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardDescription 
} from "@/components/ui/card";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

// Interface for loan data
interface Loan {
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

export default function MemberLoansPage() {
  const [loans, setLoans] = useState<Loan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const router = useRouter();

  // Fetch member loans on component mount
  useEffect(() => {
    fetchMemberLoans();
  }, []);

  const fetchMemberLoans = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/loans/member');
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch loans');
      }
      const data = await response.json();
      setLoans(data.loans || []);
    } catch (error) {
      console.error("Error fetching loans:", error);
      const message = error instanceof Error ? error.message : "An error occurred while fetching loans";
      setError(message);
      toast.error("Error", { description: message });
    } finally {
      setIsLoading(false);
    }
  };

  // Helper to handle auth errors
  const handleAuthError = () => {
    if (error?.includes('session') || error?.includes('login') || error?.includes('credentials')) {
      router.push('/login');
    }
  };

  // Use effect to handle authentication errors
  useEffect(() => {
    if (error) {
      handleAuthError();
    }
  }, [error]);

  // Apply filters for search and status
  const filteredLoans = loans.filter(loan => {
    const matchesQuery = searchQuery === '' || 
      loan.ref_no.toLowerCase().includes(searchQuery.toLowerCase()) ||
      loan.purpose.toLowerCase().includes(searchQuery.toLowerCase()) ||
      loan.loan_type?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === null || loan.status === statusFilter;
    
    return matchesQuery && matchesStatus;
  });

  // Pagination
  const indexOfLastLoan = currentPage * entriesPerPage;
  const indexOfFirstLoan = indexOfLastLoan - entriesPerPage;
  const currentLoans = filteredLoans.slice(indexOfFirstLoan, indexOfLastLoan);
  const totalPages = Math.ceil(filteredLoans.length / entriesPerPage);

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

  // Handle loan detail view
  const viewLoanDetails = (loanRef: string) => {
    router.push(`/dashboard/personal/loans/${loanRef}`);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">My Loan Applications</h1>

      <Card>
        <CardHeader>
          <CardTitle>Loan History</CardTitle>
          <CardDescription>
            View all your loan applications and their current status
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Filters and Search */}
          <div className="flex flex-wrap items-center justify-between mb-6 gap-4">
            <div className="flex items-center space-x-2">
              <span>Show</span>
              <Select
                value={entriesPerPage.toString()}
                onValueChange={(value) => {
                  setEntriesPerPage(parseInt(value));
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger className="w-[80px]">
                  <SelectValue placeholder={entriesPerPage.toString()} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5</SelectItem>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="25">25</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                </SelectContent>
              </Select>
              <span>entries</span>
            </div>

            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center space-x-2">
                <span>Status:</span>
                <Select
                  value={statusFilter || 'all'}
                  onValueChange={(value) => setStatusFilter(value === 'all' ? null : value)}
                >
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="All" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="Pending">Pending</SelectItem>
                    <SelectItem value="Approved">Approved</SelectItem>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Declined">Declined</SelectItem>
                    <SelectItem value="Closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-2">
                <span>Search:</span>
                <Input
                  type="search"
                  placeholder="Search loans..."
                  className="max-w-sm"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                />
              </div>
            </div>
          </div>

          {/* Loans Table */}
          {isLoading ? (
            <div className="py-8 text-center">Loading your loans...</div>
          ) : error ? (
            <div className="py-8 text-center">
              <div className="text-red-500 mb-4">{error}</div>
              {(error.includes('session') || error.includes('login') || error.includes('credentials')) && (
                <Button 
                  onClick={() => router.push('/login')}
                  variant="default"
                >
                  Go to Login
                </Button>
              )}
            </div>
          ) : (
            <>
              <div className="border rounded-md">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Ref No</TableHead>
                      <TableHead>Loan Type</TableHead>
                      <TableHead>Applied Date</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Repayment Period</TableHead>
                      <TableHead>Monthly Repayment</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {currentLoans.length > 0 ? (
                      currentLoans.map((loan) => (
                        <TableRow key={loan.id}>
                          <TableCell className="font-medium">{loan.ref_no}</TableCell>
                          <TableCell>{loan.loan_type || 'General Loan'}</TableCell>
                          <TableCell>{formatDate(loan.date_applied)}</TableCell>
                          <TableCell>{formatCurrency(loan.amount_requested)}</TableCell>
                          <TableCell>{loan.repayment_period} months</TableCell>
                          <TableCell>{formatCurrency(loan.monthly_repayment)}</TableCell>
                          <TableCell>
                            <Badge className={getStatusBadgeColor(loan.status)}>
                              {loan.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => viewLoanDetails(loan.ref_no)}
                            >
                              View Details
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={8} className="h-24 text-center">
                          No loan applications found.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {filteredLoans.length > 0 && (
                <div className="flex items-center justify-between mt-4">
                  <div className="text-sm text-gray-500">
                    Showing {indexOfFirstLoan + 1} to {Math.min(indexOfLastLoan, filteredLoans.length)} of {filteredLoans.length} entries
                  </div>
                  
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious 
                          onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                          className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                        />
                      </PaginationItem>
                      
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        // Show pages around current page
                        let pageNum = currentPage;
                        if (totalPages <= 5) {
                          pageNum = i + 1;
                        } else if (currentPage <= 3) {
                          pageNum = i + 1;
                        } else if (currentPage >= totalPages - 2) {
                          pageNum = totalPages - 4 + i;
                        } else {
                          pageNum = currentPage - 2 + i;
                        }
                        
                        return (
                          <PaginationItem key={pageNum}>
                            <PaginationLink
                              onClick={() => setCurrentPage(pageNum)}
                              isActive={currentPage === pageNum}
                            >
                              {pageNum}
                            </PaginationLink>
                          </PaginationItem>
                        );
                      })}
                      
                      <PaginationItem>
                        <PaginationNext 
                          onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                          className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 