import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

type ServiceAccount = {
  client_email: string;
  private_key: string;
};

type GoogleCalendarEvent = {
  id: string;
  status?: string;
  summary?: string;
  description?: string;
  location?: string;
  htmlLink?: string;
  start?: {
    dateTime?: string;
    date?: string;
  };
  end?: {
    dateTime?: string;
    date?: string;
  };
};

const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";
const GOOGLE_CALENDAR_SCOPE = "https://www.googleapis.com/auth/calendar";

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json",
    },
  });
}

function base64UrlEncode(input: string | Uint8Array): string {
  const bytes =
    typeof input === "string" ? new TextEncoder().encode(input) : input;

  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);

  return btoa(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

function privateKeyPemToArrayBuffer(privateKeyPem: string): ArrayBuffer {
  const base64 = privateKeyPem
    .replace("-----BEGIN PRIVATE KEY-----", "")
    .replace("-----END PRIVATE KEY-----", "")
    .replace(/\s/g, "");

  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);

  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }

  return bytes.buffer;
}

async function createSignedJwt(
  serviceAccount: ServiceAccount,
): Promise<string> {
  const now = Math.floor(Date.now() / 1000);

  const encodedHeader = base64UrlEncode(
    JSON.stringify({
      alg: "RS256",
      typ: "JWT",
    }),
  );

  const encodedPayload = base64UrlEncode(
    JSON.stringify({
      iss: serviceAccount.client_email,
      scope: GOOGLE_CALENDAR_SCOPE,
      aud: GOOGLE_TOKEN_URL,
      exp: now + 3600,
      iat: now,
    }),
  );

  const unsignedJwt = `${encodedHeader}.${encodedPayload}`;

  const privateKey = await crypto.subtle.importKey(
    "pkcs8",
    privateKeyPemToArrayBuffer(serviceAccount.private_key),
    {
      name: "RSASSA-PKCS1-v1_5",
      hash: "SHA-256",
    },
    false,
    ["sign"],
  );

  const signature = await crypto.subtle.sign(
    "RSASSA-PKCS1-v1_5",
    privateKey,
    new TextEncoder().encode(unsignedJwt),
  );

  return `${unsignedJwt}.${base64UrlEncode(new Uint8Array(signature))}`;
}

async function getGoogleAccessToken(
  serviceAccount: ServiceAccount,
): Promise<string> {
  const assertion = await createSignedJwt(serviceAccount);

  const response = await fetch(GOOGLE_TOKEN_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    console.error("Google token error:", data);
    throw new Error(data.error_description || "Failed to get Google token");
  }

  return data.access_token;
}

function getSupabaseClient(req: Request) {
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");
  const authorization = req.headers.get("Authorization") ?? "";

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Missing Supabase Edge Function environment variables.");
  }

  return createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: {
        Authorization: authorization,
      },
    },
  });
}

async function requireUser(supabaseClient: ReturnType<typeof createClient>) {
  const {
    data: { user },
    error,
  } = await supabaseClient.auth.getUser();

  if (error || !user) {
    throw new Error("Not authenticated.");
  }

  return user;
}

async function insertActivity(
  supabaseClient: ReturnType<typeof createClient>,
  calendarEventId: string,
  action: string,
  message: string,
  metadata: Record<string, unknown> = {},
) {
  const { error } = await supabaseClient
    .from("calendar_event_activity")
    .insert({
      calendar_event_id: calendarEventId,
      action,
      message,
      metadata,
    });

  if (error) {
    console.error("Failed to insert calendar activity:", error);
  }
}

function googleDateToIso(value?: { dateTime?: string; date?: string }) {
  if (!value) return null;

  if (value.dateTime) return value.dateTime;
  if (value.date) return `${value.date}T00:00:00+03:00`;

  return null;
}

async function fetchGoogleEvents({
  calendarId,
  accessToken,
  timeMin,
  timeMax,
}: {
  calendarId: string;
  accessToken: string;
  timeMin: string;
  timeMax: string;
}) {
  const events: GoogleCalendarEvent[] = [];
  let pageToken: string | undefined;

  do {
    const params = new URLSearchParams({
      timeMin,
      timeMax,
      singleEvents: "true",
      showDeleted: "true",
      maxResults: "2500",
    });

    if (pageToken) params.set("pageToken", pageToken);

    const response = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(
        calendarId,
      )}/events?${params.toString()}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("Google Calendar list events error:", data);
      throw new Error(data.error?.message || "Failed to list Google events");
    }

    events.push(...(data.items ?? []));
    pageToken = data.nextPageToken;
  } while (pageToken);

  return events;
}

function toFullCalendarEvent(row: any) {
  const status = row.status ?? "active";

  return {
    id: row.google_event_id ?? row.id,
    title: row.title,
    start: row.start_at,
    end: row.end_at,
    allDay: row.all_day,
    url: row.google_html_link ?? undefined,
    extendedProps: {
      crmEventId: row.id,
      location: row.location ?? "",
      description: row.description ?? "",
      eventType: row.event_type,
      status,
      syncStatus: row.sync_status,
      syncTarget: row.sync_target,
      reminderMinutes: row.reminder_minutes,
      deletedAt: row.deleted_at,
      deletedSource: row.deleted_source,
    },
  };
}

async function reconcileGoogleEvents({
  supabaseClient,
  googleEvents,
}: {
  supabaseClient: ReturnType<typeof createClient>;
  googleEvents: GoogleCalendarEvent[];
}) {
  for (const googleEvent of googleEvents) {
    if (!googleEvent.id) continue;

    if (googleEvent.status === "cancelled") {
      const { data: existing, error } = await supabaseClient
        .from("calendar_events")
        .select("id,status")
        .eq("google_event_id", googleEvent.id)
        .maybeSingle();

      if (error) throw error;

      if (existing && existing.status !== "deleted") {
        const { error: updateError } = await supabaseClient
          .from("calendar_events")
          .update({
            status: "deleted",
            deleted_at: new Date().toISOString(),
            deleted_source: "google",
            sync_status: "synced",
          })
          .eq("id", existing.id);

        if (updateError) throw updateError;

        await insertActivity(
          supabaseClient,
          existing.id,
          "google_deleted",
          "Event was deleted from Google Calendar.",
          {
            googleEventId: googleEvent.id,
          },
        );
      }

      continue;
    }

    const startAt = googleDateToIso(googleEvent.start);
    const endAt = googleDateToIso(googleEvent.end);

    if (!startAt || !endAt) continue;

    const { data: existing, error } = await supabaseClient
      .from("calendar_events")
      .select("id,status,deleted_source")
      .eq("google_event_id", googleEvent.id)
      .maybeSingle();

    if (error) throw error;

    if (existing) {
      if (existing.status === "deleted" || existing.status === "cancelled") {
        continue;
      }

      const { error: updateError } = await supabaseClient
        .from("calendar_events")
        .update({
          title: googleEvent.summary || "(Χωρίς τίτλο)",
          start_at: startAt,
          end_at: endAt,
          all_day: Boolean(googleEvent.start?.date),
          location: googleEvent.location || null,
          description: googleEvent.description || null,
          google_html_link: googleEvent.htmlLink || null,
          sync_status: "synced",
          status: existing.status,
        })
        .eq("id", existing.id);

      if (updateError) throw updateError;

      continue;
    }

    const { data: adoptedEvent, error: insertError } = await supabaseClient
      .from("calendar_events")
      .insert({
        title: googleEvent.summary || "(Χωρίς τίτλο)",
        start_at: startAt,
        end_at: endAt,
        all_day: Boolean(googleEvent.start?.date),
        location: googleEvent.location || null,
        description: googleEvent.description || null,
        status: "active",
        sync_target: "crm_google",
        reminder_minutes: 30,
        google_event_id: googleEvent.id,
        google_html_link: googleEvent.htmlLink || null,
        sync_status: "synced",
      })
      .select("id")
      .single();

    if (insertError) throw insertError;

    await insertActivity(
      supabaseClient,
      adoptedEvent.id,
      "google_synced",
      "Google Calendar event adopted into CRM history.",
      {
        googleEventId: googleEvent.id,
      },
    );
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return jsonResponse({ error: "Method not allowed" }, 405);
  }

  try {
    const serviceAccountJson = Deno.env.get("GOOGLE_SERVICE_ACCOUNT_JSON");
    const rawCalendarId = Deno.env.get("GOOGLE_CALENDAR_ID");

    if (!serviceAccountJson) {
      throw new Error("Missing Supabase secret: GOOGLE_SERVICE_ACCOUNT_JSON");
    }

    if (!rawCalendarId) {
      throw new Error("Missing Supabase secret: GOOGLE_CALENDAR_ID");
    }

    const body = await req.json().catch(() => ({}));
    const now = new Date();

    const fallbackMin = new Date(now);
    fallbackMin.setMonth(fallbackMin.getMonth() - 1);

    const fallbackMax = new Date(now);
    fallbackMax.setFullYear(fallbackMax.getFullYear() + 1);

    const timeMin = body.timeMin ?? fallbackMin.toISOString();
    const timeMax = body.timeMax ?? fallbackMax.toISOString();

    const supabaseClient = getSupabaseClient(req);
    await requireUser(supabaseClient);

    const serviceAccount = JSON.parse(serviceAccountJson) as ServiceAccount;
    const accessToken = await getGoogleAccessToken(serviceAccount);
    const calendarId = rawCalendarId.trim();

    const googleEvents = await fetchGoogleEvents({
      calendarId,
      accessToken,
      timeMin,
      timeMax,
    });

    await reconcileGoogleEvents({
      supabaseClient,
      googleEvents,
    });

    const { data: activeEvents, error: activeError } = await supabaseClient
      .from("calendar_events")
      .select("*")
      .lt("start_at", timeMax)
      .gt("end_at", timeMin)
      .in("status", ["active", "completed"])
      .order("start_at", { ascending: true });

    if (activeError) throw activeError;

    const { data: deletedEvents, error: deletedError } = await supabaseClient
      .from("calendar_events")
      .select("*")
      .lt("start_at", timeMax)
      .gt("end_at", timeMin)
      .in("status", ["deleted", "cancelled"])
      .order("start_at", { ascending: false })
      .limit(50);

    if (deletedError) throw deletedError;

    return jsonResponse({
      ok: true,
      events: (activeEvents ?? []).map(toFullCalendarEvent),
      deletedEvents: (deletedEvents ?? []).map(toFullCalendarEvent),
    });
  } catch (error) {
    console.error(error);

    return jsonResponse(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      error instanceof Error && error.message === "Not authenticated."
        ? 401
        : 500,
    );
  }
});
