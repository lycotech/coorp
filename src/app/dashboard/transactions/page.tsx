'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { Search, Download, CheckCircle, XCircle } from 'lucide-react';
import Link from 'next/link';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { AuthorizationGuard } from '@/components/AuthorizationGuard';

// --- Interfaces ---
interface MemberBalances {
    [key: string]: number | null; // Map transaction type names to balances
}

interface TransactionInput {
    [key: string]: string; // Map transaction type names to input amount strings
}

// Interface for pending transaction data
interface PendingTransaction {
  id: number;
  reg_no: string | null;
  staff_no: string | null;
  transaction_type_name: string | null;
  transaction_date: string | null;
  transaction_mode: string | null;
  amount: number | null;
  description: string | null;
  upload_batch_id: string | null;
  validation_status: string | null;
  validation_errors: string | null;
}

// Interface for grouped batches
interface PendingBatch {
    batchId: string;
    transactions: PendingTransaction[];
    status: string; // Overall status for the batch
    canApprove: boolean;
}

// TODO: Fetch these dynamically or define constants
const CREDIT_TYPES = ['Contribution', 'Savings', 'Commodity', 'Loan Credit', 'Interest Credit', 'Share Credit', 'Deposit Credit'];
const DEBIT_TYPES = ['Withdrawal', 'Commodity Debit', 'Loan Debit', 'Interest Debit', 'Share Debit', 'Deposit Debit'];
const TRANSACTION_MODES = ['Cash', 'Cheque', 'Transfer', 'Journal', 'Upload'];

function TransactionPostPageContent() {
    const [staffNo, setStaffNo] = useState('');
    const [isFetchingBalances, setIsFetchingBalances] = useState(false);
    const [balances, setBalances] = useState<MemberBalances>({});
    const [transactionInputs, setTransactionInputs] = useState<TransactionInput>({});
    const [transactionMode, setTransactionMode] = useState('');
    const [transactionDate, setTransactionDate] = useState<Date | undefined>(undefined);
    const [isPostingSingle, setIsPostingSingle] = useState(false);

    // State for Multi-Post (Upload)
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadError, setUploadError] = useState<string | null>(null);
    const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);

    // State for Pending Transactions
    const [pendingTransactions, setPendingTransactions] = useState<PendingTransaction[]>([]);
    const [isLoadingPending, setIsLoadingPending] = useState(false);
    const [fetchPendingError, setFetchPendingError] = useState<string | null>(null);
    const [actionLoading, setActionLoading] = useState<Record<string, boolean>>({});

    // Fetch pending transactions on mount
    useEffect(() => {
        fetchPendingTransactions();
    }, []);

    const handleFetchBalances = async () => {
        if (!staffNo) {
            toast.warning("Please enter a Staff Number.");
            return;
        }
        setIsFetchingBalances(true);
        setBalances({}); // Clear previous balances
        try {
            const response = await fetch(`/api/members/${staffNo}/balances`);
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to fetch balances');
            }
            const data: MemberBalances = await response.json();
            setBalances(data);
            toast.success(`Balances fetched for Staff No: ${staffNo}`);
        } catch (error) {
            console.error("Fetch balances error:", error);
            const message = error instanceof Error ? error.message : "Failed to fetch balances";
            toast.error("Error Fetching Balances", { description: message });
        } finally {
            setIsFetchingBalances(false);
        }
    };

    const handleInputChange = (type: string, value: string) => {
        // Allow only numbers and one decimal point
        const sanitizedValue = value.replace(/[^\d.]/g, '').replace(/(\..*)\./g, '$1');
        setTransactionInputs(prev => ({ ...prev, [type]: sanitizedValue }));
    };

    const handlePostTransaction = async () => {
        setIsPostingSingle(true);
        console.log("Posting Single Transaction:", {
            staffNo,
            inputs: transactionInputs,
            mode: transactionMode,
            date: transactionDate,
        });
        toast.info("Single transaction posting not implemented yet.");
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500));
        setIsPostingSingle(false);
    };

    const handleClearFields = () => {
        setTransactionInputs({});
        setTransactionMode('');
        setTransactionDate(undefined);
        toast.info("Input fields cleared.");
    };

    // --- Handlers for Multi-Post (Upload) ---
    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files.length > 0) {
            setSelectedFile(event.target.files[0]);
            setUploadError(null);
            setUploadSuccess(null);
        }
    };

    const handleUpload = async () => {
        if (!selectedFile) return;
        setIsUploading(true);
        setUploadError(null);
        setUploadSuccess(null);
        const formData = new FormData();
        formData.append('file', selectedFile);

        try {
            const response = await fetch('/api/transactions/upload', { // Updated endpoint
                method: 'POST',
                body: formData,
            });
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.error || 'Transaction upload failed');
            }
            const successMessage = data.message || 'Transaction file uploaded successfully. Batch pending approval.';
            setUploadSuccess(successMessage);
            setSelectedFile(null);
            const fileInput = document.getElementById('multi-post-file') as HTMLInputElement;
            if (fileInput) fileInput.value = '';
            toast.success("Upload Successful", { description: successMessage });
            fetchPendingTransactions(); // Refresh list after upload
        } catch (error) {
            const message = error instanceof Error ? error.message : "An unknown error occurred during upload";
            setUploadError(message);
            toast.error("Upload Error", { description: message });
        } finally {
            setIsUploading(false);
        }
    };

    // Function to fetch pending transactions
    const fetchPendingTransactions = async () => {
        setIsLoadingPending(true);
        setFetchPendingError(null);
        try {
            const response = await fetch('/api/transactions/pending');
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to fetch pending transactions');
            }
            const data: PendingTransaction[] = await response.json();
            setPendingTransactions(data);
        } catch (error) {
            console.error("Fetch pending transactions error:", error);
            const message = error instanceof Error ? error.message : "Failed to fetch pending transactions";
            setFetchPendingError(message);
            toast.error("Error Fetching Pending Transactions", { description: message });
        } finally {
            setIsLoadingPending(false);
        }
    };

    // Group transactions by batch ID
    const groupedBatches = useMemo(() => {
        const groups: Record<string, PendingTransaction[]> = {};
        pendingTransactions.forEach(trans => {
            const batchId = trans.upload_batch_id || 'unknown_batch';
            if (!groups[batchId]) {
                groups[batchId] = [];
            }
            groups[batchId].push(trans);
        });

        return Object.entries(groups).map(([batchId, transactions]): PendingBatch => {
            const hasInvalid = transactions.some(t => t.validation_status === 'Invalid');
            const status = hasInvalid ? 'Pending Validation' : 'Validated';
            const canApprove = !hasInvalid;
            return { batchId, transactions, status, canApprove };
        });
    }, [pendingTransactions]);

    // Placeholder Handlers for Approve/Reject
    const handleApproveBatch = async (batchId: string) => {
        setActionLoading(prev => ({ ...prev, [batchId]: true }));
        console.log("Approving Transaction Batch:", batchId);
        try {
            // TODO: Implement API call: POST /api/transactions/batches/approve
            await new Promise(resolve => setTimeout(resolve, 1000));
            toast.success("Batch Approved (Simulated)", { description: `Batch ${batchId} marked for approval.` });
            fetchPendingTransactions(); // Refresh list
        } catch (error) {
            const message = error instanceof Error ? error.message : "Failed to approve batch";
            toast.error("Approval Error", { description: message });
        } finally {
            setActionLoading(prev => ({ ...prev, [batchId]: false }));
        }
    };

    const handleRejectBatch = async (batchId: string) => {
        setActionLoading(prev => ({ ...prev, [batchId]: true }));
        console.log("Rejecting Transaction Batch:", batchId);
        try {
            // TODO: Implement API call: POST /api/transactions/batches/reject
            await new Promise(resolve => setTimeout(resolve, 1000));
            toast.info("Batch Rejected (Simulated)", { description: `Batch ${batchId} marked as rejected.` });
            fetchPendingTransactions(); // Refresh list
        } catch (error) {
            const message = error instanceof Error ? error.message : "Failed to reject batch";
            toast.error("Rejection Error", { description: message });
        } finally {
            setActionLoading(prev => ({ ...prev, [batchId]: false }));
        }
    };

    // Format balance for display
    const formatBalance = (balance: number | null | undefined): string => {
        if (balance === null || balance === undefined) return 'N/A';
        return balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    };

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-semibold">Transaction Post</h1>

            {/* Top Section: Staff Search & Actions */}
            <Card>
                <CardContent className="pt-6">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                        <div className="flex items-center gap-2">
                            <Label htmlFor="staff-no" className="whitespace-nowrap">Staff No.</Label>
                            <Input
                                id="staff-no"
                                value={staffNo}
                                onChange={(e) => setStaffNo(e.target.value)}
                                placeholder="Enter Staff No..."
                                className="w-40"
                            />
                            <Button size="icon" onClick={handleFetchBalances} disabled={isFetchingBalances || !staffNo}>
                                {isFetchingBalances ? <span className="loading loading-spinner loading-xs"></span> : <Search className="h-4 w-4" />}
                            </Button>
                        </div>
                        <div className="flex items-center gap-4">
                            {/* TODO: Implement these actions */}
                            <Button variant="link" className="text-purple-600 p-0 h-auto">Print Statement</Button>
                            <Button variant="link" className="text-purple-600 p-0 h-auto">Print Balances</Button>
                            <Button variant="link" className="text-purple-600 p-0 h-auto">Create Account</Button>
                        </div>
                    </div>
                    <div className="mt-2 text-sm">
                        Balance: <span className="font-medium">{formatBalance(balances['Contribution'] ?? null)}</span>
                    </div>
                </CardContent>
            </Card>

            {/* Middle Section: Single Transaction Posting */}
            <Card>
                <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                    {/* Credit Side */}
                    <div className="space-y-2">
                        {CREDIT_TYPES.map(type => (
                            <div key={type} className="grid grid-cols-3 items-center gap-2">
                                <Label htmlFor={type} className="text-sm text-right">{type}</Label>
                                <Input
                                    id={type}
                                    type="text" // Use text for custom validation
                                    inputMode="decimal"
                                    value={transactionInputs[type] || ''}
                                    onChange={(e) => handleInputChange(type, e.target.value)}
                                    placeholder="0.00"
                                    className="col-span-2 h-8"
                                />
                            </div>
                        ))}
                         <div className="grid grid-cols-3 items-center gap-2 pt-2">
                             <Label htmlFor="transaction-mode" className="text-sm text-right">Transaction Mode</Label>
                             <Select value={transactionMode} onValueChange={setTransactionMode}>
                                <SelectTrigger className="col-span-2 h-8">
                                    <SelectValue placeholder="Select Mode..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {TRANSACTION_MODES.map(mode => (
                                        <SelectItem key={mode} value={mode}>{mode}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                         </div>
                    </div>

                    {/* Debit Side */}
                    <div className="space-y-2">
                         <div className="grid grid-cols-3 items-center gap-2">
                             <Label className="text-sm text-right">Staff Number</Label>
                             <Input value={staffNo} readOnly disabled className="col-span-2 h-8 bg-muted" />
                         </div>
                        {DEBIT_TYPES.map(type => (
                            <div key={type} className="grid grid-cols-3 items-center gap-2">
                                <Label htmlFor={type} className="text-sm text-right">{type}</Label>
                                <Input
                                    id={type}
                                    type="text"
                                    inputMode="decimal"
                                    value={transactionInputs[type] || ''}
                                    onChange={(e) => handleInputChange(type, e.target.value)}
                                    placeholder="0.00"
                                    className="col-span-2 h-8"
                                />
                            </div>
                        ))}
                         <div className="grid grid-cols-3 items-center gap-2 pt-2">
                             <Label htmlFor="transaction-date" className="text-sm text-right">Transaction Date</Label>
                             <Input
                                id="transaction-date"
                                type="date"
                                value={transactionDate ? transactionDate.toISOString().split('T')[0] : ''}
                                onChange={(e) => setTransactionDate(e.target.value ? new Date(e.target.value) : undefined)}
                                className="col-span-2 h-8"
                             />
                         </div>
                    </div>
                </CardContent>
                <CardContent>
                     <div className="flex items-center gap-4 mt-4">
                        <Button onClick={handlePostTransaction} disabled={isPostingSingle} className="bg-purple-600 hover:bg-purple-700">
                            {isPostingSingle ? 'Posting...' : 'Post Transaction'}
                        </Button>
                        <Button variant="outline" onClick={handleClearFields}>Clear Fields</Button>
                    </div>
                </CardContent>
            </Card>

            {/* Bottom Section: Multi-Post & Shares */}
            <Card>
                <CardContent className="pt-6 space-y-4">
                    {/* Shares Section (Placeholder) */}
                    <div className="flex flex-wrap items-end gap-4">
                        <div className="grid gap-1.5">
                            <Label htmlFor="transaction-id">Transaction ID</Label>
                            <Input id="transaction-id" placeholder="Enter ID..." className="h-8" />
                            <Button variant="link" size="sm" className="text-red-600 p-0 h-auto justify-start">Remove</Button>
                        </div>
                         <div className="grid gap-1.5">
                            <Label htmlFor="transaction-date-remove">Date</Label>
                             {/* <DatePicker className="h-8"/> */}
                            <Input type="date" className="h-8" />
                            <Button variant="link" size="sm" className="text-red-600 p-0 h-auto justify-start">Remove</Button>
                        </div>
                         <div className="grid gap-1.5">
                            <Label htmlFor="shares-amount">Shares amount</Label>
                            <Input id="shares-amount" placeholder="Amount..." className="h-8" />
                            <Button variant="link" size="sm" className="text-purple-600 p-0 h-auto justify-start">Post Shares</Button>
                        </div>
                    </div>

                    <Separator />

                    {/* Multi-Post Section */}
                    <div>
                        <Label className="text-base font-medium">Multiple Post - Pending Approval</Label>
                         {/* Template Download Link */}
                        <div className="my-2">
                            <Link href="/transaction_upload_template.xlsx" download className="text-sm text-blue-600 hover:underline inline-flex items-center">
                                <Download className="h-4 w-4 mr-1" />
                                Download Sample Upload Template (.xlsx)
                            </Link>
                        </div>
                        <div className="flex flex-wrap items-end gap-4 mb-4">
                            <div className="grid w-full max-w-sm items-center gap-1.5">
                                <Label htmlFor="multi-post-file" className="sr-only">Upload Transaction File</Label>
                                <Input
                                    id="multi-post-file"
                                    type="file"
                                    accept=".xlsx, .xls, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
                                    onChange={handleFileChange}
                                    disabled={isUploading}
                                />
                            </div>
                             {/* Button wiring updated */}
                            {/* Removed Upload button - Post handles upload */}
                            <Button size="sm" variant="outline" disabled={!selectedFile}>View</Button> {/* TODO: Implement View */} 
                            <Button size="sm" variant="outline">Clear View</Button> {/* TODO: Implement Clear View */} 
                            <Button size="sm" onClick={handleUpload} disabled={!selectedFile || isUploading} className="bg-purple-600 hover:bg-purple-700">Post</Button>
                        </div>
                         {uploadError && <p className="text-sm text-red-600">{uploadError}</p>}
                         {uploadSuccess && <p className="text-sm text-green-600">{uploadSuccess}</p>}

                         {/* Pending Batch Display Table */} 
                        <div className="mt-4">
                            {isLoadingPending && <p>Loading pending transactions...</p>}
                            {fetchPendingError && <p className="text-red-600">Error loading pending transactions: {fetchPendingError}</p>}
                            {!isLoadingPending && !fetchPendingError && groupedBatches.length === 0 && (
                                <p className="text-center text-muted-foreground py-4">No pending transaction batches found.</p>
                            )}
                            {!isLoadingPending && !fetchPendingError && groupedBatches.length > 0 && (
                                <div className="space-y-4">
                                    {groupedBatches.map(({ batchId, transactions, canApprove }) => (
                                        <div key={batchId} className="border rounded-md p-4">
                                            <div className="flex justify-between items-center mb-2">
                                                <h3 className="font-semibold">Batch ID: <Badge variant="secondary">{batchId}</Badge></h3>
                                                <div className="space-x-2">
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        className="border-green-500 text-green-600 hover:bg-green-50"
                                                        onClick={() => handleApproveBatch(batchId)}
                                                        disabled={!canApprove || actionLoading[batchId]}
                                                    >
                                                        {actionLoading[batchId] ? 'Approving...' : <><CheckCircle className="h-4 w-4 mr-1"/> Approve Batch</>}
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="destructive"
                                                        onClick={() => handleRejectBatch(batchId)}
                                                        disabled={actionLoading[batchId]}
                                                    >
                                                         {actionLoading[batchId] ? 'Rejecting...' : <><XCircle className="h-4 w-4 mr-1"/> Reject Batch</>}
                                                    </Button>
                                                </div>
                                            </div>
                                            <Table>
                                                <TableHeader>
                                                <TableRow>
                                                    <TableHead>Reg No</TableHead>
                                                    <TableHead>Staff No</TableHead>
                                                    <TableHead>Type</TableHead>
                                                    <TableHead>Date</TableHead>
                                                    <TableHead>Mode</TableHead>
                                                    <TableHead>Amount</TableHead>
                                                    <TableHead>Validation</TableHead>
                                                </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                {transactions.map((trans) => (
                                                    <TableRow key={trans.id}>
                                                    <TableCell>{trans.reg_no}</TableCell>
                                                    <TableCell>{trans.staff_no}</TableCell>
                                                    <TableCell>{trans.transaction_type_name}</TableCell>
                                                    <TableCell>{trans.transaction_date}</TableCell>
                                                    <TableCell>{trans.transaction_mode}</TableCell>
                                                    <TableCell>{trans.amount?.toLocaleString()}</TableCell>
                                                    <TableCell>
                                                        {trans.validation_status === 'Valid' && <Badge variant="secondary">Valid</Badge>}
                                                        {trans.validation_status === 'Invalid' && (
                                                            <Badge variant="destructive" title={trans.validation_errors || 'Invalid data'}>Invalid</Badge>
                                                        )}
                                                        {trans.validation_status !== 'Valid' && trans.validation_status !== 'Invalid' && (
                                                            <Badge variant="secondary">{trans.validation_status || 'Pending'}</Badge>
                                                        )}
                                                    </TableCell>
                                                    </TableRow>
                                                ))}
                                                </TableBody>
                                            </Table>
                                        </div>
                                    ))}
                                </div>
                            )}
                         </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

export default function TransactionPostPage() {
  return (
    <AuthorizationGuard allowedRoles={['Treasurer', 'President', 'SuperAdmin']}>
      <TransactionPostPageContent />
    </AuthorizationGuard>
  );
} 