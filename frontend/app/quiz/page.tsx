"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ApiConfigError } from "@/components/ApiConfigError";
import { getApiUrl } from "@/lib/api";

type Question = {
  id: number;
  question: string;
  options: string[];
};

export default function QuizPage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<number[]>([]);
  const [answers, setAnswers] = useState<number[][]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const API_URL = getApiUrl();
  useEffect(() => {
    if (!API_URL) {
      setLoading(false);
      return;
    }
    const token = localStorage.getItem("token");
    if (!token) { router.push("/login"); return; }
    fetch(`${API_URL}/quiz/questions`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => { setQuestions(data); setLoading(false); })
      .catch(() => { setError("Could not load questions."); setLoading(false); });
  }, [API_URL, router]);

  if (!API_URL) return <ApiConfigError />;

  const toggleOption = (idx: number) => {
    setSelected((prev) =>
      prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx]
    );
  };

  const handleNext = () => {
    const updated = [...answers, selected];
    if (current + 1 < questions.length) {
      setAnswers(updated);
      setSelected([]);
      setCurrent(current + 1);
    } else {
      handleSubmit(updated);
    }
  };

  const handleSubmit = async (finalAnswers: number[][]) => {
    setSubmitting(true);
    const token = localStorage.getItem("token");
    try {
      await fetch(`${API_URL}/quiz/submit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ answers: finalAnswers.map((a) => a[0] ?? 0) }),
      });
      router.push("/dashboard");
    } catch {
      setError("Submission failed. Try again.");
      setSubmitting(false);
    }
  };

  const progress = questions.length ? ((current) / questions.length) * 100 : 0;
  const q = questions[current];

  if (loading) return (
    <main className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#D8E2DC" }}>
      <div className="text-center">
        <div className="w-12 h-12 rounded-full border-4 border-t-transparent animate-spin mx-auto mb-4" style={{ borderColor: "#7E6B8F", borderTopColor: "transparent" }} />
        <p className="text-sm font-medium" style={{ color: "#7E6B8F" }}>Loading questions...</p>
      </div>
    </main>
  );

  if (error) return (
    <main className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#D8E2DC" }}>
      <div className="rounded-2xl px-8 py-6 text-center shadow-lg" style={{ backgroundColor: "#fff" }}>
        <p className="text-sm font-medium mb-4" style={{ color: "#7a2030" }}>{error}</p>
        <button onClick={() => router.push("/login")} className="px-6 py-2 rounded-xl text-sm font-bold text-white" style={{ backgroundColor: "#7E6B8F" }}>
          Back to Login
        </button>
      </div>
    </main>
  );

  if (!questions.length) return (
    <main className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#D8E2DC" }}>
      <div className="rounded-2xl px-8 py-6 text-center shadow-lg" style={{ backgroundColor: "#fff" }}>
        <p className="text-2xl mb-2">📭</p>
        <p className="text-sm font-medium" style={{ color: "#7E6B8F" }}>No questions found. Add some via the API first.</p>
      </div>
    </main>
  );

  return (
    <main className="min-h-screen px-4 py-12 relative overflow-hidden" style={{ backgroundColor: "#D8E2DC" }}>
      {/* Blobs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full opacity-40" style={{ backgroundColor: "#FFCAD4" }} />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 rounded-full opacity-30" style={{ backgroundColor: "#7E6B8F" }} />
      </div>

      <div className="relative z-10 max-w-xl mx-auto">
       
        <div className="flex items-center justify-between mb-6">
          <span className="text-xs font-bold uppercase tracking-widest" style={{ color: "#7E6B8F" }}>
            QuizDeck
          </span>
          <span className="text-xs font-semibold px-3 py-1 rounded-full" style={{ backgroundColor: "#7E6B8F22", color: "#7E6B8F" }}>
            {current + 1} / {questions.length}
          </span>
        </div>

        
        <div className="w-full h-2 rounded-full mb-8 overflow-hidden" style={{ backgroundColor: "#fff" }}>
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{ width: `${progress}%`, backgroundColor: "#C18C5D" }}
          />
        </div>

       
        <div className="rounded-3xl shadow-xl px-8 py-10" style={{ backgroundColor: "#FFFFFF" }}>
         
          <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: "#C18C5D" }}>
            Question {current + 1}
          </p>
          <h2 className="text-xl font-bold mb-8 leading-snug" style={{ color: "#3a2e45" }}>
            {q.question}
          </h2>

         
          <p className="text-xs mb-4 font-medium" style={{ color: "#7E6B8F99" }}>
            {selected.length <= 1 ? "Select one or more answers" : `${selected.length} selected`}
          </p>

          
          <div className="space-y-3 mb-10">
            {q.options.map((opt, idx) => {
              const isSelected = selected.includes(idx);
              return (
                <button
                  key={idx}
                  onClick={() => toggleOption(idx)}
                  className="w-full text-left px-5 py-4 rounded-2xl text-sm font-medium transition-all duration-150 border-2"
                  style={{
                    backgroundColor: isSelected ? "#7E6B8F15" : "#f9f7f5",
                    borderColor: isSelected ? "#7E6B8F" : "#D8E2DC",
                    color: isSelected ? "#3a2e45" : "#555",
                    boxShadow: isSelected ? "0 4px 12px rgba(126,107,143,0.2)" : "none",
                  }}
                >
                  <span
                    className="inline-flex items-center justify-center w-6 h-6 rounded-lg text-xs font-bold mr-3"
                    style={{
                      backgroundColor: isSelected ? "#7E6B8F" : "#D8E2DC",
                      color: isSelected ? "#fff" : "#7E6B8F",
                    }}
                  >
                    {String.fromCharCode(65 + idx)}
                  </span>
                  {opt}
                </button>
              );
            })}
          </div>

          
          <button
            onClick={handleNext}
            disabled={selected.length === 0 || submitting}
            className="w-full py-3.5 rounded-xl font-bold text-sm tracking-wide text-white transition-all duration-200"
            style={{
              backgroundColor: selected.length === 0 || submitting ? "#C18C5D66" : "#C18C5D",
              boxShadow: selected.length === 0 ? "none" : "0 6px 20px rgba(193,140,93,0.4)",
              cursor: selected.length === 0 || submitting ? "not-allowed" : "pointer",
            }}
          >
            {submitting ? "Submitting..." : current + 1 === questions.length ? "Submit Quiz →" : "Next →"}
          </button>
        </div>
      </div>
    </main>
  );
}