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

function preview(value: string) {
  if (value.length <= 16) return value;
  return `${value.slice(0, 6)}...${value.slice(-24)}`;
}

function base64UrlEncode(input: string | Uint8Array): string {
  const bytes =
    typeof input === "string" ? new TextEncoder().encode(input) : input;

  let binary = "";
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }

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

  const header = {
    alg: "RS256",
    typ: "JWT",
  };

  const payload = {
    iss: serviceAccount.client_email,
    scope: GOOGLE_CALENDAR_SCOPE,
    aud: GOOGLE_TOKEN_URL,
    exp: now + 3600,
    iat: now,
  };

  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedPayload = base64UrlEncode(JSON.stringify(payload));
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

function validatePayload(payload: CalendarEventPayload) {
  if (!payload.summary) throw new Error("Missing required field: summary");
  if (!payload.start) throw new Error("Missing required field: start");
  if (!payload.end) throw new Error("Missing required field: end");

  if (Number.isNaN(Date.parse(payload.start))) {
    throw new Error("Invalid start datetime");
  }

  if (Number.isNaN(Date.parse(payload.end))) {
    throw new Error("Invalid end datetime");
  }
}

async function googleFetch(
  url: string,
  accessToken: string,
  init: RequestInit = {},
) {
  const response = await fetch(url, {
    ...init,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      ...(init.headers || {}),
    },
  });

  let data: unknown = null;

  try {
    data = await response.json();
  } catch {
    data = null;
  }

  return {
    ok: response.ok,
    status: response.status,
    data,
  };
}

async function addCalendarToServiceAccountList(
  calendarId: string,
  accessToken: string,
) {
  return googleFetch(
    "https://www.googleapis.com/calendar/v3/users/me/calendarList",
    accessToken,
    {
      method: "POST",
      body: JSON.stringify({
        id: calendarId,
        selected: true,
      }),
    },
  );
}

async function createGoogleCalendarEvent(
  calendarId: string,
  accessToken: string,
  payload: CalendarEventPayload,
) {
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

  return googleFetch(
    `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(
      calendarId,
    )}/events`,
    accessToken,
    {
      method: "POST",
      body: JSON.stringify(googleEvent),
    },
  );
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

    validatePayload(payload);

    const accessToken = await getGoogleAccessToken(serviceAccount);

    const calendarGetBefore = await googleFetch(
      `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(
        calendarId,
      )}`,
      accessToken,
      { method: "GET" },
    );

    const calendarListInsert = await addCalendarToServiceAccountList(
      calendarId,
      accessToken,
    );

    const createEvent = await createGoogleCalendarEvent(
      calendarId,
      accessToken,
      payload,
    );

    if (!createEvent.ok) {
      console.error("Google Calendar create event error:", createEvent.data);

      return jsonResponse(
        {
          error: "Failed to create Google Calendar event",
          diagnostics: {
            serviceAccountEmail: serviceAccount.client_email,
            calendarIdPreview: preview(calendarId),
            calendarIdLength: calendarId.length,
            calendarGetBeforeStatus: calendarGetBefore.status,
            calendarListInsertStatus: calendarListInsert.status,
            createEventStatus: createEvent.status,
          },
          details: createEvent.data,
          calendarGetBeforeDetails: calendarGetBefore.data,
          calendarListInsertDetails: calendarListInsert.data,
        },
        createEvent.status,
      );
    }

    const createdEvent = createEvent.data as {
      id?: string;
      htmlLink?: string;
      summary?: string;
      start?: unknown;
      end?: unknown;
    };

    return jsonResponse({
      ok: true,
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
      500,
    );
  }
});
