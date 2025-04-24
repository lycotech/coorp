'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
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
import { toast } from "sonner";
import Link from 'next/link';

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isValidToken, setIsValidToken] = useState<boolean | null>(null); // Start as null to indicate loading/unknown

  // Optional: Verify token validity on load (basic check)
  useEffect(() => {
    if (!token) {
        setError("Invalid or missing reset token.");
        setIsValidToken(false);
    } else {
        // Basic check: Assume valid initially, let the API do the real check
        setIsValidToken(true);
        // You *could* add an API call here to pre-validate the token if desired,
        // but it might be redundant if the submit API does it anyway.
    }
  }, [token]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!token) {
        setError("Invalid or missing reset token.");
        return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (newPassword.length < 6) { // Basic password length check
        setError("Password must be at least 6 characters long.");
        return;
    }

    setIsLoading(true);
    setError(null);
    setMessage(null);

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword }),
      });

      const data = await response.json();

      if (!response.ok) {
         throw new Error(data.error || 'Failed to reset password');
      }

      setMessage("Password reset successfully! You can now log in with your new password.");
      toast.success("Password Reset Successful");
      setNewPassword('');
      setConfirmPassword('');
      // Optionally redirect after a delay
      setTimeout(() => router.push('/login'), 3000);

    } catch (err) {
      console.error("Reset password error:", err);
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(errorMessage);
      toast.error("Error", { description: errorMessage });
    } finally {
      setIsLoading(false);
    }
  };

  // Render different states based on token validity
  if (isValidToken === null) {
      return <div className="flex justify-center items-center min-h-screen"><div>Loading...</div></div>; // Or a spinner
  }

  if (isValidToken === false) {
      return (
          <div className="flex items-center justify-center min-h-screen bg-background">
            <Card className="w-full max-w-sm text-center">
              <CardHeader>
                  <CardTitle className="text-2xl text-red-600">Invalid Link</CardTitle>
                  <CardDescription>The password reset link is invalid or has expired.</CardDescription>
              </CardHeader>
              <CardFooter>
                   <Link href="/forgot-password" className="w-full">
                       <Button variant="outline" className="w-full">Request a new link</Button>
                   </Link>
              </CardFooter>
            </Card>
          </div>
      );
  }

  // Render form if token seems okay initially
  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <Card className="w-full max-w-sm">
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle className="text-2xl">Reset Password</CardTitle>
            <CardDescription>
              Enter your new password below.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="new-password">New Password</Label>
              <Input
                id="new-password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
             <div className="grid gap-2">
              <Label htmlFor="confirm-password">Confirm New Password</Label>
              <Input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            {message && <p className="text-sm text-green-600">{message}</p>}
            {error && <p className="text-sm text-red-500">{error}</p>}
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Resetting...' : 'Reset Password'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}

// Wrap the component in Suspense as it uses useSearchParams
export default function ResetPasswordPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <ResetPasswordForm />
        </Suspense>
    );
} 