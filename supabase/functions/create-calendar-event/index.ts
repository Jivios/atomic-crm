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

type CalendarEventPayload = {
  action?: "create" | "delete" | "complete" | "reopen";
  eventId?: string;
  summary?: string;
  description?: string;
  location?: string;
  start?: string;
  end?: string;
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

function validateCreatePayload(payload: CalendarEventPayload) {
  if (!payload.summary) throw new Error("Missing required field: summary");
  if (!payload.start) throw new Error("Missing required field: start");
  if (!payload.end) throw new Error("Missing required field: end");

  if (Number.isNaN(Date.parse(payload.start))) {
    throw new Error("Invalid start datetime");
  }

  if (Number.isNaN(Date.parse(payload.end))) {
    throw new Error("Invalid end datetime");
  }

  if (Date.parse(payload.end) <= Date.parse(payload.start)) {
    throw new Error("Event end must be after event start.");
  }
}

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value,
  );
}

async function readGoogleResponse(response: Response) {
  const text = await response.text();

  if (!text) return null;

  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

async function ensureCalendarVisible(calendarId: string, accessToken: string) {
  await fetch("https://www.googleapis.com/calendar/v3/users/me/calendarList", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      id: calendarId,
      selected: true,
    }),
  }).catch(() => null);
}

async function findCalendarEvent(
  supabaseClient: ReturnType<typeof createClient>,
  eventId: string,
) {
  if (isUuid(eventId)) {
    const { data, error } = await supabaseClient
      .from("calendar_events")
      .select("*")
      .eq("id", eventId)
      .maybeSingle();

    if (error) throw error;
    if (data) return data;
  }

  const { data, error } = await supabaseClient
    .from("calendar_events")
    .select("*")
    .eq("google_event_id", eventId)
    .maybeSingle();

  if (error) throw error;

  return data;
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

    const calendarId = rawCalendarId.trim();
    const serviceAccount = JSON.parse(serviceAccountJson) as ServiceAccount;
    const payload = (await req.json()) as CalendarEventPayload;
    const action = payload.action ?? "create";

    const supabaseClient = getSupabaseClient(req);
    await requireUser(supabaseClient);

    const accessToken = await getGoogleAccessToken(serviceAccount);
    await ensureCalendarVisible(calendarId, accessToken);

    if (action === "complete" || action === "reopen") {
      if (!payload.eventId) throw new Error("Missing required field: eventId");

      const crmEvent = await findCalendarEvent(supabaseClient, payload.eventId);

      if (!crmEvent) {
        throw new Error("Calendar event not found.");
      }

      const nextStatus = action === "complete" ? "completed" : "active";

      const { error } = await supabaseClient
        .from("calendar_events")
        .update({
          status: nextStatus,
          deleted_at: null,
          deleted_source: null,
        })
        .eq("id", crmEvent.id);

      if (error) throw error;

      await insertActivity(
        supabaseClient,
        crmEvent.id,
        action === "complete" ? "completed" : "reopened",
        action === "complete"
          ? "Event marked as completed."
          : "Event reopened.",
      );

      return jsonResponse({
        ok: true,
        eventId: crmEvent.id,
        status: nextStatus,
      });
    }

    if (action === "delete") {
      if (!payload.eventId) throw new Error("Missing required field: eventId");

      const crmEvent = await findCalendarEvent(supabaseClient, payload.eventId);
      const googleEventId = crmEvent?.google_event_id ?? payload.eventId;

      const deleteResponse = await fetch(
        `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(
          calendarId,
        )}/events/${encodeURIComponent(googleEventId)}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      );

      const deleteDetails = await readGoogleResponse(deleteResponse);
      const googleDeleteOk =
        deleteResponse.ok ||
        deleteResponse.status === 404 ||
        deleteResponse.status === 410;

      if (!googleDeleteOk) {
        console.error("Google Calendar delete event error:", deleteDetails);

        return jsonResponse(
          {
            error: "Failed to delete Google Calendar event",
            details: deleteDetails,
          },
          deleteResponse.status,
        );
      }

      if (crmEvent) {
        const { error } = await supabaseClient
          .from("calendar_events")
          .update({
            status: "deleted",
            deleted_at: new Date().toISOString(),
            deleted_source: "crm",
            sync_status: "synced",
          })
          .eq("id", crmEvent.id);

        if (error) throw error;

        await insertActivity(
          supabaseClient,
          crmEvent.id,
          "deleted",
          "Event deleted from CRM and Google Calendar.",
          {
            googleEventId,
          },
        );
      }

      return jsonResponse({
        ok: true,
        deleted: true,
        eventId: payload.eventId,
      });
    }

    validateCreatePayload(payload);

    const { data: crmEvent, error: insertError } = await supabaseClient
      .from("calendar_events")
      .insert({
        title: payload.summary!.trim(),
        start_at: payload.start,
        end_at: payload.end,
        location: payload.location?.trim() || null,
        description: payload.description?.trim() || null,
        status: "active",
        sync_status: "pending",
      })
      .select()
      .single();

    if (insertError) throw insertError;

    await insertActivity(
      supabaseClient,
      crmEvent.id,
      "created",
      "Event created in Home Direct CRM.",
    );

    const googleEvent = {
      summary: payload.summary,
      description: payload.description ?? "",
      location: payload.location ?? "",
      start: {
        dateTime: payload.start,
        timeZone: "Europe/Athens",
      },
      end: {
        dateTime: payload.end,
        timeZone: "Europe/Athens",
      },
    };

    const createEventResponse = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(
        calendarId,
      )}/events`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(googleEvent),
      },
    );

    const createdEvent = await createEventResponse.json();

    if (!createEventResponse.ok) {
      await supabaseClient
        .from("calendar_events")
        .update({
          sync_status: "error",
        })
        .eq("id", crmEvent.id);

      await insertActivity(
        supabaseClient,
        crmEvent.id,
        "google_sync_error",
        "Google Calendar sync failed.",
        {
          details: createdEvent,
        },
      );

      console.error("Google Calendar create event error:", createdEvent);

      return jsonResponse(
        {
          error: "Failed to create Google Calendar event",
          details: createdEvent,
        },
        createEventResponse.status,
      );
    }

    const { error: updateError } = await supabaseClient
      .from("calendar_events")
      .update({
        google_event_id: createdEvent.id,
        google_html_link: createdEvent.htmlLink,
        sync_status: "synced",
      })
      .eq("id", crmEvent.id);

    if (updateError) throw updateError;

    await insertActivity(
      supabaseClient,
      crmEvent.id,
      "google_synced",
      "Event synced to Google Calendar.",
      {
        googleEventId: createdEvent.id,
      },
    );

    return jsonResponse({
      ok: true,
      crmEventId: crmEvent.id,
      eventId: createdEvent.id,
      htmlLink: createdEvent.htmlLink,
      summary: createdEvent.summary,
      start: createdEvent.start,
      end: createdEvent.end,
    });
  } catch (error) {
    console.error(error);

    return jsonResponse(
      {
        error: error instanceof Error ? error.message : "Unknown error",
      },
      error instanceof Error && error.message === "Not authenticated."
        ? 401
        : 500,
    );
  }
});
