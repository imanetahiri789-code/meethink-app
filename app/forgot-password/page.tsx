"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleReset() {
    setMessage("");
    if (!email.trim()) {
      setMessage("Merci d’entrer ton email.");
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.resetPasswordForEmail(email);

    setLoading(false);

    if (error) {
      console.error(error);
      setMessage(error.message || "Erreur lors de l’envoi de l’email.");
    } else {
      setMessage(
        "Si un compte existe avec cet email, un lien de réinitialisation a été envoyé ✉️"
      );
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-slate-900/70 border border-slate-800 rounded-2xl p-6 space-y-6 shadow-xl">
        <div>
          <h1 className="text-xl font-semibold">Mot de passe oublié</h1>
          <p className="text-sm text-slate-400 mt-1">
            Entre l’email que tu as utilisé pour créer ton compte. Tu recevras
            un lien pour choisir un nouveau mot de passe.
          </p>
        </div>

        <div className="space-y-3">
          <div className="space-y-2 text-sm">
            <label className="block text-slate-200">Email</label>
            <input
              type="email"
              placeholder="ton.email@example.com"
              className="w-full bg-slate-950 border border-slate-700 focus:border-indigo-500 outline-none p-2.5 rounded-lg text-sm"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          {message && (
            <p className="text-xs text-amber-300 whitespace-pre-line">
              {message}
            </p>
          )}

          <button
            type="button"
            onClick={handleReset}
            disabled={loading}
            className="w-full bg-gradient-to-tr from-indigo-500 to-sky-400 text-slate-950 py-2.5 rounded-lg text-sm font-semibold shadow-md hover:brightness-110 transition disabled:opacity-60"
          >
            {loading ? "Envoi en cours..." : "Envoyer le lien de réinitialisation"}
          </button>

          <button
            type="button"
            onClick={() => router.push("/auth")}
            className="w-full text-xs text-slate-400 hover:text-slate-100 mt-2"
          >
            ← Retour à la connexion
          </button>
        </div>
      </div>
    </div>
  );
}

