"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ApiConfigError } from "@/components/ApiConfigError";
import { getApiUrl } from "@/lib/api";

type Tab = "mcq" | "short" | "coding";
type ViewTab = "create" | "view";

type MCQQuestion = { id: number; question: string; options: string[]; answers: number[] };
type ShortQuestion = { id: number; question: string; sample_answer: string };
type CodingQuestion = { id: number; title: string; description: string; test_input: string; expected_output: string };

export default function AdminPage() {
  const [tab, setTab] = useState<Tab>("mcq");
  const [viewTab, setViewTab] = useState<ViewTab>("create");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  
  const [mcqList, setMcqList] = useState<MCQQuestion[]>([]);
  const [shortList, setShortList] = useState<ShortQuestion[]>([]);
  const [codingList, setCodingList] = useState<CodingQuestion[]>([]);
  const [listLoading, setListLoading] = useState(false);


  const [mcqQuestion, setMcqQuestion] = useState("");
  const [mcqOptions, setMcqOptions] = useState(["", "", "", ""]);
  const [mcqAnswers, setMcqAnswers] = useState<number[]>([]);

  
  const [shortQuestion, setShortQuestion] = useState("");
  const [shortSampleAnswer, setShortSampleAnswer] = useState("");

 
  const [codingTitle, setCodingTitle] = useState("");
  const [codingDescription, setCodingDescription] = useState("");
  const [codingTestInput, setCodingTestInput] = useState("");
  const [codingExpectedOutput, setCodingExpectedOutput] = useState("");
  const API_URL = getApiUrl();
  const notify = (msg: string, isError = false) => {
    if (isError) { setError(msg); setSuccess(""); }
    else { setSuccess(msg); setError(""); }
    setTimeout(() => { setSuccess(""); setError(""); }, 3000);
  };

  const fetchQuestions = async () => {
    setListLoading(true);
    try {
      const [mcq, short, coding] = await Promise.all([
        fetch(`${API_URL}/quiz/questions`).then((r) => r.json()),
        fetch(`${API_URL}/quiz/short-questions`).then((r) => r.json()),
        fetch(`${API_URL}/quiz/coding-questions`).then((r) => r.json()),
      ]);
      setMcqList(mcq);
      setShortList(short);
      setCodingList(coding);
    } catch {
      notify("Failed to load questions", true);
    } finally {
      setListLoading(false);
    }
  };

  useEffect(() => {
    if (!API_URL || viewTab !== "view") return;
    fetchQuestions();
  }, [viewTab, tab, API_URL]);

  const submitMCQ = async () => {
    if (!mcqQuestion || mcqOptions.some((o) => !o) || mcqAnswers.length === 0)
      return notify("Fill all fields and select at least one correct answer", true);
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/quiz/questions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: mcqQuestion, options: mcqOptions, correct_answers: mcqAnswers }),
      });
      if (!res.ok) throw new Error();
      notify("MCQ question added!");
      setMcqQuestion(""); setMcqOptions(["", "", "", ""]); setMcqAnswers([]);
    } catch { notify("Failed to add question", true); }
    finally { setLoading(false); }
  };

  const submitShort = async () => {
    if (!shortQuestion) return notify("Enter a question", true);
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/quiz/short-questions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: shortQuestion, sample_answer: shortSampleAnswer }),
      });
      if (!res.ok) throw new Error();
      notify("Short answer question added!");
      setShortQuestion(""); setShortSampleAnswer("");
    } catch { notify("Failed to add question", true); }
    finally { setLoading(false); }
  };

  const submitCoding = async () => {
    if (!codingTitle || !codingDescription) return notify("Fill title and description", true);
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/quiz/coding-questions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: codingTitle, description: codingDescription, test_input: codingTestInput, expected_output: codingExpectedOutput }),
      });
      if (!res.ok) throw new Error();
      notify("Coding problem added!");
      setCodingTitle(""); setCodingDescription(""); setCodingTestInput(""); setCodingExpectedOutput("");
    } catch { notify("Failed to add problem", true); }
    finally { setLoading(false); }
  };

  const deleteQuestion = async (type: Tab, id: number) => {
    try {
      await fetch(`${API_URL}/quiz/${type}-questions/${id}`, { method: "DELETE" });
      fetchQuestions();
      notify("Deleted!");
    } catch { notify("Delete failed", true); }
  };

  const tabs: { key: Tab; label: string; icon: string }[] = [
    { key: "mcq", label: "MCQ", icon: "🧠" },
    { key: "short", label: "Short Answer", icon: "✍️" },
    { key: "coding", label: "Coding", icon: "💻" },
  ];

  const inputStyle = { backgroundColor: "#f9f7f5", borderColor: "#D8E2DC", color: "#3a2e45" };
  const inputClass = "w-full px-4 py-3 rounded-xl text-sm outline-none transition-all duration-200 border-2";

  if (!API_URL) return <ApiConfigError />;

  return (
    <main className="min-h-screen px-4 py-12 relative overflow-hidden" style={{ backgroundColor: "#D8E2DC" }}>
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-24 -left-24 w-80 h-80 rounded-full opacity-40" style={{ backgroundColor: "#FFCAD4" }} />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 rounded-full opacity-30" style={{ backgroundColor: "#7E6B8F" }} />
      </div>

      <div className="relative z-10 max-w-2xl mx-auto">
     
        <div className="flex items-center justify-between mb-8">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: "#7E6B8F" }}>Admin Panel</p>
            <h1 className="text-2xl font-black" style={{ color: "#3a2e45" }}>Manage Questions</h1>
          </div>
          <button onClick={() => router.push("/dashboard")}
            className="px-4 py-2 rounded-xl text-xs font-bold border-2"
            style={{ borderColor: "#7E6B8F", color: "#7E6B8F" }}>← Back</button>
        </div>

        
        <div className="flex rounded-xl p-1 mb-4" style={{ backgroundColor: "#fff" }}>
          {(["create", "view"] as ViewTab[]).map((v) => (
            <button key={v} onClick={() => setViewTab(v)}
              className="flex-1 py-2.5 rounded-lg text-xs font-bold transition-all duration-200 capitalize"
              style={viewTab === v
                ? { backgroundColor: "#3a2e45", color: "#fff", boxShadow: "0 4px 12px rgba(58,46,69,0.3)" }
                : { backgroundColor: "transparent", color: "#3a2e45" }}>
              {v === "create" ? "➕ Create" : "📋 View All"}
            </button>
          ))}
        </div>

       
        <div className="flex rounded-xl p-1 mb-6" style={{ backgroundColor: "#fff" }}>
          {tabs.map((t) => (
            <button key={t.key} onClick={() => { setTab(t.key); setSuccess(""); setError(""); }}
              className="flex-1 py-2.5 rounded-lg text-xs font-bold transition-all duration-200 flex items-center justify-center gap-1.5"
              style={tab === t.key
                ? { backgroundColor: "#7E6B8F", color: "#fff", boxShadow: "0 4px 12px rgba(126,107,143,0.35)" }
                : { backgroundColor: "transparent", color: "#7E6B8F" }}>
              {t.icon} {t.label}
            </button>
          ))}
        </div>

       
        {viewTab === "create" && (
          <div className="rounded-3xl shadow-xl px-8 py-8" style={{ backgroundColor: "#fff" }}>
          
            {tab === "mcq" && (
              <div className="space-y-5">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: "#C18C5D" }}>Question</label>
                  <textarea value={mcqQuestion} onChange={(e) => setMcqQuestion(e.target.value)}
                    placeholder="Enter your question..." rows={3} className={inputClass} style={inputStyle}
                    onFocus={(e) => (e.target.style.borderColor = "#7E6B8F")}
                    onBlur={(e) => (e.target.style.borderColor = "#D8E2DC")} />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: "#C18C5D" }}>
                    Options <span className="normal-case font-normal" style={{ color: "#7E6B8F" }}>(click letter to mark correct)</span>
                  </label>
                  <div className="space-y-2">
                    {mcqOptions.map((opt, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <button onClick={() => setMcqAnswers((prev) => prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx])}
                          className="w-8 h-8 flex-shrink-0 rounded-lg text-xs font-bold transition-all"
                          style={{ backgroundColor: mcqAnswers.includes(idx) ? "#7E6B8F" : "#D8E2DC", color: mcqAnswers.includes(idx) ? "#fff" : "#7E6B8F" }}>
                          {String.fromCharCode(65 + idx)}
                        </button>
                        <input type="text" value={opt} placeholder={`Option ${String.fromCharCode(65 + idx)}`}
                          onChange={(e) => { const u = [...mcqOptions]; u[idx] = e.target.value; setMcqOptions(u); }}
                          className={inputClass} style={inputStyle}
                          onFocus={(e) => (e.target.style.borderColor = "#7E6B8F")}
                          onBlur={(e) => (e.target.style.borderColor = "#D8E2DC")} />
                      </div>
                    ))}
                  </div>
                  {mcqAnswers.length > 0 && (
                    <p className="text-xs mt-2 font-medium" style={{ color: "#4a7c59" }}>
                      ✓ Correct: {mcqAnswers.map((i) => String.fromCharCode(65 + i)).join(", ")}
                    </p>
                  )}
                </div>
                <button onClick={submitMCQ} disabled={loading}
                  className="w-full py-3.5 rounded-xl font-bold text-sm text-white"
                  style={{ backgroundColor: loading ? "#C18C5D99" : "#C18C5D", cursor: loading ? "not-allowed" : "pointer" }}>
                  {loading ? "Adding..." : "Add MCQ Question →"}
                </button>
              </div>
            )}

            
            {tab === "short" && (
              <div className="space-y-5">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: "#C18C5D" }}>Question</label>
                  <textarea value={shortQuestion} onChange={(e) => setShortQuestion(e.target.value)}
                    placeholder="e.g. Explain what a REST API is..." rows={3} className={inputClass} style={inputStyle}
                    onFocus={(e) => (e.target.style.borderColor = "#7E6B8F")}
                    onBlur={(e) => (e.target.style.borderColor = "#D8E2DC")} />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: "#C18C5D" }}>
                    Sample Answer <span className="normal-case font-normal" style={{ color: "#7E6B8F" }}>(used by AI to grade)</span>
                  </label>
                  <textarea value={shortSampleAnswer} onChange={(e) => setShortSampleAnswer(e.target.value)}
                    placeholder="Enter an ideal answer for reference..." rows={4} className={inputClass} style={inputStyle}
                    onFocus={(e) => (e.target.style.borderColor = "#7E6B8F")}
                    onBlur={(e) => (e.target.style.borderColor = "#D8E2DC")} />
                </div>
                <button onClick={submitShort} disabled={loading}
                  className="w-full py-3.5 rounded-xl font-bold text-sm text-white"
                  style={{ backgroundColor: loading ? "#C18C5D99" : "#C18C5D", cursor: loading ? "not-allowed" : "pointer" }}>
                  {loading ? "Adding..." : "Add Short Answer Question →"}
                </button>
              </div>
            )}

           
            {tab === "coding" && (
              <div className="space-y-5">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: "#C18C5D" }}>Problem Title</label>
                  <input type="text" value={codingTitle} onChange={(e) => setCodingTitle(e.target.value)}
                    placeholder="e.g. Two Sum" className={inputClass} style={inputStyle}
                    onFocus={(e) => (e.target.style.borderColor = "#7E6B8F")}
                    onBlur={(e) => (e.target.style.borderColor = "#D8E2DC")} />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: "#C18C5D" }}>Description</label>
                  <textarea value={codingDescription} onChange={(e) => setCodingDescription(e.target.value)}
                    placeholder="Describe the problem..." rows={4} className={inputClass} style={inputStyle}
                    onFocus={(e) => (e.target.style.borderColor = "#7E6B8F")}
                    onBlur={(e) => (e.target.style.borderColor = "#D8E2DC")} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: "#C18C5D" }}>Test Input</label>
                    <textarea value={codingTestInput} onChange={(e) => setCodingTestInput(e.target.value)}
                      placeholder="e.g. [2,7,11,15]" rows={3} className={inputClass} style={inputStyle}
                      onFocus={(e) => (e.target.style.borderColor = "#7E6B8F")}
                      onBlur={(e) => (e.target.style.borderColor = "#D8E2DC")} />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: "#C18C5D" }}>Expected Output</label>
                    <textarea value={codingExpectedOutput} onChange={(e) => setCodingExpectedOutput(e.target.value)}
                      placeholder="e.g. [0, 1]" rows={3} className={inputClass} style={inputStyle}
                      onFocus={(e) => (e.target.style.borderColor = "#7E6B8F")}
                      onBlur={(e) => (e.target.style.borderColor = "#D8E2DC")} />
                  </div>
                </div>
                <button onClick={submitCoding} disabled={loading}
                  className="w-full py-3.5 rounded-xl font-bold text-sm text-white"
                  style={{ backgroundColor: loading ? "#C18C5D99" : "#C18C5D", cursor: loading ? "not-allowed" : "pointer" }}>
                  {loading ? "Adding..." : "Add Coding Problem →"}
                </button>
              </div>
            )}

            {success && <div className="rounded-xl px-4 py-3 mt-4 text-sm font-medium" style={{ backgroundColor: "#D8E2DC", color: "#2d5a3d", border: "1px solid #a8c8b4" }}>✓ {success}</div>}
            {error && <div className="rounded-xl px-4 py-3 mt-4 text-sm font-medium" style={{ backgroundColor: "#FFCAD4", color: "#7a2030", border: "1px solid #f4a0b0" }}>{error}</div>}
          </div>
        )}

      
        {viewTab === "view" && (
          <div className="space-y-3">
            {listLoading ? (
              <div className="text-center py-10">
                <div className="w-10 h-10 rounded-full border-4 animate-spin mx-auto mb-3"
                  style={{ borderColor: "#7E6B8F", borderTopColor: "transparent" }} />
                <p className="text-sm" style={{ color: "#7E6B8F" }}>Loading...</p>
              </div>
            ) : (
              <>
               
                {tab === "mcq" && (
                  <>
                    {mcqList.length === 0 ? (
                      <div className="rounded-2xl px-6 py-8 text-center shadow-md" style={{ backgroundColor: "#fff" }}>
                        <p className="text-2xl mb-2">📭</p>
                        <p className="text-sm" style={{ color: "#7E6B8F" }}>No MCQ questions yet</p>
                      </div>
                    ) : mcqList.map((q) => (
                      <div key={q.id} className="rounded-2xl px-6 py-5 shadow-md" style={{ backgroundColor: "#fff" }}>
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <p className="text-sm font-bold mb-3" style={{ color: "#3a2e45" }}>{q.question}</p>
                            <div className="grid grid-cols-2 gap-1.5">
                              {q.options?.map((opt, idx) => (
                                <span key={idx} className="text-xs px-3 py-1.5 rounded-lg font-medium"
                                  style={{
                                    backgroundColor: q.answers?.includes(idx) ? "#7E6B8F20" : "#f9f7f5",
                                    color: q.answers?.includes(idx) ? "#7E6B8F" : "#555",
                                    border: q.answers?.includes(idx) ? "1px solid #7E6B8F50" : "1px solid #D8E2DC",
                                  }}>
                                  {String.fromCharCode(65 + idx)}. {opt}
                                </span>
                              ))}
                            </div>
                          </div>
                          <button onClick={() => deleteQuestion("mcq", q.id)}
                            className="text-xs px-3 py-1.5 rounded-lg font-bold flex-shrink-0"
                            style={{ backgroundColor: "#FFCAD4", color: "#7a2030" }}>Delete</button>
                        </div>
                      </div>
                    ))}
                  </>
                )}

                
                {tab === "short" && (
                  <>
                    {shortList.length === 0 ? (
                      <div className="rounded-2xl px-6 py-8 text-center shadow-md" style={{ backgroundColor: "#fff" }}>
                        <p className="text-2xl mb-2">📭</p>
                        <p className="text-sm" style={{ color: "#7E6B8F" }}>No short answer questions yet</p>
                      </div>
                    ) : shortList.map((q) => (
                      <div key={q.id} className="rounded-2xl px-6 py-5 shadow-md" style={{ backgroundColor: "#fff" }}>
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <p className="text-sm font-bold mb-2" style={{ color: "#3a2e45" }}>{q.question}</p>
                            <p className="text-xs leading-relaxed" style={{ color: "#7E6B8F" }}>
                              <span className="font-semibold">Sample: </span>{q.sample_answer}
                            </p>
                          </div>
                          <button onClick={() => deleteQuestion("short", q.id)}
                            className="text-xs px-3 py-1.5 rounded-lg font-bold flex-shrink-0"
                            style={{ backgroundColor: "#FFCAD4", color: "#7a2030" }}>Delete</button>
                        </div>
                      </div>
                    ))}
                  </>
                )}

                
                {tab === "coding" && (
                  <>
                    {codingList.length === 0 ? (
                      <div className="rounded-2xl px-6 py-8 text-center shadow-md" style={{ backgroundColor: "#fff" }}>
                        <p className="text-2xl mb-2">📭</p>
                        <p className="text-sm" style={{ color: "#7E6B8F" }}>No coding problems yet</p>
                      </div>
                    ) : codingList.map((q) => (
                      <div key={q.id} className="rounded-2xl px-6 py-5 shadow-md" style={{ backgroundColor: "#fff" }}>
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <p className="text-sm font-bold mb-1" style={{ color: "#3a2e45" }}>{q.title}</p>
                            <p className="text-xs mb-2 leading-relaxed" style={{ color: "#7E6B8F" }}>{q.description}</p>
                            {q.test_input && (
                              <p className="text-xs" style={{ color: "#C18C5D" }}>
                                <span className="font-semibold">Input: </span>{q.test_input}
                              </p>
                            )}
                            {q.expected_output && (
                              <p className="text-xs" style={{ color: "#4a7c59" }}>
                                <span className="font-semibold">Expected: </span>{q.expected_output}
                              </p>
                            )}
                          </div>
                          <button onClick={() => deleteQuestion("coding", q.id)}
                            className="text-xs px-3 py-1.5 rounded-lg font-bold flex-shrink-0"
                            style={{ backgroundColor: "#FFCAD4", color: "#7a2030" }}>Delete</button>
                        </div>
                      </div>
                    ))}
                  </>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </main>
  );
}