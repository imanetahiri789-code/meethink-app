import { NextRequest } from "next/server";
import { AccessToken } from "livekit-server-sdk";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Supabase côté serveur pour vérifier l'utilisateur
const supabaseServer = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false,
  },
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { callId } = body as { callId?: string };

    if (!callId) {
      return new Response(JSON.stringify({ error: "callId manquant" }), {
        status: 400,
      });
    }

    const livekitUrl = process.env.LIVEKIT_URL;
    const apiKey = process.env.LIVEKIT_API_KEY;
    const apiSecret = process.env.LIVEKIT_API_SECRET;

    if (!livekitUrl || !apiKey || !apiSecret) {
      return new Response(
        JSON.stringify({ error: "LIVEKIT_* non configurés" }),
        { status: 500 }
      );
    }

    // Récupérer la session utilisateur via Supabase (JWT dans les cookies)
    const authHeader = req.headers.get("Authorization");
    let userId: string | null = null;

    if (authHeader?.startsWith("Bearer ")) {
      const token = authHeader.replace("Bearer ", "");
      const { data } = await supabaseServer.auth.getUser(token);
      userId = data.user?.id ?? null;
    }

    if (!userId) {
      return new Response(
        JSON.stringify({ error: "Utilisateur non authentifié" }),
        { status: 401 }
      );
    }

    // On utilise l'id de l'appel comme nom de room
    const roomName = callId;
    const identity = userId; // tu peux mettre le pseudo plus tard

    const at = new AccessToken(apiKey, apiSecret, {
      identity,
      ttl: "1h",
    });

    at.addGrant({
      roomJoin: true,
      room: roomName,
      canPublish: true,
      canSubscribe: true,
    });

    const token = await at.toJwt();

    return new Response(
      JSON.stringify({
        token,
        serverUrl: livekitUrl,
      }),
      { status: 200 }
    );
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: "Erreur serveur" }), {
      status: 500,
    });
  }
}
