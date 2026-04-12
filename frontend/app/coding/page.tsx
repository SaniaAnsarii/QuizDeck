"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ApiConfigError } from "@/components/ApiConfigError";
import { getApiUrl } from "@/lib/api";

type CodingQuestion = {
  id: number;
  title: string;
  description: string;
  test_input: string;
  expected_output: string;
};

const LANGUAGES = [
  { label: "Python", id: "python", version: "3.10.0" },
  { label: "JavaScript", id: "javascript", version: "18.15.0" },
  { label: "Java", id: "java", version: "15.0.2" },
  { label: "C++", id: "cpp", version: "10.2.0" },
];

const STARTERS: Record<string, string> = {
  python: "# Write your solution here\n\n",
  javascript: "// Write your solution here\n\n",
  java: `public class Solution {\n    public static void main(String[] args) {\n        // Write your solution here\n    }\n}\n`,
  cpp: `#include <iostream>\nusing namespace std;\n\nint main() {\n    // Write your solution here\n    return 0;\n}\n`,
};

export default function CodingPage() {
  const API_URL = getApiUrl();
  const [questions, setQuestions] = useState<CodingQuestion[]>([]);
  const [current, setCurrent] = useState(0);
  const [code, setCode] = useState(STARTERS["python"]);
  const [language, setLanguage] = useState(LANGUAGES[0]);
  const [output, setOutput] = useState("");
  const [verdict, setVerdict] = useState<"pass" | "fail" | null>(null);
  const [running, setRunning] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [finished, setFinished] = useState(false);
  const [passed, setPassed] = useState(0);
  const router = useRouter();

  useEffect(() => {
    if (!API_URL) {
      setLoading(false);
      return;
    }
    const token = localStorage.getItem("token");
    if (!token) { router.push("/login"); return; }
    fetch(`${API_URL}/quiz/coding-questions`)
      .then((r) => r.json())
      .then((data) => { setQuestions(data); setLoading(false); })
      .catch(() => { setError("Could not load problems."); setLoading(false); });
  }, [API_URL, router]);

  if (!API_URL) return <ApiConfigError />;

  const handleLanguageChange = (lang: typeof LANGUAGES[0]) => {
    setLanguage(lang);
    setCode(STARTERS[lang.id]);
    setOutput("");
    setVerdict(null);
  };

  const runCode = async () => {
    setRunning(true);
    setOutput("");
    setVerdict(null);
    const q = questions[current];
    try {
      const res = await fetch("https://emkc.org/api/v2/piston/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          language: language.id,
          version: language.version,
          files: [{ content: code }],
          stdin: q.test_input || "",
        }),
      });
      const data = await res.json();
      const resultOutput = data.run?.output?.trim() || data.run?.stderr?.trim() || "No output";
      setOutput(resultOutput);

      if (q.expected_output) {
        const pass = resultOutput.trim() === q.expected_output.trim();
        setVerdict(pass ? "pass" : "fail");
        if (pass) setPassed((p) => p + 1);
      }
    } catch {
      setOutput("Error connecting to code runner.");
    } finally {
      setRunning(false);
    }
  };

  const handleNext = () => {
    if (current + 1 < questions.length) {
      setCurrent(current + 1);
      setCode(STARTERS[language.id]);
      setOutput("");
      setVerdict(null);
    } else {
      setFinished(true);
    }
  };

  if (loading) return (
    <main className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#D8E2DC" }}>
      <div className="text-center">
        <div className="w-12 h-12 rounded-full border-4 animate-spin mx-auto mb-4"
          style={{ borderColor: "#7E6B8F", borderTopColor: "transparent" }} />
        <p className="text-sm font-medium" style={{ color: "#7E6B8F" }}>Loading problems...</p>
      </div>
    </main>
  );

  if (error) return (
    <main className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#D8E2DC" }}>
      <div className="rounded-2xl px-8 py-6 text-center shadow-lg" style={{ backgroundColor: "#fff" }}>
        <p className="text-sm font-medium mb-4" style={{ color: "#7a2030" }}>{error}</p>
        <button onClick={() => router.push("/home")} className="px-6 py-2 rounded-xl text-sm font-bold text-white" style={{ backgroundColor: "#7E6B8F" }}>← Back</button>
      </div>
    </main>
  );

  if (!questions.length) return (
    <main className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#D8E2DC" }}>
      <div className="rounded-2xl px-8 py-6 text-center shadow-lg" style={{ backgroundColor: "#fff" }}>
        <p className="text-2xl mb-2">📭</p>
        <p className="text-sm font-medium mb-4" style={{ color: "#7E6B8F" }}>No coding problems yet. Add some in the Admin Panel.</p>
        <button onClick={() => router.push("/admin")} className="px-6 py-2 rounded-xl text-sm font-bold text-white" style={{ backgroundColor: "#C18C5D" }}>Go to Admin →</button>
      </div>
    </main>
  );

  if (finished) return (
    <main className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: "#D8E2DC" }}>
      <div className="w-full max-w-md rounded-3xl shadow-xl px-8 py-10 text-center" style={{ backgroundColor: "#fff" }}>
        <div className="text-5xl mb-4">{passed === questions.length ? "🏆" : passed > 0 ? "💪" : "📚"}</div>
        <h2 className="text-2xl font-black mb-2" style={{ color: "#3a2e45" }}>Session Complete!</h2>
        <p className="text-sm mb-6" style={{ color: "#7E6B8F" }}>
          You solved {passed} of {questions.length} problem{questions.length > 1 ? "s" : ""}
        </p>
        <div className="rounded-2xl py-6 mb-6" style={{ backgroundColor: "#D8E2DC" }}>
          <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: "#7E6B8F" }}>Score</p>
          <p className="text-5xl font-black"
            style={{ color: passed === questions.length ? "#4a7c59" : passed > 0 ? "#C18C5D" : "#7a2030" }}>
            {questions.length > 0 ? Math.round((passed / questions.length) * 100) : 0}%
          </p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => router.push("/home")}
            className="flex-1 py-3 rounded-xl text-sm font-bold border-2"
            style={{ borderColor: "#7E6B8F", color: "#7E6B8F" }}>← Home</button>
          <button onClick={() => { setCurrent(0); setCode(STARTERS[language.id]); setOutput(""); setVerdict(null); setPassed(0); setFinished(false); }}
            className="flex-1 py-3 rounded-xl text-sm font-bold text-white"
            style={{ backgroundColor: "#C18C5D" }}>Try Again</button>
        </div>
      </div>
    </main>
  );

  const q = questions[current];

  return (
    <main className="min-h-screen px-4 py-10 relative overflow-hidden" style={{ backgroundColor: "#D8E2DC" }}>
     
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full opacity-30" style={{ backgroundColor: "#FFCAD4" }} />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 rounded-full opacity-20" style={{ backgroundColor: "#7E6B8F" }} />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto">
       
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest" style={{ color: "#7E6B8F" }}>Coding Problems</p>
            <h1 className="text-xl font-black" style={{ color: "#3a2e45" }}>{q.title}</h1>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold px-3 py-1 rounded-full"
              style={{ backgroundColor: "#7E6B8F22", color: "#7E6B8F" }}>
              {current + 1} / {questions.length}
            </span>
            <button onClick={() => router.push("/home")}
              className="px-4 py-2 rounded-xl text-xs font-bold border-2"
              style={{ borderColor: "#7E6B8F", color: "#7E6B8F" }}>← Home</button>
          </div>
        </div>

        
        <div className="w-full h-2 rounded-full mb-6 overflow-hidden" style={{ backgroundColor: "#fff" }}>
          <div className="h-full rounded-full transition-all duration-500"
            style={{ width: `${(current / questions.length) * 100}%`, backgroundColor: "#C18C5D" }} />
        </div>

       
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

         
          <div className="rounded-3xl shadow-xl px-7 py-7" style={{ backgroundColor: "#fff" }}>
            <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "#C18C5D" }}>Problem</p>
            <p className="text-sm leading-relaxed mb-6" style={{ color: "#3a2e45" }}>{q.description}</p>

            {q.test_input && (
              <div className="mb-3">
                <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: "#7E6B8F" }}>Test Input</p>
                <pre className="text-xs rounded-xl px-4 py-3 overflow-x-auto"
                  style={{ backgroundColor: "#D8E2DC", color: "#3a2e45" }}>{q.test_input}</pre>
              </div>
            )}
            {q.expected_output && (
              <div>
                <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: "#7E6B8F" }}>Expected Output</p>
                <pre className="text-xs rounded-xl px-4 py-3 overflow-x-auto"
                  style={{ backgroundColor: "#D8E2DC", color: "#3a2e45" }}>{q.expected_output}</pre>
              </div>
            )}
          </div>

         
          <div className="rounded-3xl shadow-xl px-7 py-7 flex flex-col gap-4" style={{ backgroundColor: "#fff" }}>
           
            <div className="flex gap-2 flex-wrap">
              {LANGUAGES.map((lang) => (
                <button key={lang.id} onClick={() => handleLanguageChange(lang)}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
                  style={
                    language.id === lang.id
                      ? { backgroundColor: "#7E6B8F", color: "#fff" }
                      : { backgroundColor: "#D8E2DC", color: "#7E6B8F" }
                  }>
                  {lang.label}
                </button>
              ))}
            </div>

           
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              rows={12}
              spellCheck={false}
              className="w-full px-4 py-3 rounded-xl text-xs outline-none border-2 resize-none font-mono"
              style={{
                backgroundColor: "#1e1e2e",
                borderColor: "#D8E2DC",
                color: "#cdd6f4",
                lineHeight: "1.6",
              }}
              onFocus={(e) => (e.target.style.borderColor = "#7E6B8F")}
              onBlur={(e) => (e.target.style.borderColor = "#D8E2DC")}
            />

           
            <button onClick={runCode} disabled={running}
              className="w-full py-3 rounded-xl font-bold text-sm text-white transition-all"
              style={{
                backgroundColor: running ? "#4a7c5999" : "#4a7c59",
                boxShadow: running ? "none" : "0 6px 20px rgba(74,124,89,0.35)",
                cursor: running ? "not-allowed" : "pointer",
              }}>
              {running ? "Running..." : "▶ Run Code"}
            </button>

            
            {output && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-bold uppercase tracking-widest" style={{ color: "#7E6B8F" }}>Output</p>
                  {verdict && (
                    <span className="text-xs font-bold px-3 py-1 rounded-full"
                      style={{
                        backgroundColor: verdict === "pass" ? "#4a7c5920" : "#7a203020",
                        color: verdict === "pass" ? "#4a7c59" : "#7a2030",
                      }}>
                      {verdict === "pass" ? "✓ Passed" : "✗ Wrong Answer"}
                    </span>
                  )}
                </div>
                <pre className="text-xs rounded-xl px-4 py-3 overflow-x-auto"
                  style={{
                    backgroundColor: verdict === "pass" ? "#4a7c5915" : verdict === "fail" ? "#7a203015" : "#1e1e2e",
                    color: verdict === "pass" ? "#4a7c59" : verdict === "fail" ? "#7a2030" : "#cdd6f4",
                    border: `1px solid ${verdict === "pass" ? "#4a7c5940" : verdict === "fail" ? "#7a203040" : "#ffffff10"}`,
                  }}>
                  {output}
                </pre>
              </div>
            )}

            
            {verdict && (
              <button onClick={handleNext}
                className="w-full py-3 rounded-xl font-bold text-sm text-white transition-all"
                style={{ backgroundColor: "#7E6B8F", boxShadow: "0 6px 20px rgba(126,107,143,0.35)" }}>
                {current + 1 === questions.length ? "See Results →" : "Next Problem →"}
              </button>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}