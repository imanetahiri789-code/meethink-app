"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

// Options d'intérêts et d'objectifs
const INTEREST_OPTIONS = [
  "philosophie",
  "psychologie",
  "développement personnel",
  "business / entrepreneuriat",
  "argent & investissement",
  "spiritualité",
  "relations & amour",
  "santé mentale",
  "sport / santé physique",
  "livres & lecture",
  "science",
  "art & créativité",
  "technologie / IA",
  "société & politique",
  "biologie",
  "astronomie",
  "écologie",
  "musique",
  "photographie",
];

const GOAL_OPTIONS = [
  "amitié",
  "discussions intellectuelles",
  "progression personnelle",
  "réseau / projets",
  "relation amoureuse",
];

const CONVERSATION_STYLE_OPTIONS = [
  "calme",
  "réfléchi",
  "énergique",
  "passionné",
  "introverti",
  "extraverti",
];

export default function ProfilePage() {
  const [loading, setLoading] = useState(true);
  const [pseudo, setPseudo] = useState("");
  const [description, setDescription] = useState("");

  const [interests, setInterests] = useState<string[]>([]);
  const [goals, setGoals] = useState<string[]>([]);
  const [conversationStyle, setConversationStyle] = useState("");

  const [message, setMessage] = useState("");

  useEffect(() => {
    loadProfile();
  }, []);

  async function loadProfile() {
    setLoading(true);
    setMessage("");

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setMessage("Tu dois être connecté·e pour éditer ton profil.");
      setLoading(false);
      return;
    }

    const { data: profile, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", user.id)
      .single();

    // PGRST116 = "no rows found" (normal si premier profil)
    if (error && (error as any).code !== "PGRST116") {
      console.error(error);
      setMessage("Erreur en chargeant ton profil.");
    }

    if (profile) {
      setPseudo(profile.pseudo || "");
      setDescription(profile.description || "");
      setInterests(profile.interests || []);
      setGoals(profile.goals || []);
      setConversationStyle(profile.conversation_style || "");
    }

    setLoading(false);
  }

  async function saveProfile() {
    setMessage("");

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setMessage("Tu dois être connecté·e pour enregistrer ton profil.");
      return;
    }

    if (!pseudo.trim()) {
      setMessage("Le pseudo est obligatoire.");
      return;
    }

    const { error } = await supabase.from("profiles").upsert({
      user_id: user.id,
      pseudo,
      description,
      interests,
      goals,
      conversation_style: conversationStyle,
    });

    if (error) {
      console.error(error);
      setMessage(error.message);
    } else {
      setMessage("Profil enregistré");
    }


  function toggleInterest(value: string) {
    setInterests((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
    );
  }

  function toggleGoal(value: string) {
    setGoals((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-100">
        <p>Chargement du profil…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 px-4 py-8">
      <div className="max-w-xl mx-auto space-y-6">
        {/* Header avec logo / titre */}
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-2xl bg-gradient-to-tr from-indigo-500 to-sky-400 flex items-center justify-center shadow-lg">
            <span className="text-lg font-bold">M</span>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-slate-500">
              Profil MeetThink
            </p>
            <h1 className="text-2xl font-semibold">Mon profil</h1>
            <p className="text-sm text-slate-400">
              Aide l’app à te présenter aux bonnes personnes.
            </p>
          </div>
        </div>

        {/* Carte principale */}
        <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6 space-y-6 shadow-xl">
          {/* Pseudo */}
          <div className="space-y-2">
            <label className="block text-sm text-slate-200">Pseudo</label>
            <input
              className="w-full bg-slate-950 border border-slate-700 focus:border-indigo-500 outline-none p-2.5 rounded-lg text-sm"
              value={pseudo}
              onChange={(e) => setPseudo(e.target.value)}
              placeholder="Ex : EspritCurieux, DeepThinker..."
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label className="block text-sm text-slate-200">
              Description
            </label>
            <textarea
              className="w-full bg-slate-950 border border-slate-700 focus:border-indigo-500 outline-none p-2.5 rounded-lg text-sm min-h-[80px]"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Quelques lignes sur toi, ta façon de penser, ce que tu cherches…"
            />
          </div>

          {/* Intérêts */}
          <div className="space-y-2">
            <label className="block text-sm text-slate-200">
              Centres d’intérêt
            </label>
            <p className="text-xs text-slate-500 mb-1">
              Choisis ce dont tu aimes vraiment parler.
            </p>
            <div className="flex flex-wrap gap-2">
              {INTEREST_OPTIONS.map((interest) => {
                const active = interests.includes(interest);
                return (
                  <button
                    key={interest}
                    type="button"
                    onClick={() => toggleInterest(interest)}
                    className={`px-3 py-1.5 rounded-full text-xs border transition ${
                      active
                        ? "bg-indigo-500 text-slate-50 border-indigo-400"
                        : "bg-slate-950/60 text-slate-300 border-slate-700 hover:border-slate-500"
                    }`}
                  >
                    {interest}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Objectifs */}
          <div className="space-y-2">
            <label className="block text-sm text-slate-200">
              Ce que tu cherches ici
            </label>
            <p className="text-xs text-slate-500 mb-1">
              Tu peux choisir plusieurs objectifs.
            </p>
            <div className="flex flex-wrap gap-2">
              {GOAL_OPTIONS.map((goal) => {
                const active = goals.includes(goal);
                return (
                  <button
                    key={goal}
                    type="button"
                    onClick={() => toggleGoal(goal)}
                    className={`px-3 py-1.5 rounded-full text-xs border transition ${
                      active
                        ? "bg-emerald-500 text-slate-50 border-emerald-400"
                        : "bg-slate-950/60 text-slate-300 border-slate-700 hover:border-slate-500"
                    }`}
                  >
                    {goal}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Style de conversation */}
          <div className="space-y-2">
            <label className="block text-sm text-slate-200">
              Ton style de conversation
            </label>
            <p className="text-xs text-slate-500 mb-1">
              Choisis le rythme qui te ressemble le plus.
            </p>

            <div className="flex flex-wrap gap-2">
              {CONVERSATION_STYLE_OPTIONS.map((style) => {
                const active = conversationStyle === style;
                return (
                  <button
                    key={style}
                    type="button"
                    onClick={() => setConversationStyle(style)}
                    className={`px-3 py-1.5 rounded-full text-xs border transition ${
                      active
                        ? "bg-purple-500 text-slate-50 border-purple-400"
                        : "bg-slate-950/60 text-slate-300 border-slate-700 hover:border-slate-500"
                    }`}
                  >
                    {style}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Message + bouton */}
          {message && (
            <p className="text-xs text-center text-amber-300">{message}</p>
          )}

          <button
            onClick={saveProfile}
            className="w-full bg-gradient-to-tr from-indigo-500 to-sky-400 text-slate-950 py-2.5 rounded-lg text-sm font-semibold shadow-md hover:brightness-110 transition"
          >
            Enregistrer mon profil
          </button>
        </div>
      </div>
    </div>
  );
}
