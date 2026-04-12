import { apiUrlErrorMessage } from "@/lib/api";

export function ApiConfigError() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="max-w-lg rounded-lg border border-amber-200 bg-amber-50 p-6 text-center text-amber-950">
        <p className="font-medium">Backend API URL is not set</p>
        <p className="mt-3 text-sm leading-relaxed">{apiUrlErrorMessage()}</p>
      </div>
    </div>
  );
}
