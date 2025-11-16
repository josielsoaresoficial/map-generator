import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.80.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// VAPID configuration
const vapidPublicKey = Deno.env.get("VAPID_PUBLIC_KEY")!;
const vapidPrivateKey = Deno.env.get("VAPID_PRIVATE_KEY")!;
const vapidSubject = "mailto:josiel.soares.oficial@gmail.com";

// Helper function to generate JWT token for VAPID
async function generateVAPIDAuthToken(endpoint: string): Promise<string> {
  const url = new URL(endpoint);
  const audience = `${url.protocol}//${url.host}`;
  
  const header = {
    typ: "JWT",
    alg: "ES256",
  };
  
  const payload = {
    aud: audience,
    exp: Math.floor(Date.now() / 1000) + 43200, // 12 hours
    sub: vapidSubject,
  };
  
  const encoder = new TextEncoder();
  const headerB64 = btoa(JSON.stringify(header)).replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
  const payloadB64 = btoa(JSON.stringify(payload)).replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
  
  // Import private key for signing - handle URL-safe base64
  const base64 = vapidPrivateKey.replace(/-/g, '+').replace(/_/g, '/');
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  
  const cryptoKey = await crypto.subtle.importKey(
    "pkcs8",
    bytes.buffer,
    {
      name: "ECDSA",
      namedCurve: "P-256",
    },
    false,
    ["sign"]
  );
  
  const dataToSign = encoder.encode(`${headerB64}.${payloadB64}`);
  const signature = await crypto.subtle.sign(
    {
      name: "ECDSA",
      hash: { name: "SHA-256" },
    },
    cryptoKey,
    dataToSign
  );
  
  const signatureB64 = btoa(String.fromCharCode(...new Uint8Array(signature)))
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
  
  return `${headerB64}.${payloadB64}.${signatureB64}`;
}

interface NotifyRequest {
  title: string;
  body: string;
  tag?: string;
  icon?: string;
  data?: any;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get the user from the authorization header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Missing authorization header" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: { user }, error: userError } = await supabase.auth.getUser(
      authHeader.replace("Bearer ", "")
    );

    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { title, body, tag, icon, data }: NotifyRequest = await req.json();

    // Get user's push subscriptions
    const { data: subscriptions, error: subsError } = await supabase
      .from("push_subscriptions")
      .select("*")
      .eq("user_id", user.id);

    if (subsError) {
      console.error("Error fetching subscriptions:", subsError);
      return new Response(JSON.stringify({ error: "Failed to fetch subscriptions" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!subscriptions || subscriptions.length === 0) {
      return new Response(JSON.stringify({ message: "No subscriptions found" }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Send push notifications to all subscriptions
    const payload = JSON.stringify({
      title,
      body,
      icon: icon || "/icon-192x192.png",
      tag: tag || "notification",
      requireInteraction: true,
      vibrate: [500, 200, 500, 200, 500],
      data: data || {},
    });

    const results = await Promise.allSettled(
      subscriptions.map(async (sub) => {
        try {
          // Generate VAPID auth token
          const vapidToken = await generateVAPIDAuthToken(sub.endpoint);
          
          // Send notification with VAPID authentication
          const response = await fetch(sub.endpoint, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "TTL": "86400",
              "Authorization": `vapid t=${vapidToken}, k=${vapidPublicKey}`,
            },
            body: payload,
          });

          if (!response.ok && response.status === 410) {
            // Subscription is no longer valid, delete it
            await supabase
              .from("push_subscriptions")
              .delete()
              .eq("id", sub.id);
            console.log(`Deleted invalid subscription: ${sub.id}`);
          }

          return { success: true, endpoint: sub.endpoint };
        } catch (error: any) {
          console.error(`Error sending to ${sub.endpoint}:`, error);
          return { success: false, endpoint: sub.endpoint, error: error.message };
        }
      })
    );

    const successful = results.filter((r) => r.status === "fulfilled" && r.value.success).length;
    const failed = results.length - successful;

    return new Response(
      JSON.stringify({
        message: "Notifications sent",
        successful,
        failed,
        total: results.length,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: any) {
    console.error("Error in notify function:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
};

serve(handler);
