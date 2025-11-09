"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Link from "next/link";

/**
 * Reset Password page component
 * This page is accessed via the reset password email link
 */
export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [passwordError, setPasswordError] = useState("");

  // Khi nhập mật khẩu mới
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    setPasswordError("");
  };

  // Khi nhập xác nhận mật khẩu
  const handleConfirmPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setConfirmPassword(e.target.value);
    setPasswordError("");
  };

  // Gửi form đặt lại mật khẩu
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setPasswordError("Mật khẩu không khớp.");
      return;
    }

    if (password.length < 8) {
      setPasswordError("Mật khẩu phải có ít nhất 8 ký tự.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const API_HOST = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3001";
      const res = await fetch(`${API_HOST}/api/v1/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      if (!res.ok) {
        const errData = await res.json();
        setError(errData.message || "Không thể đặt lại mật khẩu.");
        return;
      }

      setSuccess(true);
      setTimeout(() => router.push("/login"), 3000);
    } catch (err) {
      console.error(err);
      setError("Đã xảy ra lỗi hệ thống. Vui lòng thử lại.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-bg min-h-screen flex flex-col justify-center items-center px-4 pb-12 pt-16">
      <div className="w-full max-w-md">
        {/* Logo và tiêu đề */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-3 mb-6">
            <Image
              src={process.env.NEXT_PUBLIC_LOGO_WAYO || "/favicon.svg"}
              alt="WAYO Logo"
              width={32}
              height={32}
              className="rounded-md"
            />
            <span className="font-semibold text-xl">WAYO</span>
          </Link>
          <h1 className="text-2xl font-bold mb-2">Tạo mật khẩu mới</h1>
          <p className="text-gray-600">
            Nhập mật khẩu mới cho tài khoản của bạn.
          </p>
        </div>

        {/* Form đặt lại mật khẩu */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 auth-form">
          {success ? (
            <div className="p-4 bg-green-50 text-green-700 rounded-lg border border-green-100 text-sm">
              <h3 className="font-medium mb-1">Đặt lại mật khẩu thành công!</h3>
              <p>Bạn sẽ được chuyển hướng đến trang đăng nhập trong giây lát...</p>
            </div>
          ) : (
            <form className="space-y-4" onSubmit={handleSubmit}>
              {error && (
                <div className="p-3 bg-red-50 text-red-700 rounded-lg border border-red-100 text-sm">
                  {error}
                </div>
              )}

              {passwordError && (
                <div className="p-3 bg-red-50 text-red-700 rounded-lg border border-red-100 text-sm">
                  {passwordError}
                </div>
              )}

              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Mật khẩu mới
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="••••••••"
                  value={password}
                  onChange={handlePasswordChange}
                />
              </div>

              <div>
                <label
                  htmlFor="confirmPassword"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Xác nhận mật khẩu mới
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={handleConfirmPasswordChange}
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 px-4 bg-blue-600 text-white font-medium rounded-lg shadow-sm hover:bg-blue-700 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isLoading ? "Đang cập nhật..." : "Đặt lại mật khẩu"}
              </button>
            </form>
          )}
        </div>

        {/* Link quay lại login */}
        <div className="text-center mt-8">
          <p className="text-sm text-gray-600">
            <Link
              href="/login"
              className="text-blue-600 hover:text-blue-800 font-medium underline"
            >
              Quay lại đăng nhập
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
