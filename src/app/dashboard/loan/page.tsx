'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
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
import { toast } from "sonner";
import { CheckCircle, XCircle, Download } from 'lucide-react';
import { AuthorizationGuard } from '@/components/AuthorizationGuard';

// Interface matching the data from /api/loans/pending
interface PendingLoan {
  id: number;
  ref_no: string | null;
  staff_no: string | null;
  reg_no: string | null;
  loan_type: string | null;
  amount_requested: number | null;
  monthly_repayment: number | null;
  repayment_period: number | null;
  interest_rate: number | null;
  purpose: string | null;
  date_applied: string | null;
  upload_batch_id: string | null;
  validation_status: string | null;
  validation_errors: string | null;
}

// Interface for grouped batches
interface PendingBatch {
    batchId: string;
    loans: PendingLoan[];
    status: string; // Overall status for the batch (e.g., Validated, Pending Validation)
    canApprove: boolean;
}

function LoanManagerPageContent() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);

  const [pendingLoans, setPendingLoans] = useState<PendingLoan[]>([]);
  const [isLoadingPending, setIsLoadingPending] = useState(false);
  const [fetchPendingError, setFetchPendingError] = useState<string | null>(null);

  const [loanRef, setLoanRef] = useState('');
  const [actionLoading, setActionLoading] = useState<Record<string, boolean>>({});

  // Fetch pending loans on component mount
  useEffect(() => {
    fetchPendingLoans();
  }, []);

  const fetchPendingLoans = async () => {
    setIsLoadingPending(true);
    setFetchPendingError(null);
    try {
      const response = await fetch('/api/loans/pending');
      if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to fetch pending loans');
      }
      const data: PendingLoan[] = await response.json();
      setPendingLoans(data);
    } catch (error) {
      console.error("Fetch pending loans error:", error);
      const message = error instanceof Error ? error.message : "Failed to fetch pending loans";
      setFetchPendingError(message);
      toast.error("Error Fetching Pending Loans", { description: message });
    } finally {
      setIsLoadingPending(false);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setSelectedFile(event.target.files[0]);
      setUploadError(null);
      setUploadSuccess(null);
    }
  };

  const handlePostLoan = async () => {
    if (!selectedFile) {
      setUploadError('Please select a file to upload.');
      return;
    }
    setIsUploading(true);
    setUploadError(null);
    setUploadSuccess(null);

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const response = await fetch('/api/loans/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Loan upload failed');
      }

      const successMessage = data.message || 'Loan file uploaded successfully. Batch pending approval.';
      setUploadSuccess(successMessage);
      setSelectedFile(null);
      const fileInput = document.getElementById('loan-file') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
      toast.success("Upload Successful", { description: successMessage });
      fetchPendingLoans();

    } catch (error) {
      console.error('Loan upload error:', error);
       const message = error instanceof Error ? error.message : "An unknown error occurred during upload";
      setUploadError(message);
       toast.error("Upload Error", { description: message });
    } finally {
      setIsUploading(false);
    }
  };

  // Group loans by batch ID for display
  const groupedBatches = useMemo(() => {
    const groups: Record<string, PendingLoan[]> = {};
    pendingLoans.forEach(loan => {
      const batchId = loan.upload_batch_id || 'unknown_batch';
      if (!groups[batchId]) {
        groups[batchId] = [];
      }
      groups[batchId].push(loan);
    });

    return Object.entries(groups).map(([batchId, loans]): PendingBatch => {
        // Determine batch status and approvability
        // Simple logic: Can approve if no loans are 'Invalid'
        const hasInvalid = loans.some(l => l.validation_status === 'Invalid');
        const canApprove = !hasInvalid;
        return { batchId, loans, status: hasInvalid ? 'Pending Validation' : 'Validated', canApprove };
    });

  }, [pendingLoans]);

  // Handlers for Approve/Reject
  const handleApproveBatch = async (batchId: string) => {
    setActionLoading(prev => ({ ...prev, [batchId]: true }));
    console.log("Approving Batch:", batchId);
    try {
        const response = await fetch('/api/loans/batches/approve', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ batchId }),
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error || 'Failed to approve batch');
        }

        toast.success("Batch Approved Successfully", { description: `Batch ${batchId} has been approved and processed.` });
        fetchPendingLoans();
    } catch (error) {
        console.error("Approve batch error:", error);
        const message = error instanceof Error ? error.message : "Failed to approve batch";
        toast.error("Approval Error", { description: message });
    } finally {
        setActionLoading(prev => ({ ...prev, [batchId]: false }));
    }
  };

  const handleRejectBatch = async (batchId: string) => {
    setActionLoading(prev => ({ ...prev, [batchId]: true }));
    console.log("Rejecting Batch:", batchId);
    
    const rejectionReason = prompt("Please provide a reason for rejection:");
    if (!rejectionReason) {
        setActionLoading(prev => ({ ...prev, [batchId]: false }));
        return;
    }
    
    try {
        const response = await fetch('/api/loans/batches/reject', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ batchId, rejectionReason }),
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error || 'Failed to reject batch');
        }

        toast.info("Batch Rejected Successfully", { description: `Batch ${batchId} has been rejected.` });
        fetchPendingLoans();
    } catch (error) {
        console.error("Reject batch error:", error);
        const message = error instanceof Error ? error.message : "Failed to reject batch";
        toast.error("Rejection Error", { description: message });
    } finally {
        setActionLoading(prev => ({ ...prev, [batchId]: false }));
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Loan Manager</h1>

      {/* Upload Section */}
      <Card>
        <CardContent className="pt-6">
          <div className="mb-6 p-4 bg-gradient-to-r from-emerald-50 to-green-50 rounded-xl border border-emerald-200">
            <div className="flex items-center gap-2 mb-2">
              <Download className="h-5 w-5 text-emerald-600" />
              <span className="text-sm font-semibold text-gray-700">🏦 Loan Template</span>
            </div>
            <Link 
              href="/api/templates/loan" 
              download 
              className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white rounded-lg font-medium shadow-md transform hover:scale-105 transition-all duration-200"
            >
                <Download className="h-4 w-4" />
                Download Sample Upload Template (.xlsx)
            </Link>
          </div>
          <div className="flex flex-wrap items-end gap-4 mb-4">
            <div className="grid w-full max-w-sm items-center gap-1.5">
              <Label htmlFor="loan-file">Upload Loan File:</Label>
              <Input
                id="loan-file"
                type="file"
                accept=".xlsx, .xls, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
                onChange={handleFileChange}
                disabled={isUploading}
              />
            </div>
            <Button
                onClick={handlePostLoan}
                disabled={!selectedFile || isUploading}
                className="bg-purple-600 hover:bg-purple-700 text-white"
            >
              {isUploading ? 'Uploading...' : 'Post Loan'}
            </Button>
          </div>
           {uploadError && <p className="text-sm text-red-600">{uploadError}</p>}
           {uploadSuccess && <p className="text-sm text-green-600">{uploadSuccess}</p>}

          <Separator className="my-4" />

          {/* Action Row */}
          <div className="flex flex-wrap items-center gap-4 text-sm">
             <div className="flex items-center gap-2">
                 <Label htmlFor="loan-ref" className="whitespace-nowrap">Loan Ref.</Label>
                 <Input
                    id="loan-ref"
                    placeholder="Enter Loan Ref..."
                    value={loanRef}
                    onChange={(e) => setLoanRef(e.target.value)}
                    className="h-8"
                />
             </div>
             <Button variant="link" className="text-purple-600 h-8 p-0">Goto Page</Button>
             <Button variant="link" className="text-purple-600 h-8 p-0">Print Guarantor(s)</Button>
             <Button variant="link" className="text-purple-600 h-8 p-0">All Declined Loan</Button>
             <Button variant="link" className="text-purple-600 h-8 p-0">All Pending Loan</Button>
          </div>
        </CardContent>
      </Card>

       {/* Pending Loans Table Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-medium">Pending Loan Uploads for Approval</CardTitle>
           <p className="text-sm text-muted-foreground">
            Review uploaded loan batches and approve or reject them.
          </p>
        </CardHeader>
        <CardContent>
          {/* Loading and Error States for Table */} 
          {isLoadingPending && <p>Loading pending loans...</p>}
          {fetchPendingError && <p className="text-red-600">Error loading pending loans: {fetchPendingError}</p>}
          {!isLoadingPending && !fetchPendingError && groupedBatches.length === 0 && (
              <p className="text-center text-muted-foreground py-4">No pending loan uploads found.</p>
          )}

          {/* Display Batches */} 
          {!isLoadingPending && !fetchPendingError && groupedBatches.length > 0 && (
            <div className="space-y-4">
                {groupedBatches.map(({ batchId, loans, canApprove }) => (
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
                                <TableHead>Staff No</TableHead>
                                <TableHead>Reg No</TableHead>
                                <TableHead>Loan Type</TableHead>
                                <TableHead>Amount Req.</TableHead>
                                <TableHead>Date Applied</TableHead>
                                <TableHead>Validation</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {loans.map((loan) => (
                                <TableRow key={loan.id}>
                                  <TableCell>{loan.staff_no}</TableCell>
                                  <TableCell>{loan.reg_no}</TableCell>
                                  <TableCell>{loan.loan_type}</TableCell>
                                  <TableCell>{loan.amount_requested?.toLocaleString()}</TableCell>
                                  <TableCell>{loan.date_applied}</TableCell>
                                  <TableCell>
                                    {loan.validation_status === 'Valid' && <Badge variant="secondary">Valid</Badge>}
                                    {loan.validation_status === 'Invalid' && (
                                        <Badge variant="destructive" title={loan.validation_errors || 'Invalid data'}>Invalid</Badge>
                                    )}
                                    {loan.validation_status !== 'Valid' && loan.validation_status !== 'Invalid' && (
                                        <Badge variant="secondary">{loan.validation_status || 'Pending'}</Badge>
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
        </CardContent>
      </Card>

    </div>
  );
}

export default function LoanManagerPage() {
  return (
    <AuthorizationGuard allowedRoles={['Administrator', 'President', 'Treasurer', 'SuperAdmin']}>
      <LoanManagerPageContent />
    </AuthorizationGuard>
  );
} 