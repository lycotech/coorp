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
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-100 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-r from-indigo-400/20 to-purple-400/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-gradient-to-r from-purple-400/20 to-pink-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <Card className="w-full max-w-md border-0 shadow-2xl bg-white/90 backdrop-blur-md relative z-10">
        <form onSubmit={handleSubmit}>
          <CardHeader className="text-center space-y-4 pb-8">
            <div className="mx-auto w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-xl">
              <div className="text-2xl">🔑</div>
            </div>
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Forgot Password?
            </CardTitle>
            <CardDescription className="text-gray-600 text-base leading-relaxed">
              No worries! 💜 Enter your email or staff number and we'll send you a secure link to reset your password.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 px-8">
            <div className="space-y-3">
              <Label htmlFor="identifier" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                📧 Email / Staff Number
              </Label>
              <Input
                id="identifier"
                type="text"
                placeholder="m@example.com or M001"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                className="border-2 border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 rounded-xl h-12 px-4 transition-all duration-200 bg-white/80"
                required
                disabled={isLoading}
              />
            </div>
            {message && (
              <div className="p-4 text-sm text-emerald-700 bg-gradient-to-r from-emerald-50 to-green-50 border-2 border-emerald-200 rounded-xl shadow-sm">
                ✅ {message}
              </div>
            )}
            {error && (
              <div className="p-4 text-sm text-red-700 bg-gradient-to-r from-red-50 to-pink-50 border-2 border-red-200 rounded-xl shadow-sm">
                ❌ {error}
              </div>
            )}
          </CardContent>
          <CardFooter className="flex flex-col space-y-6 pt-8 px-8">
            <Button 
              type="submit" 
              className="w-full h-12 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white shadow-xl transform hover:scale-105 transition-all duration-200 border-0 rounded-xl text-base font-semibold" 
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Sending reset link...
                </div>
              ) : (
                '🚀 Send Reset Link'
              )}
            </Button>
            <div className="text-center p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl w-full">
              <p className="text-sm text-gray-600">
                Remembered your password?{" "}
                <Link href="/login" className="text-indigo-600 hover:text-purple-600 underline font-semibold transition-colors">
                  🔓 Sign in here
                </Link>
              </p>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
} 