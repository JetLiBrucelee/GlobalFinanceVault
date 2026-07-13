import { useQuery } from "@tanstack/react-query";
import type { User } from "@shared/schema";

// The /api/auth/user response includes a session-only flag indicating whether
// the current login has cleared the admin-issued access code gate.
export type AuthUser = User & { accessCodeVerified?: boolean };

export function useAuth() {
  const { data: user, isLoading } = useQuery<AuthUser>({
    queryKey: ["/api/auth/user"],
    retry: false,
  });

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
  };
}
