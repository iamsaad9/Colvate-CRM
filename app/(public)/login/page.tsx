"use client";
import React, { useState } from "react";
import { Input, Button, Checkbox, Link } from "@heroui/react";
import { EyeIcon, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";

export default function Login() {
  const [isVisible, setIsVisible] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const router = useRouter();

  const toggleVisibility = () => setIsVisible(!isVisible);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("http://localhost:3000/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Login failed");
      }
      // Redirect to dashboard
      console.log("Login successful, redirecting to dashboard...");
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen w-full bg-gray-50 ">
      {/* Image Section - 60% */}
      <div className="hidden lg:flex lg:w-3/5 relative overflow-hidden bg-linear-to-br from-indigo-600 via-indigo-500 to-indigo-400">
        {/* Background Image Overlay */}
        <div
          className="absolute inset-0 opacity-15 mix-blend-overlay"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1557804506-669a67965ba0?w=1200&q=80')",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-between p-16 text-white w-full">
          {/* Logo */}
          <div className="animate-fade-in-down">
            <div className="flex items-center gap-2 font-['Playfair_Display'] text-3xl font-bold tracking-tight">
              <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center font-bold">
                C
              </div>
              CRM Pro
            </div>
          </div>

          {/* Hero Content */}
          <div className="animate-fade-in-up animation-delay-200">
            <h1 className="font-['Playfair_Display'] text-6xl font-bold leading-tight tracking-tight mb-6">
              Manage relationships
              <br />
              that matter
            </h1>
            <p className="text-lg text-white/90 max-w-lg leading-relaxed">
              The all-in-one platform designed to help your team build stronger
              customer relationships and drive revenue growth.
            </p>

            {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-8 mt-12 animate-fade-in-up animation-delay-400">
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
                <div className="text-3xl font-bold mb-1">50K+</div>
                <div className="text-sm text-white/80 font-medium">
                  Active Users
                </div>
              </div>
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
                <div className="text-3xl font-bold mb-1">99.9%</div>
                <div className="text-sm text-white/80 font-medium">
                  Uptime SLA
                </div>
              </div>
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
                <div className="text-3xl font-bold mb-1">24/7</div>
                <div className="text-sm text-white/80 font-medium">Support</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Form Section - 40% */}
      <div className="w-full  lg:w-2/5 flex items-center justify-center relative overflow-hidden">
        {/* Decorative Blobs */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600/50 rounded-full blur-3xl pointer-events-none -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-500/50 rounded-full blur-3xl pointer-events-none translate-y-1/2 -translate-x-1/2" />

        <div className="w-full max-w-md relative z-10 animate-fade-in-right animation-delay-300">
          {/* Header */}
          <div className="mb-10">
            <h2 className="font-['Playfair_Display'] text-4xl font-bold text-gray-900 mb-2 tracking-tight">
              Welcome back
            </h2>
            <p className="text-gray-500">
              Enter your credentials to access your account
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6 ">
            {/* Email Input */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Email address
              </label>
              <Input
                type="email"
                placeholder="name@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                size="lg"
                radius="lg"
                classNames={{
                  input: "text-base",
                  inputWrapper:
                    "h-12 border-2 border-gray-200 hover:border-indigo-300 focus-within:!border-indigo-600 transition-all",
                }}
                required
              />
            </div>

            {/* Password Input */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Password
              </label>
              <Input
                type={isVisible ? "text" : "password"}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                size="lg"
                radius="lg"
                endContent={
                  <button
                    className="focus:outline-none"
                    type="button"
                    onClick={toggleVisibility}
                  >
                    {isVisible ? (
                      <EyeOff className="w-5 h-5 text-gray-400 hover:text-gray-600 transition-colors" />
                    ) : (
                      <EyeIcon className="w-5 h-5 text-gray-400 hover:text-gray-600 transition-colors" />
                    )}
                  </button>
                }
                classNames={{
                  input: "text-base",
                  inputWrapper:
                    "h-12 border-2 border-gray-200 hover:border-indigo-300 focus-within:!border-indigo-600 transition-all",
                }}
                required
              />
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <Checkbox
                size="sm"
                classNames={{
                  label: "text-sm text-gray-600",
                }}
              >
                Remember me
              </Checkbox>
              <Link
                href="#"
                className="text-sm font-medium text-indigo-600 hover:text-indigo-700 transition-colors"
              >
                Forgot password?
              </Link>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold h-12 transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-indigo-600/30"
              radius="lg"
            >
              Sign in
            </Button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-4 my-6">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-sm font-medium text-gray-400">
              Or continue with
            </span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          {/* Social Buttons */}
          <div className="grid grid-cols-2 gap-4">
            <button className="flex items-center justify-center gap-2 px-4 py-3 border-2 border-gray-200 rounded-xl bg-white hover:border-indigo-600 hover:bg-gray-50 transition-all hover:-translate-y-0.5 font-medium text-gray-700 text-sm">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              Google
            </button>
            <button className="flex items-center justify-center gap-2 px-4 py-3 border-2 border-gray-200 rounded-xl bg-white hover:border-indigo-600 hover:bg-gray-50 transition-all hover:-translate-y-0.5 font-medium text-gray-700 text-sm">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701" />
              </svg>
              Apple
            </button>
          </div>

          {/* Sign Up Link */}
          <div className="text-center mt-8 pt-8 border-t border-gray-100 text-sm text-gray-600">
            Don&apos;t have an account?
            <a
              href="/signup"
              className="ml-1 font-semibold text-indigo-600 hover:text-indigo-700 transition-colors hover:underline"
            >
              Create account
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
