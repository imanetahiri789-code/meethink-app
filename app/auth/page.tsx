"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function AuthPage() {
  const [tab, setTab] = useState<"login" | "signup">("signup");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  async function handleSignup() {
    const { error } = await supabase.auth.signUp({
      email,
      password,
    });
    if (error) setMessage(error.message);
    else setMessage("Inscription réussie ! Vérifie ton email ✨");
  }

  async function handleLogin() {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) setMessage(error.message);
    else setMessage("Connexion réussie !");
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-100 p-4">
      <div className="bg-white shadow-lg rounded-lg p-6 w-full max-w-sm space-y-6">

        <div className="flex space-x-4 justify-center">
          <button
            onClick={() => setTab("signup")}
            className={`px-4 py-2 rounded ${
              tab === "signup" ? "bg-blue-500 text-white" : "bg-gray-200"
            }`}
          >
            Inscription
          </button>
          <button
            onClick={() => setTab("login")}
            className={`px-4 py-2 rounded ${
              tab === "login" ? "bg-blue-500 text-white" : "bg-gray-200"
            }`}
          >
            Connexion
          </button>
        </div>

        <div className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            className="w-full border p-2 rounded"
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type="password"
            placeholder="Mot de passe"
            className="w-full border p-2 rounded"
            onChange={(e) => setPassword(e.target.value)}
          />

          {tab === "signup" ? (
            <button
              onClick={handleSignup}
              className="w-full bg-blue-600 text-white py-2 rounded"
            >
              S’inscrire
            </button>
          ) : (
            <button
              onClick={handleLogin}
              className="w-full bg-blue-600 text-white py-2 rounded"
            >
              Se connecter
            </button>
          )}

          {message && <p className="text-center text-sm text-red-500">{message}</p>}
        </div>
      </div>
    </div>
  );
}
