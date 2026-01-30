"use client";
import { useState } from "react";
import { SVGLoader } from "@/components/SVGLoader";
import { useAuthLogic } from "@/hooks/useAuthLogic";
import Image from "next/image";
import Input from "@/components/Input";
import { useTheme } from "@/contexts/ThemeContext";
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
  const { theme } = useTheme();
  // Add error state for validation
  const [errors, setErrors] = useState<{ email?: string; password?: string }>(
    {}
  );

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
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url("/login-image.png")`,
        }}>
        {/* Overlay for better text readability */}
        <div className="absolute inset-0 bg-black/20"></div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex items-center justify-center lg:justify-start px-4 min-h-screen lg:pl-12">
        {/* Left Side - Compact White Card (Like WeTransfer's consent dialog) */}
        <div className="w-full lg:w-2/5 flex justify-center lg:justify-start">
          <div className="bg-white rounded-lg p-8 shadow-2xl max-w-sm">
            {/* Logo */}
            <div className="mb-8 flex items-center space-x-2 ">
              <Image
                src={theme === "dark" ? "/logowhite.svg" : "/logodark.svg"}
                alt="eezyhealth"
                width={150}
                height={150}
              />
            </div>

            {/* Consent/Login Text */}
            <p className="text-gray-700 mb-6 leading-relaxed text-[13px]">
              To continue, please sign in to your account or create a new one
              to access our healthcare management system.
            </p>
            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-4 mt-20">
              <div>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email address"
                  variant={errors.email ? "error" : "default"}
                  helperText={errors.email}
                  fullWidth
                />
              </div>

              <div className="relative">
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  variant={errors.password ? "error" : "default"}
                  helperText={errors.password}
                  showPasswordToggle={true}
                  fullWidth
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#22c55e] hover:bg-[#1a9f4a] text-white font-semibold py-3 px-6 rounded-sm transition-all duration-200 flex items-center justify-center">
                {isLoading ? (
                  <SVGLoader width={"18px"} height={"18px"} color={"#FFF"} />
                ) : (
                  "Sign In"
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
