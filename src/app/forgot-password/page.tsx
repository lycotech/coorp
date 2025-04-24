'use client';

import { useState } from 'react';
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
import { toast } from "sonner";

export default function ForgotPasswordPage() {
  const [identifier, setIdentifier] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);
    setMessage(null);

    try {
      const response = await fetch('/api/auth/request-password-reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Even on errors like 404 (user not found), show a generic message
        // to avoid revealing if an email/identifier is registered.
        // Only reveal specific errors for server issues (500).
        if (response.status >= 500) {
           throw new Error(data.error || 'Failed to process request due to a server error.');
        } else {
             // For 4xx errors (like user not found), still show the generic success message.
             setMessage('If an account with that email or staff number exists, a password reset link has been sent.');
             console.log("Potential user not found or other client error, but showing generic message.", data.error);
        }
      } else {
         setMessage('If an account with that email or staff number exists, a password reset link has been sent.');
      }

    } catch (err) {
      console.error("Request password reset error:", err);
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(errorMessage);
      toast.error("Error", { description: errorMessage }); // Show toast on actual error
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <Card className="w-full max-w-sm">
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle className="text-2xl">Forgot Password</CardTitle>
            <CardDescription>
              Enter your email address or staff number and we will send you a link to reset your password.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="identifier">Email / Staff Number</Label>
              <Input
                id="identifier"
                type="text"
                placeholder="m@example.com or M001"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            {message && <p className="text-sm text-green-600">{message}</p>}
            {error && <p className="text-sm text-red-500">{error}</p>}
          </CardContent>
          <CardFooter className="flex flex-col items-start gap-4">
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Sending...' : 'Send Reset Link'}
            </Button>
             <div className="text-center text-sm w-full">
                Remembered your password?{" "}
                <Link href="/login" className="underline">
                    Sign in
                </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
} 