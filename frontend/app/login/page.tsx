"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiUrlErrorMessage, getApiUrl } from "@/lib/api";

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const router = useRouter();
  const API_URL = getApiUrl();

  useEffect(() => {
    if (!API_URL) setError(apiUrlErrorMessage());
  }, [API_URL]);

  const handleSubmit = async () => {
    setError("");
    setSuccess("");
    if (!API_URL) {
      setError(apiUrlErrorMessage());
      return;
    }
    setLoading(true);
    const endpoint = isLogin ? "/auth/login" : "/auth/register";
    try {
      const res = await fetch(`${API_URL}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.detail || "Something went wrong");
      } else if (isLogin) {
        localStorage.setItem("token", data.token);
        router.push("/dashboard");
      } else {
        setSuccess("Account created! You can now log in.");
        setIsLogin(true);
      }
    } catch {
      setError(
        "Cannot reach the API. If this is production, confirm NEXT_PUBLIC_API_URL points to your hosted FastAPI and CORS allows this site."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main
      className="min-h-screen flex items-center justify-center px-4 py-12 relative overflow-hidden"
      style={{ backgroundColor: "#D8E2DC" }}
    >
      {/* Blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full opacity-50" style={{ backgroundColor: "#FFCAD4" }} />
        <div className="absolute -bottom-32 -right-16 w-[500px] h-[500px] rounded-full opacity-40" style={{ backgroundColor: "#7E6B8F" }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full opacity-20" style={{ backgroundColor: "#C18C5D" }} />
      </div>

      {/* Card */}
      <div className="relative w-full max-w-md rounded-3xl shadow-2xl px-10 py-12 z-10" style={{ backgroundColor: "#FFFFFF" }}>
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl text-2xl mb-4 shadow-md" style={{ backgroundColor: "#7E6B8F" }}>
            🎯
          </div>
          <h1 className="text-3xl font-bold tracking-tight" style={{ color: "#3a2e45" }}>
            QuizDeck
          </h1>
          <p className="mt-2 text-sm" style={{ color: "#7E6B8F" }}>
            {isLogin ? "Welcome back! Ready to practice?" : "Create your account to get started"}
          </p>
        </div>

        {/* Toggle */}
        <div className="flex rounded-xl p-1 mb-8" style={{ backgroundColor: "#D8E2DC" }}>
          {["Login", "Register"].map((label) => (
            <button
              key={label}
              onClick={() => { setIsLogin(label === "Login"); setError(""); setSuccess(""); }}
              className="flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200"
              style={
                (isLogin && label === "Login") || (!isLogin && label === "Register")
                  ? { backgroundColor: "#7E6B8F", color: "#FFFFFF", boxShadow: "0 4px 12px rgba(126,107,143,0.35)" }
                  : { backgroundColor: "transparent", color: "#7E6B8F" }
              }
            >
              {label}
            </button>
          ))}
        </div>

        {/* Inputs */}
        <div className="space-y-5 mb-6">
          {[
            { label: "Email", value: email, setter: setEmail, type: "email", placeholder: "you@example.com" },
            { label: "Password", value: password, setter: setPassword, type: "password", placeholder: "••••••••" },
          ].map(({ label, value, setter, type, placeholder }) => (
            <div key={label}>
              <label className="block text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: "#C18C5D" }}>
                {label}
              </label>
              <input
                type={type}
                value={value}
                placeholder={placeholder}
                onChange={(e) => setter(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all duration-200 border-2"
                style={{ backgroundColor: "#f9f7f5", borderColor: "#D8E2DC", color: "#3a2e45" }}
                onFocus={(e) => (e.target.style.borderColor = "#7E6B8F")}
                onBlur={(e) => (e.target.style.borderColor = "#D8E2DC")}
              />
            </div>
          ))}
        </div>

        {/* Error / Success */}
        {error && (
          <div className="rounded-xl px-4 py-3 mb-5 text-sm font-medium" style={{ backgroundColor: "#FFCAD4", color: "#7a2030", border: "1px solid #f4a0b0" }}>
            {error}
          </div>
        )}
        {success && (
          <div className="rounded-xl px-4 py-3 mb-5 text-sm font-medium" style={{ backgroundColor: "#D8E2DC", color: "#2d5a3d", border: "1px solid #a8c8b4" }}>
            {success}
          </div>
        )}

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full py-3.5 rounded-xl font-bold text-sm tracking-wide text-white transition-all duration-200"
          style={{
            backgroundColor: loading ? "#C18C5D99" : "#C18C5D",
            boxShadow: loading ? "none" : "0 6px 20px rgba(193,140,93,0.4)",
            cursor: loading ? "not-allowed" : "pointer",
          }}
        >
          {loading ? "Please wait..." : isLogin ? "Login →" : "Create Account →"}
        </button>

        {/* Switch */}
        <p className="text-center mt-6 text-xs" style={{ color: "#7E6B8F" }}>
          {isLogin ? "No account? " : "Already have one? "}
          <span
            onClick={() => { setIsLogin(!isLogin); setError(""); setSuccess(""); }}
            className="font-bold cursor-pointer underline underline-offset-2"
            style={{ color: "#C18C5D" }}
          >
            {isLogin ? "Register" : "Login"}
          </span>
        </p>
      </div>
    </main>
  );
}