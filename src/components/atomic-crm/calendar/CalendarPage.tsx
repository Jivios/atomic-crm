import { type FormEvent, useMemo, useState } from "react";
import {
  AlertCircle,
  CalendarDays,
  CheckCircle2,
  ExternalLink,
  Loader2,
  Plus,
  X,
} from "lucide-react";

import { getSupabaseClient } from "../providers/supabase/supabase";

const GOOGLE_CALENDAR_URL = "https://calendar.google.com/calendar/u/0/r";
const GOOGLE_CALENDAR_EMBED_URL = import.meta.env
  .VITE_GOOGLE_CALENDAR_EMBED_URL;

type CreateEventState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; message: string; htmlLink?: string }
  | { status: "error"; message: string };

type AppointmentFormState = {
  summary: string;
  date: string;
  startTime: string;
  endTime: string;
  location: string;
  description: string;
};

function pad(number: number) {
  return String(number).padStart(2, "0");
}

function getTomorrowDate() {
  const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);

  return `${tomorrow.getFullYear()}-${pad(tomorrow.getMonth() + 1)}-${pad(
    tomorrow.getDate(),
  )}`;
}

function formatGreekDate(date: string, time: string) {
  const [year, month, day] = date.split("-");

  return `${day}/${month}/${year}, ${time}`;
}

function buildAthensDateTime(date: string, time: string) {
  return `${date}T${time}:00+03:00`;
}

const initialAppointmentForm: AppointmentFormState = {
  summary: "Ραντεβού ανάθεσης",
  date: getTomorrowDate(),
  startTime: "10:00",
  endTime: "11:00",
  location: "Athens, Greece",
  description: "Ραντεβού από το Home Direct CRM.",
};

export const CalendarPage = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [calendarRefreshKey, setCalendarRefreshKey] = useState(0);

  const [createEventState, setCreateEventState] = useState<CreateEventState>({
    status: "idle",
  });

  const [appointmentForm, setAppointmentForm] = useState<AppointmentFormState>(
    initialAppointmentForm,
  );

  const appointmentPreview = useMemo(
    () => formatGreekDate(appointmentForm.date, appointmentForm.startTime),
    [appointmentForm.date, appointmentForm.startTime],
  );

  const calendarEmbedSrc = useMemo(() => {
    if (!GOOGLE_CALENDAR_EMBED_URL) return "";

    try {
      const url = new URL(GOOGLE_CALENDAR_EMBED_URL);
      url.searchParams.set("crmRefresh", String(calendarRefreshKey));
      return url.toString();
    } catch {
      return GOOGLE_CALENDAR_EMBED_URL;
    }
  }, [calendarRefreshKey]);

  const updateAppointmentForm = (
    field: keyof AppointmentFormState,
    value: string,
  ) => {
    setAppointmentForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const handleCreateAppointment = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setCreateEventState({ status: "loading" });

    try {
      if (!appointmentForm.summary.trim()) {
        throw new Error("Συμπλήρωσε τίτλο ραντεβού.");
      }

      if (!appointmentForm.date) {
        throw new Error("Συμπλήρωσε ημερομηνία.");
      }

      if (!appointmentForm.startTime || !appointmentForm.endTime) {
        throw new Error("Συμπλήρωσε ώρα έναρξης και λήξης.");
      }

      const start = buildAthensDateTime(
        appointmentForm.date,
        appointmentForm.startTime,
      );
      const end = buildAthensDateTime(
        appointmentForm.date,
        appointmentForm.endTime,
      );

      if (Date.parse(end) <= Date.parse(start)) {
        throw new Error("Η ώρα λήξης πρέπει να είναι μετά την ώρα έναρξης.");
      }

      const supabaseClient = getSupabaseClient();

      const { data, error } = await supabaseClient.functions.invoke(
        "create-calendar-event",
        {
          body: {
            summary: appointmentForm.summary.trim(),
            description: appointmentForm.description.trim(),
            location: appointmentForm.location.trim(),
            start,
            end,
          },
        },
      );

      if (error) {
        throw new Error(error.message);
      }

      if (!data?.ok) {
        throw new Error(data?.error ?? "Unknown Google Calendar error");
      }

      setCreateEventState({
        status: "success",
        message: `Το ραντεβού δημιουργήθηκε για ${appointmentPreview}.`,
        htmlLink: data.htmlLink,
      });

      setCalendarRefreshKey((current) => current + 1);
      setIsFormOpen(false);
    } catch (error) {
      setCreateEventState({
        status: "error",
        message:
          error instanceof Error
            ? error.message
            : "Δεν ήταν δυνατή η δημιουργία ραντεβού.",
      });
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <section className="flex flex-col gap-5 rounded-3xl bg-white p-8 shadow-sm ring-1 ring-slate-200 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-700">
              <CalendarDays className="h-4 w-4" />
              Home Direct CRM
            </div>

            <h1 className="text-3xl font-semibold tracking-tight text-slate-950">
              Ημερολόγιο
            </h1>

            <p className="mt-3 max-w-2xl text-slate-600">
              Δες το πραγματικό Google Calendar μέσα στο CRM και δημιούργησε
              ραντεβού χωρίς να φύγεις από την εφαρμογή.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={() => {
                setIsFormOpen((current) => !current);
                setCreateEventState({ status: "idle" });
              }}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#032360] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:opacity-90"
            >
              {isFormOpen ? (
                <X className="h-4 w-4" />
              ) : (
                <Plus className="h-4 w-4" />
              )}
              Νέο Ραντεβού
            </button>

            <a
              href={GOOGLE_CALENDAR_URL}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-800 shadow-sm transition hover:bg-slate-50"
            >
              Άνοιγμα Google Calendar
              <ExternalLink className="h-4 w-4" />
            </a>
          </div>
        </section>

        {createEventState.status === "success" && (
          <div className="flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">
            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />
            <div>
              <p className="font-semibold">{createEventState.message}</p>
              {createEventState.htmlLink && (
                <a
                  href={createEventState.htmlLink}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-1 inline-flex items-center gap-1 underline"
                >
                  Άνοιγμα event στο Google Calendar
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              )}
            </div>
          </div>
        )}

        {createEventState.status === "error" && (
          <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-900">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
            <div>
              <p className="font-semibold">Δεν δημιουργήθηκε το ραντεβού.</p>
              <p className="mt-1">{createEventState.message}</p>
            </div>
          </div>
        )}

        {isFormOpen && (
          <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <div className="mb-5">
              <h2 className="text-xl font-semibold text-slate-950">
                Νέο ραντεβού
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Συμπλήρωσε τα στοιχεία και δημιούργησε πραγματικό event στο
                Google Calendar.
              </p>
            </div>

            <form onSubmit={handleCreateAppointment} className="grid gap-4">
              <div className="grid gap-4 lg:grid-cols-2">
                <label className="grid gap-2 text-sm font-medium text-slate-700">
                  Τίτλος
                  <input
                    value={appointmentForm.summary}
                    onChange={(event) =>
                      updateAppointmentForm("summary", event.target.value)
                    }
                    className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-base text-slate-950 outline-none transition focus:border-[#032360] focus:ring-2 focus:ring-[#032360]/10"
                    placeholder="π.χ. Προβολή ακινήτου - Γλυφάδα"
                  />
                </label>

                <label className="grid gap-2 text-sm font-medium text-slate-700">
                  Τοποθεσία
                  <input
                    value={appointmentForm.location}
                    onChange={(event) =>
                      updateAppointmentForm("location", event.target.value)
                    }
                    className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-base text-slate-950 outline-none transition focus:border-[#032360] focus:ring-2 focus:ring-[#032360]/10"
                    placeholder="π.χ. Γλυφάδα, Αθήνα"
                  />
                </label>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <label className="grid gap-2 text-sm font-medium text-slate-700">
                  Ημερομηνία
                  <input
                    type="date"
                    value={appointmentForm.date}
                    onChange={(event) =>
                      updateAppointmentForm("date", event.target.value)
                    }
                    className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-base text-slate-950 outline-none transition focus:border-[#032360] focus:ring-2 focus:ring-[#032360]/10"
                  />
                </label>

                <label className="grid gap-2 text-sm font-medium text-slate-700">
                  Ώρα έναρξης
                  <input
                    type="time"
                    value={appointmentForm.startTime}
                    onChange={(event) =>
                      updateAppointmentForm("startTime", event.target.value)
                    }
                    className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-base text-slate-950 outline-none transition focus:border-[#032360] focus:ring-2 focus:ring-[#032360]/10"
                  />
                </label>

                <label className="grid gap-2 text-sm font-medium text-slate-700">
                  Ώρα λήξης
                  <input
                    type="time"
                    value={appointmentForm.endTime}
                    onChange={(event) =>
                      updateAppointmentForm("endTime", event.target.value)
                    }
                    className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-base text-slate-950 outline-none transition focus:border-[#032360] focus:ring-2 focus:ring-[#032360]/10"
                  />
                </label>
              </div>

              <label className="grid gap-2 text-sm font-medium text-slate-700">
                Σημειώσεις
                <textarea
                  value={appointmentForm.description}
                  onChange={(event) =>
                    updateAppointmentForm("description", event.target.value)
                  }
                  rows={3}
                  className="resize-none rounded-xl border border-slate-300 bg-white px-4 py-3 text-base text-slate-950 outline-none transition focus:border-[#032360] focus:ring-2 focus:ring-[#032360]/10"
                  placeholder="π.χ. Πελάτης ενδιαφέρεται για 3 υπνοδωμάτια, πάρκινγκ και θέα."
                />
              </label>

              <div className="flex flex-col gap-3 border-t border-slate-200 pt-4 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-slate-500">
                  Προεπισκόπηση:{" "}
                  <span className="font-semibold text-slate-800">
                    {appointmentForm.summary || "Νέο ραντεβού"} —{" "}
                    {appointmentPreview}
                  </span>
                </p>

                <button
                  type="submit"
                  disabled={createEventState.status === "loading"}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#032360] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {createEventState.status === "loading" ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Plus className="h-4 w-4" />
                  )}
                  Δημιουργία ραντεβού
                </button>
              </div>
            </form>
          </section>
        )}

        <section className="overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-slate-200">
          <div className="flex flex-col gap-3 border-b border-slate-200 p-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-xl font-semibold text-slate-950">
                Πρόγραμμα
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Embedded Google Calendar μέσα στο Home Direct CRM.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setCalendarRefreshKey((current) => current + 1)}
              className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-800 shadow-sm transition hover:bg-slate-50"
            >
              Ανανέωση ημερολογίου
            </button>
          </div>

          {calendarEmbedSrc ? (
            <iframe
              key={calendarRefreshKey}
              title="Home Direct CRM Google Calendar"
              src={calendarEmbedSrc}
              className="h-[760px] w-full border-0"
            />
          ) : (
            <div className="flex min-h-[520px] flex-col items-center justify-center bg-slate-50 p-8 text-center">
              <CalendarDays className="h-12 w-12 text-[#032360]" />

              <h3 className="mt-4 text-lg font-semibold text-slate-950">
                Λείπει το Google Calendar embed URL
              </h3>

              <p className="mt-2 max-w-xl text-sm text-slate-500">
                Πρόσθεσε το iframe src URL στο environment variable
                VITE_GOOGLE_CALENDAR_EMBED_URL και κάνε rebuild. Η δημιουργία
                events δουλεύει ήδη μέσω Supabase Edge Function.
              </p>
            </div>
          )}
        </section>
      </div>
    </main>
  );
};
