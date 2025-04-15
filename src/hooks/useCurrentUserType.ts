'use client';

import { useState, useEffect } from 'react';

interface UserData {
    userId: number;
    staffNo: string;
    email: string;
    type: string; // User role (login_type)
}

export function useCurrentUserType() {
    const [userType, setUserType] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchUserType = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const response = await fetch('/api/auth/me');

                if (response.status === 401) {
                    // Unauthorized (no token, invalid token, expired token)
                    setUserType(null);
                    // Optionally set an error message like "Session expired" if desired
                    // setError("Unauthorized or session expired");
                    console.log("useCurrentUserType: Unauthorized or session expired.");
                    return; // Exit early
                }

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || 'Failed to fetch user data');
                }

                const userData: UserData = await response.json();
                setUserType(userData.type);

            } catch (err) {
                console.error("useCurrentUserType hook error:", err);
                setError(err instanceof Error ? err.message : "An unknown error occurred");
                setUserType(null); // Ensure userType is null on error
            } finally {
                setIsLoading(false);
            }
        };

        fetchUserType();
    }, []); // Empty dependency array ensures this runs once on mount

    return { userType, isLoading, error };
} 