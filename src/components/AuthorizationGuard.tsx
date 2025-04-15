'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { toast } from 'sonner'; // Use sonner for notifications

interface AuthorizationGuardProps {
  allowedRoles: string[];
  children: React.ReactNode;
}

export function AuthorizationGuard({ allowedRoles, children }: AuthorizationGuardProps) {
  const { user, isLoading } = useCurrentUser();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        // Not logged in, redirect to login (replace avoids history entry)
        router.replace('/login');
      } else if (!allowedRoles.includes(user.type)) {
        // Logged in but not authorized
        toast.error("Access Denied", { description: "You do not have permission to view this page." });
        router.replace('/dashboard'); // Redirect to a safe page
      }
    }
  }, [user, isLoading, router, allowedRoles]);

  // Render loading state or null while checking/redirecting
  if (isLoading || !user || !allowedRoles.includes(user.type)) {
    // Render a loading indicator or null
    // You might want a more sophisticated skeleton loader here
    return <div className="p-4">Loading or checking authorization...</div>;
  }

  // Render children only if authorized
  return <>{children}</>;
} 