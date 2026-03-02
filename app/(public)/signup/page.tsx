"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Input, Button, Checkbox, Link } from "@heroui/react";
import { EyeIcon, EyeOff } from "lucide-react";

export default function SignUp() {
  const [isVisible, setIsVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const [formData, setFormData] = useState({
    fullName: "",
    companyName: "",
    email: "",
    password: "",
  });

  const toggleVisibility = () => setIsVisible(!isVisible);

  const handleChange = (field) => (e) => {
    setFormData({ ...formData, [field]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Sign up attempt:", formData);
    setLoading(true);
    setError("");

    try {
      const res = await fetch("http://localhost:3000/api/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Signup failed");
      }

      router.push("/login");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const passwordRequirements = {
    minLength: formData.password.length >= 8,
    hasUppercase: /[A-Z]/.test(formData.password),
    hasNumber: /[0-9]/.test(formData.password),
  };

  return (
    <div className="flex min-h-screen w-full bg-gray-50">
      {/* Form Section - 40% Left */}
      <div className="w-full lg:w-2/5 max-h-screen overflow-hidden flex items-center justify-center p-8 lg:p-12 bg-white relative">
        {/* Decorative Blobs */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-indigo-600/5 rounded-full blur-3xl pointer-events-none -translate-y-1/2 -translate-x-1/2" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none translate-y-1/2 translate-x-1/2" />

        <div className="w-full max-w-md relative z-10 animate-fade-in-left animation-delay-300">
          {/* Header */}
          <div className="mb-10">
            <h2 className="font-['Playfair_Display'] text-4xl font-bold text-gray-900 mb-2 tracking-tight">
              Get started
            </h2>
            <p className="text-gray-500">
              Create your account and unlock powerful CRM tools
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Full Name */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Full name
              </label>
              <Input
                type="text"
                placeholder="John Doe"
                value={formData.fullName}
                onChange={handleChange("fullName")}
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

            {/* Company Name */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Company name
              </label>
              <Input
                type="text"
                placeholder="Acme Inc."
                value={formData.companyName}
                onChange={handleChange("companyName")}
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

            {/* Email */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Work email
              </label>
              <Input
                type="email"
                placeholder="name@company.com"
                value={formData.email}
                onChange={handleChange("email")}
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

            {/* Password */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Password
              </label>
              <Input
                type={isVisible ? "text" : "password"}
                placeholder="Create a strong password"
                value={formData.password}
                onChange={handleChange("password")}
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
              {/* Password Requirements */}
              <div className="flex flex-wrap gap-3 mt-2">
                <div className="flex items-center gap-1.5 text-xs text-gray-600">
                  <span
                    className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[10px] transition-colors ${
                      passwordRequirements.minLength
                        ? "bg-green-500 text-white"
                        : "bg-gray-200"
                    }`}
                  >
                    ✓
                  </span>
                  8+ characters
                </div>
                <div className="flex items-center gap-1.5 text-xs text-gray-600">
                  <span
                    className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[10px] transition-colors ${
                      passwordRequirements.hasUppercase
                        ? "bg-green-500 text-white"
                        : "bg-gray-200"
                    }`}
                  >
                    ✓
                  </span>
                  Uppercase
                </div>
                <div className="flex items-center gap-1.5 text-xs text-gray-600">
                  <span
                    className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[10px] transition-colors ${
                      passwordRequirements.hasNumber
                        ? "bg-green-500 text-white"
                        : "bg-gray-200"
                    }`}
                  >
                    ✓
                  </span>
                  Number
                </div>
              </div>
            </div>

            {/* Terms Checkbox */}
            <div className="mt-2">
              <Checkbox
                size="sm"
                classNames={{
                  label: "text-sm text-gray-600",
                }}
                required
              >
                I agree to the{" "}
                <Link
                  href="#"
                  className="text-indigo-600 font-medium hover:text-indigo-700"
                >
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link
                  href="#"
                  className="text-indigo-600 font-medium hover:text-indigo-700"
                >
                  Privacy Policy
                </Link>
              </Checkbox>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold h-12 transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-indigo-600/30"
              radius="lg"
            >
              Create account
            </Button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-4 my-5">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-sm font-medium text-gray-400">
              Or sign up with
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

          {/* Login Link */}
          <div className="text-center mt-6 pt-6 border-t border-gray-100 text-sm text-gray-600">
            Already have an account?
            <a
              href="#"
              className="ml-1 font-semibold text-indigo-600 hover:text-indigo-700 transition-colors hover:underline"
            >
              Sign in
            </a>
          </div>
        </div>
      </div>

      {/* Image Section - 60% Right */}
      <div className="hidden lg:flex lg:w-3/5 relative overflow-hidden bg-gradient-to-bl from-indigo-600 via-indigo-500 to-indigo-400">
        {/* Background Image Overlay */}
        <div
          className="absolute inset-0 opacity-15 mix-blend-overlay"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1553877522-43269d4ea984?w=1200&q=80')",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-center items-center p-16 text-white w-full text-center">
          {/* Testimonial */}
          <div className="max-w-2xl animate-fade-in-up animation-delay-400">
            <div className="w-15 h-15 bg-white/15 backdrop-blur-md rounded-full flex items-center justify-center mx-auto mb-8 text-5xl font-['Playfair_Display']">
              &quot;
            </div>

            <p className="font-['Playfair_Display'] text-4xl font-semibold leading-tight mb-8 tracking-tight">
              CRM Pro transformed how we manage customer relationships. The
              insights and automation features saved us countless hours.
            </p>

            <div className="flex items-center gap-4 justify-center">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-full border-2 border-white/30" />
              <div className="text-left">
                <div className="font-semibold">Sarah Mitchell</div>
                <div className="text-sm text-white/80">
                  VP of Sales, TechCorp
                </div>
              </div>
            </div>

            {/* Features Grid */}
            <div className="grid grid-cols-3 gap-8 mt-16 animate-fade-in-up animation-delay-600">
              <div className="text-center">
                <div className="w-12 h-12 bg-white/15 backdrop-blur-md rounded-xl flex items-center justify-center mx-auto mb-4 text-2xl">
                  ⚡
                </div>
                <div className="font-semibold mb-1">Fast Setup</div>
                <div className="text-sm text-white/80">
                  Get started in minutes
                </div>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-white/15 backdrop-blur-md rounded-xl flex items-center justify-center mx-auto mb-4 text-2xl">
                  🔒
                </div>
                <div className="font-semibold mb-1">Secure</div>
                <div className="text-sm text-white/80">
                  Bank-level encryption
                </div>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-white/15 backdrop-blur-md rounded-xl flex items-center justify-center mx-auto mb-4 text-2xl">
                  📊
                </div>
                <div className="font-semibold mb-1">Analytics</div>
                <div className="text-sm text-white/80">Real-time insights</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
