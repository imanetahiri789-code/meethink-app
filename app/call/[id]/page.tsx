"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import {
  LiveKitRoom,
  AudioConference,
} from "@livekit/components-react";
import "@livekit/components-styles";

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
  const [livekitToken, setLivekitToken] = useState<string | null>(null);
  const [livekitUrl, setLivekitUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!callId) return;
    initCall();
  }, [callId]);

  async function initCall() {
    setLoading(true);
    setMessage("");

    // 1) Vérifier l'utilisateur
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      setMessage("Tu dois être connecté·e pour accéder à l'appel.");
      setLoading(false);
      return;
    }

    // 2) Charger l'appel
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

    if (data.caller_id !== user.id && data.receiver_id !== user.id) {
      setMessage("Tu n'as pas accès à cet appel.");
      setLoading(false);
      return;
    }

    setCall(data as Call);

    // 3) Récupérer un token LiveKit via notre API route
    const session = await supabase.auth.getSession();
    const accessToken = session.data.session?.access_token;

    const res = await fetch("/api/livekit-token", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(accessToken
          ? { Authorization: `Bearer ${accessToken}` }
          : {}),
      },
      body: JSON.stringify({ callId }),
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      console.error(body);
      setMessage(
        body.error || "Impossible d'initialiser l'appel audio."
      );
      setLoading(false);
      return;
    }

    const body = await res.json();
    setLivekitToken(body.token);
    setLivekitUrl(body.serverUrl);
    setLoading(false);
  }

  async function handleHangup() {
    if (!call) return;

    await supabase
      .from("calls")
      .update({ status: "ended" })
      .eq("id", call.id);

    router.push("/");
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center">
        <p>Connexion à l'appel…</p>
      </div>
    );
  }

  if (!livekitToken || !livekitUrl) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center px-4">
        <div className="max-w-md text-center">
          <p className="text-sm text-amber-300 mb-4">
            {message || "Impossible d'initialiser l'audio."}
          </p>
          <button
            onClick={() => router.push("/")}
            className="px-4 py-2 bg-slate-800 rounded-lg text-sm"
          >
            Retour à l'accueil
          </button>
        </div>
      </div>
    );
  }

  // 🎧 Ici : la vraie salle audio LiveKit
  return (
    <LiveKitRoom
      token={livekitToken}
      serverUrl={livekitUrl}
      connect={true}
      video={false}
      audio={true}
    >
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center px-4">
        <div className="w-full max-w-xl bg-slate-900/70 border border-slate-800 rounded-2xl p-6 space-y-6 shadow-xl">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-gradient-to-tr from-indigo-500 to-sky-400 flex items-center justify-center shadow-lg">
              <span className="text-lg font-bold">M</span>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-slate-500">
                Appel audio
              </p>
              <h1 className="text-xl font-semibold">Salle d'appel</h1>
              <p className="text-sm text-slate-400">
                Micro activé. Tu peux parler avec l'autre personne connectée à cette salle.
              </p>
            </div>
          </div>

          {/* UI audio prête à l'emploi */}
          <div className="bg-slate-950/70 rounded-xl border border-slate-800 p-4">
            <AudioConference />
          </div>

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
    </LiveKitRoom>
  );
}
