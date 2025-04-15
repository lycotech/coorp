'use client';

import React from 'react'; // Keep React import
// Removed unused imports: useState, useEffect, Card, CardContent, CardHeader, CardTitle,
// Input, Button, Progress, Wallet, ShoppingCart, Users, UserCheck

import AdminDashboard from '@/components/dashboard/AdminDashboard';
import MemberDashboard from '@/components/dashboard/MemberDashboard';

// Import the hook we will create
import { useCurrentUserType } from '@/hooks/useCurrentUserType';

export default function DashboardPage() {
  const { userType, isLoading, error } = useCurrentUserType();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div className="text-red-500">Error loading user information: {error}</div>;
  }

  // Conditionally render based on userType
  if (userType === 'Member') {
    return <MemberDashboard />;
  } else if (userType === 'SuperAdmin') {
    return <AdminDashboard />;
  } else {
     // Handle cases where userType is null (not logged in, invalid token) or unexpected value
     console.warn(`DashboardPage: Unexpected userType '${userType}' or user not logged in.`);
     return <div>Access Denied. Please log in or contact support.</div>;
  }
} 