"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

type Profile = {
  user_id: string;
  pseudo: string | null;
  description: string | null;
  interests: string[] | null;
  goals: string[] | null;
  conversation_style: string | null;
};

export default function ExplorePage() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    loadProfiles();
  }, []);

  async function loadProfiles() {
    setLoading(true);
    setMessage("");

    // Récupérer l'utilisateur connecté
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      setMessage("Tu dois être connecté·e pour explorer les profils.");
      setLoading(false);
      return;
    }

    // Récupérer tous les profils sauf le sien
    const { data, error } = await supabase
      .from("profiles")
      .select(
        "user_id, pseudo, description, interests, goals, conversation_style"
      )
      .neq("user_id", user.id);

    if (error) {
      console.error(error);
      setMessage("Erreur en chargeant les profils.");
    } else if (!data || data.length === 0) {
      setMessage("Il n’y a pas encore d’autres profils à afficher.");
    } else {
      setProfiles(data as Profile[]);
    }

    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 px-4 py-8">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-2xl bg-gradient-to-tr from-indigo-500 to-sky-400 flex items-center justify-center shadow-lg">
            <span className="text-lg font-bold">M</span>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-slate-500">
              Explorer
            </p>
            <h1 className="text-2xl font-semibold">Profils disponibles</h1>
            <p className="text-sm text-slate-400">
              Découvre des personnes qui aiment réfléchir comme toi.
            </p>
          </div>
        </div>

        {/* Etat de chargement / message */}
        {loading && (
          <p className="text-sm text-slate-400">Chargement des profils…</p>
        )}

        {message && !loading && (
          <p className="text-sm text-amber-300">{message}</p>
        )}

        {/* Liste des profils */}
        {!loading && profiles.length > 0 && (
          <div className="space-y-4">
            {profiles.map((p) => (
              <div
                key={p.user_id}
                className="bg-slate-900/70 border border-slate-800 rounded-2xl p-4 shadow-md"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-semibold">
                      {p.pseudo || "Utilisateur anonyme"}
                    </h2>
                    {p.conversation_style && (
                      <p className="text-xs text-slate-400 mt-1">
                        Style de conversation :{" "}
                        <span className="text-slate-100">
                          {p.conversation_style}
                        </span>
                      </p>
                    )}
                  </div>
                </div>

                {p.description && (
                  <p className="text-sm text-slate-300 mt-3">
                    {p.description}
                  </p>
                )}

                {p.interests && p.interests.length > 0 && (
                  <div className="mt-3">
                    <p className="text-xs text-slate-400 mb-1">
                      Centres d’intérêt :
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {p.interests.map((i) => (
                        <span
                          key={i}
                          className="px-2.5 py-1 rounded-full bg-slate-950/60 border border-slate-700 text-[11px] text-slate-200"
                        >
                          {i}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {p.goals && p.goals.length > 0 && (
                  <div className="mt-3">
                    <p className="text-xs text-slate-400 mb-1">
                      Ce qu’il/elle cherche :
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {p.goals.map((g) => (
                        <span
                          key={g}
                          className="px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-400/40 text-[11px] text-emerald-200"
                        >
                          {g}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
