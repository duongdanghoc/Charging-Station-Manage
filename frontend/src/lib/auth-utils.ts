/**
 * Auth utility functions
 */

export interface UserInfo {
  id: number;
  email: string;
  name: string;
  phone: string;
  role: string;
}

/**
 * Get current user from localStorage
 */
export function getCurrentUser(): UserInfo | null {
  if (typeof window === "undefined") return null;
  
  try {
    const userStr = localStorage.getItem("user");
    if (!userStr) return null;
    
    return JSON.parse(userStr);
  } catch (error) {
    console.error("Error parsing user data:", error);
    return null;
  }
}

/**
 * Get auth token
 */
export function getAuthToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("authToken");
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated(): boolean {
  return !!(getAuthToken() && getCurrentUser());
}

/**
 * Check if user has specific role
 */
export function hasRole(role: string): boolean {
  const user = getCurrentUser();
  if (!user) return false;
  
  const userRole = user.role.toUpperCase().replace("ROLE_", "");
  const checkRole = role.toUpperCase().replace("ROLE_", "");
  
  return userRole === checkRole;
}

/**
 * Get dashboard route for user role
 */
export function getDashboardRoute(role?: string): string {
  const userRole = role || getCurrentUser()?.role;
  if (!userRole) return "/login";
  
  const normalizedRole = userRole.toUpperCase().replace("ROLE_", "");
  
  switch (normalizedRole) {
    case "ADMIN":
      return "/admin";
    case "VENDOR":
      return "/vendor/dashboard";
    case "CUSTOMER":
      return "/customer/dashboard";
    default:
      return "/customer/dashboard";
  }
}

/**
 * Logout user
 */
export function logout(): void {
  if (typeof window === "undefined") return;
  
  localStorage.removeItem("authToken");
  localStorage.removeItem("user");
  
  // Redirect to login
  window.location.href = "/login";
}
