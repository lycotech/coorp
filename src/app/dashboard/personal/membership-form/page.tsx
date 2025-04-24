'use client';

import React, { useState, useEffect } from 'react';
import { Printer } from "lucide-react";
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardContent 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AuthorizationGuard } from '@/components/AuthorizationGuard';

// Simple Separator component that accepts className prop
const Separator = ({ className = '' }: { className?: string }) => (
  <div className={`h-[1px] w-full bg-border my-4 ${className}`} />
);

interface MemberProfile {
  id: number;
  reg_no: string;
  staff_no: string;
  email: string | null;
  firstname: string | null;
  surname: string | null;
  gender: string | null;
  dob: string | null;
  mobile_no: string | null;
  state_of_origin: string | null;
  rank_grade: string | null;
  bank_name: string | null;
  acct_no: string | null;
  member_status: string | null;
  profile_photo_url?: string | null;
}

function MembershipFormContent() {
  const [isLoading, setIsLoading] = useState(true);
  const [profile, setProfile] = useState<MemberProfile | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      setIsLoading(true);
      try {
        const response = await fetch('/api/members/profile');
        
        if (!response.ok) {
          throw new Error('Failed to fetch profile data');
        }
        
        const data = await response.json();
        setProfile(data.member);
      } catch (error) {
        console.error('Error:', error);
        setError('Failed to load profile data. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handlePrint = () => {
    window.print();
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-80">Loading membership form...</div>;
  }

  if (error) {
    return <div className="text-center text-red-500 p-4">{error}</div>;
  }

  return (
    <div className="space-y-6">
      <div className="print:hidden flex justify-end">
        <Button onClick={handlePrint} className="flex items-center gap-2">
          <Printer className="h-4 w-4" />
          Print Membership Form
        </Button>
      </div>
      
      <Card className="print:shadow-none">
        <CardHeader className="text-center border-b">
          <div className="mx-auto mb-4 w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center">
            {profile?.profile_photo_url ? (
              <img 
                src={profile.profile_photo_url} 
                alt="Profile"
                className="w-full h-full rounded-full object-cover" 
              />
            ) : (
              <span className="text-2xl text-gray-400">Photo</span>
            )}
          </div>
          <CardTitle className="text-2xl">COOPERATIVE MEMBERSHIP FORM</CardTitle>
          <p className="text-muted-foreground">Cooperative Society Limited</p>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-6">
            {/* Personal Information */}
            <div>
              <h3 className="text-lg font-semibold mb-3">1. Personal Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Registration Number</p>
                  <p className="font-medium">{profile?.reg_no || 'N/A'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Staff Number</p>
                  <p className="font-medium">{profile?.staff_no || 'N/A'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Full Name</p>
                  <p className="font-medium">{`${profile?.firstname || ''} ${profile?.surname || ''}`.trim() || 'N/A'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Gender</p>
                  <p className="font-medium">{profile?.gender || 'N/A'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Email Address</p>
                  <p className="font-medium">{profile?.email || 'N/A'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Phone Number</p>
                  <p className="font-medium">{profile?.mobile_no || 'N/A'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">State of Origin</p>
                  <p className="font-medium">{profile?.state_of_origin || 'N/A'}</p>
                </div>
              </div>
            </div>
            
            <Separator />
            
            {/* Bank Details */}
            <div>
              <h3 className="text-lg font-semibold mb-3">2. Bank Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Bank Name</p>
                  <p className="font-medium">{profile?.bank_name || 'N/A'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Account Number</p>
                  <p className="font-medium">{profile?.acct_no || 'N/A'}</p>
                </div>
              </div>
            </div>
            
            <Separator />
            
            {/* Contribution Details */}
            <div>
              <h3 className="text-lg font-semibold mb-3">3. Contribution Details</h3>
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Monthly Contribution Amount</p>
                  <p className="font-medium">₦ __________________</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Payment Method</p>
                  <p className="font-medium">☐ Salary Deduction &nbsp;&nbsp;&nbsp; ☐ Direct Deposit &nbsp;&nbsp;&nbsp; ☐ Standing Order</p>
                </div>
              </div>
            </div>
            
            <Separator />
            
            {/* Declaration */}
            <div>
              <h3 className="text-lg font-semibold mb-3">4. Declaration</h3>
              <p className="text-sm mb-6">
                I, <span className="font-bold">{`${profile?.firstname || ''} ${profile?.surname || ''}`.trim() || '_________________'}</span>, hereby apply for membership of the Cooperative Society. I agree to abide by the rules and regulations governing the operation of the society as stipulated in its bye-laws. I further authorize the deduction of my contribution from my salary and remittance of same to the society.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-10">
                <div>
                  <p className="text-sm text-muted-foreground mb-8">Applicant&apos;s Signature</p>
                  <div className="border-t border-black w-48 pt-1">
                    <p className="text-sm text-muted-foreground">Date</p>
                  </div>
                </div>
                
                <div>
                  <p className="text-sm text-muted-foreground mb-8">For Official Use Only</p>
                  <div className="border-t border-black w-48 pt-1">
                    <p className="text-sm text-muted-foreground">Authorized Signature & Stamp</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function MembershipFormPage() {
  return (
    <AuthorizationGuard allowedRoles={['Member', 'SuperAdmin']}>
      <div className="space-y-6 p-6 print:p-0">
        <div className="print:hidden">
          <h2 className="text-3xl font-bold tracking-tight">Membership Form</h2>
          <p className="text-muted-foreground">
            Print your official membership form for the cooperative.
          </p>
        </div>
        <Separator className="print:hidden" />
        <MembershipFormContent />
      </div>
    </AuthorizationGuard>
  );
} 