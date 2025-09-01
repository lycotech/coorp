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

export default function LoginPage() {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleIdentifierChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIdentifier(e.target.value);
    if (error) setError(null);
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    if (error) setError(null);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }

      console.log('Login successful:', data);
      // TODO: Implement proper session management (e.g., store token)
      router.push('/dashboard'); // Redirect to dashboard on success

    } catch (err) {
      console.error(err);
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-100 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-gradient-to-r from-purple-400/20 to-pink-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>
      
      <div className="w-full max-w-md space-y-8 relative z-10">
        {/* Logo/Branding Section - Enhanced */}
        <div className="text-center space-y-4">
          <div className="mx-auto w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-2xl transform hover:scale-110 transition-all duration-300">
            <div className="text-3xl font-bold text-white">🏢</div>
          </div>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Corporate Cooperative
            </h1>
            <p className="text-gray-600 text-base font-medium mt-2">✨ Sign in to your account</p>
          </div>
        </div>

        {/* Login Card - Completely Redesigned */}
        <Card className="border-0 shadow-2xl bg-white/90 backdrop-blur-md">
          <form onSubmit={handleSubmit}>
            <CardHeader className="space-y-2 pb-8 text-center">
              <CardTitle className="text-2xl font-bold text-gray-900">👋 Welcome Back!</CardTitle>
              <CardDescription className="text-gray-600 text-base">
                Enter your credentials to access your dashboard
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 px-8">
              <div className="space-y-3">
                <Label htmlFor="identifier" className="text-sm font-semibold text-gray-700">
                  📋 Staff No / Email
                </Label>
                <Input
                  id="identifier"
                  type="text"
                  placeholder="M001 or member@company.com"
                  value={identifier}
                  onChange={handleIdentifierChange}
                  className="border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-xl h-12 px-4 transition-all duration-200 bg-white/80"
                  required
                />
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-sm font-semibold text-gray-700">
                    🔒 Password
                  </Label>
                  <Link 
                    href="/forgot-password" 
                    className="text-sm text-blue-600 hover:text-purple-600 underline font-medium transition-colors"
                  >
                    Forgot password?
                  </Link>
                </div>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={handlePasswordChange}
                  className="border-2 border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 rounded-xl h-12 px-4 transition-all duration-200 bg-white/80"
                  required
                />
              </div>
              {error && (
                <div className="p-4 text-sm text-red-700 bg-gradient-to-r from-red-50 to-pink-50 border-2 border-red-200 rounded-xl shadow-sm">
                  ⚠️ {error}
                </div>
              )}
            </CardContent>
            <CardFooter className="flex flex-col space-y-6 pt-8 px-8">
              <Button 
                type="submit" 
                className="w-full h-12 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-xl transform hover:scale-105 transition-all duration-200 border-0 rounded-xl text-base font-semibold" 
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Signing you in...
                  </div>
                ) : (
                  '🚀 Sign In'
                )}
              </Button>
              <div className="text-center p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl">
                <p className="text-sm text-gray-600">
                  Don&apos;t have an account?{" "}
                  <Link href="/register" className="text-blue-600 hover:text-purple-600 underline font-semibold transition-colors">
                    ✨ Sign up here
                  </Link>
                </p>
              </div>
            </CardFooter>
          </form>
        </Card>

        {/* Footer - Enhanced */}
        <div className="text-center text-sm text-gray-600 font-medium">
          © 2025 Corporate Cooperative Management System 💜
        </div>
      </div>
    </div>
  );
} 