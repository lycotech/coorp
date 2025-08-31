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
  Users,
  UserCheck,
  Mail,
  Phone,
  Building2,
  Calendar
} from "lucide-react";
import Link from 'next/link';
import { toast } from "sonner";

// Sample members data
const membersData = [
  {
    id: 1,
    staffNo: "STF001",
    firstName: "John",
    lastName: "Doe",
    email: "john.doe@gov.ng",
    phone: "+234-801-234-5678",
    ministry: "Finance",
    department: "Budget Office",
    position: "Director",
    membershipDate: "2023-01-15",
    status: "Active",
    totalSavings: 250000,
    totalLoans: 150000,
  },
  {
    id: 2,
    staffNo: "STF002",
    firstName: "Jane",
    lastName: "Smith",
    email: "jane.smith@gov.ng", 
    phone: "+234-802-345-6789",
    ministry: "Health",
    department: "Primary Healthcare",
    position: "Assistant Director",
    membershipDate: "2023-02-20",
    status: "Active",
    totalSavings: 400000,
    totalLoans: 200000,
  },
  {
    id: 3,
    staffNo: "STF003",
    firstName: "Mike",
    lastName: "Johnson",
    email: "mike.johnson@gov.ng",
    phone: "+234-803-456-7890",
    ministry: "Works",
    department: "Highway Construction",
    position: "Engineer",
    membershipDate: "2023-03-10",
    status: "Inactive",
    totalSavings: 180000,
    totalLoans: 0,
  },
  {
    id: 4,
    staffNo: "STF004",
    firstName: "Sarah",
    lastName: "Wilson",
    email: "sarah.wilson@gov.ng",
    phone: "+234-804-567-8901",
    ministry: "Education",
    department: "Secondary Education",
    position: "Principal",
    membershipDate: "2023-04-05",
    status: "Active",
    totalSavings: 320000,
    totalLoans: 100000,
  },
  {
    id: 5,
    staffNo: "STF005",
    firstName: "David",
    lastName: "Brown",
    email: "david.brown@gov.ng",
    phone: "+234-805-678-9012",
    ministry: "Agriculture",
    department: "Crop Production",
    position: "Agricultural Officer",
    membershipDate: "2023-05-12",
    status: "Pending",
    totalSavings: 275000,
    totalLoans: 75000,
  }
];

export default function MembersReportPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [ministryFilter, setMinistryFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [isLoading, setIsLoading] = useState(false);

  // Get unique ministries for filter
  const ministries = [...new Set(membersData.map(member => member.ministry))];

  // Filter data based on search and filters
  const filteredData = membersData.filter(item => {
    const matchesSearch = 
      item.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.staffNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.phone.includes(searchTerm) ||
      item.ministry.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.position.toLowerCase().includes(searchTerm.toLowerCase());
    
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
      case 'active':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Active</Badge>;
      case 'inactive':
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Inactive</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Pending</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const exportToCSV = () => {
    const headers = ['Staff No', 'First Name', 'Last Name', 'Email', 'Phone', 'Ministry', 'Department', 'Position', 'Membership Date', 'Status', 'Total Savings', 'Total Loans'];
    const csvContent = [
      headers.join(','),
      ...filteredData.map(item => [
        item.staffNo,
        `"${item.firstName}"`,
        `"${item.lastName}"`,
        item.email,
        item.phone,
        `"${item.ministry}"`,
        `"${item.department}"`,
        `"${item.position}"`,
        item.membershipDate,
        item.status,
        item.totalSavings,
        item.totalLoans
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'members_report.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success('Members report exported to CSV');
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
        <span className="text-foreground">All Members</span>
      </div>

      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Users className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Members Report</h1>
            <p className="text-muted-foreground">Comprehensive directory of all cooperative members</p>
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
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
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
              <CardTitle>Members Data</CardTitle>
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
                    <TableHead>Name</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Ministry</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Position</TableHead>
                    <TableHead>Member Since</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Savings</TableHead>
                    <TableHead>Loans</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentData.map((item) => (
                    <TableRow key={item.id} className="hover:bg-muted/50">
                      <TableCell className="font-medium">{item.staffNo}</TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{item.firstName} {item.lastName}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center gap-1 text-sm">
                            <Mail className="h-3 w-3 text-muted-foreground" />
                            {item.email}
                          </div>
                          <div className="flex items-center gap-1 text-sm">
                            <Phone className="h-3 w-3 text-muted-foreground" />
                            {item.phone}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{item.ministry}</TableCell>
                      <TableCell>{item.department}</TableCell>
                      <TableCell>{item.position}</TableCell>
                      <TableCell>{new Date(item.membershipDate).toLocaleDateString()}</TableCell>
                      <TableCell>{getStatusBadge(item.status)}</TableCell>
                      <TableCell className="font-medium">{formatCurrency(item.totalSavings)}</TableCell>
                      <TableCell className="font-medium">{formatCurrency(item.totalLoans)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-12">
              <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
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
                <Users className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Members</p>
                <p className="text-2xl font-bold">{filteredData.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-green-100">
                <UserCheck className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Active Members</p>
                <p className="text-2xl font-bold">{filteredData.filter(item => item.status === 'Active').length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-purple-100">
                <Building2 className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Ministries</p>
                <p className="text-2xl font-bold">{ministries.length}</p>
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
                <p className="text-sm text-muted-foreground">New This Month</p>
                <p className="text-2xl font-bold">12</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
