"use client";

import { createContext, useContext, ReactNode } from "react";
import useSWR from "swr";
import { Role } from "@/app/generated/prisma";

interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  profilePicture?: string;
  phone?: string;
  address?: string;
  bio?: string;
  chefProfile?: {
    specialties: string[];
    yearsOfExperience: number;
    portfolioImages: string[];
  };
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  error: Error | null;
  mutate: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const fetcher = async (url: string) => {
  try {
    const res = await fetch(url, { credentials: 'include' });

    if (res.status === 401) {
      return null; // Not logged in
    }

    if (!res.ok) {
      // Log the detailed error response
      const errorBody = await res.text();
      console.error(`Failed to fetch user data. Status: ${res.status}, Body: ${errorBody}`);
      throw new Error(`Failed to fetch user data. Status: ${res.status}`);
    }

    return res.json();
  } catch (error) {
    console.error("Fetcher error:", error);
    throw error; // Re-throw the error for SWR to catch
  }
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const { data: user, error, isLoading, mutate } = useSWR<User | null>("/api/auth/me", fetcher);

  return (
    <AuthContext.Provider value={{ user: user || null, error, isLoading, mutate }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

