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

// Interface matching the data from /api/contributions/pending
interface PendingContribution {
  id: number;
  reg_no: string | null;
  staff_no: string | null;
  contribution_type: string | null;
  contribution_date: string | null; // Assuming DATE stored as string 'YYYY-MM-DD'
  amount: number | null;
  upload_batch_id: string | null;
  validation_status: string | null;
  validation_errors: string | null;
}

// Interface for grouped batches
interface PendingBatch {
    batchId: string;
    contributions: PendingContribution[];
    status: string; // Overall status for the batch (e.g., Validated, Pending Validation)
    canApprove: boolean;
}

function ContributionManagerPageContent() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);

  const [pendingContributions, setPendingContributions] = useState<PendingContribution[]>([]);
  const [isLoadingPending, setIsLoadingPending] = useState(false);
  const [fetchPendingError, setFetchPendingError] = useState<string | null>(null);

  const [actionLoading, setActionLoading] = useState<Record<string, boolean>>({}); // Track loading state per batch

  // Fetch pending contributions on component mount
  useEffect(() => {
    fetchPendingContributions();
  }, []);

  const fetchPendingContributions = async () => {
    setIsLoadingPending(true);
    setFetchPendingError(null);
    try {
      // TODO: Create this API endpoint
      const response = await fetch('/api/contributions/pending');
      if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to fetch pending contributions');
      }
      const data: PendingContribution[] = await response.json();
      setPendingContributions(data);
    } catch (error) {
      console.error("Fetch pending contributions error:", error);
      const message = error instanceof Error ? error.message : "Failed to fetch pending contributions";
      setFetchPendingError(message);
      toast.error("Error Fetching Pending Contributions", { description: message });
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

  const handlePostContributions = async () => {
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
      // TODO: Create this API endpoint
      const response = await fetch('/api/contributions/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Contribution upload failed');
      }

      const successMessage = data.message || 'Contribution file uploaded successfully. Batch pending approval.';
      setUploadSuccess(successMessage);
      setSelectedFile(null);
      const fileInput = document.getElementById('contribution-file') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
      toast.success("Upload Successful", { description: successMessage });
      // Refresh pending list after successful upload
      fetchPendingContributions();

    } catch (error) {
      console.error('Contribution upload error:', error);
       const message = error instanceof Error ? error.message : "An unknown error occurred during upload";
      setUploadError(message);
       toast.error("Upload Error", { description: message });
    } finally {
      setIsUploading(false);
    }
  };

  // Group contributions by batch ID for display
  const groupedBatches = useMemo(() => {
    const groups: Record<string, PendingContribution[]> = {};
    pendingContributions.forEach(contrib => {
      const batchId = contrib.upload_batch_id || 'unknown_batch';
      if (!groups[batchId]) {
        groups[batchId] = [];
      }
      groups[batchId].push(contrib);
    });

    return Object.entries(groups).map(([batchId, contributions]): PendingBatch => {
        const hasInvalid = contributions.some(c => c.validation_status === 'Invalid');
        const status = hasInvalid ? 'Pending Validation' : 'Validated';
        const canApprove = !hasInvalid;
        return { batchId, contributions, status, canApprove };
    });

  }, [pendingContributions]);

  // Handlers for Approve/Reject
  const handleApproveBatch = async (batchId: string) => {
    setActionLoading(prev => ({ ...prev, [batchId]: true }));
    console.log("Approving Batch:", batchId);
    try {
        const response = await fetch('/api/contributions/batches/approve', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ batchId }),
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error || 'Failed to approve batch');
        }
        
        toast.success("Batch Approved Successfully", { description: `Batch ${batchId} has been approved and processed.` });
        fetchPendingContributions(); // Refresh list
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
        const response = await fetch('/api/contributions/batches/reject', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ batchId, rejectionReason }),
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error || 'Failed to reject batch');
        }
        
        toast.info("Batch Rejected Successfully", { description: `Batch ${batchId} has been rejected.` });
        fetchPendingContributions(); // Refresh list
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
      <h1 className="text-2xl font-semibold">Contribution Manager</h1>

      {/* Upload Section */}
      <Card>
        <CardContent className="pt-6">
          {/* Updated Template Download Link */}
          <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
            <div className="flex items-center gap-2 mb-2">
              <Download className="h-5 w-5 text-blue-600" />
              <span className="text-sm font-semibold text-gray-700">📋 Upload Template</span>
            </div>
            <Link 
              href="/api/templates/contribution" 
              download 
              className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-lg font-medium shadow-md transform hover:scale-105 transition-all duration-200"
            >
                <Download className="h-4 w-4" />
                Download Sample Upload Template (.xlsx)
            </Link>
          </div>

          {/* File Upload Input */}
          <div className="flex flex-wrap items-end gap-4 mb-4">
            <div className="grid w-full max-w-sm items-center gap-1.5">
              <Label htmlFor="contribution-file">Upload Contribution File:</Label>
              <Input
                id="contribution-file"
                type="file"
                accept=".xlsx, .xls, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
                onChange={handleFileChange}
                disabled={isUploading}
              />
            </div>
            <Button
                onClick={handlePostContributions}
                disabled={!selectedFile || isUploading}
                className="bg-purple-600 hover:bg-purple-700 text-white"
            >
              {isUploading ? 'Uploading...' : 'Post Contributions'}
            </Button>
          </div>
           {uploadError && <p className="text-sm text-red-600">{uploadError}</p>}
           {uploadSuccess && <p className="text-sm text-green-600">{uploadSuccess}</p>}

          <Separator className="my-4" />

          {/* Optional Action Row - Can be removed if not needed */}
          {/* <div className="flex flex-wrap items-center gap-4 text-sm"> ... </div> */}
        </CardContent>
      </Card>

       {/* Pending Contributions Table Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-medium">Pending Contribution Uploads for Approval</CardTitle>
           <p className="text-sm text-muted-foreground">
            Review uploaded contribution batches and approve or reject them.
          </p>
        </CardHeader>
        <CardContent>
          {/* Loading and Error States for Table */} 
          {isLoadingPending && <p>Loading pending contributions...</p>}
          {fetchPendingError && <p className="text-red-600">Error loading pending contributions: {fetchPendingError}</p>}
          {!isLoadingPending && !fetchPendingError && groupedBatches.length === 0 && (
              <p className="text-center text-muted-foreground py-4">No pending contribution uploads found.</p>
          )}

          {/* Display Batches */} 
          {!isLoadingPending && !fetchPendingError && groupedBatches.length > 0 && (
            <div className="space-y-4">
                {groupedBatches.map(({ batchId, contributions, canApprove }) => (
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
                                <TableHead>Contrib. Type</TableHead>
                                <TableHead>Contrib. Date</TableHead>
                                <TableHead>Amount</TableHead>
                                <TableHead>Validation</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {contributions.map((contrib) => (
                                <TableRow key={contrib.id}>
                                  <TableCell>{contrib.reg_no}</TableCell>
                                  <TableCell>{contrib.staff_no}</TableCell>
                                  <TableCell>{contrib.contribution_type}</TableCell>
                                  <TableCell>{contrib.contribution_date}</TableCell>
                                  <TableCell>{contrib.amount?.toLocaleString()}</TableCell>
                                  <TableCell>
                                    {contrib.validation_status === 'Valid' && <Badge variant="secondary">Valid</Badge>}
                                    {contrib.validation_status === 'Invalid' && (
                                        <Badge variant="destructive" title={contrib.validation_errors || 'Invalid data'}>Invalid</Badge>
                                    )}
                                    {contrib.validation_status !== 'Valid' && contrib.validation_status !== 'Invalid' && (
                                        <Badge variant="secondary">{contrib.validation_status || 'Pending'}</Badge>
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

export default function ContributionManagerPage() {
  return (
    <AuthorizationGuard allowedRoles={['Administrator', 'President', 'Treasurer', 'SuperAdmin']}>
      <ContributionManagerPageContent />
    </AuthorizationGuard>
  );
} 