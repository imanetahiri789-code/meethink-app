"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function HomePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [pseudo, setPseudo] = useState<string | null>(null);

  useEffect(() => {
    async function loadUser() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        // pas connecté → on renvoie vers /auth
        router.push("/auth");
        return;
      }

      // on récupère le pseudo pour l'afficher
      const { data: profile } = await supabase
        .from("profiles")
        .select("pseudo")
        .eq("user_id", user.id)
        .single();

      setPseudo(profile?.pseudo ?? null);
      setLoading(false);
    }

    loadUser();
  }, [router]);

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/auth");
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center">
        <p>Chargement…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-slate-900/70 border border-slate-800 rounded-2xl p-6 space-y-6 shadow-xl">
        {/* Titre */}
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-2xl bg-gradient-to-tr from-indigo-500 to-sky-400 flex items-center justify-center shadow-lg">
            <span className="text-lg font-bold">M</span>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-slate-500">
              MeetThink
            </p>
            <h1 className="text-xl font-semibold">
              {pseudo ? `Salut, ${pseudo}` : "Bienvenue sur MeetThink"}
            </h1>
            <p className="text-sm text-slate-400">
              Choisis ce que tu veux faire.
            </p>
          </div>
        </div>

        {/* Les 3 boutons */}
        <div className="space-y-3">
          <button
            type="button"
            onClick={() => router.push("/profile")}
            className="w-full bg-gradient-to-tr from-indigo-500 to-sky-400 text-slate-950 py-2.5 rounded-lg text-sm font-semibold shadow-md hover:brightness-110 transition"
          >
            Modifier mon profil
          </button>

          <button
            type="button"
            onClick={() => router.push("/explore")}
            className="w-full bg-slate-800 text-slate-50 py-2.5 rounded-lg text-sm font-medium border border-slate-700 hover:border-slate-500 transition"
          >
            Personnes en ligne
          </button>

          <button
            type="button"
            onClick={handleLogout}
            className="w-full text-xs text-slate-400 hover:text-slate-100 mt-2"
          >
            Déconnexion
          </button>
        </div>
      </div>
    </div>
  );
}
