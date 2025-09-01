'use client';

import { useState, useEffect } from 'react';
// import Cookies from 'js-cookie'; // No longer needed
// import { jwtDecode } from 'jwt-decode'; // No longer needed

// Interface matching the structure returned by /api/auth/me
interface UserData {
    userId: number;
    staffNo: string;
    email: string;
    type: string; // User role (login_type)
    phone?: string; // Optional phone number
}

export function useCurrentUser() {
    const [user, setUser] = useState<UserData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null); // Optional: Add error state

    useEffect(() => {
        const fetchUser = async () => {
            setIsLoading(true);
            setError(null);
            setUser(null); // Reset user state initially

            try {
                const response = await fetch('/api/auth/me');

                if (response.status === 401) {
                    // Unauthorized (handled by API, session likely invalid/expired)
                    console.log("useCurrentUser: Not logged in or session expired (401).");
                    // User remains null
                } else if (!response.ok) {
                    const errorData = await response.json().catch(() => ({ error: "Failed to parse error response" }));
                    throw new Error(errorData.error || 'Failed to fetch user data');
                } else {
                    // Successful fetch
                    const userData: UserData = await response.json();
                    setUser(userData);
                }
            } catch (err) {
                console.error("useCurrentUser hook error:", err);
                setError(err instanceof Error ? err.message : "An unknown error occurred");
                // User remains null
            } finally {
                setIsLoading(false);
            }
        };

        fetchUser();

    }, []); // Empty dependency array ensures this runs once on mount

    // Return error state as well if needed by consumers
    return { user, isLoading, error };
} 