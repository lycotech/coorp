import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getDbPool } from "@/lib/db"; // Import DB pool function
import mysql from 'mysql2/promise'; // Import mysql types
import { 
  Users, 
  PiggyBank, 
  HandCoins, 
  Shield, 
  TrendingUp, 
  Clock,
  CheckCircle,
  XCircle
} from "lucide-react";

// Function to test DB connection
async function checkDbConnection(): Promise<{ connected: boolean; error: string | null }> {
  let connection: mysql.PoolConnection | null = null;
  try {
    console.log("Checking DB connection...");
    const pool = getDbPool();
    if (!pool) {
      return { connected: false, error: "Database pool not initialized - check environment variables" };
    }
    connection = await pool.getConnection();
    // Simple query to test connection
    await connection.query('SELECT 1');
    console.log("DB Connection Successful!");
    return { connected: true, error: null };
  } catch (error) {
    console.error("DB Connection Failed:", error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    return { connected: false, error: errorMessage };
  } finally {
    if (connection) {
      try {
        connection.release();
        console.log("DB Connection released.");
      } catch (releaseError) {
        console.error("DB Release Error:", releaseError);
      }
    }
  }
}

// Make the component async to perform server-side actions
export default async function Home() {

  // Check DB connection status on the server when the page loads
  const dbStatus = await checkDbConnection();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-100 relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-gradient-to-r from-purple-400/20 to-pink-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-emerald-400/10 to-blue-400/10 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      {/* Database Status Bar - Enhanced */}
      <div className="border-b border-white/20 bg-white/80 backdrop-blur-md shadow-sm relative z-10">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-gray-700">System Status:</span>
              {dbStatus.connected ? (
                <Badge className="bg-gradient-to-r from-emerald-500 to-green-500 text-white border-0 shadow-sm">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  ✨ Online & Ready
                </Badge>
              ) : (
                <Badge className="bg-gradient-to-r from-red-500 to-pink-500 text-white border-0 shadow-sm">
                  <XCircle className="w-3 h-3 mr-1" />
                  Connection Issue
                </Badge>
              )}
            </div>
            {dbStatus.error && (
              <span className="text-xs text-gray-600 truncate max-w-md bg-white/50 px-3 py-1 rounded-full">
                ⚠️ {dbStatus.error}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-20 relative z-10">
        {/* Hero Section - Dramatically Enhanced */}
        <div className="text-center space-y-8 mb-20">
          <div className="mx-auto w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mb-8 shadow-2xl transform hover:scale-110 transition-all duration-300">
            <div className="text-4xl font-bold text-white">💼</div>
          </div>
          <div className="space-y-4">
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight">
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                Corporate Cooperative
              </span>
              <span className="block text-4xl md:text-6xl mt-4 bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent">
                Management System ✨
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              🚀 Streamline your cooperative operations with our comprehensive platform for managing 
              contributions, loans, and member activities with style and efficiency!
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-6 justify-center mt-12">
            <Link href="/login">
              <Button size="lg" className="px-10 py-4 text-lg bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 shadow-xl transform hover:scale-105 transition-all duration-200 border-0">
                🔐 Login to Your Account
              </Button>
            </Link>
            <Link href="/register">
              <Button variant="outline" size="lg" className="px-10 py-4 text-lg border-2 border-purple-200 bg-white/80 hover:bg-gradient-to-r hover:from-purple-50 hover:to-blue-50 shadow-lg transform hover:scale-105 transition-all duration-200 text-purple-700 hover:text-purple-800">
                ✨ Register as Member
              </Button>
            </Link>
          </div>
        </div>

        {/* Features Section - Completely Redesigned */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
          <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-blue-50 hover:shadow-2xl transform hover:scale-105 transition-all duration-300 group">
            <CardHeader className="pb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:shadow-xl transition-shadow">
                <Users className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-xl font-bold text-gray-900">👥 Member Management</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 leading-relaxed">
                Comprehensive member registration, profile management, and status tracking with intuitive dashboards.
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-emerald-50 hover:shadow-2xl transform hover:scale-105 transition-all duration-300 group">
            <CardHeader className="pb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:shadow-xl transition-shadow">
                <PiggyBank className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-xl font-bold text-gray-900">💰 Contribution Tracking</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 leading-relaxed">
                Monitor monthly contributions, savings balance, and financial growth with beautiful analytics.
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-purple-50 hover:shadow-2xl transform hover:scale-105 transition-all duration-300 group">
            <CardHeader className="pb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:shadow-xl transition-shadow">
                <HandCoins className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-xl font-bold text-gray-900">🏦 Loan Management</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 leading-relaxed">
                Apply for loans, track repayments, and manage approvals with streamlined workflows.
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-orange-50 hover:shadow-2xl transform hover:scale-105 transition-all duration-300 group">
            <CardHeader className="pb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:shadow-xl transition-shadow">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-xl font-bold text-gray-900">🛡️ Secure Platform</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 leading-relaxed">
                Advanced security features with role-based access and enterprise-grade data protection.
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-cyan-50 hover:shadow-2xl transform hover:scale-105 transition-all duration-300 group">
            <CardHeader className="pb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:shadow-xl transition-shadow">
                <TrendingUp className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-xl font-bold text-gray-900">📈 Analytics & Reports</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 leading-relaxed">
                Detailed financial reports and interactive analytics for data-driven decision making.
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-indigo-50 hover:shadow-2xl transform hover:scale-105 transition-all duration-300 group">
            <CardHeader className="pb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:shadow-xl transition-shadow">
                <Clock className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-xl font-bold text-gray-900">⚡ Real-time Updates</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 leading-relaxed">
                Stay updated with instant notifications, live status changes, and real-time synchronization.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* CTA Section - Enhanced */}
        <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl p-12 text-center shadow-2xl relative overflow-hidden">
          <div className="absolute inset-0 bg-white/10 backdrop-blur-sm rounded-3xl"></div>
          <div className="relative z-10">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              🚀 Ready to Transform Your Cooperative?
            </h2>
            <p className="text-blue-100 text-xl mb-8 max-w-2xl mx-auto leading-relaxed">
              Join thousands of cooperatives already using our platform to streamline their operations and empower their members!
            </p>
            <Link href="/register">
              <Button size="lg" className="px-12 py-4 text-lg bg-white text-purple-600 hover:bg-gray-50 shadow-xl transform hover:scale-105 transition-all duration-200 font-bold">
                ✨ Create Your Account Now
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Footer - Enhanced */}
      <footer className="border-t border-white/20 bg-white/80 backdrop-blur-md py-8 relative z-10">
        <div className="container mx-auto px-4 text-center">
          <p className="text-gray-600 font-medium">
            © 2025 Corporate Cooperative Management System. Made with 💜 for cooperatives worldwide.
          </p>
        </div>
      </footer>
    </div>
  );
}
