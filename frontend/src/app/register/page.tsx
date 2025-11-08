"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useSignupMutation, isErrorWithData } from "@/lib/redux/services/auth";
import type { SignupCredentials } from "@/lib/redux/services/auth";
import Link from "next/link";

/**
 * Signup page component
 */
export default function SignupPage() {
  const router = useRouter();
  const [signup, { isLoading, error }] = useSignupMutation();
  const [credentials, setCredentials] = useState<
    SignupCredentials & { confirmPassword: string; agreeTerms: boolean }
  >({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    role: "CUSTOMER",
    agreeTerms: false,
  });

  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  /** Handle input change */
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ): void => {
    const { name, value, type } = e.target;
    const checked = e.target instanceof HTMLInputElement ? e.target.checked : false;

    setCredentials({
      ...credentials,
      [name]: type === "checkbox" ? checked : value,
    });

    // Clear validation error for this field
    if (validationErrors[name]) {
      setValidationErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  /** Validate form */
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!credentials.name.trim()) errors.name = "Tên không được để trống";

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!credentials.email) errors.email = "Email không được để trống";
    else if (!emailRegex.test(credentials.email)) errors.email = "Email không đúng định dạng";

    const phoneRegex = /^0\d{9,10}$/;
    if (!credentials.phone) errors.phone = "Số điện thoại không được để trống";
    else if (!phoneRegex.test(credentials.phone))
      errors.phone = "Số điện thoại phải bắt đầu bằng 0 và có 10-11 chữ số";

    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!credentials.password) errors.password = "Mật khẩu không được để trống";
    else if (!passwordRegex.test(credentials.password))
      errors.password =
        "Mật khẩu phải có ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt";

    if (credentials.password !== credentials.confirmPassword)
      errors.confirmPassword = "Mật khẩu không khớp";

    if (!credentials.role) errors.role = "Vui lòng chọn vai trò";

    if (!credentials.agreeTerms)
      errors.agreeTerms = "Bạn phải đồng ý với điều khoản dịch vụ";

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  /** Handle form submit */
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      const { confirmPassword, agreeTerms, ...signupData } = credentials;

      if (signupData.password !== confirmPassword) {
        alert("Passwords do not match");
        return;
      }

      if (!agreeTerms) {
        alert("You must agree to the terms and conditions.");
        return;
      }
      await signup(signupData).unwrap();
      router.push("/login?registered=success");
    } catch (err: unknown) {
      console.error("Signup error:", err);
      if (isErrorWithData(err) && err.data.errors) {
        setValidationErrors(err.data.errors);
      }
    }
  };

  /** Display backend or RTK error message */
  const getErrorMessage = (): string | null => {
    if (!error) return null;
    if (isErrorWithData(error)) return error.data.message || "Đăng ký thất bại. Vui lòng thử lại.";
    if ("error" in error) return String(error.error);
    return "Đăng ký thất bại. Vui lòng thử lại.";
  };

  return (
    <div className="auth-bg min-h-screen flex flex-col justify-center items-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-3 mb-6">
            <Image
              src={process.env.NEXT_PUBLIC_LOGO_WAYO || "/favicon.svg"}
              alt="Logo"
              width={32}
              height={32}
              className="rounded-md"
            />
            <span className="font-semibold text-xl">Charging Station</span>
          </Link>
          <h1 className="text-2xl font-bold mb-2">Tạo tài khoản mới</h1>
          <p className="text-gray-600">Đăng ký để sử dụng dịch vụ trạm sạc điện</p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <form className="space-y-4" onSubmit={handleSubmit}>
            {error && (
              <div className="p-3 bg-red-50 text-red-700 rounded-lg border border-red-100 text-sm">
                {getErrorMessage()}
              </div>
            )}

            {/* Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Họ và tên <span className="text-red-500">*</span>
              </label>
              <input
                id="name"
                name="name"
                type="text"
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  validationErrors.name ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Nhập họ và tên"
                value={credentials.name}
                onChange={handleChange}
              />
              {validationErrors.name && (
                <p className="mt-1 text-xs text-red-600">{validationErrors.name}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                id="email"
                name="email"
                type="email"
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  validationErrors.email ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="example@email.com"
                value={credentials.email}
                onChange={handleChange}
              />
              {validationErrors.email && (
                <p className="mt-1 text-xs text-red-600">{validationErrors.email}</p>
              )}
            </div>

            {/* Phone */}
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                Số điện thoại <span className="text-red-500">*</span>
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  validationErrors.phone ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="0901234567"
                value={credentials.phone}
                onChange={handleChange}
              />
              {validationErrors.phone && (
                <p className="mt-1 text-xs text-red-600">{validationErrors.phone}</p>
              )}
            </div>

            {/* Role */}
            <div>
              <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
                Vai trò <span className="text-red-500">*</span>
              </label>
              <select
                id="role"
                name="role"
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  validationErrors.role ? "border-red-500" : "border-gray-300"
                }`}
                value={credentials.role}
                onChange={handleChange}
              >
                <option value="">Chọn vai trò</option>
                <option value="CUSTOMER">Khách hàng</option>
                <option value="VENDOR">Nhà cung cấp</option>
              </select>
              {validationErrors.role && (
                <p className="mt-1 text-xs text-red-600">{validationErrors.role}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Mật khẩu <span className="text-red-500">*</span>
              </label>
              <input
                id="password"
                name="password"
                type="password"
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  validationErrors.password ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="••••••••"
                value={credentials.password}
                onChange={handleChange}
              />
              {validationErrors.password ? (
                <p className="mt-1 text-xs text-red-600">{validationErrors.password}</p>
              ) : (
                <p className="mt-1 text-xs text-gray-500">
                  Phải có ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt
                </p>
              )}
            </div>

            {/* Confirm password */}
            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Xác nhận mật khẩu <span className="text-red-500">*</span>
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  validationErrors.confirmPassword ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="••••••••"
                value={credentials.confirmPassword}
                onChange={handleChange}
              />
              {validationErrors.confirmPassword && (
                <p className="mt-1 text-xs text-red-600">{validationErrors.confirmPassword}</p>
              )}
            </div>

            {/* Terms */}
            <div className="flex items-start">
              <input
                id="agreeTerms"
                name="agreeTerms"
                type="checkbox"
                className="h-4 w-4 mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-600"
                checked={credentials.agreeTerms}
                onChange={handleChange}
              />
              <label htmlFor="agreeTerms" className="ml-2 block text-sm text-gray-700">
                Tôi đồng ý với{" "}
                <Link href="/terms" className="text-blue-600 hover:text-blue-800 underline">
                  Điều khoản dịch vụ
                </Link>{" "}
                và{" "}
                <Link href="/privacy" className="text-blue-600 hover:text-blue-800 underline">
                  Chính sách bảo mật
                </Link>
              </label>
            </div>
            {validationErrors.agreeTerms && (
              <p className="mt-1 text-xs text-red-600">{validationErrors.agreeTerms}</p>
            )}

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
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 
                      7.962 0 014 12H0c0 3.042 1.135 5.824 
                      3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Đang tạo tài khoản...
                </span>
              ) : (
                "Tạo tài khoản"
              )}
            </button>
          </form>
        </div>

        {/* Login link */}
        <div className="text-center mt-6">
          <p className="text-sm text-gray-600">
            Đã có tài khoản?{" "}
            <Link href="/login" className="text-blue-600 hover:text-blue-800 font-medium underline">
              Đăng nhập ngay
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
