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
import { Badge } from "@/components/ui/badge";
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
  TrendingUp, 
  AlertTriangle
} from "lucide-react";
import { useCurrentUser } from "@/hooks/useCurrentUser";

interface UserProfile {
  staffNo: string;
  fullName: string;
  department: string;
  currentContribution: number;
}

export default function ContributionChangePage() {
  const { user } = useCurrentUser();
  
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    staffNo: '',
    surname: '',
    department: '',
    loanObtained: '',
    loanRefNo: '',
    presentContribution: '',
    intendingContribution: ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  useEffect(() => {
    fetchUserProfile();
  }, [user]);

  useEffect(() => {
    if (profile) {
      setFormData(prev => ({
        ...prev,
        staffNo: profile.staffNo,
        surname: profile.fullName,
        department: profile.department,
        presentContribution: profile.currentContribution.toLocaleString()
      }));
    }
  }, [profile]);

  const fetchUserProfile = async () => {
    if (!user) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockProfile: UserProfile = {
        staffNo: user.staffNo,
        fullName: user.email?.split('@')[0]?.toUpperCase() || 'MEMBER',
        department: 'INFORMATION TECHNOLOGY',
        currentContribution: 50000
      };
      
      setProfile(mockProfile);
    } catch (err) {
      console.error('Error fetching user profile:', err);
      setError('Failed to load user profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async () => {
    if (!formData.intendingContribution.trim()) {
      alert('Please enter your intended monthly contribution');
      return;
    }

    if (formData.loanObtained === 'Yes' && !formData.loanRefNo.trim()) {
      alert('Please provide loan reference number');
      return;
    }

    const intendingAmount = parseFloat(formData.intendingContribution.replace(/,/g, ''));
    if (isNaN(intendingAmount) || intendingAmount <= 0) {
      alert('Please enter a valid contribution amount');
      return;
    }

    setIsSubmitting(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const requestData = {
        ...formData,
        intendingContribution: intendingAmount,
        requestDate: new Date().toISOString(),
        status: 'Pending'
      };
      
      console.log('Submitting contribution change request:', requestData);
      
      alert('Contribution change request submitted successfully!');
      
      setFormData(prev => ({
        ...prev,
        loanObtained: '',
        loanRefNo: '',
        intendingContribution: ''
      }));
      
    } catch (err) {
      console.error('Error submitting contribution change:', err);
      alert('Failed to submit contribution change request');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <TrendingUp className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Monthly Contribution</h1>
              <p className="text-muted-foreground">Request to change your monthly contribution amount</p>
            </div>
          </div>
        </div>
        
        <Card className="max-w-4xl">
          <CardHeader className="bg-primary text-primary-foreground">
            <CardTitle className="text-xl font-semibold">
              Monthly Contribution Increment and Decrement
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="animate-pulse space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                    <div className="h-10 bg-gray-200 rounded"></div>
                  </div>
                ))}
              </div>
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
              <h1 className="text-3xl font-bold tracking-tight">Monthly Contribution</h1>
              <p className="text-muted-foreground">Request to change your monthly contribution amount</p>
            </div>
          </div>
        </div>
        
        <Card className="max-w-4xl">
          <CardContent className="p-6">
            <div className="text-center py-8">
              <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Error Loading Profile</h3>
              <p className="text-muted-foreground mb-4">{error}</p>
              <Button onClick={fetchUserProfile}>
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
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <TrendingUp className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Monthly Contribution</h1>
            <p className="text-muted-foreground">Request to change your monthly contribution amount</p>
          </div>
        </div>
        <Badge variant="outline" className="text-sm">
          <Users className="h-4 w-4 mr-1" />
          Member Portal
        </Badge>
      </div>

      <Card className="max-w-4xl">
        <CardHeader className="bg-primary text-primary-foreground">
          <CardTitle className="text-xl font-semibold">
            Monthly Contribution Increment and Decrement
          </CardTitle>
          <div className="flex items-center gap-2 text-sm text-primary-foreground/80 mt-2">
            <AlertTriangle className="h-4 w-4" />
            <span>Note: All fields (*) are required</span>
          </div>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="staffNo" className="text-sm font-medium">
                Staff No<span className="text-red-500">*</span>
              </Label>
              <Input
                id="staffNo"
                value={formData.staffNo}
                disabled
                className="bg-gray-50"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="surname" className="text-sm font-medium">
                Surname<span className="text-red-500">*</span>
              </Label>
              <Input
                id="surname"
                value={formData.surname}
                disabled
                className="bg-gray-50"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="department" className="text-sm font-medium">
                Department<span className="text-red-500">*</span>
              </Label>
              <Input
                id="department"
                value={formData.department}
                disabled
                className="bg-gray-50"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="presentContribution" className="text-sm font-medium">
                Present Monthly Contribution
              </Label>
              <div className="relative">
                <span className="absolute left-3 top-3 text-sm font-medium text-muted-foreground">₦</span>
                <Input
                  id="presentContribution"
                  value={`₦ ${formData.presentContribution}`}
                  disabled
                  className="pl-9 bg-gray-50 font-medium"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="loanObtained" className="text-sm font-medium">
                Any Loan Obtained<span className="text-red-500">*</span>
              </Label>
              <Select 
                value={formData.loanObtained} 
                onValueChange={(value) => handleInputChange('loanObtained', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Yes or No" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Yes">Yes</SelectItem>
                  <SelectItem value="No">No</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {formData.loanObtained === 'Yes' && (
              <div className="space-y-2">
                <Label htmlFor="loanRefNo" className="text-sm font-medium">
                  If Yes, Ref. No<span className="text-red-500">*</span>
                </Label>
                <Input
                  id="loanRefNo"
                  value={formData.loanRefNo}
                  onChange={(e) => handleInputChange('loanRefNo', e.target.value)}
                  placeholder="Enter loan reference number"
                />
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="intendingContribution" className="text-sm font-medium">
              Intending Monthly Contribution<span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <span className="absolute left-3 top-3 text-sm font-medium text-muted-foreground">₦</span>
              <Input
                id="intendingContribution"
                value={formData.intendingContribution}
                onChange={(e) => {
                  const value = e.target.value.replace(/[^0-9]/g, '');
                  const formatted = value ? parseInt(value).toLocaleString() : '';
                  handleInputChange('intendingContribution', formatted);
                }}
                placeholder="Enter your intended monthly contribution"
                className="pl-9"
              />
            </div>
            {formData.intendingContribution && (
              <div className="flex items-center gap-2 text-sm">
                <span className="text-muted-foreground">Amount in words:</span>
                <span className="font-medium">
                  {new Intl.NumberFormat('en-NG', {
                    style: 'currency',
                    currency: 'NGN',
                    minimumFractionDigits: 0,
                  }).format(parseFloat(formData.intendingContribution.replace(/,/g, '')) || 0)}
                </span>
              </div>
            )}
          </div>

          <Separator />

          <div className="flex justify-center pt-4">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button 
                  size="lg" 
                  className="px-8"
                  disabled={isSubmitting || !formData.intendingContribution.trim()}
                >
                  {isSubmitting ? (
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Submitting Request...
                    </div>
                  ) : (
                    'Submit Request'
                  )}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Confirm Contribution Change Request</AlertDialogTitle>
                  <AlertDialogDescription className="space-y-2">
                    <p>Please confirm the following details:</p>
                    <div className="bg-gray-50 p-4 rounded-lg space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Staff No:</span>
                        <span className="font-medium">{formData.staffNo}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Current Contribution:</span>
                        <span className="font-medium">₦ {formData.presentContribution}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>New Contribution:</span>
                        <span className="font-medium">₦ {formData.intendingContribution}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Loan Obtained:</span>
                        <span className="font-medium">{formData.loanObtained}</span>
                      </div>
                      {formData.loanRefNo && (
                        <div className="flex justify-between">
                          <span>Loan Ref No:</span>
                          <span className="font-medium">{formData.loanRefNo}</span>
                        </div>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mt-4">
                      This request will be submitted for administrative approval.
                    </p>
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleSubmit} disabled={isSubmitting}>
                    {isSubmitting ? 'Submitting...' : 'Confirm & Submit'}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
