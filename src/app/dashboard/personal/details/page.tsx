'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardContent 
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { format } from 'date-fns';
import { AuthorizationGuard } from '@/components/AuthorizationGuard';

// Simple toast implementation since we don't have the shadcn toast component
const useToast = () => {
  const showToast = (message: { title: string; description: string; variant?: string }) => {
    alert(`${message.title}: ${message.description}`);
  };
  return { toast: showToast };
};

// Simple Separator component
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

const genderOptions = [
  { value: 'Male', label: 'Male' },
  { value: 'Female', label: 'Female' },
];

const stateOptions = [
  { value: 'Abia', label: 'Abia' },
  { value: 'Adamawa', label: 'Adamawa' },
  { value: 'Akwa Ibom', label: 'Akwa Ibom' },
  { value: 'Anambra', label: 'Anambra' },
  { value: 'Bauchi', label: 'Bauchi' },
  { value: 'Bayelsa', label: 'Bayelsa' },
  { value: 'Benue', label: 'Benue' },
  { value: 'Borno', label: 'Borno' },
  { value: 'Cross River', label: 'Cross River' },
  { value: 'Delta', label: 'Delta' },
  { value: 'Ebonyi', label: 'Ebonyi' },
  { value: 'Edo', label: 'Edo' },
  { value: 'Ekiti', label: 'Ekiti' },
  { value: 'Enugu', label: 'Enugu' },
  { value: 'FCT', label: 'FCT' },
  { value: 'Gombe', label: 'Gombe' },
  { value: 'Imo', label: 'Imo' },
  { value: 'Jigawa', label: 'Jigawa' },
  { value: 'Kaduna', label: 'Kaduna' },
  { value: 'Kano', label: 'Kano' },
  { value: 'Katsina', label: 'Katsina' },
  { value: 'Kebbi', label: 'Kebbi' },
  { value: 'Kogi', label: 'Kogi' },
  { value: 'Kwara', label: 'Kwara' },
  { value: 'Lagos', label: 'Lagos' },
  { value: 'Nasarawa', label: 'Nasarawa' },
  { value: 'Niger', label: 'Niger' },
  { value: 'Ogun', label: 'Ogun' },
  { value: 'Ondo', label: 'Ondo' },
  { value: 'Osun', label: 'Osun' },
  { value: 'Oyo', label: 'Oyo' },
  { value: 'Plateau', label: 'Plateau' },
  { value: 'Rivers', label: 'Rivers' },
  { value: 'Sokoto', label: 'Sokoto' },
  { value: 'Taraba', label: 'Taraba' },
  { value: 'Yobe', label: 'Yobe' },
  { value: 'Zamfara', label: 'Zamfara' },
];

const bankOptions = [
  { value: 'Access Bank', label: 'Access Bank' },
  { value: 'Citibank', label: 'Citibank' },
  { value: 'Ecobank', label: 'Ecobank' },
  { value: 'Fidelity Bank', label: 'Fidelity Bank' },
  { value: 'First Bank', label: 'First Bank' },
  { value: 'First City Monument Bank', label: 'First City Monument Bank' },
  { value: 'Guaranty Trust Bank', label: 'Guaranty Trust Bank' },
  { value: 'Heritage Bank', label: 'Heritage Bank' },
  { value: 'Keystone Bank', label: 'Keystone Bank' },
  { value: 'Polaris Bank', label: 'Polaris Bank' },
  { value: 'Stanbic IBTC Bank', label: 'Stanbic IBTC Bank' },
  { value: 'Standard Chartered Bank', label: 'Standard Chartered Bank' },
  { value: 'Sterling Bank', label: 'Sterling Bank' },
  { value: 'Union Bank', label: 'Union Bank' },
  { value: 'United Bank for Africa', label: 'United Bank for Africa' },
  { value: 'Unity Bank', label: 'Unity Bank' },
  { value: 'Wema Bank', label: 'Wema Bank' },
  { value: 'Zenith Bank', label: 'Zenith Bank' },
];

const relationshipOptions = [
  { value: 'Spouse', label: 'Spouse' },
  { value: 'Child', label: 'Child' },
  { value: 'Parent', label: 'Parent' },
  { value: 'Sibling', label: 'Sibling' },
  { value: 'Other', label: 'Other' },
];

const maritalStatusOptions = [
  { value: 'Single', label: 'Single' },
  { value: 'Married', label: 'Married' },
  { value: 'Divorced', label: 'Divorced' },
  { value: 'Widowed', label: 'Widowed' },
];

// Component with the actual page content
function ViewUpdateDetailsContent() {
  const { toast } = useToast();
  const router = useRouter();

  // Member profile state
  const [profile, setProfile] = useState<MemberProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    firstname: '',
    surname: '',
    email: '',
    gender: '',
    dob: null as Date | null,
    phone: '',
    occupation: '',
    address: '',
    state_of_origin: '',
    marital_status: '',
    spouse_name: '',
    
    // Next of Kin
    kin_name: '',
    kin_address: '',
    kin_phone: '',
    kin_occupation: '',
    kin_gender: '',
    kin_relationship: '',
    
    // Cooperative
    membership_no: '',
    rank_grade: '',
    faculty: '',
    department: '',
    
    // Bank
    bank_name: '',
    account_no: '',
    account_name: '',
    
    // Added for LGA
    origin_lga: '',
  });

  // Fetch profile on component mount
  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/members/profile');
      
      if (!response.ok) {
        throw new Error('Failed to fetch profile');
      }
      
      const data = await response.json();
      setProfile(data.member);
      
      // Map DB data to form fields
      setFormData({
        firstname: data.member.firstname || '',
        surname: data.member.surname || '',
        email: data.member.email || '',
        gender: data.member.gender || '',
        dob: data.member.dob ? new Date(data.member.dob) : null,
        phone: data.member.mobile_no || '',
        occupation: data.member.occupation || '',
        address: data.member.address || '',
        state_of_origin: data.member.state_of_origin || '',
        marital_status: data.member.marital_status || '',
        spouse_name: data.member.spouse_name || '',
        
        // TODO: Map next of kin data when available in DB
        kin_name: '',
        kin_address: '',
        kin_phone: '',
        kin_occupation: '',
        kin_gender: '',
        kin_relationship: '',
        
        membership_no: data.member.reg_no || '',
        rank_grade: data.member.rank_grade || '',
        faculty: data.member.faculty || '',
        department: data.member.department || '',
        
        bank_name: data.member.bank_name || '',
        account_no: data.member.acct_no || '',
        account_name: '', // TODO: Map when available
        
        // LGA
        origin_lga: data.member.origin_lga || '',
      });
      
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast({
        title: "Error",
        description: "Failed to load profile data. Please try again later.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string | Date | null) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    try {
      // Prepare data for API
      const updateData = {
        firstname: formData.firstname,
        surname: formData.surname,
        email: formData.email,
        gender: formData.gender,
        dob: formData.dob ? format(formData.dob, 'yyyy-MM-dd') : null,
        mobile_no: formData.phone,
        state_of_origin: formData.state_of_origin,
        bank_name: formData.bank_name,
        acct_no: formData.account_no,
      };
      
      const response = await fetch('/api/members/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update profile');
      }
      
      toast({
        title: "Success",
        description: "Profile updated successfully",
      });
      
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-80">Loading profile data...</div>;
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-6">
        {/* Personal Information */}
        <Card>
          <CardHeader>
            <CardTitle>Person Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Staff No */}
              <div className="space-y-1">
                <Label htmlFor="staff_no">Staff No.</Label>
                <Input
                  id="staff_no"
                  value={profile?.staff_no || ''}
                  disabled
                  readOnly
                />
              </div>
              
              {/* First Name */}
              <div className="space-y-1">
                <Label htmlFor="first_name">First Name</Label>
                <Input
                  id="first_name"
                  value={formData.firstname}
                  onChange={(e) => handleInputChange('firstname', e.target.value)}
                />
              </div>
              
              {/* Last Name */}
              <div className="space-y-1">
                <Label htmlFor="last_name">Last Name</Label>
                <Input
                  id="last_name"
                  value={formData.surname}
                  onChange={(e) => handleInputChange('surname', e.target.value)}
                />
              </div>
              
              {/* Gender */}
              <div className="space-y-1">
                <Label htmlFor="gender">Gender</Label>
                <Select
                  value={formData.gender}
                  onValueChange={(value) => handleInputChange('gender', value)}
                >
                  <SelectTrigger id="gender">
                    <SelectValue placeholder="Select Gender" />
                  </SelectTrigger>
                  <SelectContent>
                    {genderOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {/* Date of Birth - Simplified */}
              <div className="space-y-1">
                <Label htmlFor="dob">Date of Birth</Label>
                <Input
                  id="dob"
                  type="date"
                  value={formData.dob ? format(formData.dob, 'yyyy-MM-dd') : ''}
                  onChange={(e) => {
                    const date = e.target.value ? new Date(e.target.value) : null;
                    handleInputChange('dob', date);
                  }}
                />
              </div>
              
              {/* Email Address */}
              <div className="space-y-1">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                />
              </div>
              
              {/* Phone Number */}
              <div className="space-y-1">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                />
              </div>
              
              {/* Occupation */}
              <div className="space-y-1">
                <Label htmlFor="occupation">Occupation</Label>
                <Input
                  id="occupation"
                  value={formData.occupation}
                  onChange={(e) => handleInputChange('occupation', e.target.value)}
                />
              </div>
              
              {/* Full Address */}
              <div className="space-y-1">
                <Label htmlFor="address">Full Address</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                />
              </div>
              
              {/* State of Origin */}
              <div className="space-y-1">
                <Label htmlFor="state_of_origin">State of Origin</Label>
                <Select
                  value={formData.state_of_origin}
                  onValueChange={(value) => handleInputChange('state_of_origin', value)}
                >
                  <SelectTrigger id="state_of_origin">
                    <SelectValue placeholder="Select State of Origin" />
                  </SelectTrigger>
                  <SelectContent>
                    {stateOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {/* Origin LGA */}
              <div className="space-y-1">
                <Label htmlFor="origin_lga">Origin LGA</Label>
                <Select
                  value={formData.origin_lga}
                  onValueChange={(value) => handleInputChange('origin_lga', value)}
                >
                  <SelectTrigger id="origin_lga">
                    <SelectValue placeholder="Select Origin LGA" />
                  </SelectTrigger>
                  <SelectContent>
                    {/* TODO: Add LGA options based on selected state */}
                    <SelectItem value="placeholder">Select LGA</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {/* Marital Status */}
              <div className="space-y-1">
                <Label htmlFor="marital_status">Marital Status</Label>
                <Select
                  value={formData.marital_status}
                  onValueChange={(value) => handleInputChange('marital_status', value)}
                >
                  <SelectTrigger id="marital_status">
                    <SelectValue placeholder="Select your Marital Status" />
                  </SelectTrigger>
                  <SelectContent>
                    {maritalStatusOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {/* Spouse Name */}
              <div className="space-y-1">
                <Label htmlFor="spouse_name">Spouse Name</Label>
                <Input
                  id="spouse_name"
                  value={formData.spouse_name}
                  onChange={(e) => handleInputChange('spouse_name', e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Next of KIN Information */}
        <Card>
          <CardHeader>
            <CardTitle>Next of KIN Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Full Name */}
              <div className="space-y-1">
                <Label htmlFor="kin_name">Full Name</Label>
                <Input
                  id="kin_name"
                  value={formData.kin_name}
                  onChange={(e) => handleInputChange('kin_name', e.target.value)}
                />
              </div>
              
              {/* Gender */}
              <div className="space-y-1">
                <Label htmlFor="kin_gender">Gender</Label>
                <Select
                  value={formData.kin_gender}
                  onValueChange={(value) => handleInputChange('kin_gender', value)}
                >
                  <SelectTrigger id="kin_gender">
                    <SelectValue placeholder="Select Gender" />
                  </SelectTrigger>
                  <SelectContent>
                    {genderOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {/* Address */}
              <div className="space-y-1">
                <Label htmlFor="kin_address">Address</Label>
                <Input
                  id="kin_address"
                  value={formData.kin_address}
                  onChange={(e) => handleInputChange('kin_address', e.target.value)}
                />
              </div>
              
              {/* Phone Number */}
              <div className="space-y-1">
                <Label htmlFor="kin_phone">Phone Number</Label>
                <Input
                  id="kin_phone"
                  value={formData.kin_phone}
                  onChange={(e) => handleInputChange('kin_phone', e.target.value)}
                />
              </div>
              
              {/* Occupation */}
              <div className="space-y-1">
                <Label htmlFor="kin_occupation">Occupation</Label>
                <Input
                  id="kin_occupation"
                  value={formData.kin_occupation}
                  onChange={(e) => handleInputChange('kin_occupation', e.target.value)}
                />
              </div>
              
              {/* Relationship */}
              <div className="space-y-1">
                <Label htmlFor="kin_relationship">Relationship</Label>
                <Select
                  value={formData.kin_relationship}
                  onValueChange={(value) => handleInputChange('kin_relationship', value)}
                >
                  <SelectTrigger id="kin_relationship">
                    <SelectValue placeholder="Select Relationship" />
                  </SelectTrigger>
                  <SelectContent>
                    {relationshipOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Cooperative Information */}
        <Card>
          <CardHeader>
            <CardTitle>Cooperative Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Membership No. */}
              <div className="space-y-1">
                <Label htmlFor="membership_no">Membership No.</Label>
                <Input
                  id="membership_no"
                  value={formData.membership_no}
                  disabled
                  readOnly
                />
              </div>
              
              {/* Rank or Grade/level */}
              <div className="space-y-1">
                <Label htmlFor="rank_grade">Rank or Grade/level</Label>
                <Input
                  id="rank_grade"
                  value={formData.rank_grade}
                  disabled
                  readOnly
                />
              </div>
              
              {/* Faculty/Branch */}
              <div className="space-y-1">
                <Label htmlFor="faculty">Faculty/Branch</Label>
                <Select
                  value={formData.faculty}
                  onValueChange={(value) => handleInputChange('faculty', value)}
                  disabled
                >
                  <SelectTrigger id="faculty">
                    <SelectValue placeholder="Select Faculty" />
                  </SelectTrigger>
                  <SelectContent>
                    {/* TODO: Add Faculty options */}
                    <SelectItem value="placeholder">Faculty</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {/* Department */}
              <div className="space-y-1">
                <Label htmlFor="department">Department</Label>
                <Select
                  value={formData.department}
                  onValueChange={(value) => handleInputChange('department', value)}
                  disabled
                >
                  <SelectTrigger id="department">
                    <SelectValue placeholder="Select Department" />
                  </SelectTrigger>
                  <SelectContent>
                    {/* TODO: Add Department options based on faculty */}
                    <SelectItem value="placeholder">Department</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Bank Details */}
        <Card>
          <CardHeader>
            <CardTitle>Bank Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Bank Name */}
              <div className="space-y-1">
                <Label htmlFor="bank_name">Bank Name</Label>
                <Select
                  value={formData.bank_name}
                  onValueChange={(value) => handleInputChange('bank_name', value)}
                >
                  <SelectTrigger id="bank_name">
                    <SelectValue placeholder="Select Bank Name" />
                  </SelectTrigger>
                  <SelectContent>
                    {bankOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {/* Account Name */}
              <div className="space-y-1">
                <Label htmlFor="account_name">Account Name</Label>
                <Input
                  id="account_name"
                  value={formData.account_name}
                  onChange={(e) => handleInputChange('account_name', e.target.value)}
                />
              </div>
              
              {/* Account No */}
              <div className="space-y-1">
                <Label htmlFor="account_no">Account No</Label>
                <Input
                  id="account_no"
                  value={formData.account_no}
                  onChange={(e) => handleInputChange('account_no', e.target.value)}
                />
              </div>

              {/* Passport Upload */}
              <div className="space-y-1">
                <Label htmlFor="passport_upload">Passport Upload</Label>
                <Input 
                  id="passport_upload"
                  type="file"
                  accept="image/*"
                />
                <p className="text-xs text-muted-foreground mt-1">Uploaded Passport Name: {profile?.profile_photo_url || 'No file chosen'}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Submit Button */}
        <div className="flex space-x-2">
          <Button type="submit" disabled={isSaving}>
            {isSaving ? "Updating Records..." : "Update Records"}
          </Button>
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
        </div>
      </div>
    </form>
  );
}

// Main component with authorization
export default function ViewUpdateDetailsPage() {
  return (
    <AuthorizationGuard allowedRoles={['Member', 'SuperAdmin']}>
      <div className="space-y-6 p-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">View/Update Details</h2>
          <p className="text-muted-foreground">
            View and update your personal information, next of kin, and bank details.
          </p>
        </div>
        <Separator />
        <ViewUpdateDetailsContent />
      </div>
    </AuthorizationGuard>
  );
} 