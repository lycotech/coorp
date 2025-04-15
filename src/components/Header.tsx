'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { LogOut, User } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";

// Placeholder for fetching user data - replace with actual logic
// e.g., fetch from context, zustand store, or server component prop
const useUser = () => {
  // In a real app, you would get this from the JWT payload decoded
  // in middleware or fetched based on the session.
  // For now, let's use a placeholder.
  return {
    name: "Admin User",
    initials: "AU", // Fallback initials
    imageUrl: undefined, // Or a URL string like "/path/to/avatar.jpg"
  };
};

export function Header() {
  const router = useRouter();
  const user = useUser();

  const handleLogout = async () => {
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Logout failed');
      }

      // Redirect to login page after successful logout
      router.push('/login');
      router.refresh(); // Refresh state after logout
    } catch (error) {
      console.error('Logout error:', error);
      // Handle logout error (e.g., show a toast message)
    }
  };

  return (
    <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-6 dark:bg-muted/20">
      {/* Optional: Add Search or other header elements here */}
      <div className="ml-auto flex items-center gap-4">
        {/* Add Theme Toggle */}
        <ThemeToggle />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-8 w-8 rounded-full">
              <Avatar className="h-8 w-8">
                {user.imageUrl && <AvatarImage src={user.imageUrl} alt={user.name} />}
                <AvatarFallback>{user.initials}</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
            </DropdownMenuItem>
            {/* Add other items like Settings here */}
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
} 