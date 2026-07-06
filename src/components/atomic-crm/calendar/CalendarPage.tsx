import {
  type FormEvent,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import FullCalendar from "@fullcalendar/react";
import type { EventClickArg, EventInput } from "@fullcalendar/core";
import elLocale from "@fullcalendar/core/locales/el";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import listPlugin from "@fullcalendar/list";
import timeGridPlugin from "@fullcalendar/timegrid";
import {
  AlertCircle,
  CalendarDays,
  CheckCircle2,
  ExternalLink,
  Loader2,
  Plus,
  RefreshCw,
  RotateCcw,
  Trash2,
  X,
} from "lucide-react";

import { getSupabaseClient } from "../providers/supabase/supabase";

const GOOGLE_CALENDAR_URL = "https://calendar.google.com/calendar/u/0/r";
const BRAND_BLUE = "#032360";
const EUCALYPTUS = "#009688";
const GOOGLE_NOW_RED = "#d93025";
const COMPLETED_EVENTS_STORAGE_KEY = "home-direct-calendar-completed-event-ids";

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

type HoveredEvent = {
  title: string;
  time: string;
  location: string;
  description: string;
  x: number;
  y: number;
};

type EventDetails = {
  eventId?: string;
  title: string;
  time: string;
  location: string;
  description: string;
  url?: string;
};

type OverlapWarning = {
  requestedTime: string;
  overlaps: EventInput[];
};

function pad(number: number) {
  return String(number).padStart(2, "0");
}

function readCompletedEventIds() {
  if (typeof window === "undefined") return new Set<string>();

  try {
    const raw = window.localStorage.getItem(COMPLETED_EVENTS_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];

    return new Set<string>(Array.isArray(parsed) ? parsed : []);
  } catch {
    return new Set<string>();
  }
}

function writeCompletedEventIds(ids: Set<string>) {
  if (typeof window === "undefined") return;

  window.localStorage.setItem(
    COMPLETED_EVENTS_STORAGE_KEY,
    JSON.stringify([...ids]),
  );
}

function getTomorrowDate() {
  const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);

  return `${tomorrow.getFullYear()}-${pad(tomorrow.getMonth() + 1)}-${pad(
    tomorrow.getDate(),
  )}`;
}

function toDateInputValue(date: Date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
    date.getDate(),
  )}`;
}

function toTimeInputValue(date: Date) {
  return `${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function addHours(date: Date, hours: number) {
  const next = new Date(date);
  next.setHours(next.getHours() + hours);
  return next;
}

function normalizeClickedDate(date: Date, allDay?: boolean) {
  const normalized = new Date(date);

  if (
    allDay ||
    (normalized.getHours() === 0 && normalized.getMinutes() === 0)
  ) {
    normalized.setHours(10, 0, 0, 0);
  }

  return normalized;
}

function formatGreekDate(date: string, time: string) {
  const [year, month, day] = date.split("-");

  return `${day}/${month}/${year}, ${time}`;
}

function buildAthensDateTime(date: string, time: string) {
  return `${date}T${time}:00+03:00`;
}

function getCalendarFetchRange() {
  const start = new Date();
  start.setMonth(start.getMonth() - 1);

  const end = new Date();
  end.setFullYear(end.getFullYear() + 1);

  return {
    timeMin: start.toISOString(),
    timeMax: end.toISOString(),
  };
}

function formatEventTime(
  start?: Date | null,
  end?: Date | null,
  allDay?: boolean,
) {
  if (!start) return "Χωρίς ώρα";

  if (allDay) {
    return start.toLocaleDateString("el-GR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  }

  const formatter = new Intl.DateTimeFormat("el-GR", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  if (!end) return formatter.format(start);

  return `${formatter.format(start)} – ${formatter.format(end)}`;
}

function formatLocation(location: string) {
  const normalized = location.trim().toLowerCase();

  if (normalized === "athens, greece") return "Αθήνα, Ελλάδα";

  return location;
}

function getGoogleMapsUrl(location: string) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    location,
  )}`;
}

function isSameCalendarDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function getSelectionEndForSameDayCheck(end: Date) {
  return new Date(end.getTime() - 1);
}

function toDate(value: unknown): Date | null {
  if (!value) return null;
  if (value instanceof Date) return value;

  const parsed = new Date(String(value));

  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function getEventRange(event: EventInput) {
  const start = toDate(event.start);
  if (!start) return null;

  const end = event.end ? toDate(event.end) : addHours(start, 1);
  if (!end) return null;

  return { start, end };
}

function rangesOverlap(
  firstStart: Date,
  firstEnd: Date,
  secondStart: Date,
  secondEnd: Date,
) {
  return firstStart < secondEnd && secondStart < firstEnd;
}

function getOverlappingEvents(
  events: EventInput[],
  requestedStart: Date,
  requestedEnd: Date,
) {
  return events.filter((event) => {
    const range = getEventRange(event);
    if (!range) return false;

    return rangesOverlap(requestedStart, requestedEnd, range.start, range.end);
  });
}

function getEventIdentity(event: EventInput) {
  return String(event.id ?? `${event.title ?? "event"}-${String(event.start)}`);
}

function getEventDetailsFromInput(event: EventInput): EventDetails {
  const range = getEventRange(event);
  const location = formatLocation(String(event.extendedProps?.location || ""));

  return {
    eventId: String(event.id || ""),
    title: String(event.title || "(Χωρίς τίτλο)"),
    time: formatEventTime(
      range?.start ?? null,
      range?.end ?? null,
      Boolean(event.allDay),
    ),
    location,
    description: String(event.extendedProps?.description || ""),
    url: event.url ? String(event.url) : undefined,
  };
}

const initialAppointmentForm: AppointmentFormState = {
  summary: "Ραντεβού ανάθεσης",
  date: getTomorrowDate(),
  startTime: "10:00",
  endTime: "11:00",
  location: "Αθήνα, Ελλάδα",
  description: "Ραντεβού από το Home Direct CRM.",
};

export const CalendarPage = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [calendarEvents, setCalendarEvents] = useState<EventInput[]>([]);
  const [deletedCalendarEvents, setDeletedCalendarEvents] = useState<
    EventInput[]
  >([]);
  const [eventsLoading, setEventsLoading] = useState(false);
  const [eventsError, setEventsError] = useState<string | null>(null);
  const [refreshCounter, setRefreshCounter] = useState(0);
  const [selectedDate, setSelectedDate] = useState(
    toDateInputValue(new Date()),
  );
  const [hoveredEvent, setHoveredEvent] = useState<HoveredEvent | null>(null);
  const [eventDetails, setEventDetails] = useState<EventDetails | null>(null);
  const [deleteConfirmation, setDeleteConfirmation] =
    useState<EventDetails | null>(null);
  const [isDeletingEvent, setIsDeletingEvent] = useState(false);
  const [isRestoringEvent, setIsRestoringEvent] = useState(false);
  const [historyExpanded, setHistoryExpanded] = useState(false);
  const [overlapWarning, setOverlapWarning] = useState<OverlapWarning | null>(
    null,
  );
  const [completedEventIds, setCompletedEventIds] = useState<Set<string>>(() =>
    readCompletedEventIds(),
  );

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

  const selectedDayEvents = useMemo(() => {
    return calendarEvents
      .filter((event) => {
        const range = getEventRange(event);
        if (!range) return false;

        const selected = new Date(`${selectedDate}T12:00:00`);

        return (
          isSameCalendarDay(range.start, selected) ||
          (range.start <= selected && range.end >= selected)
        );
      })
      .sort((a, b) => {
        const aRange = getEventRange(a);
        const bRange = getEventRange(b);

        return (aRange?.start.getTime() ?? 0) - (bRange?.start.getTime() ?? 0);
      });
  }, [calendarEvents, selectedDate]);

  const selectedDeletedDayEvents = useMemo(() => {
    return deletedCalendarEvents
      .filter((event) => {
        const range = getEventRange(event);
        if (!range) return false;

        const selected = new Date(`${selectedDate}T12:00:00`);

        return (
          isSameCalendarDay(range.start, selected) ||
          (range.start <= selected && range.end >= selected)
        );
      })
      .sort((a, b) => {
        const aRange = getEventRange(a);
        const bRange = getEventRange(b);

        return (aRange?.start.getTime() ?? 0) - (bRange?.start.getTime() ?? 0);
      });
  }, [deletedCalendarEvents, selectedDate]);

  useEffect(() => {
    const hasSelectedDayItems = [
      ...calendarEvents,
      ...deletedCalendarEvents,
    ].some((event) => {
      const range = getEventRange(event);
      if (!range) return false;

      const selected = new Date(`${selectedDate}T12:00:00`);

      return (
        isSameCalendarDay(range.start, selected) ||
        (range.start <= selected && range.end >= selected)
      );
    });

    if (!hasSelectedDayItems && calendarEvents.length > 0) {
      const firstEventRange = getEventRange(calendarEvents[0]);

      if (firstEventRange) {
        setSelectedDate(toDateInputValue(firstEventRange.start));
      }
    }
  }, [calendarEvents, deletedCalendarEvents, selectedDate]);

  const toggleCompletedEvent = (eventId: string) => {
    setCompletedEventIds((current) => {
      const next = new Set(current);

      if (next.has(eventId)) {
        next.delete(eventId);
      } else {
        next.add(eventId);
      }

      writeCompletedEventIds(next);

      return next;
    });
  };

  const updateAppointmentForm = (
    field: keyof AppointmentFormState,
    value: string,
  ) => {
    setAppointmentForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const openAppointmentDraft = ({
    start,
    end,
    allDay,
  }: {
    start: Date;
    end?: Date;
    allDay?: boolean;
  }) => {
    const normalizedStart = normalizeClickedDate(start, allDay);
    const normalizedEnd = end ? new Date(end) : addHours(normalizedStart, 1);

    if (allDay || normalizedEnd <= normalizedStart) {
      normalizedEnd.setTime(addHours(normalizedStart, 1).getTime());
    }

    const date = toDateInputValue(normalizedStart);

    setSelectedDate(date);
    setAppointmentForm((current) => ({
      ...current,
      date,
      startTime: toTimeInputValue(normalizedStart),
      endTime: toTimeInputValue(normalizedEnd),
    }));
    setCreateEventState({ status: "idle" });
    setOverlapWarning(null);
    setIsFormOpen(true);
  };

  const fetchCalendarEvents = useCallback(async () => {
    setEventsLoading(true);
    setEventsError(null);

    try {
      const supabaseClient = getSupabaseClient();
      const { timeMin, timeMax } = getCalendarFetchRange();

      const { data, error } = await supabaseClient.functions.invoke(
        "list-calendar-events",
        {
          body: {
            timeMin,
            timeMax,
          },
        },
      );

      if (error) {
        throw new Error(error.message);
      }

      if (!data?.ok) {
        throw new Error(data?.error ?? "Δεν φορτώθηκαν τα events.");
      }

      const coloredEvents: EventInput[] = (data.events ?? []).map(
        (event: EventInput) => ({
          ...event,
          backgroundColor: EUCALYPTUS,
          borderColor: EUCALYPTUS,
          textColor: "#ffffff",
        }),
      );

      const deletedEvents: EventInput[] = (data.deletedEvents ?? []).map(
        (event: EventInput) => ({
          ...event,
          backgroundColor: "#94a3b8",
          borderColor: "#94a3b8",
          textColor: "#ffffff",
        }),
      );

      setCalendarEvents(coloredEvents);
      setDeletedCalendarEvents(deletedEvents);
    } catch (error) {
      setDeletedCalendarEvents([]);
      setEventsError(
        error instanceof Error
          ? error.message
          : "Δεν φορτώθηκαν τα events του ημερολογίου.",
      );
    } finally {
      setEventsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCalendarEvents();
  }, [fetchCalendarEvents, refreshCounter]);

  const createAppointment = async ({
    allowOverlap = false,
  }: {
    allowOverlap?: boolean;
  } = {}) => {
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

      const requestedStart = new Date(start);
      const requestedEnd = new Date(end);

      if (requestedEnd <= requestedStart) {
        throw new Error("Η ώρα λήξης πρέπει να είναι μετά την ώρα έναρξης.");
      }

      const overlaps = getOverlappingEvents(
        calendarEvents,
        requestedStart,
        requestedEnd,
      );

      if (overlaps.length > 0 && !allowOverlap) {
        setCreateEventState({ status: "idle" });
        setOverlapWarning({
          requestedTime: `${appointmentPreview} – ${appointmentForm.endTime}`,
          overlaps,
        });
        return;
      }

      setOverlapWarning(null);

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

      setIsFormOpen(false);
      setRefreshCounter((current) => current + 1);
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

  const handleCreateAppointment = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await createAppointment();
  };

  const handleDeleteEvent = async () => {
    if (!deleteConfirmation?.eventId) {
      setDeleteConfirmation(null);
      return;
    }

    setIsDeletingEvent(true);

    try {
      const supabaseClient = getSupabaseClient();

      const { data, error } = await supabaseClient.functions.invoke(
        "create-calendar-event",
        {
          body: {
            action: "delete",
            eventId: deleteConfirmation.eventId,
          },
        },
      );

      if (error) {
        throw new Error(error.message);
      }

      if (!data?.ok) {
        throw new Error(data?.error ?? "Δεν διαγράφηκε το event.");
      }

      setDeleteConfirmation(null);
      setEventDetails(null);
      setCreateEventState({
        status: "success",
        message: "Το event διαγράφηκε από το Google Calendar.",
      });
      setRefreshCounter((current) => current + 1);
    } catch (error) {
      setCreateEventState({
        status: "error",
        message:
          error instanceof Error
            ? error.message
            : "Δεν ήταν δυνατή η διαγραφή του event.",
      });
    } finally {
      setIsDeletingEvent(false);
    }
  };

  const handleRestoreEvent = async (event: EventDetails) => {
    if (!event.eventId) return;

    setIsRestoringEvent(true);

    try {
      const supabaseClient = getSupabaseClient();

      const { data, error } = await supabaseClient.functions.invoke(
        "create-calendar-event",
        {
          body: {
            action: "restore",
            eventId: event.eventId,
          },
        },
      );

      if (error) {
        throw new Error(error.message);
      }

      if (!data?.ok) {
        throw new Error(data?.error ?? "Δεν έγινε επαναφορά του event.");
      }

      setCreateEventState({
        status: "success",
        message: "Το event επανήλθε στο ημερολόγιο.",
        htmlLink: data.htmlLink,
      });
      setRefreshCounter((current) => current + 1);
      setHistoryExpanded(false);
    } catch (error) {
      setCreateEventState({
        status: "error",
        message:
          error instanceof Error
            ? error.message
            : "Δεν ήταν δυνατή η επαναφορά του event.",
      });
    } finally {
      setIsRestoringEvent(false);
    }
  };

  const handleEventClick = (eventClick: EventClickArg) => {
    eventClick.jsEvent.preventDefault();

    const event = eventClick.event;

    if (event.start) {
      setSelectedDate(toDateInputValue(event.start));
    }

    setEventDetails({
      eventId: event.id,
      title: event.title || "(Χωρίς τίτλο)",
      time: formatEventTime(event.start, event.end, event.allDay),
      location: formatLocation(String(event.extendedProps.location || "")),
      description: String(event.extendedProps.description || ""),
      url: event.url || undefined,
    });
  };

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-8">
      <style>
        {`
          .home-direct-calendar {
            --fc-border-color: ${BRAND_BLUE};
            --fc-neutral-text-color: ${BRAND_BLUE};
            --fc-page-bg-color: #ffffff;
            --fc-today-bg-color: rgba(3, 35, 96, 0.06);
            --fc-now-indicator-color: ${GOOGLE_NOW_RED};
            --fc-button-bg-color: ${BRAND_BLUE};
            --fc-button-border-color: ${BRAND_BLUE};
            --fc-button-hover-bg-color: #021a49;
            --fc-button-hover-border-color: #021a49;
            --fc-button-active-bg-color: #021a49;
            --fc-button-active-border-color: #021a49;
            color: ${BRAND_BLUE};
          }

          .home-direct-calendar .fc {
            color: ${BRAND_BLUE};
          }

          .home-direct-calendar .fc-scrollgrid,
          .home-direct-calendar .fc-theme-standard td,
          .home-direct-calendar .fc-theme-standard th {
            border-color: rgba(3, 35, 96, 0.55);
          }

          .home-direct-calendar .fc-col-header-cell,
          .home-direct-calendar .fc-timegrid-slot-label,
          .home-direct-calendar .fc-toolbar-title,
          .home-direct-calendar .fc-daygrid-day-number,
          .home-direct-calendar .fc-list-day-text,
          .home-direct-calendar .fc-list-day-side-text {
            color: ${BRAND_BLUE};
          }

          .home-direct-calendar .fc-timegrid-slot-minor {
            border-top: 0;
          }

          .home-direct-calendar .fc-timegrid-slot {
            height: 54px;
          }

          .home-direct-calendar .fc-timegrid-now-indicator-line {
            border-color: ${GOOGLE_NOW_RED};
            border-width: 2px 0 0;
          }

          .home-direct-calendar .fc-timegrid-now-indicator-arrow {
            border-color: ${GOOGLE_NOW_RED};
          }

          .home-direct-calendar .fc-event {
            border-radius: 10px;
            border: 2px solid rgba(255, 255, 255, 0.95) !important;
            box-shadow: 0 8px 18px rgba(0, 150, 136, 0.18);
            cursor: pointer;
            margin-inline: 1px;
          }

          .home-direct-calendar .fc-timegrid-event {
            padding: 2px;
          }

          .home-direct-calendar .fc-event-title,
          .home-direct-calendar .fc-event-time {
            font-weight: 700;
          }

          .home-direct-calendar .fc-list-event-dot {
            border-color: ${EUCALYPTUS};
          }
        `}
      </style>

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
              Δες προβολές, αναθέσεις, εκτιμήσεις και follow-ups σε πραγματικό
              calendar view μέσα στο CRM.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={() => {
                setIsFormOpen((current) => !current);
                setCreateEventState({ status: "idle" });
                setOverlapWarning(null);
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
                  Τοποθεσία / διεύθυνση
                  <input
                    value={appointmentForm.location}
                    onChange={(event) =>
                      updateAppointmentForm("location", event.target.value)
                    }
                    className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-base text-slate-950 outline-none transition focus:border-[#032360] focus:ring-2 focus:ring-[#032360]/10"
                    placeholder="π.χ. Βουλιαγμένης 120, Γλυφάδα"
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
                Αρχική προβολή από 08:00 έως περίπου 18:00, με scroll για όλο το
                24ωρο. Αν υπάρχει overlap, θα εμφανιστεί προειδοποίηση.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setRefreshCounter((current) => current + 1)}
              disabled={eventsLoading}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-800 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <RefreshCw
                className={`h-4 w-4 ${eventsLoading ? "animate-spin" : ""}`}
              />
              Ανανέωση
            </button>
          </div>

          {eventsError && (
            <div className="m-5 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-900">
              {eventsError}
            </div>
          )}

          <div className="home-direct-calendar p-5">
            <div className="rounded-2xl border border-slate-200 bg-white p-4">
              <FullCalendar
                plugins={[
                  dayGridPlugin,
                  timeGridPlugin,
                  listPlugin,
                  interactionPlugin,
                ]}
                locale={elLocale}
                initialView="timeGridWeek"
                headerToolbar={{
                  left: "prev,next today",
                  center: "title",
                  right: "dayGridMonth,timeGridWeek,timeGridDay,listWeek",
                }}
                buttonText={{
                  today: "Σήμερα",
                  month: "Μήνας",
                  week: "Εβδομάδα",
                  day: "Ημέρα",
                  list: "Πρόγραμμα",
                }}
                events={calendarEvents}
                eventClick={handleEventClick}
                eventContent={(eventContentArg) => (
                  <div className="overflow-hidden px-1 py-0.5 leading-tight">
                    <div className="truncate text-[12px] font-bold">
                      {eventContentArg.timeText}
                    </div>
                    <div className="truncate text-[12px] font-semibold">
                      {eventContentArg.event.title}
                    </div>
                  </div>
                )}
                dateClick={(dateClickInfo) => {
                  setSelectedDate(toDateInputValue(dateClickInfo.date));
                  openAppointmentDraft({
                    start: dateClickInfo.date,
                    allDay: dateClickInfo.allDay,
                  });
                }}
                selectable
                selectMirror
                selectMinDistance={5}
                selectAllow={(selectInfo) => {
                  const lastMoment = getSelectionEndForSameDayCheck(
                    selectInfo.end,
                  );

                  return isSameCalendarDay(selectInfo.start, lastMoment);
                }}
                select={(selectInfo) => {
                  setSelectedDate(toDateInputValue(selectInfo.start));
                  openAppointmentDraft({
                    start: selectInfo.start,
                    end: selectInfo.end,
                    allDay: selectInfo.allDay,
                  });
                  selectInfo.view.calendar.unselect();
                }}
                eventMouseEnter={(eventMouseEnterInfo) => {
                  const event = eventMouseEnterInfo.event;
                  const jsEvent = eventMouseEnterInfo.jsEvent;

                  setHoveredEvent({
                    title: event.title || "(Χωρίς τίτλο)",
                    time: formatEventTime(event.start, event.end, event.allDay),
                    location: formatLocation(
                      String(event.extendedProps.location || ""),
                    ),
                    description: String(event.extendedProps.description || ""),
                    x: Math.min(jsEvent.clientX + 16, window.innerWidth - 360),
                    y: Math.min(jsEvent.clientY + 16, window.innerHeight - 220),
                  });
                }}
                eventMouseLeave={() => setHoveredEvent(null)}
                height="650px"
                nowIndicator
                navLinks
                allDaySlot={false}
                slotMinTime="00:00:00"
                slotMaxTime="24:00:00"
                scrollTime="08:00:00"
                scrollTimeReset={false}
                slotDuration="01:00:00"
                slotLabelInterval="01:00:00"
                snapDuration="00:15:00"
                slotEventOverlap={false}
                eventColor={EUCALYPTUS}
                eventBackgroundColor={EUCALYPTUS}
                eventBorderColor={EUCALYPTUS}
                eventTextColor="#ffffff"
                eventTimeFormat={{
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: false,
                }}
                slotLabelFormat={{
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: false,
                }}
              />
            </div>

            <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50">
              <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
                <div>
                  <h3 className="font-semibold text-[#032360]">
                    Ημερήσια tasks / events
                  </h3>
                  <p className="text-sm text-slate-500">
                    Επιλεγμένη ημερομηνία:{" "}
                    {formatGreekDate(selectedDate, "00:00").replace(
                      ", 00:00",
                      "",
                    )}
                  </p>
                </div>
              </div>

              <div className="divide-y divide-slate-200">
                {selectedDayEvents.length > 0 ? (
                  selectedDayEvents.map((event) => {
                    const eventId = getEventIdentity(event);
                    const range = getEventRange(event);
                    const details = getEventDetailsFromInput(event);
                    const isCompleted = completedEventIds.has(eventId);

                    return (
                      <div
                        key={eventId}
                        className={`flex items-center gap-3 px-4 py-3 text-sm transition hover:bg-white ${
                          isCompleted ? "bg-slate-100 opacity-60" : ""
                        }`}
                      >
                        <button
                          type="button"
                          onClick={() => toggleCompletedEvent(eventId)}
                          className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition ${
                            isCompleted
                              ? "border-slate-400 bg-slate-400 text-white"
                              : "border-slate-400 bg-white"
                          }`}
                          title={
                            isCompleted
                              ? "Σήμανση ως μη ολοκληρωμένο"
                              : "Σήμανση ως ολοκληρωμένο"
                          }
                        >
                          {isCompleted && (
                            <span className="h-2 w-2 rounded-full bg-white" />
                          )}
                        </button>

                        <button
                          type="button"
                          onClick={() => setEventDetails(details)}
                          className="grid flex-1 grid-cols-[120px_1fr_auto] items-center gap-3 text-left"
                        >
                          <span
                            className={`font-semibold ${
                              isCompleted
                                ? "text-slate-400 line-through"
                                : "text-[#032360]"
                            }`}
                          >
                            {formatEventTime(
                              range?.start ?? null,
                              range?.end ?? null,
                              Boolean(event.allDay),
                            )}
                          </span>

                          <span
                            className={`truncate font-medium ${
                              isCompleted
                                ? "text-slate-400 line-through"
                                : "text-slate-900"
                            }`}
                          >
                            {String(event.title || "(Χωρίς τίτλο)")}
                          </span>

                          <span
                            className={`hidden max-w-[260px] truncate md:block ${
                              isCompleted
                                ? "text-slate-400 line-through"
                                : "text-slate-500"
                            }`}
                          >
                            {details.location}
                          </span>
                        </button>

                        {details.eventId && (
                          <button
                            type="button"
                            onClick={() => setDeleteConfirmation(details)}
                            className="rounded-lg p-2 text-red-600 transition hover:bg-red-50"
                            title="Διαγραφή event"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    );
                  })
                ) : (
                  <div className="px-4 py-6 text-sm text-slate-500">
                    Δεν υπάρχουν events για αυτή την ημέρα. Κάνε click στο
                    calendar για να δημιουργήσεις νέο ραντεβού.
                  </div>
                )}
              </div>
            </div>

            {selectedDeletedDayEvents.length > 0 && (
              <div className="mt-6 border-t border-slate-200 pt-4">
                <button
                  type="button"
                  onClick={() => setHistoryExpanded((current) => !current)}
                  className="flex w-full items-center justify-between rounded-xl px-2 py-2 text-left text-sm text-slate-500 transition hover:bg-slate-100"
                >
                  <span>
                    Ιστορικό διαγραμμένων / ακυρωμένων events ·{" "}
                    <span className="font-semibold">
                      {selectedDeletedDayEvents.length}
                    </span>
                  </span>

                  <span className="text-xs font-semibold uppercase tracking-wide">
                    {historyExpanded ? "Απόκρυψη" : "Εμφάνιση"}
                  </span>
                </button>

                {historyExpanded && (
                  <div className="mt-2 rounded-xl border border-slate-200 bg-white">
                    <div className="divide-y divide-slate-100">
                      {selectedDeletedDayEvents.map((event) => {
                        const eventId = getEventIdentity(event);
                        const range = getEventRange(event);
                        const details = getEventDetailsFromInput(event);
                        const deletedSource = String(
                          event.extendedProps?.deletedSource || "",
                        );

                        return (
                          <div
                            key={eventId}
                            className="grid grid-cols-[110px_1fr_auto_auto] items-center gap-3 px-3 py-2 text-xs text-slate-500"
                          >
                            <span className="font-medium line-through">
                              {formatEventTime(
                                range?.start ?? null,
                                range?.end ?? null,
                                Boolean(event.allDay),
                              )}
                            </span>

                            <span className="truncate line-through">
                              {details.title}
                            </span>

                            <span className="hidden text-[10px] font-semibold uppercase tracking-wide text-slate-400 md:block">
                              {deletedSource === "google"
                                ? "Google"
                                : deletedSource === "crm"
                                  ? "CRM"
                                  : "Deleted"}
                            </span>

                            {details.eventId && (
                              <button
                                type="button"
                                onClick={() => handleRestoreEvent(details)}
                                disabled={isRestoringEvent}
                                className="inline-flex items-center justify-center gap-1 rounded-lg border border-slate-200 bg-white px-2 py-1 text-[11px] font-semibold text-[#032360] transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                                title="Επαναφορά event"
                              >
                                {isRestoringEvent ? (
                                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                ) : (
                                  <RotateCcw className="h-3.5 w-3.5" />
                                )}
                                Επαναφορά
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </section>
      </div>

      {overlapWarning && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-slate-950/40 p-4">
          <div className="w-full max-w-xl rounded-3xl bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold text-[#032360]">
                  Υπάρχει ήδη ραντεβού σε αυτή την ώρα
                </h2>
                <p className="mt-2 text-sm text-slate-600">
                  Το νέο ραντεβού που πας να δημιουργήσεις επικαλύπτεται με άλλο
                  event. Μπορείς να προχωρήσεις παρόλα αυτά ή να γυρίσεις πίσω
                  και να αλλάξεις ώρα.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setOverlapWarning(null)}
                className="rounded-full p-2 text-slate-500 transition hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-4">
              <p className="text-sm font-semibold text-amber-950">
                Νέο ραντεβού: {overlapWarning.requestedTime}
              </p>

              <div className="mt-3 space-y-2">
                {overlapWarning.overlaps.map((event) => {
                  const range = getEventRange(event);

                  return (
                    <div
                      key={String(event.id ?? event.title)}
                      className="rounded-xl bg-white px-3 py-2 text-sm shadow-sm"
                    >
                      <p className="font-semibold text-slate-900">
                        {String(event.title || "(Χωρίς τίτλο)")}
                      </p>
                      <p className="text-slate-600">
                        {formatEventTime(
                          range?.start ?? null,
                          range?.end ?? null,
                          Boolean(event.allDay),
                        )}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setOverlapWarning(null)}
                className="rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-800 shadow-sm transition hover:bg-slate-50"
              >
                Επιστροφή για αλλαγή ώρας
              </button>

              <button
                type="button"
                onClick={() => createAppointment({ allowOverlap: true })}
                className="rounded-xl bg-[#032360] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:opacity-90"
              >
                Προχώρησε παρόλα αυτά
              </button>
            </div>
          </div>
        </div>
      )}

      {eventDetails && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/40 p-4">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold text-[#032360]">
                  {eventDetails.title}
                </h2>
                <p className="mt-2 text-slate-600">{eventDetails.time}</p>
              </div>

              <div className="flex items-center gap-2">
                {eventDetails.eventId && (
                  <button
                    type="button"
                    onClick={() => setDeleteConfirmation(eventDetails)}
                    className="rounded-lg p-2 text-red-600 transition hover:bg-red-50"
                    title="Διαγραφή event"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setEventDetails(null)}
                  className="rounded-full p-2 text-slate-500 transition hover:bg-slate-100"
                  title="Κλείσιμο"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {eventDetails.location && (
              <p className="mt-5 text-sm text-slate-700">
                <span className="font-semibold">Τοποθεσία:</span>{" "}
                {eventDetails.location}
              </p>
            )}

            {eventDetails.description && (
              <p className="mt-3 whitespace-pre-wrap text-sm text-slate-600">
                {eventDetails.description}
              </p>
            )}

            <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm font-semibold text-[#032360]">
                Συσχετίσεις CRM
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {["Ακίνητο", "Πελάτης", "Συναλλαγή", "Συνεργάτης"].map(
                  (label) => (
                    <span
                      key={label}
                      className="rounded-full border border-slate-300 bg-white px-3 py-1 text-xs font-medium text-slate-500"
                    >
                      {label} · σύντομα
                    </span>
                  ),
                )}
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
              {eventDetails.location && (
                <a
                  href={getGoogleMapsUrl(eventDetails.location)}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-800 shadow-sm transition hover:bg-slate-50"
                >
                  Άνοιγμα σε Google Maps
                  <ExternalLink className="h-4 w-4" />
                </a>
              )}

              {eventDetails.url && (
                <a
                  href={eventDetails.url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-800 shadow-sm transition hover:bg-slate-50"
                >
                  Άνοιγμα στο Google Calendar
                  <ExternalLink className="h-4 w-4" />
                </a>
              )}
            </div>
          </div>
        </div>
      )}

      {deleteConfirmation && (
        <div className="fixed inset-0 z-[10001] flex items-center justify-center bg-slate-950/50 p-4">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold text-red-700">
                  Διαγραφή event;
                </h2>
                <p className="mt-2 text-sm text-slate-600">
                  Πρόκειται να διαγράψεις αυτό το event από το Google Calendar.
                  Αυτή η ενέργεια δεν αναιρείται εύκολα.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setDeleteConfirmation(null)}
                className="rounded-full p-2 text-slate-500 transition hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 p-4">
              <p className="font-semibold text-slate-950">
                {deleteConfirmation.title}
              </p>
              <p className="mt-1 text-sm text-slate-600">
                {deleteConfirmation.time}
              </p>
              {deleteConfirmation.location && (
                <p className="mt-2 text-sm text-slate-600">
                  {deleteConfirmation.location}
                </p>
              )}
            </div>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setDeleteConfirmation(null)}
                className="rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-800 shadow-sm transition hover:bg-slate-50"
              >
                Άκυρο
              </button>

              <button
                type="button"
                onClick={handleDeleteEvent}
                disabled={isDeletingEvent}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isDeletingEvent ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
                Ναι, διαγραφή
              </button>
            </div>
          </div>
        </div>
      )}

      {hoveredEvent && (
        <div
          className="fixed z-[9998] w-[340px] rounded-2xl border border-slate-200 bg-white p-4 text-sm shadow-2xl"
          style={{
            left: hoveredEvent.x,
            top: hoveredEvent.y,
          }}
        >
          <p className="font-semibold text-[#032360]">{hoveredEvent.title}</p>
          <p className="mt-1 text-slate-600">{hoveredEvent.time}</p>

          {hoveredEvent.location && (
            <p className="mt-3 truncate text-slate-700">
              <span className="font-semibold">Τοποθεσία:</span>{" "}
              {hoveredEvent.location}
            </p>
          )}

          {hoveredEvent.description && (
            <p className="mt-2 line-clamp-3 text-slate-600">
              {hoveredEvent.description}
            </p>
          )}
        </div>
      )}
    </main>
  );
};
