"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

/**
 * Get dashboard route based on role
 */
function getDashboardRoute(role: string): string {
  const normalizedRole = role.toUpperCase().replace("ROLE_", "");
  
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
 * Get user info from localStorage
 */
function getUserInfo() {
  if (typeof window === "undefined") return null;
  
  try {
    const token = localStorage.getItem("authToken");
    const userStr = localStorage.getItem("user");
    
    if (!token || !userStr) return null;
    
    const user = JSON.parse(userStr);
    return { user, token };
  } catch (error) {
    console.error("Error reading user info:", error);
    return null;
  }
}

/**
 * Client-side Auth Guard Component
 * Handles automatic redirects based on authentication state
 */
export default function ClientAuthGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    // Only run on client side
    if (typeof window === "undefined") return;

    const authInfo = getUserInfo();
    
    // Define public pages (no auth required)
    const publicPages = [
      "/",
      "/login",
      "/register",
      "/forgot-password",
      "/reset-password",
      "/map",
      "/add-instance",
    ];
    
    const isPublicPage = publicPages.some(page => 
      pathname === page || pathname.startsWith(page + "?")
    );

    console.log("🔐 AuthGuard check:", {
      pathname,
      hasAuth: !!authInfo,
      isPublicPage,
      role: authInfo?.user?.role
    });

    // ✅ CRITICAL: If user is logged in and on login/register page
    if (authInfo && (pathname === "/login" || pathname === "/register")) {
      const dashboardRoute = getDashboardRoute(authInfo.user.role);
      console.log("✅ User already logged in, redirecting to:", dashboardRoute);
      
      // Use window.location for guaranteed redirect
      window.location.href = dashboardRoute;
      return;
    }

    // ✅ If user is logged in and on home page "/"
    if (authInfo && pathname === "/") {
      const dashboardRoute = getDashboardRoute(authInfo.user.role);
      console.log("✅ User on home page, redirecting to:", dashboardRoute);
      
      window.location.href = dashboardRoute;
      return;
    }

    // ✅ If user is not logged in and tries to access protected pages
    const protectedPrefixes = ["/admin", "/vendor", "/customer"];
    const isProtectedPage = protectedPrefixes.some(prefix => 
      pathname.startsWith(prefix)
    );

    if (!authInfo && isProtectedPage) {
      console.log("❌ User not logged in, redirecting to login");
      router.replace("/login");
      return;
    }

    // ✅ If user is logged in but on wrong dashboard
    if (authInfo && isProtectedPage) {
      const currentRole = authInfo.user.role.toUpperCase().replace("ROLE_", "");
      
      // Check if user is on correct dashboard
      if (currentRole === "ADMIN" && !pathname.startsWith("/admin")) {
        console.log("⚠️ Admin user on wrong page, redirecting to /admin");
        window.location.href = "/admin";
      } else if (currentRole === "VENDOR" && !pathname.startsWith("/vendor")) {
        console.log("⚠️ Vendor user on wrong page, redirecting to /vendor/dashboard");
        window.location.href = "/vendor/dashboard";
      } else if (currentRole === "CUSTOMER" && !pathname.startsWith("/customer")) {
        console.log("⚠️ Customer user on wrong page, redirecting to /customer/dashboard");
        window.location.href = "/customer/dashboard";
      }
    }
  }, [pathname, router]);

  return <>{children}</>;
}
