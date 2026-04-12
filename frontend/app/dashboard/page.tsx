"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ApiConfigError } from "@/components/ApiConfigError";
import { getApiUrl } from "@/lib/api";

type DashboardData = {
  totalQuizzes: number;
  averageScore: number;
  weakTopics: string[];
};

const quizOptions = [
  { title: "MCQ Quiz", description: "Multiple choice questions", icon: "🧠", href: "/quiz", color: "#7E6B8F", shadow: "rgba(126,107,143,0.35)" },
  { title: "Short Answer", description: "AI grades your response", icon: "✍️", href: "/short-answer", color: "#C18C5D", shadow: "rgba(193,140,93,0.35)" },
  { title: "Coding Problem", description: "Write and run real code", icon: "💻", href: "/coding", color: "#4a7c59", shadow: "rgba(74,124,89,0.35)" },
];

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [adminInput, setAdminInput] = useState("");
  const [showAdminPrompt, setShowAdminPrompt] = useState(false);
  const [adminError, setAdminError] = useState("");
  const router = useRouter();
  const API_URL = getApiUrl();

  useEffect(() => {
    if (!API_URL) {
      setLoading(false);
      return;
    }
    const token = localStorage.getItem("token");
    if (!token) { router.push("/login"); return; }
    fetch(`${API_URL}/dashboard/`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((d) => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, [API_URL, router]);

  if (!API_URL) return <ApiConfigError />;

  const handleAdminAccess = () => {
    if (adminInput === "#admin") {
      setShowAdminPrompt(false);
      setAdminInput("");
      setAdminError("");
      router.push("/admin");
    } else {
      setAdminError("Wrong code. Try again.");
    }
  };

  const scoreColor = !data ? "#C18C5D"
    : data.averageScore >= 70 ? "#4a7c59"
    : data.averageScore >= 40 ? "#C18C5D"
    : "#7a2030";

  const scoreLabel = !data ? ""
    : data.averageScore >= 70 ? "Great job! 🎉"
    : data.averageScore >= 40 ? "Keep practicing 💪"
    : "Needs work 📚";

  if (loading) return (
    <main className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#D8E2DC" }}>
      <div className="text-center">
        <div className="w-12 h-12 rounded-full border-4 animate-spin mx-auto mb-4"
          style={{ borderColor: "#7E6B8F", borderTopColor: "transparent" }} />
        <p className="text-sm font-medium" style={{ color: "#7E6B8F" }}>Loading...</p>
      </div>
    </main>
  );

  return (
    <main className="min-h-screen px-4 py-12 relative overflow-hidden" style={{ backgroundColor: "#D8E2DC" }}>
     
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-20 -left-20 w-80 h-80 rounded-full opacity-40" style={{ backgroundColor: "#FFCAD4" }} />
        <div className="absolute -bottom-20 -right-20 w-96 h-96 rounded-full opacity-30" style={{ backgroundColor: "#7E6B8F" }} />
      </div>

      
      {showAdminPrompt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4"
          style={{ backgroundColor: "rgba(0,0,0,0.4)", backdropFilter: "blur(4px)" }}>
          <div className="w-full max-w-sm rounded-3xl shadow-2xl px-8 py-8" style={{ backgroundColor: "#fff" }}>
            <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: "#C18C5D" }}>Admin Access</p>
            <h2 className="text-xl font-black mb-2" style={{ color: "#3a2e45" }}>Enter Access Code</h2>
            <p className="text-sm mb-5" style={{ color: "#7E6B8F" }}>This area is restricted. Enter the admin code to continue.</p>
            <input
              type="password"
              value={adminInput}
              onChange={(e) => { setAdminInput(e.target.value); setAdminError(""); }}
              onKeyDown={(e) => e.key === "Enter" && handleAdminAccess()}
              placeholder="Enter code..."
              className="w-full px-4 py-3 rounded-xl text-sm outline-none border-2 mb-3"
              style={{ backgroundColor: "#f9f7f5", borderColor: adminError ? "#f4a0b0" : "#D8E2DC", color: "#3a2e45" }}
              onFocus={(e) => (e.target.style.borderColor = "#7E6B8F")}
              onBlur={(e) => (e.target.style.borderColor = adminError ? "#f4a0b0" : "#D8E2DC")}
              autoFocus
            />
            {adminError && (
              <p className="text-xs font-medium mb-3" style={{ color: "#7a2030" }}>{adminError}</p>
            )}
            <div className="flex gap-3">
              <button onClick={() => { setShowAdminPrompt(false); setAdminInput(""); setAdminError(""); }}
                className="flex-1 py-3 rounded-xl text-sm font-bold border-2"
                style={{ borderColor: "#7E6B8F", color: "#7E6B8F" }}>Cancel</button>
              <button onClick={handleAdminAccess}
                className="flex-1 py-3 rounded-xl text-sm font-bold text-white"
                style={{ backgroundColor: "#C18C5D" }}>Enter →</button>
            </div>
          </div>
        </div>
      )}

      <div className="relative z-10 max-w-2xl mx-auto">
       
        <div className="flex items-center justify-between mb-8">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: "#7E6B8F" }}>QuizDeck</p>
            <h1 className="text-3xl font-black" style={{ color: "#3a2e45" }}>Dashboard</h1>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setShowAdminPrompt(true)}
              className="px-4 py-2 rounded-xl text-xs font-bold border-2 transition-all"
              style={{ borderColor: "#3a2e45", color: "#3a2e45" }}>⚙️ Admin</button>
            <button onClick={() => { localStorage.removeItem("token"); router.push("/login"); }}
              className="px-4 py-2 rounded-xl text-xs font-bold border-2"
              style={{ borderColor: "#7E6B8F", color: "#7E6B8F" }}>Logout</button>
          </div>
        </div>

       
        <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "#7E6B8F" }}>
          Choose a quiz type
        </p>
        <div className="grid grid-cols-1 gap-3 mb-8">
          {quizOptions.map((opt) => (
            <button key={opt.title} onClick={() => router.push(opt.href)}
              className="w-full text-left rounded-2xl px-6 py-5 shadow-md flex items-center gap-5 transition-all duration-200"
              style={{ backgroundColor: "#fff" }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.boxShadow = `0 8px 24px ${opt.shadow}`;
                (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.boxShadow = "0 2px 8px rgba(0,0,0,0.06)";
                (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
              }}>
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-xl flex-shrink-0"
                style={{ backgroundColor: `${opt.color}18` }}>
                {opt.icon}
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold" style={{ color: "#3a2e45" }}>{opt.title}</p>
                <p className="text-xs" style={{ color: "#7E6B8F" }}>{opt.description}</p>
              </div>
              <span style={{ color: opt.color }}>→</span>
            </button>
          ))}
        </div>

       
        <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "#7E6B8F" }}>
          Your stats
        </p>
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="rounded-2xl shadow-md px-5 py-5 col-span-1" style={{ backgroundColor: "#fff" }}>
            <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: "#C18C5D" }}>Score</p>
            <p className="text-3xl font-black" style={{ color: scoreColor }}>{data?.averageScore ?? 0}%</p>
            <p className="text-xs mt-0.5" style={{ color: "#7E6B8F" }}>{scoreLabel}</p>
          </div>
          <div className="rounded-2xl shadow-md px-5 py-5" style={{ backgroundColor: "#fff" }}>
            <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: "#C18C5D" }}>Quizzes</p>
            <p className="text-3xl font-black" style={{ color: "#3a2e45" }}>{data?.totalQuizzes ?? 0}</p>
            <p className="text-xs mt-0.5" style={{ color: "#7E6B8F" }}>completed</p>
          </div>
          <div className="rounded-2xl shadow-md px-5 py-5" style={{ backgroundColor: "#fff" }}>
            <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: "#C18C5D" }}>Weak</p>
            <p className="text-3xl font-black" style={{ color: "#3a2e45" }}>{data?.weakTopics?.length ?? 0}</p>
            <p className="text-xs mt-0.5" style={{ color: "#7E6B8F" }}>topics</p>
          </div>
        </div>

        
        {data?.weakTopics && data.weakTopics.length > 0 && (
          <div className="rounded-2xl shadow-md px-6 py-5" style={{ backgroundColor: "#fff" }}>
            <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: "#C18C5D" }}>Focus Areas</p>
            <div className="flex flex-wrap gap-2">
              {data.weakTopics.map((topic) => (
                <span key={topic} className="px-3 py-1.5 rounded-full text-xs font-bold"
                  style={{ backgroundColor: "#FFCAD4", color: "#7a2030" }}>{topic}</span>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}