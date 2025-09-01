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
import { Label } from "@/components/ui/label";
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
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
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
  FileText,
  Search,
  Filter,
  Download,
  Eye,
  Calendar,
  ArrowUpDown,
  TrendingUp,
  TrendingDown,
  DollarSign,
  CreditCard,
  Banknote,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  CheckCircle,
  Clock,
  XCircle,
  AlertTriangle
} from "lucide-react";
import { toast } from "sonner";
import { useCurrentUser } from "@/hooks/useCurrentUser";

// Transaction types and status
const transactionTypes = [
  'Contribution',
  'Loan Disbursement',
  'Loan Repayment',
  'Interest Payment',
  'Service Charge',
  'Registration Fee',
  'Withdrawal',
  'Transfer',
  'Penalty',
  'Refund'
];

const transactionStatuses = [
  'Completed',
  'Pending',
  'Failed',
  'Cancelled',
  'Processing'
];

const paymentMethods = [
  'Bank Transfer',
  'Cash',
  'Check',
  'Mobile Money',
  'Salary Deduction',
  'Online Payment'
];

// Sample transaction data
const sampleTransactions = [
  {
    id: 'TXN001',
    date: '2024-08-30',
    type: 'Contribution',
    description: 'Monthly contribution payment',
    amount: 50000,
    balance: 450000,
    status: 'Completed',
    paymentMethod: 'Salary Deduction',
    reference: 'SAL-202408-001',
    category: 'Credit'
  },
  {
    id: 'TXN002',
    date: '2024-08-25',
    type: 'Loan Repayment',
    description: 'Personal loan installment payment',
    amount: -25000,
    balance: 400000,
    status: 'Completed',
    paymentMethod: 'Bank Transfer',
    reference: 'LRP-202408-002',
    category: 'Debit'
  },
  {
    id: 'TXN003',
    date: '2024-08-20',
    type: 'Interest Payment',
    description: 'Interest earned on savings',
    amount: 5000,
    balance: 425000,
    status: 'Completed',
    paymentMethod: 'System Credit',
    reference: 'INT-202408-003',
    category: 'Credit'
  },
  {
    id: 'TXN004',
    date: '2024-08-15',
    type: 'Service Charge',
    description: 'Monthly account maintenance fee',
    amount: -1000,
    balance: 420000,
    status: 'Completed',
    paymentMethod: 'Auto Debit',
    reference: 'SVC-202408-004',
    category: 'Debit'
  },
  {
    id: 'TXN005',
    date: '2024-08-10',
    type: 'Loan Disbursement',
    description: 'Personal loan disbursement',
    amount: 200000,
    balance: 421000,
    status: 'Completed',
    paymentMethod: 'Bank Transfer',
    reference: 'LDB-202408-005',
    category: 'Credit'
  },
  {
    id: 'TXN006',
    date: '2024-08-05',
    type: 'Contribution',
    description: 'Monthly contribution payment',
    amount: 50000,
    balance: 221000,
    status: 'Processing',
    paymentMethod: 'Cash',
    reference: 'CSH-202408-006',
    category: 'Credit'
  },
  {
    id: 'TXN007',
    date: '2024-07-30',
    type: 'Withdrawal',
    description: 'Emergency withdrawal request',
    amount: -75000,
    balance: 171000,
    status: 'Pending',
    paymentMethod: 'Bank Transfer',
    reference: 'WDR-202407-007',
    category: 'Debit'
  },
  {
    id: 'TXN008',
    date: '2024-07-25',
    type: 'Transfer',
    description: 'Transfer to savings account',
    amount: -30000,
    balance: 246000,
    status: 'Failed',
    paymentMethod: 'Internal Transfer',
    reference: 'TRF-202407-008',
    category: 'Debit'
  }
];

export default function MemberTransactionsPage() {
  const { user } = useCurrentUser();
  const [transactions, setTransactions] = useState(sampleTransactions);
  const [filteredTransactions, setFilteredTransactions] = useState(sampleTransactions);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [dateRange, setDateRange] = useState('all');
  const [sortOrder, setSortOrder] = useState('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [isLoading, setIsLoading] = useState(false);

  // Filter and search logic
  useEffect(() => {
    let filtered = transactions;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(transaction =>
        transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transaction.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transaction.id.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Type filter
    if (selectedType !== 'all') {
      filtered = filtered.filter(transaction => transaction.type === selectedType);
    }

    // Status filter
    if (selectedStatus !== 'all') {
      filtered = filtered.filter(transaction => transaction.status === selectedStatus);
    }

    // Category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(transaction => transaction.category === selectedCategory);
    }

    // Date range filter
    if (dateRange !== 'all') {
      const now = new Date();
      const filterDate = new Date();
      
      switch (dateRange) {
        case '7days':
          filterDate.setDate(now.getDate() - 7);
          break;
        case '30days':
          filterDate.setDate(now.getDate() - 30);
          break;
        case '90days':
          filterDate.setDate(now.getDate() - 90);
          break;
        default:
          filterDate.setFullYear(now.getFullYear() - 1);
      }

      filtered = filtered.filter(transaction =>
        new Date(transaction.date) >= filterDate
      );
    }

    // Sort by date
    filtered = filtered.sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      return sortOrder === 'desc' ? dateB.getTime() - dateA.getTime() : dateA.getTime() - dateB.getTime();
    });

    setFilteredTransactions(filtered);
    setCurrentPage(1);
  }, [transactions, searchTerm, selectedType, selectedStatus, selectedCategory, dateRange, sortOrder]);

  // Pagination
  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedTransactions = filteredTransactions.slice(startIndex, startIndex + itemsPerPage);

  // Summary calculations
  const totalCredits = filteredTransactions
    .filter(t => t.category === 'Credit' && t.status === 'Completed')
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);

  const totalDebits = filteredTransactions
    .filter(t => t.category === 'Debit' && t.status === 'Completed')
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);

  const netAmount = totalCredits - totalDebits;
  const pendingAmount = filteredTransactions
    .filter(t => t.status === 'Pending' || t.status === 'Processing')
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'Pending':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'Processing':
        return <RefreshCw className="h-4 w-4 text-blue-600 animate-spin" />;
      case 'Failed':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'Cancelled':
        return <AlertTriangle className="h-4 w-4 text-gray-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'Completed':
        return 'default';
      case 'Pending':
        return 'secondary';
      case 'Processing':
        return 'outline';
      case 'Failed':
        return 'destructive';
      case 'Cancelled':
        return 'outline';
      default:
        return 'secondary';
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

  const exportTransactions = () => {
    const dataToExport = filteredTransactions.map(transaction => ({
      'Transaction ID': transaction.id,
      'Date': formatDate(transaction.date),
      'Type': transaction.type,
      'Description': transaction.description,
      'Amount': formatCurrency(transaction.amount),
      'Balance': formatCurrency(transaction.balance),
      'Status': transaction.status,
      'Payment Method': transaction.paymentMethod,
      'Reference': transaction.reference,
      'Category': transaction.category
    }));

    const csv = [
      Object.keys(dataToExport[0]).join(','),
      ...dataToExport.map(row => Object.values(row).join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `member-transactions-${user?.staffNo}-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);

    toast.success('Transaction history exported successfully!');
  };

  const refreshTransactions = async () => {
    try {
      setIsLoading(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      toast.success('Transaction history refreshed!');
    } catch (error) {
      toast.error('Failed to refresh transaction history');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <FileText className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Transaction History</h1>
            <p className="text-muted-foreground">View and manage your complete transaction record</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={refreshTransactions} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button variant="outline" onClick={exportTransactions}>
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Credits</p>
                <p className="text-2xl font-bold text-green-600">{formatCurrency(totalCredits)}</p>
              </div>
              <div className="p-2 bg-green-100 rounded-lg">
                <TrendingUp className="h-5 w-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Debits</p>
                <p className="text-2xl font-bold text-red-600">{formatCurrency(totalDebits)}</p>
              </div>
              <div className="p-2 bg-red-100 rounded-lg">
                <TrendingDown className="h-5 w-5 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Net Amount</p>
                <p className={`text-2xl font-bold ${netAmount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(netAmount)}
                </p>
              </div>
              <div className={`p-2 rounded-lg ${netAmount >= 0 ? 'bg-green-100' : 'bg-red-100'}`}>
                <DollarSign className={`h-5 w-5 ${netAmount >= 0 ? 'text-green-600' : 'text-red-600'}`} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pending Amount</p>
                <p className="text-2xl font-bold text-yellow-600">{formatCurrency(pendingAmount)}</p>
              </div>
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock className="h-5 w-5 text-yellow-600" />
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
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="space-y-2">
              <Label htmlFor="search">Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Search transactions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Transaction Type</Label>
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {transactionTypes.map(type => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  {transactionStatuses.map(status => (
                    <SelectItem key={status} value={status}>{status}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="Credit">Credit</SelectItem>
                  <SelectItem value="Debit">Debit</SelectItem>
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
                  <SelectItem value="7days">Last 7 days</SelectItem>
                  <SelectItem value="30days">Last 30 days</SelectItem>
                  <SelectItem value="90days">Last 90 days</SelectItem>
                  <SelectItem value="1year">Last year</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Sort Order</Label>
              <Select value={sortOrder} onValueChange={setSortOrder}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="desc">Newest First</SelectItem>
                  <SelectItem value="asc">Oldest First</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Transactions Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Transaction Details</CardTitle>
              <CardDescription>
                Showing {paginatedTransactions.length} of {filteredTransactions.length} transactions
              </CardDescription>
            </div>
            <Badge variant="outline" className="text-sm">
              {filteredTransactions.length} Results
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Transaction ID</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead className="text-right">Balance</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Payment Method</TableHead>
                  <TableHead>Reference</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedTransactions.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        {formatDate(transaction.date)}
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{transaction.id}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{transaction.type}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="max-w-48 truncate">
                        {transaction.description}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className={`flex items-center justify-end gap-1 ${
                        transaction.amount > 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {transaction.amount > 0 ? (
                          <ArrowUpRight className="h-4 w-4" />
                        ) : (
                          <ArrowDownRight className="h-4 w-4" />
                        )}
                        <span className="font-medium">
                          {formatCurrency(Math.abs(transaction.amount))}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCurrency(transaction.balance)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(transaction.status)}
                        <Badge variant={getStatusBadgeVariant(transaction.status)}>
                          {transaction.status}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>{transaction.paymentMethod}</TableCell>
                    <TableCell className="font-mono text-sm">
                      {transaction.reference}
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
                            <AlertDialogTitle>Transaction Details</AlertDialogTitle>
                            <AlertDialogDescription>
                              Complete information for transaction {transaction.id}
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <div className="grid grid-cols-2 gap-4 py-4">
                            <div>
                              <Label className="text-sm font-medium">Transaction ID</Label>
                              <p className="text-sm font-mono">{transaction.id}</p>
                            </div>
                            <div>
                              <Label className="text-sm font-medium">Date & Time</Label>
                              <p className="text-sm">{formatDate(transaction.date)}</p>
                            </div>
                            <div>
                              <Label className="text-sm font-medium">Type</Label>
                              <p className="text-sm">{transaction.type}</p>
                            </div>
                            <div>
                              <Label className="text-sm font-medium">Category</Label>
                              <p className="text-sm">{transaction.category}</p>
                            </div>
                            <div>
                              <Label className="text-sm font-medium">Amount</Label>
                              <p className={`text-sm font-medium ${
                                transaction.amount > 0 ? 'text-green-600' : 'text-red-600'
                              }`}>
                                {formatCurrency(transaction.amount)}
                              </p>
                            </div>
                            <div>
                              <Label className="text-sm font-medium">Balance After</Label>
                              <p className="text-sm font-medium">{formatCurrency(transaction.balance)}</p>
                            </div>
                            <div>
                              <Label className="text-sm font-medium">Status</Label>
                              <div className="flex items-center gap-2">
                                {getStatusIcon(transaction.status)}
                                <span className="text-sm">{transaction.status}</span>
                              </div>
                            </div>
                            <div>
                              <Label className="text-sm font-medium">Payment Method</Label>
                              <p className="text-sm">{transaction.paymentMethod}</p>
                            </div>
                            <div className="col-span-2">
                              <Label className="text-sm font-medium">Description</Label>
                              <p className="text-sm">{transaction.description}</p>
                            </div>
                            <div className="col-span-2">
                              <Label className="text-sm font-medium">Reference Number</Label>
                              <p className="text-sm font-mono">{transaction.reference}</p>
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
          {filteredTransactions.length === 0 && (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No transactions found</h3>
              <p className="text-muted-foreground">
                {searchTerm || selectedType !== 'all' || selectedStatus !== 'all' 
                  ? 'Try adjusting your filters to see more results'
                  : 'Your transaction history will appear here'
                }
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
