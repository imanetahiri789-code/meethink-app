"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleUpdatePassword() {
    setMessage("");

    if (!password || password.length < 6) {
      setMessage("Le mot de passe doit faire au moins 6 caractères.");
      return;
    }

    if (password !== confirm) {
      setMessage("Les mots de passe ne correspondent pas.");
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.updateUser({
      password,
    });

    setLoading(false);

    if (error) {
      console.error(error);
      setMessage(error.message || "Erreur lors de la mise à jour du mot de passe.");
    } else {
      setMessage("Mot de passe mis à jour ✅ Tu peux te reconnecter.");
      setTimeout(() => {
        router.push("/auth");
      }, 1200);
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-slate-900/70 border border-slate-800 rounded-2xl p-6 space-y-6 shadow-xl">
        <div>
          <h1 className="text-xl font-semibold">Nouveau mot de passe</h1>
          <p className="text-sm text-slate-400 mt-1">
            Choisis un nouveau mot de passe pour ton compte.
          </p>
        </div>

        <div className="space-y-3">
          <div className="space-y-2 text-sm">
            <label className="block text-slate-200">Nouveau mot de passe</label>
            <input
              type="password"
              className="w-full bg-slate-950 border border-slate-700 focus:border-indigo-500 outline-none p-2.5 rounded-lg text-sm"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>

          <div className="space-y-2 text-sm">
            <label className="block text-slate-200">
              Confirme le mot de passe
            </label>
            <input
              type="password"
              className="w-full bg-slate-950 border border-slate-700 focus:border-indigo-500 outline-none p-2.5 rounded-lg text-sm"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="••••••••"
            />
          </div>

          {message && (
            <p className="text-xs text-amber-300 whitespace-pre-line">
              {message}
            </p>
          )}

          <button
            type="button"
            onClick={handleUpdatePassword}
            disabled={loading}
            className="w-full bg-gradient-to-tr from-indigo-500 to-sky-400 text-slate-950 py-2.5 rounded-lg text-sm font-semibold shadow-md hover:brightness-110 transition disabled:opacity-60"
          >
            {loading ? "Mise à jour..." : "Mettre à jour le mot de passe"}
          </button>
        </div>
      </div>
    </div>
  );
}
