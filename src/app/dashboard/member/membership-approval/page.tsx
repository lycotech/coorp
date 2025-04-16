'use client';

import React from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AuthorizationGuard } from '@/components/AuthorizationGuard';

// TODO: Define interface for pending application data
interface PendingApplication {
  staffNo: string;
  surname: string;
  gender: string;
  mobileNo: string;
  appDate: string;
  zonalCode: string; // Or whatever this represents
  // Add other relevant fields
}

function MembershipApprovalPageContent() {
  // TODO: Fetch pending applications from API
  const pendingApplications: PendingApplication[] = []; // Placeholder

  const handleApprove = (staffNo: string) => {
    console.log("Approving:", staffNo);
    // TODO: Implement approval logic (call API)
  };

  const handleDecline = (staffNo: string) => {
    console.log("Declining:", staffNo);
    // TODO: Implement decline logic (call API)
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Membership Approval</h1>

      {/* Top Filter/Search Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-medium">Membership approval</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div className="space-y-1">
              <label htmlFor="staff-no" className="text-sm">Staff No.<span className="text-red-500">*</span></label>
              <Input id="staff-no" placeholder="Staff No." />
            </div>
            <div className="space-y-1">
              <label htmlFor="applicant-name" className="text-sm">Applicant Name<span className="text-red-500">*</span></label>
              <Input id="applicant-name" placeholder="Applicant Name" />
            </div>
            <div className="space-y-1">
              <label htmlFor="membership-no" className="text-sm">Membership No.<span className="text-red-500">*</span></label>
              <Input id="membership-no" placeholder="Membership No." />
            </div>
            <div className="flex items-end space-x-2">
                 <Button variant="outline" size="sm" type="button">Clear</Button> {/* Add Clear button */} 
                 <Button className="bg-purple-600 hover:bg-purple-700 text-white" size="sm" type="submit">Approve</Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Pending Applications Table Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-medium">Pending Application</CardTitle>
          <p className="text-sm text-muted-foreground">
            Note: The view column allows you to see applicant to approve or decline user as a member
          </p>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
             {/* Entries per page selector */}
             <div className="flex items-center space-x-2">
                <span className="text-sm text-muted-foreground">Show</span>
                <Select defaultValue="10">
                    <SelectTrigger className="w-[70px]">
                        <SelectValue placeholder="10" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="10">10</SelectItem>
                        <SelectItem value="25">25</SelectItem>
                        <SelectItem value="50">50</SelectItem>
                        <SelectItem value="100">100</SelectItem>
                    </SelectContent>
                </Select>
                 <span className="text-sm text-muted-foreground">entries</span>
            </div>
            {/* Search input */}
            <div className="flex items-center space-x-2">
                <span className="text-sm text-muted-foreground">Search:</span>
                <Input placeholder="Search..." className="max-w-xs" />
            </div>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Staff No.</TableHead>
                <TableHead>Surname</TableHead>
                <TableHead>Gender</TableHead>
                <TableHead>Mobile No.</TableHead>
                <TableHead>App. Date</TableHead>
                <TableHead>Zonal Code</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pendingApplications.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center">
                    No data available in table
                  </TableCell>
                </TableRow>
              ) : (
                pendingApplications.map((app) => (
                  <TableRow key={app.staffNo}>
                    <TableCell>{app.staffNo}</TableCell>
                    <TableCell>{app.surname}</TableCell>
                    <TableCell>{app.gender}</TableCell>
                    <TableCell>{app.mobileNo}</TableCell>
                    <TableCell>{app.appDate}</TableCell>
                    <TableCell>{app.zonalCode}</TableCell>
                    <TableCell className="text-right">
                       {/* Add View/Approve/Decline buttons here */}
                       <Button variant="ghost" size="sm" onClick={() => handleApprove(app.staffNo)}>Approve</Button>
                       <Button variant="ghost" size="sm" onClick={() => handleDecline(app.staffNo)}>Decline</Button>
                       {/* Or use icons */}
                       {/* <Button variant="ghost" size="icon"><Edit className="h-4 w-4" /></Button> */}
                       {/* <Button variant="ghost" size="icon"><Trash2 className="h-4 w-4" /></Button> */}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          {/* Pagination */}
          <div className="flex items-center justify-between mt-4">
             <div className="text-sm text-muted-foreground">
                Showing 0 to 0 of 0 entries
             </div>
            <div className="space-x-2">
              <Button variant="outline" size="sm" disabled>Previous</Button>
              <Button variant="outline" size="sm" disabled>Next</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function MembershipApprovalPage() {
  return (
    <AuthorizationGuard allowedRoles={['President', 'Secretary', 'SuperAdmin']}>
      <MembershipApprovalPageContent />
    </AuthorizationGuard>
  );
} 