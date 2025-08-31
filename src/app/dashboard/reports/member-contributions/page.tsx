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
  CreditCard,
  TrendingUp,
  Calendar,
  DollarSign,
  User
} from "lucide-react";
import Link from 'next/link';
import { toast } from "sonner";

// Sample member contributions data
const contributionsData = [
  {
    id: 1,
    staffNo: "STF001",
    memberName: "John Doe",
    ministry: "Finance",
    monthlyContribution: 5000,
    totalContributions: 60000,
    lastContribution: "2024-02-01",
    contributionMonths: 12,
    status: "Current",
    arrears: 0,
  },
  {
    id: 2,
    staffNo: "STF002", 
    memberName: "Jane Smith",
    ministry: "Health",
    monthlyContribution: 7500,
    totalContributions: 82500,
    lastContribution: "2024-02-01",
    contributionMonths: 11,
    status: "Current",
    arrears: 0,
  },
  {
    id: 3,
    staffNo: "STF003",
    memberName: "Mike Johnson",
    ministry: "Works",
    monthlyContribution: 4000,
    totalContributions: 32000,
    lastContribution: "2023-12-01",
    contributionMonths: 8,
    status: "Arrears",
    arrears: 8000,
  },
  {
    id: 4,
    staffNo: "STF004",
    memberName: "Sarah Wilson",
    ministry: "Education",
    monthlyContribution: 6000,
    totalContributions: 72000,
    lastContribution: "2024-02-01",
    contributionMonths: 12,
    status: "Current",
    arrears: 0,
  },
  {
    id: 5,
    staffNo: "STF005",
    memberName: "David Brown",
    ministry: "Agriculture",
    monthlyContribution: 5500,
    totalContributions: 38500,
    lastContribution: "2024-01-01",
    contributionMonths: 7,
    status: "Late",
    arrears: 5500,
  }
];

export default function MemberContributionsReportPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [ministryFilter, setMinistryFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [isLoading, setIsLoading] = useState(false);

  // Get unique ministries for filter
  const ministries = [...new Set(contributionsData.map(member => member.ministry))];

  // Filter data based on search and filters
  const filteredData = contributionsData.filter(item => {
    const matchesSearch = 
      item.memberName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.staffNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.ministry.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || item.status.toLowerCase() === statusFilter;
    const matchesMinistry = ministryFilter === 'all' || item.ministry === ministryFilter;
    
    return matchesSearch && matchesStatus && matchesMinistry;
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
      case 'current':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Current</Badge>;
      case 'late':
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Late</Badge>;
      case 'arrears':
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Arrears</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const exportToCSV = () => {
    const headers = ['Staff No', 'Member Name', 'Ministry', 'Monthly Contribution', 'Total Contributions', 'Last Contribution', 'Contribution Months', 'Status', 'Arrears'];
    const csvContent = [
      headers.join(','),
      ...filteredData.map(item => [
        item.staffNo,
        `"${item.memberName}"`,
        `"${item.ministry}"`,
        item.monthlyContribution,
        item.totalContributions,
        item.lastContribution,
        item.contributionMonths,
        item.status,
        item.arrears
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'member_contributions_report.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success('Member contributions report exported to CSV');
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
        <span className="text-foreground">Members Contribution</span>
      </div>

      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <CreditCard className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Members Contribution Report</h1>
            <p className="text-muted-foreground">Track individual member contribution history and payment status</p>
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
                placeholder="Search members..."
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
                <SelectItem value="current">Current</SelectItem>
                <SelectItem value="late">Late</SelectItem>
                <SelectItem value="arrears">Arrears</SelectItem>
              </SelectContent>
            </Select>
            <Select value={ministryFilter} onValueChange={setMinistryFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Ministry" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Ministries</SelectItem>
                {ministries.map(ministry => (
                  <SelectItem key={ministry} value={ministry}>{ministry}</SelectItem>
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
              <CardTitle>Contribution Data</CardTitle>
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
                    <TableHead>Staff No</TableHead>
                    <TableHead>Member Name</TableHead>
                    <TableHead>Ministry</TableHead>
                    <TableHead>Monthly Contribution</TableHead>
                    <TableHead>Total Contributions</TableHead>
                    <TableHead>Last Contribution</TableHead>
                    <TableHead>Months</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Arrears</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentData.map((item) => (
                    <TableRow key={item.id} className="hover:bg-muted/50">
                      <TableCell className="font-medium">{item.staffNo}</TableCell>
                      <TableCell className="font-medium">{item.memberName}</TableCell>
                      <TableCell>{item.ministry}</TableCell>
                      <TableCell className="font-medium">{formatCurrency(item.monthlyContribution)}</TableCell>
                      <TableCell className="font-medium text-green-600">{formatCurrency(item.totalContributions)}</TableCell>
                      <TableCell>{new Date(item.lastContribution).toLocaleDateString()}</TableCell>
                      <TableCell className="text-center">{item.contributionMonths}</TableCell>
                      <TableCell>{getStatusBadge(item.status)}</TableCell>
                      <TableCell className={`font-medium ${item.arrears > 0 ? 'text-red-600' : 'text-green-600'}`}>
                        {item.arrears > 0 ? formatCurrency(item.arrears) : '-'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-12">
              <CreditCard className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
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
                <p className="text-sm text-muted-foreground">Contributing Members</p>
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
                <p className="text-sm text-muted-foreground">Total Contributions</p>
                <p className="text-2xl font-bold">{formatCurrency(filteredData.reduce((sum, item) => sum + item.totalContributions, 0))}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-red-100">
                <TrendingUp className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Arrears</p>
                <p className="text-2xl font-bold">{formatCurrency(filteredData.reduce((sum, item) => sum + item.arrears, 0))}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-orange-100">
                <Calendar className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Average Monthly</p>
                <p className="text-2xl font-bold">{formatCurrency(filteredData.reduce((sum, item) => sum + item.monthlyContribution, 0) / filteredData.length)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
