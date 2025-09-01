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
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-blue-50 to-purple-100 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 right-20 w-80 h-80 bg-gradient-to-r from-emerald-400/20 to-blue-400/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-10 left-20 w-96 h-96 bg-gradient-to-r from-purple-400/20 to-pink-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="w-full max-w-lg space-y-8 relative z-10">
        {/* Logo/Branding Section - Enhanced */}
        <div className="text-center space-y-4">
          <div className="mx-auto w-20 h-20 bg-gradient-to-br from-emerald-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-2xl transform hover:scale-110 transition-all duration-300">
            <div className="text-3xl font-bold text-white">🌟</div>
          </div>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent">
              Join Our Cooperative! 
            </h1>
            <p className="text-gray-600 text-base font-medium mt-2">🚀 Create your account to get started</p>
          </div>
        </div>

        {/* Register Card - Completely Redesigned */}
        <Card className="border-0 shadow-2xl bg-white/90 backdrop-blur-md">
          <form onSubmit={handleSubmit}>
            <CardHeader className="space-y-2 pb-8 text-center">
              <CardTitle className="text-2xl font-bold text-gray-900">✨ Create Your Account</CardTitle>
              <CardDescription className="text-gray-600 text-base">
                Fill in your details to join our amazing cooperative community
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 px-8">
              <div className="space-y-3">
                <Label htmlFor="staff-no" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  🆔 Staff Number
                </Label>
                <Input
                  id="staff-no"
                  placeholder="Enter your staff number (e.g. 12345)"
                  value={staffNo}
                  onChange={(e) => setStaffNo(e.target.value)}
                  className="border-2 border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 rounded-xl h-12 px-4 transition-all duration-200 bg-white/80"
                  required
                />
              </div>
              <div className="space-y-3">
                <Label htmlFor="email" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  📧 Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="member@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-xl h-12 px-4 transition-all duration-200 bg-white/80"
                  required
                />
              </div>
              <div className="space-y-3">
                <Label htmlFor="password" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  🔒 Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Create a strong password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="border-2 border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 rounded-xl h-12 px-4 transition-all duration-200 bg-white/80"
                  required
                />
              </div>
              <div className="space-y-3">
                <Label htmlFor="confirm-password" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  ✅ Confirm Password
                </Label>
                <Input
                  id="confirm-password"
                  type="password"
                  placeholder="Confirm your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="border-2 border-gray-200 focus:border-pink-500 focus:ring-2 focus:ring-pink-200 rounded-xl h-12 px-4 transition-all duration-200 bg-white/80"
                  required
                />
              </div>
              {error && (
                <div className="p-4 text-sm text-red-700 bg-gradient-to-r from-red-50 to-pink-50 border-2 border-red-200 rounded-xl shadow-sm">
                  ❌ {error}
                </div>
              )}
              {success && (
                <div className="p-4 text-sm text-emerald-700 bg-gradient-to-r from-emerald-50 to-green-50 border-2 border-emerald-200 rounded-xl shadow-sm">
                  🎉 {success}
                </div>
              )}
            </CardContent>
            <CardFooter className="flex flex-col space-y-6 pt-8 px-8">
              <Button 
                type="submit" 
                className="w-full h-12 bg-gradient-to-r from-emerald-500 to-blue-600 hover:from-emerald-600 hover:to-blue-700 text-white shadow-xl transform hover:scale-105 transition-all duration-200 border-0 rounded-xl text-base font-semibold" 
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Creating your account...
                  </div>
                ) : (
                  '🎯 Create My Account'
                )}
              </Button>
              <div className="text-center p-4 bg-gradient-to-r from-emerald-50 to-blue-50 rounded-xl">
                <p className="text-sm text-gray-600">
                  Already have an account?{" "}
                  <Link href="/login" className="text-emerald-600 hover:text-blue-600 underline font-semibold transition-colors">
                    🔑 Sign in here
                  </Link>
                </p>
              </div>
            </CardFooter>
          </form>
        </Card>

        {/* Footer - Enhanced */}
        <div className="text-center text-sm text-gray-600 font-medium">
          © 2025 Corporate Cooperative Management System 💚
        </div>
      </div>
    </div>
  );
} 