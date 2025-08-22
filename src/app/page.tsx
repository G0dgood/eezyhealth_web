"use client";

import Link from "next/link";
import { useState } from "react";
import {
  User,
  Stethoscope,
  Shield,
  Eye,
  EyeOff,
  Lock,
  Mail,
  Heart,
} from "lucide-react";

export default function HomePage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>(
    {}
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

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
      setIsLoading(false);
      return;
    }

    // Simulate login process
    setTimeout(() => {
      setIsLoading(false);
      // Here you would typically handle authentication
      // For now, we'll just show a success message
      alert("Login successful! Redirecting to dashboard...");
    }, 1500);
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
        <div className="text-white text-2xl font-bold">eezyhealth</div>

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
          <button className="px-4 py-2 text-white border border-white rounded-lg hover:bg-white hover:text-gray-900 transition-colors">
            Log in
          </button>
          <button className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors">
            Sign up
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex items-center justify-center px-6">
        <div className="w-full mt-32 ml-12 flex items-center">
          {/* Left Side - Compact White Card (Like WeTransfer's consent dialog) */}
          <div className="w-full lg:w-2/5 flex justify-center lg:justify-start">
            <div className="bg-white rounded-2xl p-8 shadow-2xl max-w-sm">
              {/* Logo */}
              <div className="w-12 h-12 bg-gray-900 rounded-lg flex items-center justify-center mb-6">
                <Heart className="w-6 h-6 text-white" />
              </div>

              {/* Main Text */}
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                You&apos;re almost there
              </h1>

              {/* Consent/Login Text */}
              <p className="text-gray-700 mb-6 leading-relaxed">
                To continue, please sign in to your account or create a new one
                to access our healthcare management system.
              </p>

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
                  className="w-full bg-[#22c55e] hover:bg-[#1a9f4a] text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed">
                  {isLoading ? "Signing in..." : "Sign In"}
                </button>
              </form>

              {/* Quick Access Links */}
              <div className="mt-6 text-center">
                <div className="text-sm text-gray-600">
                  <Link
                    href="/nurse"
                    className="text-blue-600 hover:underline mr-4">
                    Nurse Access
                  </Link>
                  <Link
                    href="/doctor"
                    className="text-blue-600 hover:underline mr-4">
                    Doctor Access
                  </Link>
                  <Link href="/admin" className="text-blue-600 hover:underline">
                    Admin Access
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
