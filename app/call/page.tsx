"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

type Call = {
  id: string;
  caller_id: string;
  receiver_id: string;
  status: string;
  created_at: string;
};

export default function CallPage() {
  const params = useParams();
  const router = useRouter();
  const callId = params.id as string;

  const [call, setCall] = useState<Call | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!callId) return;
    loadCall();
  }, [callId]);

  async function loadCall() {
    setLoading(true);
    setMessage("");

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      setMessage("Tu dois être connecté·e pour accéder à l'appel.");
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("calls")
      .select("*")
      .eq("id", callId)
      .single();

    if (error || !data) {
      console.error(error);
      setMessage("Appel introuvable.");
      setLoading(false);
      return;
    }

    // Optionnel : vérifier que l'utilisateur fait partie de l'appel
    if (data.caller_id !== user.id && data.receiver_id !== user.id) {
      setMessage("Tu n'as pas accès à cet appel.");
      setLoading(false);
      return;
    }

    setCall(data as Call);
    setLoading(false);
  }

  async function handleHangup() {
    if (!call) return;

    await supabase
      .from("calls")
      .update({ status: "ended" })
      .eq("id", call.id);

    router.push("/"); // retour à la page d'accueil
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center">
        <p>Connexion à l'appel…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-slate-900/70 border border-slate-800 rounded-2xl p-6 space-y-6 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-2xl bg-gradient-to-tr from-indigo-500 to-sky-400 flex items-center justify-center shadow-lg">
            <span className="text-lg font-bold">M</span>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-slate-500">
              Appel audio
            </p>
            <h1 className="text-xl font-semibold">
              {call ? "Salle d'appel" : "Appel"}
            </h1>
            <p className="text-sm text-slate-400">
              Ici on branchera le vrai audio (LiveKit / WebRTC).
            </p>
          </div>
        </div>

        {message && <p className="text-sm text-amber-300">{message}</p>}

        {call && (
          <div className="space-y-3 text-sm text-slate-300">
            <p>
              <span className="text-slate-400">ID de l'appel :</span> {call.id}
            </p>
            <p>
              <span className="text-slate-400">Statut :</span> {call.status}
            </p>
            <p className="text-xs text-slate-500">
              (Plus tard : ici on affichera les pseudos des deux personnes,
              durée de l'appel, etc.)
            </p>
          </div>
        )}

        <div className="flex justify-center">
          <button
            onClick={handleHangup}
            className="mt-4 px-4 py-2 bg-rose-500 text-slate-50 rounded-lg text-sm font-semibold hover:brightness-110 transition"
          >
            Raccrocher
          </button>
        </div>
      </div>
    </div>
  );
}
