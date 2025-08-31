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
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Database Status Bar */}
      <div className="border-b border-border/40 bg-background/95 backdrop-blur">
        <div className="container mx-auto px-4 py-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">System Status:</span>
              {dbStatus.connected ? (
                <Badge variant="default" className="bg-green-100 text-green-800 border-green-200">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Connected
                </Badge>
              ) : (
                <Badge variant="destructive" className="bg-red-100 text-red-800 border-red-200">
                  <XCircle className="w-3 h-3 mr-1" />
                  Connection Failed
                </Badge>
              )}
            </div>
            {dbStatus.error && (
              <span className="text-xs text-muted-foreground truncate max-w-md">
                Error: {dbStatus.error}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center space-y-6 mb-16">
          <div className="mx-auto w-20 h-20 bg-primary rounded-full flex items-center justify-center mb-6">
            <div className="text-3xl font-bold text-primary-foreground">C</div>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-foreground tracking-tight">
            Corporate Cooperative
            <span className="text-primary block mt-2">Management System</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Streamline your cooperative operations with our comprehensive platform for managing 
            contributions, loans, and member activities.
          </p>
          <div className="flex gap-4 justify-center mt-8">
            <Link href="/login">
              <Button size="lg" className="px-8">
                Login to Your Account
              </Button>
            </Link>
            <Link href="/register">
              <Button variant="outline" size="lg" className="px-8">
                Register as Member
              </Button>
            </Link>
          </div>
        </div>

        {/* Features Section */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          <Card className="border-border/40 hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <CardTitle>Member Management</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Comprehensive member registration, profile management, and status tracking.
              </p>
            </CardContent>
          </Card>

          <Card className="border-border/40 hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <PiggyBank className="w-6 h-6 text-primary" />
              </div>
              <CardTitle>Contribution Tracking</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Monitor monthly contributions, savings balance, and financial growth over time.
              </p>
            </CardContent>
          </Card>

          <Card className="border-border/40 hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <HandCoins className="w-6 h-6 text-primary" />
              </div>
              <CardTitle>Loan Management</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Apply for loans, track repayments, and manage loan approvals seamlessly.
              </p>
            </CardContent>
          </Card>

          <Card className="border-border/40 hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <Shield className="w-6 h-6 text-primary" />
              </div>
              <CardTitle>Secure Platform</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Advanced security features with role-based access and data protection.
              </p>
            </CardContent>
          </Card>

          <Card className="border-border/40 hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <TrendingUp className="w-6 h-6 text-primary" />
              </div>
              <CardTitle>Analytics & Reports</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Detailed financial reports and analytics for informed decision making.
              </p>
            </CardContent>
          </Card>

          <Card className="border-border/40 hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <Clock className="w-6 h-6 text-primary" />
              </div>
              <CardTitle>Real-time Updates</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Stay updated with real-time notifications and instant status changes.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* CTA Section */}
        <div className="bg-primary/5 rounded-2xl p-8 text-center">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            Join our cooperative management platform and streamline your financial operations today.
          </p>
          <Link href="/register">
            <Button size="lg" className="px-8">
              Create Your Account
            </Button>
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-border/40 py-8">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>© 2024 Corporate Cooperative Management System. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
