"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

type CallRow = {
  id: string;
  caller_id: string;
  receiver_id: string;
  status: string;
  created_at: string;
};

export default function HomePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [pseudo, setPseudo] = useState<string | null>(null);
  const [incomingCallId, setIncomingCallId] = useState<string | null>(null);

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

      // 🔹 Met à jour last_seen pour dire "je suis en ligne"
      await supabase
        .from("profiles")
        .update({ last_seen: new Date().toISOString() })
        .eq("user_id", user.id);

      // 🔹 Récupère le pseudo
      const { data: profile } = await supabase
        .from("profiles")
        .select("pseudo")
        .eq("user_id", user.id)
        .single();

      setPseudo(profile?.pseudo ?? null);

      // 🔹 Cherche un appel entrant pour cet utilisateur
      const { data: calls, error } = await supabase
        .from("calls")
        .select("*")
        .eq("receiver_id", user.id)
        .eq("status", "pending")
        .order("created_at", { ascending: false })
        .limit(1);

      if (error) {
        console.error(error);
      }

      if (calls && calls.length > 0) {
        const call = calls[0] as CallRow;
        setIncomingCallId(call.id);
      } else {
        setIncomingCallId(null);
      }

      setLoading(false);
    }

    loadUser();
  }, [router]);

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/auth");
  }

  function handleGoToProfile() {
    router.push("/profile");
  }

  function handleGoToExplore() {
    router.push("/explore");
  }

  function handleJoinCall() {
    if (!incomingCallId) return;
    router.push(`/call/${incomingCallId}`);
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
        {/* Header */}
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

        {/* Boutons principaux */}
        <div className="space-y-3">
          <button
            type="button"
            onClick={handleGoToProfile}
            className="w-full bg-gradient-to-tr from-indigo-500 to-sky-400 text-slate-950 py-2.5 rounded-lg text-sm font-semibold shadow-md hover:brightness-110 transition"
          >
            Modifier mon profil
          </button>

          <button
            type="button"
            onClick={handleGoToExplore}
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

        {/* Bloc appel entrant */}
        {incomingCallId && (
          <div className="mt-4 p-3 rounded-lg border border-emerald-500/60 bg-emerald-500/10 text-sm space-y-2">
            <p className="text-emerald-100 font-medium">
              📞 Tu as un appel en cours.
            </p>
            <p className="text-slate-300 text-xs">
              Clique sur “Rejoindre l’appel” pour entrer dans la même salle que
              l’autre personne.
            </p>
            <button
              type="button"
              onClick={handleJoinCall}
              className="mt-1 px-3 py-1.5 rounded-full bg-emerald-500 text-slate-950 text-xs font-semibold hover:brightness-110 transition"
            >
              Rejoindre l’appel
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
