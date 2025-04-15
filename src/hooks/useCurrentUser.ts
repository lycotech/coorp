'use client';

import { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import { jwtDecode } from 'jwt-decode'; // Use jwt-decode for client-side decoding

interface DecodedToken {
    userId: number;
    staffNo: string;
    email: string;
    type: string; // User role (login_type)
    iat: number;
    exp: number;
}

export function useCurrentUser() {
    const [user, setUser] = useState<DecodedToken | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const token = Cookies.get('sessionToken');
        if (token) {
            try {
                const decoded = jwtDecode<DecodedToken>(token);
                setUser(decoded);
            } catch (error) {
                console.error("Failed to decode token:", error);
                // Optionally clear the invalid cookie
                // Cookies.remove('sessionToken');
                setUser(null);
            }
        } else {
            setUser(null);
        }
        setIsLoading(false);
    }, []);

    return { user, isLoading };
} 