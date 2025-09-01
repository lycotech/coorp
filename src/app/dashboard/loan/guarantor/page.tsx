'use client';

import React, { useState, useEffect } from 'react';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
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
  Shield, 
  Search,
  AlertTriangle
} from "lucide-react";
import { useCurrentUser } from "@/hooks/useCurrentUser";

interface GuarantorFormData {
  // Search/Reference
  refNo: string;
  
  // Applicant Information (auto-filled from search)
  applicantName: string;
  applicantRegNo: string;
  loanAmount: string;
  applicantDepartment: string;
  
  // Guarantor Information
  guarantorName: string;
  guarantorFacultyBranch: string;
  guarantorSavings: string;
  guarantorLoan: string;
  
  // Terms and conditions
  acceptedTerms: boolean;
}

export default function GuarantorFormPage() {
  const { user } = useCurrentUser();
  
  const [formData, setFormData] = useState<GuarantorFormData>({
    refNo: '',
    applicantName: '',
    applicantRegNo: '',
    loanAmount: '',
    applicantDepartment: '',
    guarantorName: '',
    guarantorFacultyBranch: '',
    guarantorSavings: '',
    guarantorLoan: '',
    acceptedTerms: false
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchPerformed, setSearchPerformed] = useState(false);

  useEffect(() => {
    // Initialize guarantor details with current user
    if (user) {
      setFormData(prev => ({
        ...prev,
        guarantorName: user.email?.split('@')[0]?.toUpperCase() || 'OLUDIPE, Mrs. OMODOLAPO ABIODUN',
        guarantorSavings: '758066',
        guarantorLoan: '906319'
      }));
    }
  }, [user]);

  const handleInputChange = (field: keyof GuarantorFormData, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSearch = async () => {
    if (!formData.refNo.trim()) {
      alert('Please enter a reference number to search');
      return;
    }

    setIsLoading(true);

    try {
      // Simulate API search
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Mock applicant data based on reference number
      const mockApplicantData = {
        applicantName: 'JOHNSON, Mr. ADEBAYO SAMUEL',
        applicantRegNo: formData.refNo,
        loanAmount: '500,000',
        applicantDepartment: 'FINANCE & ACCOUNTS'
      };
      
      setFormData(prev => ({
        ...prev,
        ...mockApplicantData
      }));
      
      setSearchPerformed(true);
      
    } catch (err) {
      console.error('Error searching for applicant:', err);
      alert('Failed to find applicant details. Please check the reference number.');
    } finally {
      setIsLoading(false);
    }
  };

  const validateForm = (): string[] => {
    const errors: string[] = [];
    
    if (!searchPerformed) errors.push('Please search for applicant details first');
    if (!formData.guarantorName.trim()) errors.push('Guarantor name is required');
    if (!formData.guarantorFacultyBranch.trim()) errors.push('Guarantor faculty/branch is required');
    if (!formData.acceptedTerms) errors.push('Please accept the terms and conditions');
    
    return errors;
  };

  const handleSubmit = async () => {
    const errors = validateForm();
    if (errors.length > 0) {
      alert('Please fix the following errors:\n' + errors.join('\n'));
      return;
    }

    setIsSubmitting(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      console.log('Submitting guarantor form:', formData);
      
      alert('Guarantor form submitted successfully! The loan applicant will be notified.');
      
      // Reset form
      setFormData(prev => ({
        ...prev,
        refNo: '',
        applicantName: '',
        applicantRegNo: '',
        loanAmount: '',
        applicantDepartment: '',
        guarantorFacultyBranch: '',
        acceptedTerms: false
      }));
      setSearchPerformed(false);
      
    } catch (err) {
      console.error('Error submitting guarantor form:', err);
      alert('Failed to submit guarantor form. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setFormData(prev => ({
      ...prev,
      refNo: '',
      applicantName: '',
      applicantRegNo: '',
      loanAmount: '',
      applicantDepartment: '',
      guarantorFacultyBranch: '',
      acceptedTerms: false
    }));
    setSearchPerformed(false);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Shield className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Guarantor Form</h1>
            <p className="text-muted-foreground">Stand as a guarantor for a loan applicant</p>
          </div>
        </div>
        <Badge variant="outline" className="text-sm">
          <Users className="h-4 w-4 mr-1" />
          Guarantor Portal
        </Badge>
      </div>

      {/* Guarantor Form */}
      <Card className="max-w-4xl">
        <CardHeader className="bg-primary text-primary-foreground">
          <CardTitle className="text-xl font-semibold">
            Guarantor For:
          </CardTitle>
          <div className="text-sm text-red-200 mt-2">
            <AlertTriangle className="h-4 w-4 inline mr-1" />
            Note: All fields are required
          </div>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          {/* Search Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <Label htmlFor="refNo" className="text-sm font-medium">
                  Ref No
                </Label>
                <Input
                  id="refNo"
                  value={formData.refNo}
                  onChange={(e) => handleInputChange('refNo', e.target.value)}
                  placeholder="Enter applicant reference number"
                  disabled={isLoading}
                />
              </div>
              <Button 
                onClick={handleSearch}
                disabled={isLoading || !formData.refNo.trim()}
                className="mt-6"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Searching...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Search className="h-4 w-4" />
                    Search
                  </div>
                )}
              </Button>
            </div>
          </div>

          <Separator />

          {/* Applicant Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Applicant Name */}
            <div className="space-y-2">
              <Label htmlFor="applicantName" className="text-sm font-medium">
                Applicant Name
              </Label>
              <Input
                id="applicantName"
                value={formData.applicantName}
                disabled
                className="bg-gray-50"
                placeholder={searchPerformed ? "" : "Search to populate"}
              />
            </div>

            {/* Applicant Reg.No */}
            <div className="space-y-2">
              <Label htmlFor="applicantRegNo" className="text-sm font-medium">
                Applicant Reg.No
              </Label>
              <Input
                id="applicantRegNo"
                value={formData.applicantRegNo}
                disabled
                className="bg-gray-50"
                placeholder={searchPerformed ? "" : "Search to populate"}
              />
            </div>

            {/* Loan Amount */}
            <div className="space-y-2">
              <Label htmlFor="loanAmount" className="text-sm font-medium">
                Loan Amount
              </Label>
              <Input
                id="loanAmount"
                value={formData.loanAmount ? `₦ ${formData.loanAmount}` : ''}
                disabled
                className="bg-gray-50"
                placeholder={searchPerformed ? "" : "Search to populate"}
              />
            </div>

            {/* Applicant Department */}
            <div className="space-y-2">
              <Label htmlFor="applicantDepartment" className="text-sm font-medium">
                Applicant Department
              </Label>
              <Input
                id="applicantDepartment"
                value={formData.applicantDepartment}
                disabled
                className="bg-gray-50"
                placeholder={searchPerformed ? "" : "Search to populate"}
              />
            </div>
          </div>

          <Separator />

          {/* Guarantor Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Guarantor Name */}
            <div className="space-y-2">
              <Label htmlFor="guarantorName" className="text-sm font-medium">
                Guarantor Name
              </Label>
              <Input
                id="guarantorName"
                value={formData.guarantorName}
                onChange={(e) => handleInputChange('guarantorName', e.target.value)}
                placeholder="OLUDIPE, Mrs. OMODOLAPO ABIODUN"
                className="bg-gray-50"
              />
            </div>

            {/* Guarantor Faculty/Branch */}
            <div className="space-y-2">
              <Label htmlFor="guarantorFacultyBranch" className="text-sm font-medium">
                Guarantor Faculty/Branch
              </Label>
              <Input
                id="guarantorFacultyBranch"
                value={formData.guarantorFacultyBranch}
                onChange={(e) => handleInputChange('guarantorFacultyBranch', e.target.value)}
                placeholder="Enter your faculty/branch"
              />
            </div>

            {/* Guarantor Savings */}
            <div className="space-y-2">
              <Label htmlFor="guarantorSavings" className="text-sm font-medium">
                Guarantor Savings
              </Label>
              <Input
                id="guarantorSavings"
                value={formData.guarantorSavings}
                onChange={(e) => handleInputChange('guarantorSavings', e.target.value)}
                placeholder="758066"
                className="bg-gray-50"
              />
            </div>

            {/* Guarantor Loan */}
            <div className="space-y-2">
              <Label htmlFor="guarantorLoan" className="text-sm font-medium">
                Guarantor Loan
              </Label>
              <Input
                id="guarantorLoan"
                value={formData.guarantorLoan}
                onChange={(e) => handleInputChange('guarantorLoan', e.target.value)}
                placeholder="906319"
                className="bg-gray-50"
              />
            </div>
          </div>

          <Separator />

          {/* Terms and Conditions */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="terms"
              checked={formData.acceptedTerms}
              onCheckedChange={(checked) => handleInputChange('acceptedTerms', checked as boolean)}
            />
            <Label htmlFor="terms" className="text-sm">
              I consent to the{' '}
              <span className="text-primary underline cursor-pointer">
                terms and conditions
              </span>
            </Label>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-center gap-4 pt-4">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button 
                  size="lg" 
                  className="px-8 bg-primary hover:bg-primary/90"
                  disabled={isSubmitting || !formData.acceptedTerms || !searchPerformed}
                >
                  {isSubmitting ? (
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Submitting...
                    </div>
                  ) : (
                    'Submit'
                  )}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Confirm Guarantor Declaration</AlertDialogTitle>
                  <AlertDialogDescription className="space-y-2">
                    <p>Please confirm that you agree to stand as guarantor for:</p>
                    <div className="bg-gray-50 p-4 rounded-lg space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Applicant:</span>
                        <span className="font-medium">{formData.applicantName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Reg No:</span>
                        <span className="font-medium">{formData.applicantRegNo}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Loan Amount:</span>
                        <span className="font-medium">₦ {formData.loanAmount}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Department:</span>
                        <span className="font-medium">{formData.applicantDepartment}</span>
                      </div>
                    </div>
                    <div className="bg-blue-50 p-4 rounded-lg space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Your Name:</span>
                        <span className="font-medium">{formData.guarantorName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Faculty/Branch:</span>
                        <span className="font-medium">{formData.guarantorFacultyBranch}</span>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mt-4">
                      By confirming, you agree to guarantee this loan according to the cooperative's terms and conditions.
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

            <Button 
              variant="outline" 
              size="lg" 
              className="px-8"
              onClick={handleReset}
              disabled={isSubmitting}
            >
              Reset
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
