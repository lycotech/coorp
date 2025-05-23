import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import React from "react";
import { cookies } from 'next/headers'; // Import cookies
import { jwtVerify } from 'jose'; // Import jose

// Interface for the expected JWT payload (align with login route and middleware)
/* Remove unused interface
interface DecodedToken {
  userId: number;
  staffNo: string;
  email: string;
  type: string; // User role (login_type)
  iat: number;
  exp: number;
}
*/

// Helper function to get user type from cookie
async function getUserType(): Promise<string | null> {
  try {
    // Await the cookie store as indicated by linter errors
    const cookieStore = await cookies();
    const token = cookieStore.get('sessionToken')?.value;
    const jwtSecret = process.env.JWT_SECRET;

    if (token && jwtSecret) {
        // const decoded = jwt.verify(token, jwtSecret) as DecodedToken;
        // Use jose for verification
        const secret = new TextEncoder().encode(jwtSecret);
        const { payload } = await jwtVerify(token, secret);

        // Ensure the payload matches the expected structure if needed,
        // otherwise, directly access the type property.
        // We assume the payload structure matches what jose returns,
        // which includes the properties we added during signing.
        // const userType = (payload as DecodedToken).type;
        // Access payload properties directly (ensure they exist as expected)
        const userType = payload.type as string | undefined; // Access directly, cast to string

        if (userType) {
          return userType; // Return the user type
        } else {
          console.error("Layout: 'type' property missing in JWT payload.");
        }
    } else {
        if (!token) console.log("Layout: No session token found.");
        if (!jwtSecret) console.error("Layout: JWT_SECRET not set.");
    }
  } catch (error) {
      console.error("Layout: Error processing cookies or verifying token:", error);
      // Consider clearing cookie if verification fails consistently
      // Example (careful with modifying cookies in Server Components):
      // try { cookies().delete('sessionToken'); } catch (e) { console.error("Failed to delete cookie", e); }
  }
  return null;
}

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  const userType = await getUserType();
  console.log("Layout: User type retrieved:", userType);

  return (
    <div className="flex h-screen bg-background">
      {/* Pass userType to Sidebar */}
      <Sidebar userType={userType} />
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* You might want to pass user info to Header too */}
        <Header />
        <main className="flex-1 overflow-y-auto p-6">
          {/* Add a header here if needed */}
          {children}
        </main>
      </div>
    </div>
  );
} 