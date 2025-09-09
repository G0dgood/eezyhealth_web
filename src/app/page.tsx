"use client";

import Link from "next/link";
import { useState } from "react";
import { Heart } from "lucide-react";
import { SVGLoader } from "@/components/SVGLoader";
import { useAuthLogic } from "@/hooks/useAuthLogic";
import Image from "next/image";
export default function HomePage() {
  // Use the authentication logic hook
  const {
    isLoading,
    email,
    setEmail,
    password,
    setPassword,
    handleSignInWithGoogle,
    loginHandler,
  } = useAuthLogic();

  // Add error state for validation
  const [errors, setErrors] = useState<{ email?: string; password?: string }>(
    {}
  );
  const [showPassword, setShowPassword] = useState(false);

  // Enhanced form handler with validation
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Clear previous errors
    setErrors({});

    // Basic validation
    const newErrors: { email?: string; password?: string } = {};

    if (!email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Please enter a valid email";
    }

    if (!password) {
      newErrors.password = "Password is required";
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Use the authentication logic
    await loginHandler(e);
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background - Healthcare/Doctor Images */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='1200' height='800' viewBox='0 0 1200 800' xmlns='http://www.w3.org/2000/svg'%3E%3Cdefs%3E%3ClinearGradient id='a' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' style='stop-color:%23f0f9ff;stop-opacity:1' /%3E%3Cstop offset='50%25' style='stop-color:%23e0e7ff;stop-opacity:1' /%3E%3Cstop offset='100%25' style='stop-color:%23fdf2f8;stop-opacity:1' /%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='1200' height='800' fill='url(%23a)' /%3E%3Ccircle cx='200' cy='150' r='80' fill='%23dbeafe' opacity='0.6' /%3E%3Ccircle cx='1000' cy='200' r='60' fill='%23e9d5ff' opacity='0.6' /%3E%3Ccircle cx='150' cy='600' r='70' fill='%23fce7f3' opacity='0.6' /%3E%3Ccircle cx='900' cy='650' r='50' fill='%23dbeafe' opacity='0.6' /%3E%3C/svg%3E")`,
        }}>
        {/* Overlay for better text readability */}
        <div className="absolute inset-0 bg-black/20"></div>
      </div>

      {/* Header/Navigation Bar */}
      <div className="relative z-10 flex justify-between items-center p-6">
        {/* Left - Logo */}
        <Image src="/logowhite.svg" alt="Logo" width={200} height={200} />
        {/* <div className="text-white text-2xl font-bold">eezyhealth</div> */}

        {/* Right - Navigation */}
        <div className="hidden md:flex items-center space-x-8">
          <Link
            href="#"
            className="text-white hover:text-gray-200 transition-colors">
            Features
          </Link>
          <Link
            href="#"
            className="text-white hover:text-gray-200 transition-colors">
            Pricing
          </Link>
          <Link
            href="#"
            className="text-white hover:text-gray-200 transition-colors">
            Use cases
          </Link>
          <Link
            href="#"
            className="text-white hover:text-gray-200 transition-colors">
            Resources
          </Link>
          {/* <button className="px-4 py-2 text-white border border-white rounded-lg hover:bg-white hover:text-gray-900 transition-colors">
            Log in
          </button> */}
          {/* <button className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors">
            Sign up
          </button> */}
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex items-center justify-center px-6">
        <div className="w-full mt-32 ml-12 flex items-center">
          {/* Left Side - Compact White Card (Like WeTransfer's consent dialog) */}
          <div className="w-full lg:w-2/5 flex justify-center lg:justify-start">
            <div className="bg-white rounded-2xl p-8 shadow-2xl max-w-sm">
              {/* Logo */}
              {/* <div className="w-12 h-12 bg-gray-900 rounded-lg flex items-center justify-center mb-6">
                <Heart className="w-6 h-6 text-white" />
              </div> */}

              {/* Main Text */}
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                You&apos;re almost there
              </h1>

              {/* Consent/Login Text */}
              <p className="text-gray-700 mb-6 leading-relaxed">
                To continue, please sign in to your account or create a new one
                to access our healthcare management system.
              </p>

              {/* Google Sign In Button */}
              <button
                type="button"
                onClick={handleSignInWithGoogle}
                disabled={isLoading}
                className="w-full bg-white border border-gray-300 text-gray-700 font-semibold py-3 px-6 rounded-lg hover:bg-gray-50 transition-all duration-200 flex items-center justify-center mb-4">
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Sign in with Google
              </button>

              <div className="relative mb-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">
                    Or continue with
                  </span>
                </div>
              </div>

              {/* Login Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email address"
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#22c55e] focus:border-[#22c55e] transition-all duration-200 ${
                      errors.email
                        ? "border-red-300 bg-red-50"
                        : "border-gray-300 hover:border-[#22c55e]"
                    }`}
                  />
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                  )}
                </div>

                <div>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password"
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#22c55e] focus:border-[#22c55e] transition-all duration-200 ${
                      errors.password
                        ? "border-red-300 bg-red-50"
                        : "border-gray-300 hover:border-[#22c55e]"
                    }`}
                  />
                  {errors.password && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.password}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-[#22c55e] hover:bg-[#1a9f4a] text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 flex items-center justify-center">
                  {isLoading ? (
                    <SVGLoader width={"25px"} height={"25px"} color={"#FFF"} />
                  ) : (
                    "Sign In"
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
