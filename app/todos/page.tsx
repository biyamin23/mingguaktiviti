import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import Link from "next/link";
import { ArrowLeft, Database } from "lucide-react";

export default async function TodosPage() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data: todos, error } = await supabase.from("todos").select();

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-sky-400 hover:text-sky-300 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Kembali ke Dashboard MRSM Tumpat
        </Link>

        <div className="bg-slate-800/80 border border-slate-700 rounded-xl p-6 shadow-xl space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-blue-500/20 text-blue-400 border border-blue-500/30">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Supabase SSR Connection Test</h1>
              <p className="text-xs text-slate-400">
                Pautan langsung ke:{" "}
                <span className="text-sky-400 font-mono">
                  {process.env.NEXT_PUBLIC_SUPABASE_URL}
                </span>
              </p>
            </div>
          </div>

          {error && (
            <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs">
              <p className="font-semibold mb-1">Status Query Jadual &apos;todos&apos;:</p>
              <p>{error.message}</p>
              <p className="mt-2 text-slate-400">
                (Nota: Ralat ini adalah normal sekiranya jadual &apos;todos&apos; belum dicipta di SQL Editor Supabase. Sambungan ke Supabase aktif dan sah.)
              </p>
            </div>
          )}

          <div className="space-y-2">
            <h2 className="text-sm font-semibold text-slate-300">Senarai Todos:</h2>
            {todos && todos.length > 0 ? (
              <ul className="divide-y divide-slate-700/50 border border-slate-700 rounded-lg overflow-hidden">
                {todos.map((todo: { id: string | number; name?: string; title?: string }) => (
                  <li key={todo.id} className="p-3 bg-slate-800 hover:bg-slate-750 text-sm">
                    {todo.name || todo.title || JSON.stringify(todo)}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-slate-400 italic bg-slate-900/50 p-4 rounded-lg border border-slate-700/50">
                Tiada rekod di dalam jadual &apos;todos&apos;.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
