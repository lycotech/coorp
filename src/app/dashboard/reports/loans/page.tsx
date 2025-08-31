'use client';

import React, { useState } from 'react';
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Copy,
  FileSpreadsheet,
  FileText,
  Printer,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  HandCoins,
  DollarSign,
  Calendar,
  TrendingUp,
  AlertCircle,
  CheckCircle
} from "lucide-react";
import Link from 'next/link';
import { toast } from "sonner";

// Sample loans data
const loansData = [
  {
    id: 1,
    loanId: "LN001",
    memberName: "John Doe",
    staffNo: "STF001",
    ministry: "Finance",
    loanType: "Personal Loan",
    principalAmount: 500000,
    interestRate: 12,
    loanTerm: 24,
    monthlyPayment: 25000,
    amountDisbursed: 500000,
    totalRepaid: 125000,
    outstandingBalance: 375000,
    disbursementDate: "2023-06-15",
    maturityDate: "2025-06-15",
    status: "Active",
    nextPaymentDate: "2024-03-01",
    guarantorName: "Jane Smith",
  },
  {
    id: 2,
    loanId: "LN002",
    memberName: "Jane Smith",
    staffNo: "STF002",
    ministry: "Health",
    loanType: "Emergency Loan",
    principalAmount: 300000,
    interestRate: 10,
    loanTerm: 18,
    monthlyPayment: 18500,
    amountDisbursed: 300000,
    totalRepaid: 37000,
    outstandingBalance: 263000,
    disbursementDate: "2023-12-01",
    maturityDate: "2025-06-01",
    status: "Active",
    nextPaymentDate: "2024-03-01",
    guarantorName: "Mike Johnson",
  },
  {
    id: 3,
    loanId: "LN003",
    memberName: "Mike Johnson",
    staffNo: "STF003",
    ministry: "Works",
    loanType: "Car Loan",
    principalAmount: 1200000,
    interestRate: 15,
    loanTerm: 36,
    monthlyPayment: 45000,
    amountDisbursed: 1200000,
    totalRepaid: 270000,
    outstandingBalance: 930000,
    disbursementDate: "2023-08-15",
    maturityDate: "2026-08-15",
    status: "Overdue",
    nextPaymentDate: "2024-02-15",
    guarantorName: "Sarah Wilson",
  },
  {
    id: 4,
    loanId: "LN004",
    memberName: "Sarah Wilson",
    staffNo: "STF004",
    ministry: "Education",
    loanType: "Education Loan",
    principalAmount: 800000,
    interestRate: 8,
    loanTerm: 30,
    monthlyPayment: 30000,
    amountDisbursed: 800000,
    totalRepaid: 800000,
    outstandingBalance: 0,
    disbursementDate: "2021-01-15",
    maturityDate: "2023-07-15",
    status: "Completed",
    nextPaymentDate: "-",
    guarantorName: "David Brown",
  },
  {
    id: 5,
    loanId: "LN005",
    memberName: "David Brown",
    staffNo: "STF005",
    ministry: "Agriculture",
    loanType: "Business Loan",
    principalAmount: 600000,
    interestRate: 12,
    loanTerm: 24,
    monthlyPayment: 28500,
    amountDisbursed: 600000,
    totalRepaid: 57000,
    outstandingBalance: 543000,
    disbursementDate: "2024-01-01",
    maturityDate: "2026-01-01",
    status: "Active",
    nextPaymentDate: "2024-03-01",
    guarantorName: "John Doe",
  },
];

export default function LoansReportPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [isLoading, setIsLoading] = useState(false);

  // Get unique loan types for filter
  const loanTypes = [...new Set(loansData.map(loan => loan.loanType))];

  // Filter data based on search and filters
  const filteredData = loansData.filter(item => {
    const matchesSearch = 
      item.memberName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.staffNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.loanId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.ministry.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.guarantorName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || item.status.toLowerCase() === statusFilter;
    const matchesType = typeFilter === 'all' || item.loanType === typeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  // Pagination
  const totalItems = filteredData.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = filteredData.slice(startIndex, endIndex);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Active</Badge>;
      case 'overdue':
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Overdue</Badge>;
      case 'completed':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Completed</Badge>;
      case 'defaulted':
        return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">Defaulted</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const calculateProgress = (totalRepaid: number, principalAmount: number) => {
    return Math.round((totalRepaid / principalAmount) * 100);
  };

  const exportToCSV = () => {
    const headers = ['Loan ID', 'Member Name', 'Staff No', 'Ministry', 'Loan Type', 'Principal Amount', 'Interest Rate', 'Loan Term', 'Amount Disbursed', 'Total Repaid', 'Outstanding Balance', 'Disbursement Date', 'Maturity Date', 'Status', 'Guarantor Name'];
    const csvContent = [
      headers.join(','),
      ...filteredData.map(item => [
        item.loanId,
        `"${item.memberName}"`,
        item.staffNo,
        `"${item.ministry}"`,
        `"${item.loanType}"`,
        item.principalAmount,
        item.interestRate,
        item.loanTerm,
        item.amountDisbursed,
        item.totalRepaid,
        item.outstandingBalance,
        item.disbursementDate,
        item.maturityDate,
        item.status,
        `"${item.guarantorName}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'loans_report.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success('Loans report exported to CSV');
  };

  const refreshData = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      toast.success('Data refreshed');
    }, 1000);
  };

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/dashboard" className="hover:text-foreground">Dashboard</Link>
        <ChevronRight className="h-4 w-4" />
        <Link href="/dashboard/reports" className="hover:text-foreground">Reports</Link>
        <ChevronRight className="h-4 w-4" />
        <span className="text-foreground">All Active Loan Records</span>
      </div>

      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <HandCoins className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Active Loan Records</h1>
            <p className="text-muted-foreground">Comprehensive overview of all loan portfolio and repayment status</p>
          </div>
        </div>
      </div>

      {/* Export Buttons */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2 flex-wrap">
            <Button variant="outline" size="sm">
              <Copy className="h-4 w-4 mr-2" />
              Copy
            </Button>
            <Button onClick={exportToCSV} variant="outline" size="sm">
              <FileSpreadsheet className="h-4 w-4 mr-2" />
              CSV
            </Button>
            <Button variant="outline" size="sm">
              <FileSpreadsheet className="h-4 w-4 mr-2" />
              Excel
            </Button>
            <Button variant="outline" size="sm">
              <FileText className="h-4 w-4 mr-2" />
              PDF
            </Button>
            <Button variant="outline" size="sm">
              <Printer className="h-4 w-4 mr-2" />
              Print
            </Button>
            <div className="ml-auto flex items-center gap-2">
              <Button onClick={refreshData} variant="outline" size="sm" disabled={isLoading}>
                <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex-1 min-w-[200px] relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search loans..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="overdue">Overdue</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="defaulted">Defaulted</SelectItem>
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Loan Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {loanTypes.map(type => (
                  <SelectItem key={type} value={type}>{type}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              More Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Main Data Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Loan Portfolio Data</CardTitle>
              <CardDescription>
                Showing {startIndex + 1} to {Math.min(endIndex, totalItems)} of {totalItems} entries
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Select value={itemsPerPage.toString()} onValueChange={(value) => setItemsPerPage(Number(value))}>
                <SelectTrigger className="w-20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5</SelectItem>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="25">25</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {currentData.length > 0 ? (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Loan ID</TableHead>
                    <TableHead>Member</TableHead>
                    <TableHead>Loan Type</TableHead>
                    <TableHead>Principal</TableHead>
                    <TableHead>Disbursed</TableHead>
                    <TableHead>Repaid</TableHead>
                    <TableHead>Outstanding</TableHead>
                    <TableHead>Progress</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Next Payment</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentData.map((item) => (
                    <TableRow key={item.id} className="hover:bg-muted/50">
                      <TableCell className="font-medium">{item.loanId}</TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{item.memberName}</div>
                          <div className="text-sm text-muted-foreground">{item.staffNo} • {item.ministry}</div>
                        </div>
                      </TableCell>
                      <TableCell>{item.loanType}</TableCell>
                      <TableCell className="font-medium">{formatCurrency(item.principalAmount)}</TableCell>
                      <TableCell className="font-medium">{formatCurrency(item.amountDisbursed)}</TableCell>
                      <TableCell className="font-medium text-green-600">{formatCurrency(item.totalRepaid)}</TableCell>
                      <TableCell className={`font-medium ${item.outstandingBalance > 0 ? 'text-red-600' : 'text-green-600'}`}>
                        {formatCurrency(item.outstandingBalance)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="w-16 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full"
                              style={{ width: `${calculateProgress(item.totalRepaid, item.principalAmount)}%` }}
                            ></div>
                          </div>
                          <span className="text-sm font-medium">{calculateProgress(item.totalRepaid, item.principalAmount)}%</span>
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(item.status)}</TableCell>
                      <TableCell>
                        {item.nextPaymentDate !== '-' ? new Date(item.nextPaymentDate).toLocaleDateString() : '-'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-12">
              <HandCoins className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No data available in table</h3>
              <p className="text-muted-foreground">Try adjusting your search or filter criteria</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Showing {startIndex + 1} to {Math.min(endIndex, totalItems)} of {totalItems} entries
              </div>
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Previous
                </Button>
                
                <div className="flex items-center gap-1">
                  {[...Array(totalPages)].map((_, i) => {
                    const page = i + 1;
                    if (
                      page === 1 || 
                      page === totalPages || 
                      (page >= currentPage - 2 && page <= currentPage + 2)
                    ) {
                      return (
                        <Button
                          key={page}
                          variant={currentPage === page ? "default" : "outline"}
                          size="sm"
                          onClick={() => setCurrentPage(page)}
                          className="w-8 h-8 p-0"
                        >
                          {page}
                        </Button>
                      );
                    } else if (
                      page === currentPage - 3 || 
                      page === currentPage + 3
                    ) {
                      return <span key={page} className="px-2">...</span>;
                    }
                    return null;
                  })}
                </div>

                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Summary Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-blue-100">
                <HandCoins className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Loans</p>
                <p className="text-2xl font-bold">{filteredData.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-green-100">
                <DollarSign className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Disbursed</p>
                <p className="text-2xl font-bold">{formatCurrency(filteredData.reduce((sum, item) => sum + item.amountDisbursed, 0))}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-red-100">
                <AlertCircle className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Outstanding</p>
                <p className="text-2xl font-bold">{formatCurrency(filteredData.reduce((sum, item) => sum + item.outstandingBalance, 0))}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-orange-100">
                <CheckCircle className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Collection Rate</p>
                <p className="text-2xl font-bold">
                  {Math.round((filteredData.reduce((sum, item) => sum + item.totalRepaid, 0) / 
                  filteredData.reduce((sum, item) => sum + item.amountDisbursed, 0)) * 100)}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
