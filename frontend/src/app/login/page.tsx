"use client";

import { useState, useEffect, Suspense } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useLoginMutation, isErrorWithData } from "@/lib/redux/services/auth";
import type { LoginCredentials } from "@/lib/redux/services/auth";
import Link from "next/link";
import { jwtDecode } from "jwt-decode";

interface JwtPayload {
  sub: string;
  id: number;
  name: string;
  phone: string;
  role: string;
  exp: number;
}

/**
 * Login form content component
 */
function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const registered = searchParams.get("registered");
  const [login, { isLoading, error }] = useLoginMutation();

  const [credentials, setCredentials] = useState<LoginCredentials & {
    rememberMe: boolean;
  }>({
    email: "",
    password: "",
    rememberMe: false,
  });

  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    if (registered === "success") {
      setSuccessMessage("Đăng ký thành công! Vui lòng đăng nhập.");
    }
  }, [registered]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const { name, value, type, checked } = e.target;
    setCredentials({
      ...credentials,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();

    try {
      const result = await login({
        email: credentials.email,
        password: credentials.password,
      }).unwrap();

      console.log("Login response:", result);

      if (!result || !result.token) {
        throw new Error("Invalid login response - missing token");
      }

      // ✅ Decode JWT to get user info
      const decoded = jwtDecode<JwtPayload>(result.token);
      console.log("Decoded JWT:", decoded);

      // Save token
      localStorage.setItem("authToken", result.token);

      // ✅ Save user info (from JWT)
      localStorage.setItem("user", JSON.stringify({
        id: decoded.id,
        email: decoded.sub,
        name: decoded.name,
        phone: decoded.phone,
        role: decoded.role,
      }));

      console.log("Login successful, redirecting...");

      // Redirect based on role (replace to prevent navigation history issues)
      if (decoded.role === "VENDOR") {
        router.replace("/vendor/dashboard");
      } else if (decoded.role === "ADMIN" || decoded.role === "ROLE_ADMIN") { // Thêm dòng này
        router.replace("/admin");
      } else {
        router.replace("/customer/dashboard");
      }
    } catch (err: unknown) {
      console.error("Đăng nhập thất bại:", err);

      if (err && typeof err === "object" && "status" in err) {
        const error = err as { status?: string; data?: { message?: string } };

        if (error.status === "FETCH_ERROR") {
          alert(
            "❌ Không thể kết nối đến server!\n\n" +
              "✅ Kiểm tra:\n" +
                  "1. Backend đang chạy? (port 8080)\n" +
                  "2. File .env.local có NEXT_PUBLIC_API_BASE_URL=http://localhost:8080?\n" +
              "3. CORS đã cấu hình?"
          );
        } else if (error.data?.message) {
          alert("Đăng nhập thất bại: " + error.data.message);
        }
      }
    }
  };

  const getErrorMessage = (): string | null => {
    if (!error) return null;

    if (isErrorWithData(error)) {
      return error.data.message || "Email hoặc mật khẩu không hợp lệ";
    }

    if ("error" in error) {
      return String(error.error);
    }

    return "Đăng nhập thất bại. Vui lòng thử lại.";
  };

  return (
    <div className="auth-bg min-h-screen flex flex-col justify-center items-center px-4 pb-12 pt-16">
      <div className="w-full max-w-md">
        {/* Logo and header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center drop-shadow-lg gap-3 mb-6">
            <Image
              src={process.env.NEXT_PUBLIC_LOGO_WAYO || "/favicon.svg"}
              alt="Logo"
              width={32}
              height={32}
              className="rounded-md"
            />
            <span className="font-semibold text-xl">Charging Station</span>
          </Link>
          <h1 className="text-2xl font-bold mb-2">Đăng nhập vào tài khoản</h1>
          <p className="text-gray-600">
            Chào mừng trở lại! Vui lòng nhập thông tin của bạn.
          </p>
        </div>

        {/* Login form */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <form className="space-y-4" onSubmit={handleSubmit}>
            {/* Success message */}
            {successMessage && (
              <div className="p-3 bg-green-50 text-green-700 rounded-lg border border-green-100 text-sm">
                {successMessage}
              </div>
            )}

            {/* Error message */}
            {error && (
              <div className="p-3 bg-red-50 text-red-700 rounded-lg border border-red-100 text-sm">
                {getErrorMessage()}
              </div>
            )}

            {/* Email field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="example@email.com"
                value={credentials.email}
                onChange={handleChange}
              />
            </div>

            {/* Password field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Mật khẩu
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="••••••••"
                value={credentials.password}
                onChange={handleChange}
              />
            </div>

            {/* Remember me + Forgot password */}
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="rememberMe"
                  name="rememberMe"
                  type="checkbox"
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-600"
                  checked={credentials.rememberMe}
                  onChange={handleChange}
                />
                <label htmlFor="rememberMe" className="ml-2 block text-sm text-gray-700">
                  Ghi nhớ tôi
                </label>
              </div>
              <Link href="/forgot-password" className="text-sm text-blue-600 hover:text-blue-800 underline">
                Quên mật khẩu?
              </Link>
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 px-4 bg-blue-600 text-white font-medium rounded-lg shadow-sm hover:bg-blue-700 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Đang đăng nhập...
                </span>
              ) : (
                "Đăng nhập"
              )}
            </button>
          </form>
        </div>

        {/* Register link */}
        <div className="text-center mt-6">
          <p className="text-sm text-gray-600">
            Chưa có tài khoản?{" "}
            <Link href="/register" className="text-blue-600 hover:text-blue-800 font-medium underline">
              Đăng ký ngay
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

/**
 * Login page component with Suspense boundary
 */
export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}
