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
    <header className="flex h-16 items-center gap-4 px-6 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      {/* Page title or breadcrumbs could go here */}
      <div className="flex items-center gap-2">
        <div className="text-sm font-medium text-muted-foreground">Dashboard</div>
      </div>
      
      {/* Header actions */}
      <div className="ml-auto flex items-center gap-3">
        {/* Theme Toggle with improved styling */}
        <ThemeToggle />
        
        {/* User menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-9 w-9 rounded-full border border-border/50 hover:border-border">
              <Avatar className="h-8 w-8">
                {user.imageUrl && <AvatarImage src={user.imageUrl} alt={user.name} />}
                <AvatarFallback className="bg-primary/10 text-primary text-xs font-medium">{user.initials}</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{user.name}</p>
                <p className="text-xs leading-none text-muted-foreground">
                  Corporate Member
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="cursor-pointer">
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-destructive hover:text-destructive">
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
} 