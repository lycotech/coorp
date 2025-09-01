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
import { Textarea } from "@/components/ui/textarea";
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
  CreditCard, 
  FileText, 
  AlertTriangle,
  Calendar,
  Upload
} from "lucide-react";
import { useCurrentUser } from "@/hooks/useCurrentUser";

interface LoanApplicationData {
  // Personal Information
  regNo: string;
  name: string;
  gradeRank: string;
  locationDept: string;
  monthlyBasicSalary: string;
  accountToBeCredited: string;
  phoneNumber: string;
  
  // Request Details
  requestType: string;
  monthlyContribution: string;
  dateRepaidLastLoan: string;
  retirementYear: string;
  totalLoanRepayment: string;
  monthlyRepayment: string;
  
  // Loan Information
  monthlyContributionIncludingRepayment: string;
  amountRequestedInFigure: string;
  repaymentPeriod: string;
  amountRequestedInWords: string;
  purposeOfRequest: string;
  
  // Application Payment Receipt
  applicationPaymentReceipt: File | null;
  
  // Terms and conditions
  acceptedTerms: boolean;
}

const requestTypes = [
  "New Loan Application",
  "Loan Increment", 
  "Emergency Loan",
  "Educational Loan",
  "Medical Loan",
  "Housing Loan"
];

const repaymentPeriods = [
  "6 months",
  "12 months", 
  "18 months",
  "24 months",
  "36 months",
  "48 months"
];

const departments = [
  "INFORMATION TECHNOLOGY",
  "HUMAN RESOURCES",
  "FINANCE & ACCOUNTS",
  "ADMINISTRATION",
  "OPERATIONS",
  "MARKETING",
  "CUSTOMER SERVICE"
];

export default function LoanApplicationPage() {
  const { user } = useCurrentUser();
  
  const [formData, setFormData] = useState<LoanApplicationData>({
    regNo: '',
    name: '',
    gradeRank: '',
    locationDept: '',
    monthlyBasicSalary: '',
    accountToBeCredited: '',
    phoneNumber: '',
    requestType: '',
    monthlyContribution: '',
    dateRepaidLastLoan: '',
    retirementYear: '',
    totalLoanRepayment: '',
    monthlyRepayment: '',
    monthlyContributionIncludingRepayment: '',
    amountRequestedInFigure: '',
    repaymentPeriod: '',
    amountRequestedInWords: '',
    purposeOfRequest: '',
    applicationPaymentReceipt: null,
    acceptedTerms: false
  });
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Initialize form with user data
    if (user) {
      setFormData(prev => ({
        ...prev,
        regNo: user.staffNo || '313',
        name: user.email?.split('@')[0]?.toUpperCase() || 'OLUDIPE, Mrs. OMODOLAPO ABIODUN',
        locationDept: 'INFORMATION TECHNOLOGY',
        phoneNumber: user.phone || '',
        monthlyContribution: '50000'
      }));
    }
    setIsLoading(false);
  }, [user]);

  const handleInputChange = (field: keyof LoanApplicationData, value: string | boolean | File | null) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Auto-calculate amount in words when figure changes
    if (field === 'amountRequestedInFigure' && typeof value === 'string') {
      const numericValue = parseFloat(value.replace(/,/g, ''));
      if (!isNaN(numericValue)) {
        const amountInWords = convertNumberToWords(numericValue);
        setFormData(prev => ({
          ...prev,
          amountRequestedInWords: amountInWords
        }));
      }
    }
  };

  const convertNumberToWords = (num: number): string => {
    // Simple implementation for Nigerian Naira
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
    }).format(num) + ' only';
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    handleInputChange('applicationPaymentReceipt', file);
  };

  const validateForm = (): string[] => {
    const errors: string[] = [];
    
    if (!formData.requestType) errors.push('Please select your request type');
    if (!formData.amountRequestedInFigure) errors.push('Please enter the loan amount');
    if (!formData.repaymentPeriod) errors.push('Please select repayment period');
    if (!formData.purposeOfRequest.trim()) errors.push('Please specify the purpose of request');
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
      
      console.log('Submitting loan application:', formData);
      
      alert('Loan application submitted successfully! You will receive a confirmation email shortly.');
      
      // Reset form
      setFormData(prev => ({
        ...prev,
        requestType: '',
        amountRequestedInFigure: '',
        repaymentPeriod: '',
        amountRequestedInWords: '',
        purposeOfRequest: '',
        applicationPaymentReceipt: null,
        acceptedTerms: false
      }));
      
    } catch (err) {
      console.error('Error submitting loan application:', err);
      alert('Failed to submit loan application. Please try again.');
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
              <CreditCard className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Loan Application</h1>
              <p className="text-muted-foreground">Apply for a cooperative loan</p>
            </div>
          </div>
        </div>
        
        <Card className="max-w-6xl">
          <CardContent className="p-6">
            <div className="animate-pulse space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[...Array(10)].map((_, i) => (
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

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <CreditCard className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Loan Application</h1>
            <p className="text-muted-foreground">Apply for a cooperative loan</p>
          </div>
        </div>
        <Badge variant="outline" className="text-sm">
          <FileText className="h-4 w-4 mr-1" />
          Application Form
        </Badge>
      </div>

      {/* Application Form */}
      <Card className="max-w-6xl">
        <CardHeader className="bg-primary text-primary-foreground">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Input 
                value={formData.regNo}
                onChange={(e) => handleInputChange('regNo', e.target.value)}
                className="w-20 bg-white text-black"
                placeholder="313"
              />
              <CardTitle className="text-xl">
                TO The President I wish to request for
              </CardTitle>
              <Select 
                value={formData.requestType} 
                onValueChange={(value) => handleInputChange('requestType', value)}
              >
                <SelectTrigger className="w-64 bg-white text-black">
                  <SelectValue placeholder="Select your Request Type" />
                </SelectTrigger>
                <SelectContent>
                  {requestTypes.map(type => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="text-sm text-red-200 mt-2">
            <AlertTriangle className="h-4 w-4 inline mr-1" />
            Note: All fields are required
          </div>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          {/* Personal Information Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium">
                Name
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="OLUDIPE, Mrs. OMODOLAPO ABIODUN"
                className="bg-gray-50"
              />
            </div>

            {/* Reg No */}
            <div className="space-y-2">
              <Label htmlFor="regNo2" className="text-sm font-medium">
                Reg No
              </Label>
              <Input
                id="regNo2"
                value={formData.regNo}
                onChange={(e) => handleInputChange('regNo', e.target.value)}
                placeholder="313"
              />
            </div>

            {/* Grade/Rank */}
            <div className="space-y-2">
              <Label htmlFor="gradeRank" className="text-sm font-medium">
                Grade/Rank
              </Label>
              <Input
                id="gradeRank"
                value={formData.gradeRank}
                onChange={(e) => handleInputChange('gradeRank', e.target.value)}
                placeholder="Enter your grade/rank"
              />
            </div>

            {/* Application Payment Receipt */}
            <div className="space-y-2">
              <Label htmlFor="receipt" className="text-sm font-medium">
                Application Payment Receipt
              </Label>
              <div className="flex items-center gap-2">
                <Input
                  id="receipt"
                  type="file"
                  onChange={handleFileUpload}
                  accept=".pdf,.jpg,.jpeg,.png"
                  className="hidden"
                />
                <Label
                  htmlFor="receipt"
                  className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md cursor-pointer hover:bg-gray-50"
                >
                  <Upload className="h-4 w-4" />
                  Choose File
                </Label>
                <span className="text-sm text-gray-500">
                  {formData.applicationPaymentReceipt ? formData.applicationPaymentReceipt.name : 'No file chosen'}
                </span>
              </div>
            </div>

            {/* Location/Dept */}
            <div className="space-y-2">
              <Label htmlFor="locationDept" className="text-sm font-medium">
                Location/Dept
              </Label>
              <Select 
                value={formData.locationDept} 
                onValueChange={(value) => handleInputChange('locationDept', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Department" />
                </SelectTrigger>
                <SelectContent>
                  {departments.map(dept => (
                    <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Phone Number */}
            <div className="space-y-2">
              <Label htmlFor="phoneNumber" className="text-sm font-medium">
                Phone Number
              </Label>
              <Input
                id="phoneNumber"
                value={formData.phoneNumber}
                onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                placeholder="Enter your phone number"
              />
            </div>

            {/* Monthly Basic Salary */}
            <div className="space-y-2">
              <Label htmlFor="monthlyBasicSalary" className="text-sm font-medium">
                Monthly Basic Salary
              </Label>
              <div className="relative">
                <span className="absolute left-3 top-3 text-sm font-medium text-muted-foreground">₦</span>
                <Input
                  id="monthlyBasicSalary"
                  value={formData.monthlyBasicSalary}
                  onChange={(e) => {
                    const value = e.target.value.replace(/[^0-9]/g, '');
                    const formatted = value ? parseInt(value).toLocaleString() : '';
                    handleInputChange('monthlyBasicSalary', formatted);
                  }}
                  placeholder="Enter monthly basic salary"
                  className="pl-9"
                />
              </div>
            </div>

            {/* Monthly Contribution */}
            <div className="space-y-2">
              <Label htmlFor="monthlyContribution" className="text-sm font-medium">
                Monthly Contribution
              </Label>
              <div className="relative">
                <span className="absolute left-3 top-3 text-sm font-medium text-muted-foreground">₦</span>
                <Input
                  id="monthlyContribution"
                  value={formData.monthlyContribution}
                  onChange={(e) => {
                    const value = e.target.value.replace(/[^0-9]/g, '');
                    const formatted = value ? parseInt(value).toLocaleString() : '';
                    handleInputChange('monthlyContribution', formatted);
                  }}
                  placeholder="Enter monthly contribution"
                  className="pl-9"
                />
              </div>
            </div>

            {/* Acct. No/Bank to be Credited */}
            <div className="space-y-2">
              <Label htmlFor="accountToBeCredited" className="text-sm font-medium">
                Acct. No/Bank to be Credited
              </Label>
              <Input
                id="accountToBeCredited"
                value={formData.accountToBeCredited}
                onChange={(e) => handleInputChange('accountToBeCredited', e.target.value)}
                placeholder="Enter account details"
              />
            </div>

            {/* Date Repaid Last Loan Granted */}
            <div className="space-y-2">
              <Label htmlFor="dateRepaidLastLoan" className="text-sm font-medium">
                Date Repaid Last Loan Granted
              </Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="dateRepaidLastLoan"
                  type="date"
                  value={formData.dateRepaidLastLoan}
                  onChange={(e) => handleInputChange('dateRepaidLastLoan', e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            {/* Monthly Contribution Including Repayment */}
            <div className="space-y-2">
              <Label htmlFor="monthlyContributionIncludingRepayment" className="text-sm font-medium">
                Monthly Contribution Including Repayment
              </Label>
              <div className="relative">
                <span className="absolute left-3 top-3 text-sm font-medium text-muted-foreground">₦</span>
                <Input
                  id="monthlyContributionIncludingRepayment"
                  value={formData.monthlyContributionIncludingRepayment}
                  onChange={(e) => {
                    const value = e.target.value.replace(/[^0-9]/g, '');
                    const formatted = value ? parseInt(value).toLocaleString() : '';
                    handleInputChange('monthlyContributionIncludingRepayment', formatted);
                  }}
                  placeholder="Enter total monthly amount"
                  className="pl-9"
                />
              </div>
            </div>

            {/* Retirement Year */}
            <div className="space-y-2">
              <Label htmlFor="retirementYear" className="text-sm font-medium">
                Retirement Year
              </Label>
              <Input
                id="retirementYear"
                value={formData.retirementYear}
                onChange={(e) => handleInputChange('retirementYear', e.target.value)}
                placeholder="Enter retirement year"
                type="number"
                min="2025"
                max="2070"
              />
            </div>

            {/* Amount Requested in Figure */}
            <div className="space-y-2">
              <Label htmlFor="amountRequestedInFigure" className="text-sm font-medium">
                Amount Requested in Figure
              </Label>
              <div className="relative">
                <span className="absolute left-3 top-3 text-sm font-medium text-muted-foreground">₦</span>
                <Input
                  id="amountRequestedInFigure"
                  value={formData.amountRequestedInFigure}
                  onChange={(e) => {
                    const value = e.target.value.replace(/[^0-9]/g, '');
                    const formatted = value ? parseInt(value).toLocaleString() : '';
                    handleInputChange('amountRequestedInFigure', formatted);
                  }}
                  placeholder="Enter loan amount"
                  className="pl-9"
                />
              </div>
            </div>

            {/* Total Loan Repayment */}
            <div className="space-y-2">
              <Label htmlFor="totalLoanRepayment" className="text-sm font-medium">
                Total Loan Repayment
              </Label>
              <div className="relative">
                <span className="absolute left-3 top-3 text-sm font-medium text-muted-foreground">₦</span>
                <Input
                  id="totalLoanRepayment"
                  value={formData.totalLoanRepayment}
                  onChange={(e) => {
                    const value = e.target.value.replace(/[^0-9]/g, '');
                    const formatted = value ? parseInt(value).toLocaleString() : '';
                    handleInputChange('totalLoanRepayment', formatted);
                  }}
                  placeholder="Enter total repayment amount"
                  className="pl-9"
                />
              </div>
            </div>

            {/* Repayment Period Requesting */}
            <div className="space-y-2">
              <Label htmlFor="repaymentPeriod" className="text-sm font-medium">
                Repayment Period Requesting
              </Label>
              <Select 
                value={formData.repaymentPeriod} 
                onValueChange={(value) => handleInputChange('repaymentPeriod', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Repayment Period" />
                </SelectTrigger>
                <SelectContent>
                  {repaymentPeriods.map(period => (
                    <SelectItem key={period} value={period}>{period}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Monthly Repayment */}
            <div className="space-y-2">
              <Label htmlFor="monthlyRepayment" className="text-sm font-medium">
                Monthly Repayment
              </Label>
              <div className="relative">
                <span className="absolute left-3 top-3 text-sm font-medium text-muted-foreground">₦</span>
                <Input
                  id="monthlyRepayment"
                  value={formData.monthlyRepayment}
                  onChange={(e) => {
                    const value = e.target.value.replace(/[^0-9]/g, '');
                    const formatted = value ? parseInt(value).toLocaleString() : '';
                    handleInputChange('monthlyRepayment', formatted);
                  }}
                  placeholder="Enter monthly repayment"
                  className="pl-9"
                />
              </div>
            </div>
          </div>

          {/* Full Width Fields */}
          <div className="space-y-6">
            {/* Amount Requested in Words */}
            <div className="space-y-2">
              <Label htmlFor="amountRequestedInWords" className="text-sm font-medium">
                Amount Requested in Words
              </Label>
              <Input
                id="amountRequestedInWords"
                value={formData.amountRequestedInWords}
                onChange={(e) => handleInputChange('amountRequestedInWords', e.target.value)}
                placeholder="Amount in words will be auto-generated"
                className="bg-gray-50"
                readOnly
              />
            </div>

            {/* Purpose of Request */}
            <div className="space-y-2">
              <Label htmlFor="purposeOfRequest" className="text-sm font-medium">
                Purpose of Request
              </Label>
              <Textarea
                id="purposeOfRequest"
                value={formData.purposeOfRequest}
                onChange={(e) => handleInputChange('purposeOfRequest', e.target.value)}
                placeholder="Please specify the purpose of your loan request..."
                rows={4}
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

          {/* Submit Button */}
          <div className="flex justify-center pt-4">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button 
                  size="lg" 
                  className="px-8 bg-primary hover:bg-primary/90"
                  disabled={isSubmitting || !formData.acceptedTerms}
                >
                  {isSubmitting ? (
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Submitting Application...
                    </div>
                  ) : (
                    'Submit Application'
                  )}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Confirm Loan Application</AlertDialogTitle>
                  <AlertDialogDescription className="space-y-2">
                    <p>Please review your loan application details:</p>
                    <div className="bg-gray-50 p-4 rounded-lg space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Request Type:</span>
                        <span className="font-medium">{formData.requestType}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Loan Amount:</span>
                        <span className="font-medium">₦ {formData.amountRequestedInFigure}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Repayment Period:</span>
                        <span className="font-medium">{formData.repaymentPeriod}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Monthly Repayment:</span>
                        <span className="font-medium">₦ {formData.monthlyRepayment}</span>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mt-4">
                      This application will be submitted for administrative review and approval.
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
