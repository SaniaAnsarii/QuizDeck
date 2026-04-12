"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

type ShortQuestion = {
  id: number;
  question: string;
  sample_answer: string;
};

type Feedback = {
  score: number;
  feedback: string;
};

export default function ShortAnswerPage() {
  const [questions, setQuestions] = useState<ShortQuestion[]>([]);
  const [current, setCurrent] = useState(0);
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [loading, setLoading] = useState(true);
  const [grading, setGrading] = useState(false);
  const [error, setError] = useState("");
  const [finished, setFinished] = useState(false);
  const [scores, setScores] = useState<number[]>([]);
  const router = useRouter();
const API_URL = process.env.NEXT_PUBLIC_API_URL
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) { router.push("/login"); return; }
    fetch(`${API_URL}/quiz/short-questions`)
      .then((r) => r.json())
      .then((data) => { setQuestions(data); setLoading(false); })
      .catch(() => { setError("Could not load questions."); setLoading(false); });
  }, []);

  const handleSubmit = async () => {
    if (!answer.trim()) return;
    setGrading(true);
    try {
      const res = await fetch(`${API_URL}/quiz/grade-short`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: questions[current].question,
          sample_answer: questions[current].sample_answer,
          user_answer: answer,
        }),
      });
      const data = await res.json();
      setFeedback(data);
      setScores((prev) => [...prev, data.score]);
    } catch {
      setError("Grading failed. Try again.");
    } finally {
      setGrading(false);
    }
  };

  const handleNext = () => {
    if (current + 1 < questions.length) {
      setCurrent(current + 1);
      setAnswer("");
      setFeedback(null);
    } else {
      setFinished(true);
    }
  };

  const avgScore = scores.length
    ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
    : 0;

  const progress = questions.length ? (current / questions.length) * 100 : 0;
  const q = questions[current];

  if (loading) return (
    <main className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#D8E2DC" }}>
      <div className="text-center">
        <div className="w-12 h-12 rounded-full border-4 animate-spin mx-auto mb-4"
          style={{ borderColor: "#7E6B8F", borderTopColor: "transparent" }} />
        <p className="text-sm font-medium" style={{ color: "#7E6B8F" }}>Loading questions...</p>
      </div>
    </main>
  );

  if (error) return (
    <main className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#D8E2DC" }}>
      <div className="rounded-2xl px-8 py-6 text-center shadow-lg" style={{ backgroundColor: "#fff" }}>
        <p className="text-sm font-medium mb-4" style={{ color: "#7a2030" }}>{error}</p>
        <button onClick={() => router.push("/home")}
          className="px-6 py-2 rounded-xl text-sm font-bold text-white"
          style={{ backgroundColor: "#7E6B8F" }}>← Back</button>
      </div>
    </main>
  );

  if (!questions.length) return (
    <main className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#D8E2DC" }}>
      <div className="rounded-2xl px-8 py-6 text-center shadow-lg" style={{ backgroundColor: "#fff" }}>
        <p className="text-2xl mb-2">📭</p>
        <p className="text-sm font-medium mb-4" style={{ color: "#7E6B8F" }}>
          No short answer questions yet. Add some in the Admin Panel.
        </p>
        <button onClick={() => router.push("/admin")}
          className="px-6 py-2 rounded-xl text-sm font-bold text-white"
          style={{ backgroundColor: "#C18C5D" }}>Go to Admin →</button>
      </div>
    </main>
  );

 
  if (finished) return (
    <main className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: "#D8E2DC" }}>
      <div className="w-full max-w-md rounded-3xl shadow-xl px-8 py-10 text-center" style={{ backgroundColor: "#fff" }}>
        <div className="text-5xl mb-4">{avgScore >= 70 ? "🎉" : avgScore >= 40 ? "💪" : "📚"}</div>
        <h2 className="text-2xl font-black mb-2" style={{ color: "#3a2e45" }}>Session Complete!</h2>
        <p className="text-sm mb-6" style={{ color: "#7E6B8F" }}>
          You answered {questions.length} question{questions.length > 1 ? "s" : ""}
        </p>
        <div className="rounded-2xl py-6 mb-6" style={{ backgroundColor: "#D8E2DC" }}>
          <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: "#7E6B8F" }}>Average Score</p>
          <p className="text-5xl font-black" style={{ color: avgScore >= 70 ? "#4a7c59" : avgScore >= 40 ? "#C18C5D" : "#7a2030" }}>
            {avgScore}%
          </p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => router.push("/home")}
            className="flex-1 py-3 rounded-xl text-sm font-bold border-2"
            style={{ borderColor: "#7E6B8F", color: "#7E6B8F" }}>← Home</button>
          <button onClick={() => { setCurrent(0); setAnswer(""); setFeedback(null); setScores([]); setFinished(false); }}
            className="flex-1 py-3 rounded-xl text-sm font-bold text-white"
            style={{ backgroundColor: "#C18C5D" }}>Try Again</button>
        </div>
      </div>
    </main>
  );

  return (
    <main className="min-h-screen px-4 py-12 relative overflow-hidden" style={{ backgroundColor: "#D8E2DC" }}>
      
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full opacity-40" style={{ backgroundColor: "#FFCAD4" }} />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 rounded-full opacity-30" style={{ backgroundColor: "#7E6B8F" }} />
      </div>

      <div className="relative z-10 max-w-xl mx-auto">
      
        <div className="flex items-center justify-between mb-6">
          <span className="text-xs font-bold uppercase tracking-widest" style={{ color: "#7E6B8F" }}>
            Short Answer
          </span>
          <span className="text-xs font-semibold px-3 py-1 rounded-full"
            style={{ backgroundColor: "#7E6B8F22", color: "#7E6B8F" }}>
            {current + 1} / {questions.length}
          </span>
        </div>

       
        <div className="w-full h-2 rounded-full mb-8 overflow-hidden" style={{ backgroundColor: "#fff" }}>
          <div className="h-full rounded-full transition-all duration-500"
            style={{ width: `${progress}%`, backgroundColor: "#C18C5D" }} />
        </div>

       
        <div className="rounded-3xl shadow-xl px-8 py-10" style={{ backgroundColor: "#fff" }}>
          <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: "#C18C5D" }}>
            Question {current + 1}
          </p>
          <h2 className="text-xl font-bold mb-6 leading-snug" style={{ color: "#3a2e45" }}>
            {q.question}
          </h2>

         
          <textarea
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="Type your answer here..."
            rows={5}
            disabled={!!feedback}
            className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all duration-200 border-2 resize-none mb-4"
            style={{
              backgroundColor: feedback ? "#f9f7f5" : "#f9f7f5",
              borderColor: feedback ? "#D8E2DC" : "#D8E2DC",
              color: "#3a2e45",
              opacity: feedback ? 0.7 : 1,
            }}
            onFocus={(e) => { if (!feedback) e.target.style.borderColor = "#7E6B8F"; }}
            onBlur={(e) => (e.target.style.borderColor = "#D8E2DC")}
          />

          
          {!feedback && (
            <button
              onClick={handleSubmit}
              disabled={!answer.trim() || grading}
              className="w-full py-3.5 rounded-xl font-bold text-sm text-white transition-all mb-2"
              style={{
                backgroundColor: !answer.trim() || grading ? "#C18C5D66" : "#C18C5D",
                boxShadow: !answer.trim() ? "none" : "0 6px 20px rgba(193,140,93,0.4)",
                cursor: !answer.trim() || grading ? "not-allowed" : "pointer",
              }}
            >
              {grading ? "Grading with AI..." : "Submit Answer →"}
            </button>
          )}

          
          {feedback && (
            <div className="mt-2 space-y-3">
              
              <div className="flex items-center justify-between rounded-2xl px-5 py-4"
                style={{ backgroundColor: "#D8E2DC" }}>
                <span className="text-sm font-bold" style={{ color: "#3a2e45" }}>Your Score</span>
                <span className="text-2xl font-black"
                  style={{ color: feedback.score >= 70 ? "#4a7c59" : feedback.score >= 40 ? "#C18C5D" : "#7a2030" }}>
                  {feedback.score}%
                </span>
              </div>

              
              <div className="rounded-2xl px-5 py-4 border-2" style={{ borderColor: "#D8E2DC" }}>
                <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: "#7E6B8F" }}>
                  AI Feedback
                </p>
                <p className="text-sm leading-relaxed" style={{ color: "#3a2e45" }}>
                  {feedback.feedback}
                </p>
              </div>

             
              <button onClick={handleNext}
                className="w-full py-3.5 rounded-xl font-bold text-sm text-white transition-all"
                style={{ backgroundColor: "#7E6B8F", boxShadow: "0 6px 20px rgba(126,107,143,0.35)" }}>
                {current + 1 === questions.length ? "See Results →" : "Next Question →"}
              </button>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}