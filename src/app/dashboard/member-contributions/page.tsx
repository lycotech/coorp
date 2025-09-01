"use client";

import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { 
  Users, 
  DollarSign, 
  TrendingUp, 
  Calendar,
  Search,
  Filter,
  Download,
  RefreshCw,
  CheckCircle,
  Clock,
  XCircle,
  AlertTriangle,
  Eye,
  FileText,
  CreditCard,
  ArrowUpRight,
  ArrowDownRight
} from "lucide-react";
import { useCurrentUser } from "@/hooks/useCurrentUser";

interface Contribution {
  id: number;
  transaction_date: string;
  amount: number;
  description: string;
  status: string;
  reference_no: string;
  payment_method: string;
  balance_after: number;
  category: 'Credit' | 'Debit';
}

// Sample data for demonstration
const sampleContributions: Contribution[] = [
  {
    id: 1,
    transaction_date: '2024-08-30',
    amount: 50000,
    description: 'Monthly contribution for August 2024',
    status: 'Completed',
    reference_no: 'CONT-2024-08-001',
    payment_method: 'Salary Deduction',
    balance_after: 450000,
    category: 'Credit'
  },
  {
    id: 2,
    transaction_date: '2024-07-30',
    amount: 50000,
    description: 'Monthly contribution for July 2024',
    status: 'Completed',
    reference_no: 'CONT-2024-07-001',
    payment_method: 'Bank Transfer',
    balance_after: 400000,
    category: 'Credit'
  },
  {
    id: 3,
    transaction_date: '2024-06-30',
    amount: 45000,
    description: 'Monthly contribution for June 2024',
    status: 'Completed',
    reference_no: 'CONT-2024-06-001',
    payment_method: 'Cash',
    balance_after: 350000,
    category: 'Credit'
  },
  {
    id: 4,
    transaction_date: '2024-05-30',
    amount: 45000,
    description: 'Monthly contribution for May 2024',
    status: 'Completed',
    reference_no: 'CONT-2024-05-001',
    payment_method: 'Salary Deduction',
    balance_after: 305000,
    category: 'Credit'
  },
  {
    id: 5,
    transaction_date: '2024-04-30',
    amount: 45000,
    description: 'Monthly contribution for April 2024',
    status: 'Completed',
    reference_no: 'CONT-2024-04-001',
    payment_method: 'Bank Transfer',
    balance_after: 260000,
    category: 'Credit'
  },
  {
    id: 6,
    transaction_date: '2024-03-30',
    amount: 40000,
    description: 'Monthly contribution for March 2024',
    status: 'Completed',
    reference_no: 'CONT-2024-03-001',
    payment_method: 'Salary Deduction',
    balance_after: 215000,
    category: 'Credit'
  },
  {
    id: 7,
    transaction_date: '2024-02-29',
    amount: 40000,
    description: 'Monthly contribution for February 2024',
    status: 'Completed',
    reference_no: 'CONT-2024-02-001',
    payment_method: 'Cash',
    balance_after: 175000,
    category: 'Credit'
  },
  {
    id: 8,
    transaction_date: '2024-01-30',
    amount: 40000,
    description: 'Monthly contribution for January 2024',
    status: 'Completed',
    reference_no: 'CONT-2024-01-001',
    payment_method: 'Bank Transfer',
    balance_after: 135000,
    category: 'Credit'
  }
];

export default function ContributionHistoryPage() {
  const { user } = useCurrentUser();
  const [contributions, setContributions] = useState<Contribution[]>([]);
  const [filteredContributions, setFilteredContributions] = useState<Contribution[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('all');
  const [dateRange, setDateRange] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  useEffect(() => {
    fetchContributions();
  }, []);

  useEffect(() => {
    filterContributions();
  }, [contributions, searchTerm, selectedStatus, selectedPaymentMethod, dateRange]);

  const fetchContributions = async () => {
    setLoading(true);
    setError(null);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // In real app, this would call the actual API
      // const response = await fetch("/api/members/contributions/history");
      
      setContributions(sampleContributions);
      setFilteredContributions(sampleContributions);
    } catch (err: unknown) {
      console.error("Error fetching contributions:", err);
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch contribution history";
      setError(errorMessage);
      toast.error("Failed to fetch contributions");
    } finally {
      setLoading(false);
    }
  };

  const filterContributions = () => {
    let filtered = contributions;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(contribution =>
        contribution.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contribution.reference_no.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (selectedStatus !== 'all') {
      filtered = filtered.filter(contribution => contribution.status === selectedStatus);
    }

    // Payment method filter
    if (selectedPaymentMethod !== 'all') {
      filtered = filtered.filter(contribution => contribution.payment_method === selectedPaymentMethod);
    }

    // Date range filter
    if (dateRange !== 'all') {
      const now = new Date();
      const filterDate = new Date();
      
      switch (dateRange) {
        case '30days':
          filterDate.setDate(now.getDate() - 30);
          break;
        case '90days':
          filterDate.setDate(now.getDate() - 90);
          break;
        case '1year':
          filterDate.setFullYear(now.getFullYear() - 1);
          break;
        default:
          filterDate.setFullYear(now.getFullYear() - 2);
      }

      filtered = filtered.filter(contribution =>
        new Date(contribution.transaction_date) >= filterDate
      );
    }

    setFilteredContributions(filtered);
    setCurrentPage(1);
  };

  // Pagination
  const totalPages = Math.ceil(filteredContributions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedContributions = filteredContributions.slice(startIndex, startIndex + itemsPerPage);

  // Summary calculations
  const totalContributions = filteredContributions
    .filter(c => c.status === 'Completed')
    .reduce((sum, c) => sum + c.amount, 0);

  const averageContribution = filteredContributions.length > 0 
    ? totalContributions / filteredContributions.filter(c => c.status === 'Completed').length 
    : 0;

  const currentBalance = filteredContributions.length > 0 
    ? filteredContributions[0].balance_after 
    : 0;

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'Pending':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'Failed':
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'Completed':
        return 'default';
      case 'Pending':
        return 'secondary';
      case 'Failed':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB');
  };

  const exportContributions = () => {
    const dataToExport = filteredContributions.map(contribution => ({
      'Date': formatDate(contribution.transaction_date),
      'Amount': formatCurrency(contribution.amount),
      'Description': contribution.description,
      'Status': contribution.status,
      'Payment Method': contribution.payment_method,
      'Reference': contribution.reference_no,
      'Balance After': formatCurrency(contribution.balance_after)
    }));

    const csv = [
      Object.keys(dataToExport[0]).join(','),
      ...dataToExport.map(row => Object.values(row).join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `contribution-history-${user?.staffNo}-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);

    toast.success('Contribution history exported successfully!');
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <TrendingUp className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Member Contributions</h1>
              <p className="text-muted-foreground">View your contribution history and track payments</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-12 w-12 rounded-lg mb-4" />
                <Skeleton className="h-4 w-24 mb-2" />
                <Skeleton className="h-8 w-32" />
              </CardContent>
            </Card>
          ))}
        </div>

        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <TrendingUp className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Member Contributions</h1>
              <p className="text-muted-foreground">View your contribution history and track payments</p>
            </div>
          </div>
        </div>

        <Card>
          <CardContent className="p-6">
            <div className="text-center py-8">
              <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Error Loading Contributions</h3>
              <p className="text-muted-foreground mb-4">{error}</p>
              <Button onClick={fetchContributions}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Retry
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <TrendingUp className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Member Contributions</h1>
            <p className="text-muted-foreground">View your contribution history and track payments</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={fetchContributions}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline" onClick={exportContributions}>
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Contributions</p>
                <p className="text-2xl font-bold text-green-600">{formatCurrency(totalContributions)}</p>
              </div>
              <div className="p-2 bg-green-100 rounded-lg">
                <DollarSign className="h-5 w-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Current Balance</p>
                <p className="text-2xl font-bold text-blue-600">{formatCurrency(currentBalance)}</p>
              </div>
              <div className="p-2 bg-blue-100 rounded-lg">
                <CreditCard className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Average Contribution</p>
                <p className="text-2xl font-bold text-purple-600">{formatCurrency(averageContribution)}</p>
              </div>
              <div className="p-2 bg-purple-100 rounded-lg">
                <TrendingUp className="h-5 w-5 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters & Search
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="search">Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Search contributions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="Completed">Completed</SelectItem>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="Failed">Failed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Payment Method</Label>
              <Select value={selectedPaymentMethod} onValueChange={setSelectedPaymentMethod}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Methods</SelectItem>
                  <SelectItem value="Salary Deduction">Salary Deduction</SelectItem>
                  <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                  <SelectItem value="Cash">Cash</SelectItem>
                  <SelectItem value="Mobile Money">Mobile Money</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Date Range</Label>
              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="30days">Last 30 days</SelectItem>
                  <SelectItem value="90days">Last 90 days</SelectItem>
                  <SelectItem value="1year">Last year</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contributions Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Contribution History</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Showing {paginatedContributions.length} of {filteredContributions.length} contributions
              </p>
            </div>
            <Badge variant="outline">
              {filteredContributions.length} Records
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Payment Method</TableHead>
                  <TableHead>Reference</TableHead>
                  <TableHead className="text-right">Balance After</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedContributions.map((contribution) => (
                  <TableRow key={contribution.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        {formatDate(contribution.transaction_date)}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1 text-green-600">
                        <ArrowUpRight className="h-4 w-4" />
                        <span className="font-medium">
                          {formatCurrency(contribution.amount)}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="max-w-48 truncate">
                        {contribution.description}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(contribution.status)}
                        <Badge variant={getStatusBadgeVariant(contribution.status)}>
                          {contribution.status}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>{contribution.payment_method}</TableCell>
                    <TableCell className="font-mono text-sm">
                      {contribution.reference_no}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCurrency(contribution.balance_after)}
                    </TableCell>
                    <TableCell>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="max-w-2xl">
                          <AlertDialogHeader>
                            <AlertDialogTitle>Contribution Details</AlertDialogTitle>
                            <AlertDialogDescription>
                              Complete information for this contribution
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <div className="grid grid-cols-2 gap-4 py-4">
                            <div>
                              <Label className="text-sm font-medium">Date</Label>
                              <p className="text-sm">{formatDate(contribution.transaction_date)}</p>
                            </div>
                            <div>
                              <Label className="text-sm font-medium">Amount</Label>
                              <p className="text-sm font-medium text-green-600">
                                {formatCurrency(contribution.amount)}
                              </p>
                            </div>
                            <div>
                              <Label className="text-sm font-medium">Status</Label>
                              <div className="flex items-center gap-2">
                                {getStatusIcon(contribution.status)}
                                <span className="text-sm">{contribution.status}</span>
                              </div>
                            </div>
                            <div>
                              <Label className="text-sm font-medium">Payment Method</Label>
                              <p className="text-sm">{contribution.payment_method}</p>
                            </div>
                            <div className="col-span-2">
                              <Label className="text-sm font-medium">Description</Label>
                              <p className="text-sm">{contribution.description}</p>
                            </div>
                            <div className="col-span-2">
                              <Label className="text-sm font-medium">Reference Number</Label>
                              <p className="text-sm font-mono">{contribution.reference_no}</p>
                            </div>
                            <div>
                              <Label className="text-sm font-medium">Balance After Transaction</Label>
                              <p className="text-sm font-medium">
                                {formatCurrency(contribution.balance_after)}
                              </p>
                            </div>
                          </div>
                          <AlertDialogFooter>
                            <AlertDialogAction>Close</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6">
              <div className="text-sm text-muted-foreground">
                Page {currentPage} of {totalPages}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}

          {/* Empty State */}
          {filteredContributions.length === 0 && (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No contributions found</h3>
              <p className="text-muted-foreground">
                {searchTerm || selectedStatus !== 'all' || selectedPaymentMethod !== 'all' 
                  ? 'Try adjusting your filters to see more results'
                  : 'Your contribution history will appear here'
                }
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}