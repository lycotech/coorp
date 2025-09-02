'use client';

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { AuthorizationGuard } from '@/components/AuthorizationGuard';
import { Download } from 'lucide-react';
import Link from 'next/link';

function UploadUserPageContent() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setSelectedFile(event.target.files[0]);
      setUploadStatus(null);
      setError(null);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError('Please select a file to upload.');
      return;
    }

    setIsLoading(true);
    setUploadStatus('Uploading...');
    setError(null);

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      // TODO: Replace with your actual API endpoint for file upload
      const response = await fetch('/api/users/upload', {
        method: 'POST',
        body: formData,
        // Note: Don't set Content-Type header manually when using FormData,
        // the browser will set it correctly with the boundary.
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Upload failed');
      }

      setUploadStatus(`Upload successful! ${data.message || ''}`);
      setSelectedFile(null); // Clear file input after successful upload
       // Optionally reset the file input visually if needed
       const fileInput = document.getElementById('excel-file') as HTMLInputElement;
       if (fileInput) fileInput.value = '';

    } catch (err) {
      const message = err instanceof Error ? err.message : 'An unexpected error occurred.';
      setError(message);
      setUploadStatus(null);
      console.error('Upload error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Upload User Data</h1>

      <Card>
        <CardHeader>
          <CardTitle>Upload Excel Sheet</CardTitle>
          <CardDescription>
            Select an Excel file (.xlsx, .xls) containing user data to upload.
            Ensure the file follows the required format/template.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid w-full max-w-sm items-center gap-1.5">
            <Label htmlFor="excel-file">Excel File</Label>
            <Input
              id="excel-file"
              type="file"
              accept=".xlsx, .xls, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
              onChange={handleFileChange}
              disabled={isLoading}
            />
          </div>
          {selectedFile && (
            <p className="text-sm text-muted-foreground">Selected file: {selectedFile.name}</p>
          )}

          <Button onClick={handleUpload} disabled={!selectedFile || isLoading}>
            {isLoading ? 'Uploading...' : 'Upload File'}
          </Button>

          {uploadStatus && <p className="text-sm text-green-600">{uploadStatus}</p>}
          {error && <p className="text-sm text-red-600">{error}</p>}

          {/* Template Download Link */} 
          <div className="pt-6 p-4 bg-gradient-to-r from-orange-50 to-red-50 rounded-xl border border-orange-200">
            <div className="flex items-center gap-2 mb-2">
              <Download className="h-5 w-5 text-orange-600" />
              <span className="text-sm font-semibold text-gray-700">👥 Member Template</span>
            </div>
             <Link href="/api/templates/member" download className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white rounded-lg font-medium shadow-md transform hover:scale-105 transition-all duration-200">
                <Download className="h-4 w-4" />
                Download Sample Upload Template (.xlsx)
             </Link>
          </div> 
        </CardContent>
      </Card>

      {/* Optional: Display upload history or results here */}

    </div>
  );
}

export default function UploadUserPage() {
  return (
    <AuthorizationGuard allowedRoles={['Administrator', 'SuperAdmin']}>
      <UploadUserPageContent />
    </AuthorizationGuard>
  );
} 