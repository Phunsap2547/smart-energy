"use client";

import theme from "@/config/theme.js";

export default function AdminLoginPage() {
  return (
    <div
      className="flex min-h-screen items-center justify-center"
      style={{ backgroundColor: theme.page.background }}
    >
      <form className="bg-white p-8 rounded-card shadow-card w-full max-w-sm">
        <h1 className="text-xl font-bold mb-6" style={{ color: theme.page.heading }}>
          Admin Login
        </h1>

        <label className="block text-sm mb-1">Username</label>
        <input
          type="text"
          className="w-full border rounded-lg px-3 py-2 mb-4"
          placeholder="Enter username"
        />

        <label className="block text-sm mb-1">Password</label>
        <input
          type="password"
          className="w-full border rounded-lg px-3 py-2 mb-6"
          placeholder="Enter password"
        />

        <button
          type="submit"
          className="w-full py-2 rounded-lg font-semibold text-white"
          style={{ backgroundColor: theme.stats.realPower.border }}
        >
          Log in
        </button>
      </form>
    </div>
  );
}