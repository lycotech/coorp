'use client';

import React, { useState, useEffect } from 'react';
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
  Download,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Calendar,
  ShieldCheck,
  User,
  DollarSign,
  Building2
} from "lucide-react";
import Link from 'next/link';
import { toast } from "sonner";

// Sample guarantor data
const guarantorsData = [
  {
    id: 1,
    refNo: "GTR001",
    applicantName: "John Doe",
    applicantRegNo: "MEM001",
    loanAmount: 500000,
    applicantMinistry: "Finance",
    guarantorMinistry: "Education",
    guarantorSavings: 250000,
    guarantorLoan: 150000,
    status: "Approved",
    dateFiled: "2024-01-15",
  },
  {
    id: 2,
    refNo: "GTR002", 
    applicantName: "Jane Smith",
    applicantRegNo: "MEM002",
    loanAmount: 750000,
    applicantMinistry: "Health",
    guarantorMinistry: "Agriculture",
    guarantorSavings: 400000,
    guarantorLoan: 200000,
    status: "Pending",
    dateFiled: "2024-01-20",
  },
  {
    id: 3,
    refNo: "GTR003",
    applicantName: "Mike Johnson",
    applicantRegNo: "MEM003", 
    loanAmount: 300000,
    applicantMinistry: "Works",
    guarantorMinistry: "Finance",
    guarantorSavings: 180000,
    guarantorLoan: 0,
    status: "Rejected",
    dateFiled: "2024-01-25",
  },
  {
    id: 4,
    refNo: "GTR004",
    applicantName: "Sarah Wilson",
    applicantRegNo: "MEM004",
    loanAmount: 600000,
    applicantMinistry: "Education",
    guarantorMinistry: "Health",
    guarantorSavings: 320000,
    guarantorLoan: 100000,
    status: "Approved",
    dateFiled: "2024-02-01",
  },
  {
    id: 5,
    refNo: "GTR005",
    applicantName: "David Brown",
    applicantRegNo: "MEM005",
    loanAmount: 450000,
    applicantMinistry: "Agriculture", 
    guarantorMinistry: "Works",
    guarantorSavings: 275000,
    guarantorLoan: 75000,
    status: "Pending",
    dateFiled: "2024-02-05",
  }
];

export default function GuarantorsReportPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [isLoading, setIsLoading] = useState(false);

  // Filter data based on search and status
  const filteredData = guarantorsData.filter(item => {
    const matchesSearch = 
      item.applicantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.refNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.applicantRegNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.applicantMinistry.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.guarantorMinistry.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || item.status.toLowerCase() === statusFilter;
    
    return matchesSearch && matchesStatus;
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
      case 'approved':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Approved</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Pending</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const exportToCSV = () => {
    const headers = ['Ref No', 'Applicant Name', 'Reg No', 'Loan Amount', 'Applicant Ministry', 'Guarantor Ministry', 'Guarantor Savings', 'Guarantor Loan', 'Status', 'Date Filed'];
    const csvContent = [
      headers.join(','),
      ...filteredData.map(item => [
        item.refNo,
        `"${item.applicantName}"`,
        item.applicantRegNo,
        item.loanAmount,
        `"${item.applicantMinistry}"`,
        `"${item.guarantorMinistry}"`,
        item.guarantorSavings,
        item.guarantorLoan,
        item.status,
        item.dateFiled
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'guarantors_report.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success('Guarantors report exported to CSV');
  };

  const exportToExcel = () => {
    toast.info('Excel export functionality would be implemented here');
  };

  const exportToPDF = () => {
    toast.info('PDF export functionality would be implemented here');
  };

  const printReport = () => {
    window.print();
    toast.success('Print dialog opened');
  };

  const copyData = () => {
    const textData = filteredData.map(item => 
      `${item.refNo}\t${item.applicantName}\t${item.applicantRegNo}\t${formatCurrency(item.loanAmount)}\t${item.applicantMinistry}\t${item.guarantorMinistry}\t${formatCurrency(item.guarantorSavings)}\t${formatCurrency(item.guarantorLoan)}\t${item.status}\t${item.dateFiled}`
    ).join('\n');
    
    navigator.clipboard.writeText(textData).then(() => {
      toast.success('Data copied to clipboard');
    }).catch(() => {
      toast.error('Failed to copy data');
    });
  };

  const refreshData = () => {
    setIsLoading(true);
    // Simulate API call
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
        <span className="text-foreground">Guarantors</span>
      </div>

      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <ShieldCheck className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Guarantors Report</h1>
            <p className="text-muted-foreground">Comprehensive view of all guarantor relationships and loan applications</p>
          </div>
        </div>
      </div>

      {/* Export Buttons */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2 flex-wrap">
            <Button onClick={copyData} variant="outline" size="sm">
              <Copy className="h-4 w-4 mr-2" />
              Copy
            </Button>
            <Button onClick={exportToCSV} variant="outline" size="sm">
              <FileSpreadsheet className="h-4 w-4 mr-2" />
              CSV
            </Button>
            <Button onClick={exportToExcel} variant="outline" size="sm">
              <FileSpreadsheet className="h-4 w-4 mr-2" />
              Excel
            </Button>
            <Button onClick={exportToPDF} variant="outline" size="sm">
              <FileText className="h-4 w-4 mr-2" />
              PDF
            </Button>
            <Button onClick={printReport} variant="outline" size="sm">
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
                placeholder="Search guarantors..."
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
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
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
              <CardTitle>Guarantors Data</CardTitle>
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
                    <TableHead>Ref No</TableHead>
                    <TableHead>Applicant Name</TableHead>
                    <TableHead>Reg. No.</TableHead>
                    <TableHead>Loan Amount</TableHead>
                    <TableHead>Applicant Ministry</TableHead>
                    <TableHead>Guarantor Ministry</TableHead>
                    <TableHead>Guarantor Savings</TableHead>
                    <TableHead>Guarantor Loan</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date Filed</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentData.map((item) => (
                    <TableRow key={item.id} className="hover:bg-muted/50">
                      <TableCell className="font-medium">{item.refNo}</TableCell>
                      <TableCell>{item.applicantName}</TableCell>
                      <TableCell>{item.applicantRegNo}</TableCell>
                      <TableCell className="font-medium">{formatCurrency(item.loanAmount)}</TableCell>
                      <TableCell>{item.applicantMinistry}</TableCell>
                      <TableCell>{item.guarantorMinistry}</TableCell>
                      <TableCell className="font-medium">{formatCurrency(item.guarantorSavings)}</TableCell>
                      <TableCell className="font-medium">{formatCurrency(item.guarantorLoan)}</TableCell>
                      <TableCell>{getStatusBadge(item.status)}</TableCell>
                      <TableCell>{new Date(item.dateFiled).toLocaleDateString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-12">
              <ShieldCheck className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
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
                <User className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Applications</p>
                <p className="text-2xl font-bold">{filteredData.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-green-100">
                <ShieldCheck className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Approved</p>
                <p className="text-2xl font-bold">{filteredData.filter(item => item.status === 'Approved').length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-yellow-100">
                <Calendar className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold">{filteredData.filter(item => item.status === 'Pending').length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-red-100">
                <DollarSign className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Loan Amount</p>
                <p className="text-2xl font-bold">{formatCurrency(filteredData.reduce((sum, item) => sum + item.loanAmount, 0))}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
