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
  ReceiptText,
  ArrowUpCircle,
  ArrowDownCircle,
  DollarSign,
  Calendar,
  TrendingUp
} from "lucide-react";
import Link from 'next/link';
import { toast } from "sonner";

// Sample transactions data
const transactionsData = [
  {
    id: 1,
    transactionId: "TXN001",
    date: "2024-02-01",
    memberName: "John Doe",
    staffNo: "STF001",
    transactionType: "Contribution",
    category: "Monthly Contribution",
    amount: 5000,
    status: "Completed",
    paymentMethod: "Bank Transfer",
    reference: "REF001",
    description: "February 2024 monthly contribution",
  },
  {
    id: 2,
    transactionId: "TXN002",
    date: "2024-02-01",
    memberName: "Jane Smith",
    staffNo: "STF002",
    transactionType: "Loan Disbursement", 
    category: "Personal Loan",
    amount: -750000,
    status: "Completed",
    paymentMethod: "Bank Transfer",
    reference: "REF002",
    description: "Personal loan disbursement - Application #LN002",
  },
  {
    id: 3,
    transactionId: "TXN003",
    date: "2024-02-02",
    memberName: "Mike Johnson",
    staffNo: "STF003",
    transactionType: "Loan Repayment",
    category: "Loan Payment",
    amount: 25000,
    status: "Completed",
    paymentMethod: "Cash",
    reference: "REF003",
    description: "Monthly loan repayment - Loan #LN001",
  },
  {
    id: 4,
    transactionId: "TXN004",
    date: "2024-02-03",
    memberName: "Sarah Wilson",
    staffNo: "STF004",
    transactionType: "Registration Fee",
    category: "Membership Fee",
    amount: 1000,
    status: "Pending",
    paymentMethod: "Online Payment",
    reference: "REF004",
    description: "New member registration fee",
  },
  {
    id: 5,
    transactionId: "TXN005",
    date: "2024-02-04",
    memberName: "David Brown",
    staffNo: "STF005",
    transactionType: "Withdrawal",
    category: "Savings Withdrawal",
    amount: -15000,
    status: "Completed",
    paymentMethod: "Bank Transfer",
    reference: "REF005",
    description: "Emergency savings withdrawal request",
  },
];

export default function TransactionsReportPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [isLoading, setIsLoading] = useState(false);

  // Get unique transaction types for filter
  const transactionTypes = [...new Set(transactionsData.map(t => t.transactionType))];

  // Filter data based on search and filters
  const filteredData = transactionsData.filter(item => {
    const matchesSearch = 
      item.memberName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.staffNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.transactionId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || item.status.toLowerCase() === statusFilter;
    const matchesType = typeFilter === 'all' || item.transactionType === typeFilter;
    
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
    }).format(Math.abs(amount));
  };

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Completed</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Pending</Badge>;
      case 'failed':
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Failed</Badge>;
      case 'cancelled':
        return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getTransactionIcon = (amount: number) => {
    return amount > 0 ? (
      <ArrowUpCircle className="h-4 w-4 text-green-600" />
    ) : (
      <ArrowDownCircle className="h-4 w-4 text-red-600" />
    );
  };

  const exportToCSV = () => {
    const headers = ['Transaction ID', 'Date', 'Member Name', 'Staff No', 'Type', 'Category', 'Amount', 'Status', 'Payment Method', 'Reference', 'Description'];
    const csvContent = [
      headers.join(','),
      ...filteredData.map(item => [
        item.transactionId,
        item.date,
        `"${item.memberName}"`,
        item.staffNo,
        `"${item.transactionType}"`,
        `"${item.category}"`,
        item.amount,
        item.status,
        `"${item.paymentMethod}"`,
        item.reference,
        `"${item.description}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'transactions_report.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success('Transactions report exported to CSV');
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
        <span className="text-foreground">All Transaction Updates</span>
      </div>

      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <ReceiptText className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Transaction Updates Report</h1>
            <p className="text-muted-foreground">Complete transaction history and financial activity tracking</p>
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
                placeholder="Search transactions..."
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
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Transaction Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {transactionTypes.map(type => (
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
              <CardTitle>Transaction Data</CardTitle>
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
                    <TableHead>Transaction ID</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Member</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Payment Method</TableHead>
                    <TableHead>Description</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentData.map((item) => (
                    <TableRow key={item.id} className="hover:bg-muted/50">
                      <TableCell className="font-medium">{item.transactionId}</TableCell>
                      <TableCell>{new Date(item.date).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{item.memberName}</div>
                          <div className="text-sm text-muted-foreground">{item.staffNo}</div>
                        </div>
                      </TableCell>
                      <TableCell>{item.transactionType}</TableCell>
                      <TableCell>{item.category}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getTransactionIcon(item.amount)}
                          <span className={`font-medium ${item.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {item.amount > 0 ? '+' : '-'}{formatCurrency(item.amount)}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(item.status)}</TableCell>
                      <TableCell>{item.paymentMethod}</TableCell>
                      <TableCell>
                        <div className="max-w-[200px] truncate" title={item.description}>
                          {item.description}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-12">
              <ReceiptText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
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
                <ReceiptText className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Transactions</p>
                <p className="text-2xl font-bold">{filteredData.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-green-100">
                <ArrowUpCircle className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Inflow</p>
                <p className="text-2xl font-bold">{formatCurrency(filteredData.filter(t => t.amount > 0).reduce((sum, item) => sum + item.amount, 0))}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-red-100">
                <ArrowDownCircle className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Outflow</p>
                <p className="text-2xl font-bold">{formatCurrency(Math.abs(filteredData.filter(t => t.amount < 0).reduce((sum, item) => sum + item.amount, 0)))}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-purple-100">
                <TrendingUp className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Net Flow</p>
                <p className="text-2xl font-bold">{formatCurrency(filteredData.reduce((sum, item) => sum + item.amount, 0))}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
