"use client";

import { useState } from "react";
import Image from "next/image";
import { useForgotPasswordMutation } from "@/lib/redux/services/auth";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [forgotPassword, { isLoading, isSuccess }] = useForgotPasswordMutation();
  const [email, setEmail] = useState("");
  const [validationError, setValidationError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    setValidationError("");
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setValidationError("");

    // Validation
    if (!email || !email.includes("@")) {
      setValidationError("Vui lòng nhập địa chỉ email hợp lệ");
      return;
    }

    try {
      const response = await forgotPassword({ email }).unwrap();
      console.log("Forgot password success:", response);
    } catch (err: any) {
      console.error("Forgot password error:", err);
      
      // Handle error from backend
      if (err?.data?.message) {
        setValidationError(err.data.message);
      } else if (err?.data?.error) {
        setValidationError(err.data.error);
      } else if (err?.status === "FETCH_ERROR") {
        setValidationError("Không thể kết nối đến server. Vui lòng thử lại sau.");
      } else {
        setValidationError("Có lỗi xảy ra. Vui lòng thử lại.");
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-4 py-8 bg-gradient-to-br from-blue-50 to-gray-50">
      <div className="w-full max-w-md">
        {/* Logo and header */}
        <div className="text-center mb-10">
          <Link 
            href="/" 
            className="inline-flex items-center justify-center gap-3 mb-8 group"
          >
            <div className="relative w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center transform group-hover:scale-105 transition-transform duration-200">
              <Image
                src={process.env.NEXT_PUBLIC_LOGO_WAYO || "/favicon.svg"}
                alt="WAYO Logo"
                width={28}
                height={28}
                className="rounded-md"
              />
            </div>
            <span className="font-bold text-2xl text-gray-800">WAYO</span>
          </Link>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-3">
            Quên mật khẩu
          </h1>
          <p className="text-gray-600 text-base">
            {isSuccess 
              ? "Vui lòng kiểm tra email của bạn để tiếp tục đặt lại mật khẩu"
              : "Nhập email của bạn và chúng tôi sẽ gửi liên kết đặt lại mật khẩu"
            }
          </p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
          {isSuccess ? (
            // Success State
            <div className="text-center space-y-6">
              <div className="w-20 h-20 mx-auto rounded-full bg-green-100 flex items-center justify-center">
                <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
              </div>
              
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Email đã được gửi!
                </h3>
                <p className="text-gray-600 mb-6">
                  Chúng tôi đã gửi liên kết đặt lại mật khẩu đến{" "}
                  <span className="font-medium text-blue-600">{email}</span>. 
                  Vui lòng kiểm tra hộp thư đến của bạn.
                </p>
                
                <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 text-sm text-blue-700 mb-6">
                  <p className="font-medium mb-1">💡 Lưu ý:</p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Kiểm tra thư mục spam nếu bạn không thấy email</li>
                    <li>Liên kết sẽ hết hạn sau 1 giờ</li>
                    <li>Chỉ gửi lại email sau 5 phút nếu chưa nhận được</li>
                  </ul>
                </div>
              </div>

              <div className="space-y-3">
                <button
                  onClick={() => {
                    setEmail("");
                    setValidationError("");
                  }}
                  className="w-full py-3 px-4 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
                >
                  Gửi lại email
                </button>
                
                <Link
                  href="/login"
                  className="block w-full py-3 px-4 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors text-center"
                >
                  Quay lại đăng nhập
                </Link>
              </div>
            </div>
          ) : (
            // Form State
            <form className="space-y-6" onSubmit={handleSubmit}>
              {validationError && (
                <div className="p-4 bg-red-50 text-red-700 rounded-lg border border-red-100 text-sm animate-fade-in">
                  <div className="flex items-start">
                    <svg className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    <span>{validationError}</span>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700"
                >
                  Địa chỉ email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                    </svg>
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="nhập email của bạn"
                    value={email}
                    onChange={handleChange}
                    disabled={isLoading}
                  />
                </div>
                <p className="text-xs text-gray-500">
                  Nhập email bạn đã sử dụng khi đăng ký tài khoản
                </p>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 px-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium rounded-lg shadow-sm hover:from-blue-700 hover:to-blue-800 transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Đang gửi...
                  </>
                ) : (
                  "Gửi liên kết đặt lại mật khẩu"
                )}
              </button>
            </form>
          )}
        </div>

        {/* Additional links */}
        <div className="text-center mt-8 space-y-4">
          <p className="text-sm text-gray-600">
            Nhớ mật khẩu?{" "}
            <Link
              href="/login"
              className="text-blue-600 hover:text-blue-800 font-medium underline hover:no-underline transition-colors"
            >
              Đăng nhập ngay
            </Link>
          </p>
          
          <p className="text-sm text-gray-600">
            Chưa có tài khoản?{" "}
            <Link
              href="/register"
              className="text-blue-600 hover:text-blue-800 font-medium underline hover:no-underline transition-colors"
            >
              Tạo tài khoản mới
            </Link>
          </p>
        </div>

        {/* Help section */}
        {!isSuccess && (
          <div className="mt-8 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <h4 className="font-medium text-gray-900 mb-2 flex items-center">
              <svg className="w-5 h-5 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              Cần trợ giúp?
            </h4>
            <p className="text-sm text-gray-600">
              Nếu bạn gặp vấn đề khi đặt lại mật khẩu, vui lòng liên hệ{' '}
              <a href="mailto:support@wayo.com" className="text-blue-600 hover:underline">
                support@wayo.com
              </a>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}