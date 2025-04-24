'use client';

import React, { useState, useEffect } from 'react';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";

interface UserProfile {
  staffNo: string;
  fullName: string;
  department: string;
  currentContribution: number;
}

export default function MemberContributionChangePage() {
  // User profile/details
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Form state
  const [loanObtained, setLoanObtained] = useState<string | null>(null);
  const [loanRefNo, setLoanRefNo] = useState('');
  const [intendingContribution, setIntendingContribution] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Fetch user profile on component mount
  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Fetch the member's profile
      const response = await fetch('/api/members/profile');
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to fetch user profile');
      }
      
      const data = await response.json();
      
      // Fetch the current contribution 
      const contributionResponse = await fetch('/api/members/contribution');
      
      if (!contributionResponse.ok) {
        throw new Error('Failed to fetch current contribution');
      }
      
      const contributionData = await contributionResponse.json();
      
      // Set the profile with all required data
      setProfile({
        staffNo: data.member.staff_no,
        fullName: `${data.member.firstname} ${data.member.surname}`,
        department: data.member.department || '', // Add department field to your API if not present
        currentContribution: contributionData.amount || 0
      });
      
    } catch (error) {
      console.error('Error fetching profile:', error);
      const message = error instanceof Error ? error.message : 'An unknown error occurred';
      setError(message);
      toast.error("Error", { description: message });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!intendingContribution) {
      toast.error("Error", { description: "Please enter your intended contribution amount" });
      return;
    }
    
    if (loanObtained === 'yes' && !loanRefNo) {
      toast.error("Error", { description: "Please enter your loan reference number" });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const response = await fetch('/api/members/contribution-change', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          staffNo: profile?.staffNo,
          currentContribution: profile?.currentContribution,
          newContribution: parseFloat(intendingContribution),
          hasLoan: loanObtained === 'yes',
          loanRefNo: loanObtained === 'yes' ? loanRefNo : null
        }),
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to submit contribution change request');
      }
      
      // Success
      toast.success("Success", { description: "Your contribution change request has been submitted" });
      
      // Reset form
      setLoanObtained(null);
      setLoanRefNo('');
      setIntendingContribution('');
      
    } catch (error) {
      console.error('Error submitting request:', error);
      const message = error instanceof Error ? error.message : 'An unknown error occurred';
      toast.error("Error", { description: message });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Format currency
  const formatCurrency = (amount: number | string) => {
    const value = typeof amount === 'string' ? parseFloat(amount) : amount;
    if (isNaN(value)) return '₦0.00';
    
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 2
    }).format(value);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p>Loading your profile...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <p className="text-red-500">{error}</p>
        <Button onClick={fetchUserProfile}>Try Again</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Monthly Contribution</h1>
      
      <Card>
        <CardHeader className="bg-blue-600 text-white">
          <CardTitle>Monthly Contribution Increment and Decrement</CardTitle>
        </CardHeader>
        
        <CardContent className="pt-6">
          <div className="text-red-500 mb-4">
            Note: All fields (*) are required
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Staff Number */}
              <div className="space-y-2">
                <Label htmlFor="staffNo">
                  Staff No<span className="text-red-500">*</span>
                </Label>
                <Input
                  id="staffNo"
                  value={profile?.staffNo || ''}
                  readOnly
                  className="bg-gray-100"
                />
              </div>
              
              {/* Surname */}
              <div className="space-y-2">
                <Label htmlFor="surname">
                  Surname<span className="text-red-500">*</span>
                </Label>
                <Input
                  id="surname"
                  value={profile?.fullName || ''}
                  readOnly
                  className="bg-gray-100"
                />
              </div>
              
              {/* Department */}
              <div className="space-y-2">
                <Label htmlFor="department">
                  Department<span className="text-red-500">*</span>
                </Label>
                <Input
                  id="department"
                  value={profile?.department || ''}
                  readOnly
                  className="bg-gray-100"
                />
              </div>
              
              {/* Present Monthly Contribution */}
              <div className="space-y-2">
                <Label htmlFor="presentContribution">
                  Present Monthly Contribution
                </Label>
                <Input
                  id="presentContribution"
                  value={formatCurrency(profile?.currentContribution || 0)}
                  readOnly
                  className="bg-gray-100"
                />
              </div>
              
              {/* Any Loan Obtained */}
              <div className="space-y-2">
                <Label htmlFor="loanObtained">
                  Any Loan Obtained<span className="text-red-500">*</span>
                </Label>
                <Select
                  value={loanObtained || "no"}
                  onValueChange={(value) => setLoanObtained(value)}
                >
                  <SelectTrigger id="loanObtained">
                    <SelectValue placeholder="Select Yes or No" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="yes">Yes</SelectItem>
                    <SelectItem value="no">No</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {/* If Yes, Ref. No */}
              <div className="space-y-2">
                <Label htmlFor="loanRefNo">
                  If Yes, Ref. No
                </Label>
                <Input
                  id="loanRefNo"
                  value={loanRefNo}
                  onChange={(e) => setLoanRefNo(e.target.value)}
                  disabled={loanObtained !== 'yes'}
                />
              </div>
              
              {/* Intending Monthly Contribution */}
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="intendingContribution">
                  Intending Monthly Contribution<span className="text-red-500">*</span>
                </Label>
                <Input
                  id="intendingContribution"
                  value={intendingContribution}
                  onChange={(e) => {
                    // Allow only numbers and decimal point
                    const val = e.target.value.replace(/[^0-9.]/g, '');
                    setIntendingContribution(val);
                  }}
                  placeholder="Enter amount"
                />
              </div>
            </div>
            
            <Separator />
            
            <div className="flex justify-start">
              <Button 
                type="submit" 
                className="bg-purple-600 hover:bg-purple-700 text-white"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Submitting...' : 'Submit Request'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
} 