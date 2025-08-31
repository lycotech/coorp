'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";

export default function RegisterPage() {
  const [staffNo, setStaffNo] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ staff_no: staffNo, email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      console.log('Registration successful:', data);
      setSuccess('Registration successful! Redirecting to login...');
      // Redirect to login page after a short delay
      setTimeout(() => {
        router.push('/login');
      }, 2000);

    } catch (err) {
      console.error(err);
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Logo/Branding Section */}
        <div className="text-center space-y-2">
          <div className="mx-auto w-16 h-16 bg-primary rounded-full flex items-center justify-center">
            <div className="text-2xl font-bold text-primary-foreground">C</div>
          </div>
          <h1 className="text-2xl font-bold text-foreground">Join Our Cooperative</h1>
          <p className="text-muted-foreground text-sm">Create your account to get started</p>
        </div>

        {/* Register Card */}
        <Card className="border-border/40 shadow-lg">
          <form onSubmit={handleSubmit}>
            <CardHeader className="space-y-1 pb-6">
              <CardTitle className="text-xl text-center">Create Account</CardTitle>
              <CardDescription className="text-center">
                Fill in your details to register as a member
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="staff-no" className="text-sm font-medium">Staff Number</Label>
                <Input
                  id="staff-no"
                  placeholder="Enter your staff number (e.g. 12345)"
                  value={staffNo}
                  onChange={(e) => setStaffNo(e.target.value)}
                  className="border-border/50 focus:border-primary"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="member@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="border-border/50 focus:border-primary"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Create a strong password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="border-border/50 focus:border-primary"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password" className="text-sm font-medium">Confirm Password</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  placeholder="Confirm your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="border-border/50 focus:border-primary"
                  required
                />
              </div>
              {error && (
                <div className="p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md">
                  {error}
                </div>
              )}
              {success && (
                <div className="p-3 text-sm text-green-700 bg-green-50 border border-green-200 rounded-md">
                  {success}
                </div>
              )}
            </CardContent>
            <CardFooter className="flex flex-col space-y-4 pt-6">
              <Button 
                type="submit" 
                className="w-full h-10 bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm" 
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin"></div>
                    Creating account...
                  </div>
                ) : (
                  'Create Account'
                )}
              </Button>
              <p className="text-center text-sm text-muted-foreground">
                Already have an account?{" "}
                <Link href="/login" className="text-primary hover:text-primary/80 underline font-medium">
                  Sign in here
                </Link>
              </p>
            </CardFooter>
          </form>
        </Card>

        {/* Footer */}
        <div className="text-center text-xs text-muted-foreground">
          © 2024 Corporate Cooperative Management System
        </div>
      </div>
    </div>
  );
} 