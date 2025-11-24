"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function AuthPage() {
  const router = useRouter();

  const [tab, setTab] = useState<"login" | "signup">("signup");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");

  async function handleSignup() {
    setMessage("");
    const { error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      setMessage(error.message);
    } else {
      setMessage("Inscription réussie ! Tu peux maintenant te connecter ✨");
      setTab("login");
    }
  }

  async function handleLogin() {
    setMessage("");
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setMessage(error.message);
    } else {
      router.push("/profile");
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 text-slate-50 px-4">
      {/* LOGO + NOM APPLI */}
      <div className="mb-8 flex items-center gap-3">
        <div className="h-11 w-11 rounded-2xl bg-gradient-to-tr from-indigo-500 to-sky-400 flex items-center justify-center shadow-lg">
          <span className="text-xl font-bold">M</span>
        </div>
        <div className="text-left">
          <p className="text-xs uppercase tracking-[0.25em] text-slate-400">
            Application audio
          </p>
          <h1 className="text-2xl font-semibold">MeetThink</h1>
          <p className="text-sm text-slate-400">
            Des conversations profondes avec les bonnes personnes.
          </p>
        </div>
      </div>

      {/* CARD AUTH */}
      <div className="bg-slate-900/70 border border-slate-800 shadow-xl rounded-2xl p-6 w-full max-w-sm space-y-6">
        {/* Onglets */}
        <div className="flex bg-slate-800 rounded-xl p-1">
          <button
            type="button"
            onClick={() => {
              setTab("signup");
              setMessage("");
            }}
            className={`w-1/2 px-4 py-2 text-sm rounded-lg transition ${
              tab === "signup"
                ? "bg-slate-50 text-slate-900 font-semibold"
                : "text-slate-400"
            }`}
          >
            Inscription
          </button>
          <button
            type="button"
            onClick={() => {
              setTab("login");
              setMessage("");
            }}
            className={`w-1/2 px-4 py-2 text-sm rounded-lg transition ${
              tab === "login"
                ? "bg-slate-50 text-slate-900 font-semibold"
                : "text-slate-400"
            }`}
          >
            Connexion
          </button>
        </div>

        {/* Formulaire */}
        <div className="space-y-4">
          {/* Email */}
          <div className="space-y-2 text-sm">
            <label className="block text-slate-300">Email</label>
            <input
              type="email"
              placeholder="ton.email@example.com"
              className="w-full bg-slate-900 border border-slate-700 focus:border-indigo-500 outline-none p-2.5 rounded-lg text-sm"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          {/* Mot de passe + Afficher/Masquer */}
          <div className="space-y-2 text-sm">
            <label className="block text-slate-300">Mot de passe</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                className="w-full bg-slate-900 border border-slate-700 focus:border-indigo-500 outline-none p-2.5 rounded-lg text-sm pr-16"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute inset-y-0 right-2 px-2 text-xs text-slate-400 hover:text-slate-100"
              >
                {showPassword ? "Masquer" : "Afficher"}
              </button>
            </div>
          </div>

          {/* Lien "Mot de passe oublié ?" */}
          {tab === "login" && (
            <button
              type="button"
              onClick={() => router.push("/forgot-password")}
              className="text-xs text-slate-400 hover:text-slate-100 underline underline-offset-2"
            >
              Mot de passe oublié ?
            </button>
          )}

          {/* Bouton principal */}
          {tab === "signup" ? (
            <button
              type="button"
              onClick={handleSignup}
              className="w-full bg-gradient-to-tr from-indigo-500 to-sky-400 text-slate-950 py-2 rounded-lg text-sm font-semibold shadow-md hover:brightness-110 transition"
            >
              Créer mon compte
            </button>
          ) : (
            <button
              type="button"
              onClick={handleLogin}
              className="w-full bg-gradient-to-tr from-indigo-500 to-sky-400 text-slate-950 py-2 rounded-lg text-sm font-semibold shadow-md hover:brightness-110 transition"
            >
              Me connecter
            </button>
          )}

          {/* Message d'erreur / succès */}
          {message && (
            <p className="text-center text-xs text-rose-400 mt-2">{message}</p>
          )}

          <p className="text-[11px] text-center text-slate-500 mt-2">
            En continuant, tu acceptes de respecter les autres et de garder des
            conversations de qualité 💛
          </p>
        </div>
      </div>
    </div>
  );
}
