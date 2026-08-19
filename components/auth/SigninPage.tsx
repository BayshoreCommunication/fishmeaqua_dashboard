"use client";

import { adminSigninAction } from "@/app/actions/auth";
import { motion } from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";
import { useActionState, useEffect, useState } from "react";
import { BiEnvelope, BiLockAlt, BiLogIn } from "react-icons/bi";
import { FiEye, FiEyeOff } from "react-icons/fi";

const SigninPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [state, formAction, isPending] = useActionState(adminSigninAction, {
    ok: false,
    error: "",
  });
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";

  useEffect(() => {
    if (state.ok) {
      // Full page navigation so server components (layout, navbar) re-render
      // with the fresh session cookie instead of serving a stale RSC cache.
      window.location.href = state.redirectTo || callbackUrl;
    }
  }, [state.ok, state.redirectTo, callbackUrl]);

  // Shared styles
  const inputWrapperClass = "relative flex items-center";
  const inputClass =
    "w-full rounded-xl border border-gray-200 bg-gray-50/50 py-3 pl-11 pr-4 text-sm text-gray-900 placeholder-gray-400 transition-all focus:border-primary focus:bg-white focus:outline-none focus:ring-4 focus:ring-primary/10";
  const iconClass = "absolute left-3.5 h-5 w-5 text-gray-400";

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gray-50">
      {/* --- Ambient Background --- */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute left-[20%] top-[20%] h-[400px] w-[400px] rounded-full bg-primary/20 blur-[120px]" />
        <div className="absolute right-[20%] bottom-[20%] h-[400px] w-[400px] rounded-full bg-black/10 blur-[120px]" />
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.02]" />
      </div>

      <div className="container relative z-10 mx-auto flex w-full max-w-[420px] flex-col justify-center space-y-6 px-4">
        {/* --- Header --- */}
        <div className="flex flex-col items-center space-y-4 text-center">
          <div className="space-y-1">
            <motion.h1
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-2xl font-bold tracking-tight text-gray-900"
            >
              Welcome Admin
            </motion.h1>
            <motion.p
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-sm text-gray-500"
            >
              Sign in to manage the platform
            </motion.p>
          </div>
        </div>

        {/* --- Card --- */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="relative overflow-hidden rounded-2xl border border-white/20 bg-white/70 p-8 shadow-2xl backdrop-blur-xl"
        >
          <form action={formAction} className="space-y-5">
            <input type="hidden" name="callbackUrl" value={callbackUrl} />
            {/* Email Field */}
            <div className="space-y-1.5">
              <label
                className="text-xs font-semibold uppercase tracking-wider text-gray-500"
                htmlFor="email"
              >
                Email
              </label>
              <div className={inputWrapperClass}>
                <BiEnvelope className={iconClass} />
                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="name@example.com"
                  required
                  className={inputClass}
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <label
                className="text-xs font-semibold uppercase tracking-wider text-gray-500"
                htmlFor="password"
              >
                Password
              </label>
              <div className={inputWrapperClass}>
                <BiLockAlt className={iconClass} />
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  required
                  className={inputClass}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 text-gray-400 hover:text-primary-dark transition-colors"
                >
                  {showPassword ? (
                    <FiEyeOff className="h-5 w-5" />
                  ) : (
                    <FiEye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Status Messages */}
            {(state?.error || state?.ok) && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                className={`flex items-center gap-2 rounded-lg px-4 py-3 text-sm font-medium ${
                  state.error
                    ? "bg-red-50 text-red-600"
                    : "bg-green-50 text-green-600"
                }`}
              >
                {state.error || "Login successful! Redirecting..."}
              </motion.div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isPending}
              className="mt-2 w-full transform rounded-xl bg-black px-4 py-3 font-bold text-white shadow-lg shadow-black/25 transition-all hover:-translate-y-0.5 hover:bg-black/90 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isPending ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Signing in...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  Sign In <BiLogIn className="h-5 w-5" />
                </span>
              )}
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default SigninPage;
