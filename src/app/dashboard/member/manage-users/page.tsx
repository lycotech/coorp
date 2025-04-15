'use client';

import React, { useState } from 'react';
// import { useRouter } from 'next/navigation'; // Import if needed
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { AuthorizationGuard } from '@/components/AuthorizationGuard'; // Import the guard
// import { useToast } from "@/components/ui/use-toast"; // Uncomment if using toast

// --- 1. Define MemberDetailsResponse Interface ---
interface MemberDetailsResponse {
  member: {
    id: number;
    staff_no: string;
    email: string | null;
    firstname: string | null;
    surname: string | null;
    member_status: string | null;
  };
  loginExists: boolean;
}

// --- Define Login Types and Statuses ---
const loginTypes = ['Administrator', 'Member', 'President', 'Secretary', 'Staff'];
const memberStatuses = ['Active', 'Inactive', 'Retired', 'Suspended', 'Terminated'];

// Define the component containing the actual page content
function ManageUsersPageContent() {
  // const { toast } = useToast();

  // State for fetching member details
  const [staffNoForFetch, setStaffNoForFetch] = useState('');
  const [isFetching, setIsFetching] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [memberDetails, setMemberDetails] = useState<MemberDetailsResponse['member'] | null>(null);
  const [loginExists, setLoginExists] = useState<boolean>(false);

  // State for Create User Login form
  const [editableLoginEmail, setEditableLoginEmail] = useState('');
  const [isEmailEditable, setIsEmailEditable] = useState(false);
  const [loginPassword, setLoginPassword] = useState('');
  const [loginType, setLoginType] = useState('');
  const [loginCurrentAdminPassword, setLoginCurrentAdminPassword] = useState('');
  const [isCreatingLogin, setIsCreatingLogin] = useState(false);
  const [createLoginError, setCreateLoginError] = useState<string | null>(null);
  const [createLoginSuccess, setCreateLoginSuccess] = useState<string | null>(null);

  // State for other actions
  const [newPassword, /* setNewPassword */] = useState(''); // For Reset Password

  // State for Account Manager form
  const [accountStaffNo, setAccountStaffNo] = useState('');
  const [accountStatus, setAccountStatus] = useState('');
  const [accountAdminPassword, setAccountAdminPassword] = useState('');
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [updateStatusError, setUpdateStatusError] = useState<string | null>(null);
  const [updateStatusSuccess, setUpdateStatusSuccess] = useState<string | null>(null);


  const handleFetchRecords = async () => {
    console.log('Fetch button clicked! Staff No:', staffNoForFetch);
    if (!staffNoForFetch) {
      setFetchError("Please enter a Staff Number.");
      return;
    }
    setIsFetching(true);
    setFetchError(null);
    setMemberDetails(null);
    setLoginExists(false);
    setEditableLoginEmail('');
    setIsEmailEditable(false);
    setCreateLoginError(null);
    setCreateLoginSuccess(null);

    try {
      const response = await fetch(`/api/members/details/${staffNoForFetch}`);
      const data: MemberDetailsResponse | { error: string } = await response.json();

      if (!response.ok) {
        throw new Error((data as { error: string }).error || 'Failed to fetch member details');
      }

      const result = data as MemberDetailsResponse;
      setMemberDetails(result.member);
      setLoginExists(result.loginExists);

      const fetchedEmail = result.member.email || '';
      setEditableLoginEmail(fetchedEmail);
      setIsEmailEditable(!fetchedEmail);

      setLoginType('');
      setLoginPassword('');

      if (result.loginExists) {
        console.log("Login already exists for this member.");
      }

    } catch (error) {
      console.error("Fetch error:", error);
      setFetchError(error instanceof Error ? error.message : "An unknown error occurred");
    } finally {
      setIsFetching(false);
    }
  };

  // --- 2. Update handleCreateUser ---
  const handleCreateUser = async () => {
    if (!memberDetails || !editableLoginEmail || !loginPassword || !loginType) {
      setCreateLoginError("Missing required fields: Email, Password, and Login Type.");
      return;
    }
    // Add admin password validation if implemented
    // if(!loginCurrentAdminPassword) { ... }

    setIsCreatingLogin(true);
    setCreateLoginError(null);
    setCreateLoginSuccess(null);

    try {
      const response = await fetch('/api/users/create-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          staff_no: memberDetails.staff_no,
          email: editableLoginEmail,
          password: loginPassword,
          login_type: loginType,
          // adminPassword: loginCurrentAdminPassword // Send if needed
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create user login');
      }

      setCreateLoginSuccess("User login created successfully!");
      setLoginExists(true);
      setIsEmailEditable(false);
      setLoginPassword('');

    } catch (error) {
      console.error("Create login error:", error);
      const message = error instanceof Error ? error.message : "An unknown error occurred";
      setCreateLoginError(message);
    } finally {
      setIsCreatingLogin(false);
    }
  };

  // --- Placeholder Handlers for other buttons ---
  const handleDeleteUser = () => {
    console.log('Deleting User:', { staffNo: memberDetails?.staff_no, loginCurrentAdminPassword });
    // TODO: API call to delete user login (DELETE /api/users/[staffNo])
  };

  const handleResetUser = () => {
    console.log('Resetting User?: (Requires Definition)', { staffNo: memberDetails?.staff_no });
    // TODO: Clarify what "Reset User" means and implement API call
  };

  const handleResetPassword = () => {
    console.log('Resetting Password:', { staffNo: memberDetails?.staff_no, newPassword, loginCurrentAdminPassword });
    // TODO: API call to reset password (PUT/PATCH /api/users/password/[staffNo])
    // Requires adding an input field for `newPassword` state
  };

  const handleAccountSubmit = async () => {
    console.log('Submitting Account Update:', { accountStaffNo, accountStatus, accountAdminPassword });
    setIsUpdatingStatus(true);
    setUpdateStatusError(null);
    setUpdateStatusSuccess(null);

    try {
      // TODO: Implement API call (PUT/PATCH /api/members/status/[staffNo])
      // Example placeholder:
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API delay
      if (!accountStaffNo || !accountStatus) {
        throw new Error("Staff No and Account Status are required.");
      }
      // if(accountStaffNo === 'error') throw new Error("Simulated API error");

      setUpdateStatusSuccess(`Status for ${accountStaffNo} updated successfully!`);

    } catch (error) {
      console.error("Update status error:", error);
      const message = error instanceof Error ? error.message : "An unknown error occurred";
      setUpdateStatusError(message);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  // --- 3. Update JSX to use state variables ---
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Manage Users</h1>

      {/* Create User Login Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-medium">Create User Login</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* --- Fetch Input --- */}
          <div className="flex items-start space-x-2">
            <div className="flex-grow space-y-1">
              <Label htmlFor="fetch-staff-no">Staff No</Label>
              <Input
                id="fetch-staff-no"
                placeholder="Enter Staff No to fetch details"
                value={staffNoForFetch}
                onChange={(e) => setStaffNoForFetch(e.target.value)}
                disabled={isFetching} // Use isFetching state
              />
              {/* Display Fetch Error */}
              {fetchError && <p className="text-xs text-red-500 pt-1">{fetchError}</p>}
            </div>
            <Button
              variant="outline"
              onClick={handleFetchRecords}
              disabled={isFetching || !staffNoForFetch}
              className="mt-[26px]" // Adjust alignment
            >
              {isFetching ? 'Fetching...' : 'Fetch Records'} 
            </Button>
          </div>

          <Separator />

          {/* --- User Creation Form (conditional rendering) --- */}
          {memberDetails && ( // Render only if memberDetails exist
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Display Fetched/Editable Email */}
                <div className="space-y-1">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    value={editableLoginEmail}
                    onChange={(e) => setEditableLoginEmail(e.target.value)}
                    readOnly={!isEmailEditable}
                    disabled={loginExists || isCreatingLogin}
                    placeholder={isEmailEditable ? "Enter member email" : "(Fetched from member record)"}
                    required
                  />
                  {!isEmailEditable && memberDetails.email && <p className="text-xs text-muted-foreground pt-1">Fetched from member record.</p>}
                  {isEmailEditable && <p className="text-xs text-blue-600 pt-1">Email was missing, please enter and verify.</p>}
                </div>
                {/* Login Type Select */}
                <div className="space-y-1">
                  <Label htmlFor="login-type">Login Type</Label>
                  <Select
                    value={loginType}
                    onValueChange={setLoginType}
                    disabled={loginExists || isCreatingLogin}
                  >
                    <SelectTrigger disabled={loginExists}>
                      <SelectValue placeholder="Select Login Type" />
                    </SelectTrigger>
                    <SelectContent>
                      {loginTypes.map(type => <SelectItem key={type} value={type}>{type}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                {/* Password Input */}
                <div className="space-y-1">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder={loginExists ? "Login already exists" : "Enter password for login"}
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    disabled={loginExists || isCreatingLogin}
                    required={!loginExists}
                  />
                </div>
                {/* Admin Password Verification */}
                <div className="space-y-1">
                  <Label htmlFor="login-current-admin-pass">Current Admin Password</Label>
                  <Input
                    id="login-current-admin-pass"
                    type="password"
                    value={loginCurrentAdminPassword}
                    onChange={(e) => setLoginCurrentAdminPassword(e.target.value)}
                    placeholder="Admin password to execute"
                    disabled={isCreatingLogin}
                    // required // Make required if backend needs it
                  />
                  {/* <p className="text-xs text-red-500">Enter your password to execute this action</p> */}
                </div>
              </div>

              {/* Status Messages */}
              {createLoginError && <p className="text-sm text-red-500">{createLoginError}</p>}
              {createLoginSuccess && <p className="text-sm text-green-500">{createLoginSuccess}</p>}
              {loginExists && !createLoginSuccess && (
                 <p className="text-sm text-blue-600">A login already exists for this member. Use other options if needed.</p>
              )}

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-2 pt-4">
                <Button
                  size="sm"
                  className="bg-purple-600 hover:bg-purple-700"
                  onClick={handleCreateUser}
                  disabled={!memberDetails || loginExists || isCreatingLogin || !editableLoginEmail || !loginType || !loginPassword}
                >
                  {isCreatingLogin ? 'Creating...' : 'Create User'}
                </Button>
                {/* Disable other buttons based on login existence */} 
                <Button size="sm" variant="destructive" onClick={handleDeleteUser} disabled={!loginExists}>Delete User</Button>
                <Button size="sm" variant="outline" onClick={handleResetUser} disabled={!loginExists}>Reset User</Button>
                <Button size="sm" className="bg-yellow-500 hover:bg-yellow-600" onClick={handleResetPassword} disabled={!loginExists}>Reset Password</Button>
              </div>

            </div>
          )}
        </CardContent>
      </Card>

      {/* Account Manager Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-medium">Account Manager</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
           <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1">
                    <Label htmlFor="account-staff-no">Staff No</Label>
                    <Input
                        id="account-staff-no"
                        placeholder="Staff No to manage"
                        value={accountStaffNo}
                        onChange={(e) => setAccountStaffNo(e.target.value)}
                        // required
                    />
                </div>
                 <div className="space-y-1">
                    <Label htmlFor="account-status">Account Status</Label>
                    <Select value={accountStatus} onValueChange={setAccountStatus} /* required */>
                    <SelectTrigger>
                        <SelectValue placeholder="Select account status" />
                    </SelectTrigger>
                    <SelectContent>
                         {memberStatuses.map(status => <SelectItem key={status} value={status}>{status}</SelectItem>)}
                    </SelectContent>
                    </Select>
                </div>
                <div className="space-y-1">
                    <Label htmlFor="account-admin-pass">Current Admin Password</Label>
                    <Input
                        id="account-admin-pass"
                        type="password"
                        value={accountAdminPassword}
                        onChange={(e) => setAccountAdminPassword(e.target.value)}
                        placeholder="Admin password to verify"
                        // required
                    />
                    <p className="text-xs text-red-500">Enter your password to verify this action</p>
                </div>
           </div>
           <div className="flex items-center space-x-2 pt-4">
             <Button size="sm" className="bg-purple-600 hover:bg-purple-700" onClick={handleAccountSubmit} disabled={isUpdatingStatus}>
                {isUpdatingStatus ? 'Updating...' : 'Submit Account'}
             </Button>
             <Button size="sm" variant="outline">Cancel</Button>
          </div>
            {updateStatusError && <p className="text-sm text-red-500 pt-2">{updateStatusError}</p>}
            {updateStatusSuccess && <p className="text-sm text-green-500 pt-2">{updateStatusSuccess}</p>}
        </CardContent>
      </Card>
    </div>
  );
}

// Wrap the content component with the guard
export default function ManageUsersPage() {
  return (
    <AuthorizationGuard allowedRoles={['Administrator']}>
      <ManageUsersPageContent />
    </AuthorizationGuard>
  );
} 