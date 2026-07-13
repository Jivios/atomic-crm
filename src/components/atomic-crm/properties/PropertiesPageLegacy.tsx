import {
  type FormEvent,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  AlertCircle,
  Bath,
  BedDouble,
  Bell,
  Building2,
  CalendarDays,
  CheckCircle2,
  ClipboardCheck,
  Euro,
  Eye,
  FileCheck2,
  FileText,
  FileWarning,
  Handshake,
  Home,
  Loader2,
  MapPin,
  Megaphone,
  Plus,
  Search,
  Sparkles,
  Square,
  TrendingUp,
  User,
  X,
} from "lucide-react";

import { getSupabaseClient } from "../providers/supabase/supabase";

type PropertyStatus =
  | "draft"
  | "active"
  | "reserved"
  | "under_offer"
  | "sold"
  | "rented"
  | "withdrawn"
  | "archived";

type ListingType = "sale" | "rent";

type PropertyType =
  | "apartment"
  | "maisonette"
  | "detached_house"
  | "villa"
  | "land"
  | "commercial"
  | "office"
  | "store"
  | "other";

type HtkStatus = "missing" | "pending" | "complete" | "not_required";
type SettlementStatus = "unknown" | "not_needed" | "pending" | "completed";
type PortalStatus =
  | "not_published"
  | "ready"
  | "published_manual"
  | "published_xe"
  | "published_partner"
  | "paused";

type PropertyRecord = {
  id: string;
  title: string;
  status: PropertyStatus;
  listing_type: ListingType;
  property_type: PropertyType;
  price: number | string | null;
  currency: string;
  address: string | null;
  city: string | null;
  area: string | null;
  postal_code: string | null;
  bedrooms: number | null;
  bathrooms: number | string | null;
  size_sqm: number | string | null;
  plot_sqm: number | string | null;
  floor: string | null;
  construction_year: number | null;
  renovation_year: number | null;
  heating_type: string | null;
  orientation: string | null;
  parking_spaces: number | null;
  kaek: string | null;
  pea_required: boolean;
  pea_certificate_number: string | null;
  pea_energy_class: string | null;
  pea_issue_date: string | null;
  pea_expires_at: string | null;
  htk_status: HtkStatus;
  htk_certificate_number: string | null;
  htk_completion_certificate_expires_at: string | null;
  responsible_engineer_name: string | null;
  arbitrary_settlement_status: SettlementStatus;
  title_deed_available: boolean;
  building_permit_available: boolean;
  topographic_diagram_available: boolean;
  floor_plan_available: boolean;
  thousandths_table_available: boolean;
  enfia_available: boolean;
  owner_name: string | null;
  owner_phone: string | null;
  owner_email: string | null;
  assigned_agent_name: string | null;
  headline_el: string | null;
  headline_en: string | null;
  description: string | null;
  notes: string | null;
  portal_status: PortalStatus;
  last_vendor_report_sent_at: string | null;
  created_at: string;
  updated_at: string;
};

type PropertyFormState = {
  title: string;
  status: PropertyStatus;
  listingType: ListingType;
  propertyType: PropertyType;
  price: string;
  address: string;
  city: string;
  area: string;
  postalCode: string;
  bedrooms: string;
  bathrooms: string;
  sizeSqm: string;
  plotSqm: string;
  floor: string;
  constructionYear: string;
  renovationYear: string;
  heatingType: string;
  orientation: string;
  parkingSpaces: string;
  kaek: string;
  peaRequired: boolean;
  peaCertificateNumber: string;
  peaEnergyClass: string;
  peaIssueDate: string;
  peaExpiresAt: string;
  htkStatus: HtkStatus;
  htkCertificateNumber: string;
  htkCompletionCertificateExpiresAt: string;
  responsibleEngineerName: string;
  arbitrarySettlementStatus: SettlementStatus;
  titleDeedAvailable: boolean;
  buildingPermitAvailable: boolean;
  topographicDiagramAvailable: boolean;
  floorPlanAvailable: boolean;
  thousandthsTableAvailable: boolean;
  enfiaAvailable: boolean;
  ownerName: string;
  ownerPhone: string;
  ownerEmail: string;
  assignedAgentName: string;
  headlineEl: string;
  headlineEn: string;
  description: string;
  notes: string;
};

type SaveState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; message: string }
  | { status: "error"; message: string };

const statusLabels: Record<PropertyStatus, string> = {
  draft: "Προσχέδιο",
  active: "Ενεργό",
  reserved: "Δεσμευμένο",
  under_offer: "Σε διαπραγμάτευση",
  sold: "Πουλήθηκε",
  rented: "Μισθώθηκε",
  withdrawn: "Αποσύρθηκε",
  archived: "Αρχειοθετημένο",
};

const listingTypeLabels: Record<ListingType, string> = {
  sale: "Πώληση",
  rent: "Μίσθωση",
};

const propertyTypeLabels: Record<PropertyType, string> = {
  apartment: "Διαμέρισμα",
  maisonette: "Μεζονέτα",
  detached_house: "Μονοκατοικία",
  villa: "Βίλα",
  land: "Οικόπεδο",
  commercial: "Επαγγελματικό",
  office: "Γραφείο",
  store: "Κατάστημα",
  other: "Άλλο",
};

const htkStatusLabels: Record<HtkStatus, string> = {
  missing: "Λείπει",
  pending: "Σε εκκρεμότητα",
  complete: "Ολοκληρωμένη",
  not_required: "Δεν απαιτείται",
};

const settlementStatusLabels: Record<SettlementStatus, string> = {
  unknown: "Άγνωστο",
  not_needed: "Δεν απαιτείται",
  pending: "Σε εκκρεμότητα",
  completed: "Ολοκληρωμένη",
};

const initialForm: PropertyFormState = {
  title: "",
  status: "draft",
  listingType: "sale",
  propertyType: "apartment",
  price: "",
  address: "",
  city: "Αθήνα",
  area: "",
  postalCode: "",
  bedrooms: "",
  bathrooms: "",
  sizeSqm: "",
  plotSqm: "",
  floor: "",
  constructionYear: "",
  renovationYear: "",
  heatingType: "",
  orientation: "",
  parkingSpaces: "",
  kaek: "",
  peaRequired: true,
  peaCertificateNumber: "",
  peaEnergyClass: "",
  peaIssueDate: "",
  peaExpiresAt: "",
  htkStatus: "missing",
  htkCertificateNumber: "",
  htkCompletionCertificateExpiresAt: "",
  responsibleEngineerName: "",
  arbitrarySettlementStatus: "unknown",
  titleDeedAvailable: false,
  buildingPermitAvailable: false,
  topographicDiagramAvailable: false,
  floorPlanAvailable: false,
  thousandthsTableAvailable: false,
  enfiaAvailable: false,
  ownerName: "",
  ownerPhone: "",
  ownerEmail: "",
  assignedAgentName: "",
  headlineEl: "",
  headlineEn: "",
  description: "",
  notes: "",
};

function numberOrNull(value: string) {
  if (!value.trim()) return null;

  const parsed = Number(value);

  return Number.isFinite(parsed) ? parsed : null;
}

function dateOrNull(value: string) {
  return value.trim() ? value : null;
}

function textOrNull(value: string) {
  const trimmed = value.trim();

  return trimmed ? trimmed : null;
}

function formatPrice(price: number | string | null, currency = "EUR") {
  if (price === null || price === undefined || price === "") {
    return "Τιμή κατόπιν επικοινωνίας";
  }

  const parsed = Number(price);

  if (!Number.isFinite(parsed)) {
    return "Τιμή κατόπιν επικοινωνίας";
  }

  return new Intl.NumberFormat("el-GR", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(parsed);
}

function formatLocation(property: PropertyRecord) {
  return (
    [property.area, property.city].filter(Boolean).join(", ") || "Χωρίς περιοχή"
  );
}

function getStatusClasses(status: PropertyStatus) {
  switch (status) {
    case "active":
      return "bg-emerald-50 text-emerald-700 ring-emerald-200";
    case "reserved":
    case "under_offer":
      return "bg-amber-50 text-amber-700 ring-amber-200";
    case "sold":
      return "bg-blue-50 text-blue-700 ring-blue-200";
    case "rented":
      return "bg-violet-50 text-violet-700 ring-violet-200";
    case "withdrawn":
    case "archived":
      return "bg-slate-100 text-slate-500 ring-slate-200";
    case "draft":
    default:
      return "bg-slate-50 text-slate-700 ring-slate-200";
  }
}

function getLegalChecklist(property: PropertyRecord) {
  const peaOk =
    !property.pea_required ||
    Boolean(property.pea_energy_class && property.pea_issue_date);

  const htkOk =
    property.htk_status === "complete" ||
    property.htk_status === "not_required";

  const settlementOk =
    property.arbitrary_settlement_status === "completed" ||
    property.arbitrary_settlement_status === "not_needed";

  return [
    {
      label: "ΚΑΕΚ",
      ok: Boolean(property.kaek),
      detail: property.kaek || "Δεν έχει συμπληρωθεί",
    },
    {
      label: "ΠΕΑ",
      ok: peaOk,
      detail: property.pea_required
        ? property.pea_energy_class
          ? `Κλάση ${property.pea_energy_class}`
          : "Απαιτείται για δημοσίευση"
        : "Δεν απαιτείται",
    },
    {
      label: "Ηλεκτρονική Ταυτότητα Κτιρίου",
      ok: htkOk,
      detail: htkStatusLabels[property.htk_status],
    },
    {
      label: "Τακτοποίηση αυθαιρέτων",
      ok: settlementOk,
      detail: settlementStatusLabels[property.arbitrary_settlement_status],
    },
    {
      label: "Τίτλοι",
      ok: property.title_deed_available,
      detail: property.title_deed_available ? "Υπάρχουν" : "Λείπουν",
    },
    {
      label: "Τοπογραφικό / κάτοψη",
      ok:
        property.topographic_diagram_available || property.floor_plan_available,
      detail:
        property.topographic_diagram_available || property.floor_plan_available
          ? "Υπάρχει τουλάχιστον ένα"
          : "Δεν έχει καταχωριστεί",
    },
  ];
}

function getPublishability(property: PropertyRecord) {
  const checklist = getLegalChecklist(property);
  const criticalItems = checklist.filter((item) =>
    ["ΠΕΑ", "ΚΑΕΚ"].includes(item.label),
  );

  const criticalOk = criticalItems.every((item) => item.ok);
  const allOk = checklist.every((item) => item.ok);

  if (allOk) {
    return {
      level: "ready" as const,
      label: "Έτοιμο για δημοσίευση",
      className: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    };
  }

  if (criticalOk) {
    return {
      level: "partial" as const,
      label: "Μπορεί να προχωρήσει",
      className: "bg-amber-50 text-amber-700 ring-amber-200",
    };
  }

  return {
    level: "blocked" as const,
    label: "Λείπουν κρίσιμα στοιχεία",
    className: "bg-red-50 text-red-700 ring-red-200",
  };
}

export const PropertiesPage = () => {
  const [properties, setProperties] = useState<PropertyRecord[]>([]);
  const [selectedProperty, setSelectedProperty] =
    useState<PropertyRecord | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [form, setForm] = useState<PropertyFormState>(initialForm);
  const [saveState, setSaveState] = useState<SaveState>({ status: "idle" });
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<PropertyStatus | "all">(
    "all",
  );
  const [typeFilter, setTypeFilter] = useState<PropertyType | "all">("all");
  const [publishabilityFilter, setPublishabilityFilter] = useState<
    "all" | "ready" | "partial" | "blocked"
  >("all");

  const fetchProperties = useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);

    try {
      const supabaseClient = getSupabaseClient();

      const { data, error } = await supabaseClient
        .from("properties")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      setProperties((data ?? []) as PropertyRecord[]);
    } catch (error) {
      setLoadError(
        error instanceof Error ? error.message : "Δεν φορτώθηκαν τα ακίνητα.",
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProperties();
  }, [fetchProperties]);

  const filteredProperties = useMemo(() => {
    const query = search.trim().toLowerCase();

    return properties.filter((property) => {
      const publishability = getPublishability(property);

      const matchesSearch =
        !query ||
        [
          property.title,
          property.address,
          property.area,
          property.city,
          property.owner_name,
          property.kaek,
        ]
          .filter(Boolean)
          .some((value) => String(value).toLowerCase().includes(query));

      const matchesStatus =
        statusFilter === "all" || property.status === statusFilter;

      const matchesType =
        typeFilter === "all" || property.property_type === typeFilter;

      const matchesPublishability =
        publishabilityFilter === "all" ||
        publishability.level === publishabilityFilter;

      return (
        matchesSearch && matchesStatus && matchesType && matchesPublishability
      );
    });
  }, [properties, search, statusFilter, typeFilter, publishabilityFilter]);

  const stats = useMemo(() => {
    const active = properties.filter(
      (property) => property.status === "active",
    );
    const ready = properties.filter(
      (property) => getPublishability(property).level === "ready",
    );
    const blocked = properties.filter(
      (property) => getPublishability(property).level === "blocked",
    );

    const totalValue = properties.reduce((sum, property) => {
      const price = Number(property.price ?? 0);

      return Number.isFinite(price) ? sum + price : sum;
    }, 0);

    return {
      total: properties.length,
      active: active.length,
      ready: ready.length,
      blocked: blocked.length,
      totalValue,
    };
  }, [properties]);

  const updateForm = <K extends keyof PropertyFormState>(
    field: K,
    value: PropertyFormState[K],
  ) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const resetForm = () => {
    setForm(initialForm);
    setSaveState({ status: "idle" });
  };

  const handleCreateProperty = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaveState({ status: "loading" });

    try {
      if (!form.title.trim()) {
        throw new Error("Συμπλήρωσε τίτλο ακινήτου.");
      }

      const kaek = textOrNull(form.kaek);

      if (kaek && !/^[0-9]{12}\/[0-9]+\/[0-9]+$/.test(kaek)) {
        throw new Error("Το ΚΑΕΚ πρέπει να έχει μορφή 012345678901/0/0.");
      }

      const supabaseClient = getSupabaseClient();

      const { data: property, error } = await supabaseClient
        .from("properties")
        .insert({
          title: form.title.trim(),
          status: form.status,
          listing_type: form.listingType,
          property_type: form.propertyType,
          price: numberOrNull(form.price),
          currency: "EUR",
          address: textOrNull(form.address),
          city: textOrNull(form.city),
          area: textOrNull(form.area),
          postal_code: textOrNull(form.postalCode),
          bedrooms: numberOrNull(form.bedrooms),
          bathrooms: numberOrNull(form.bathrooms),
          size_sqm: numberOrNull(form.sizeSqm),
          plot_sqm: numberOrNull(form.plotSqm),
          floor: textOrNull(form.floor),
          construction_year: numberOrNull(form.constructionYear),
          renovation_year: numberOrNull(form.renovationYear),
          heating_type: textOrNull(form.heatingType),
          orientation: textOrNull(form.orientation),
          parking_spaces: numberOrNull(form.parkingSpaces),
          kaek,
          pea_required: form.peaRequired,
          pea_certificate_number: textOrNull(form.peaCertificateNumber),
          pea_energy_class: textOrNull(form.peaEnergyClass),
          pea_issue_date: dateOrNull(form.peaIssueDate),
          pea_expires_at: dateOrNull(form.peaExpiresAt),
          htk_status: form.htkStatus,
          htk_certificate_number: textOrNull(form.htkCertificateNumber),
          htk_completion_certificate_expires_at: dateOrNull(
            form.htkCompletionCertificateExpiresAt,
          ),
          responsible_engineer_name: textOrNull(form.responsibleEngineerName),
          arbitrary_settlement_status: form.arbitrarySettlementStatus,
          title_deed_available: form.titleDeedAvailable,
          building_permit_available: form.buildingPermitAvailable,
          topographic_diagram_available: form.topographicDiagramAvailable,
          floor_plan_available: form.floorPlanAvailable,
          thousandths_table_available: form.thousandthsTableAvailable,
          enfia_available: form.enfiaAvailable,
          owner_name: textOrNull(form.ownerName),
          owner_phone: textOrNull(form.ownerPhone),
          owner_email: textOrNull(form.ownerEmail),
          assigned_agent_name: textOrNull(form.assignedAgentName),
          headline_el: textOrNull(form.headlineEl),
          headline_en: textOrNull(form.headlineEn),
          description: textOrNull(form.description),
          notes: textOrNull(form.notes),
          portal_status: "not_published",
        })
        .select("*")
        .single();

      if (error) throw error;

      await supabaseClient.from("property_activity").insert({
        property_id: property.id,
        action: "created",
        message: "Το ακίνητο δημιουργήθηκε στο Home Direct CRM.",
      });

      if (property.price) {
        await supabaseClient.from("property_price_history").insert({
          property_id: property.id,
          old_price: null,
          new_price: property.price,
          reason: "Initial asking price",
        });
      }

      setSaveState({
        status: "success",
        message: "Το ακίνητο δημιουργήθηκε.",
      });

      setIsFormOpen(false);
      resetForm();
      await fetchProperties();
      setSelectedProperty(property as PropertyRecord);
    } catch (error) {
      setSaveState({
        status: "error",
        message:
          error instanceof Error
            ? error.message
            : "Δεν δημιουργήθηκε το ακίνητο.",
      });
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <section className="flex flex-col gap-5 rounded-3xl bg-white p-8 shadow-sm ring-1 ring-slate-200 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-700">
              <Building2 className="h-4 w-4" />
              Home Direct CRM
            </div>

            <h1 className="text-3xl font-semibold tracking-tight text-slate-950">
              Ακίνητα
            </h1>

            <p className="mt-3 max-w-2xl text-slate-600">
              Το property module είναι η “καρδιά” του real estate CRM: ακίνητα,
              ιδιοκτήτες, νομικά έγγραφα, matching, προβολές, προσφορές και
              vendor reports.
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              resetForm();
              setIsFormOpen(true);
            }}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#032360] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:opacity-90"
          >
            <Plus className="h-4 w-4" />
            Νέο Ακίνητο
          </button>
        </section>

        {saveState.status === "success" && (
          <div className="flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">
            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />
            <p className="font-semibold">{saveState.message}</p>
          </div>
        )}

        {saveState.status === "error" && (
          <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-900">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
            <div>
              <p className="font-semibold">Κάτι πήγε στραβά.</p>
              <p className="mt-1">{saveState.message}</p>
            </div>
          </div>
        )}

        <section className="grid gap-4 md:grid-cols-5">
          <div className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
            <p className="text-sm text-slate-500">Σύνολο</p>
            <p className="mt-2 text-3xl font-semibold text-[#032360]">
              {stats.total}
            </p>
          </div>

          <div className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
            <p className="text-sm text-slate-500">Ενεργά</p>
            <p className="mt-2 text-3xl font-semibold text-[#009688]">
              {stats.active}
            </p>
          </div>

          <div className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
            <p className="text-sm text-slate-500">Έτοιμα για publish</p>
            <p className="mt-2 text-3xl font-semibold text-emerald-600">
              {stats.ready}
            </p>
          </div>

          <div className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
            <p className="text-sm text-slate-500">Λείπουν στοιχεία</p>
            <p className="mt-2 text-3xl font-semibold text-red-600">
              {stats.blocked}
            </p>
          </div>

          <div className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
            <p className="text-sm text-slate-500">Συνολική αξία</p>
            <p className="mt-2 text-2xl font-semibold text-[#032360]">
              {formatPrice(stats.totalValue)}
            </p>
          </div>
        </section>

        {isFormOpen && (
          <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold text-slate-950">
                  Νέο ακίνητο
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Καταχώρισε βασικά στοιχεία, νομική ετοιμότητα και στοιχεία
                  ιδιοκτήτη.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsFormOpen(false)}
                className="rounded-full p-2 text-slate-500 transition hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateProperty} className="grid gap-6">
              <div className="rounded-2xl border border-slate-200 p-4">
                <h3 className="font-semibold text-[#032360]">
                  Βασικά στοιχεία
                </h3>

                <div className="mt-4 grid gap-4 lg:grid-cols-3">
                  <label className="grid gap-2 text-sm font-medium text-slate-700 lg:col-span-2">
                    Τίτλος ακινήτου
                    <input
                      value={form.title}
                      onChange={(event) =>
                        updateForm("title", event.target.value)
                      }
                      className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-base text-slate-950 outline-none transition focus:border-[#032360] focus:ring-2 focus:ring-[#032360]/10"
                      placeholder="π.χ. Διαμέρισμα 92τ.μ. στη Γλυφάδα"
                    />
                  </label>

                  <label className="grid gap-2 text-sm font-medium text-slate-700">
                    Κατάσταση
                    <select
                      value={form.status}
                      onChange={(event) =>
                        updateForm(
                          "status",
                          event.target.value as PropertyStatus,
                        )
                      }
                      className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-base text-slate-950 outline-none transition focus:border-[#032360] focus:ring-2 focus:ring-[#032360]/10"
                    >
                      {Object.entries(statusLabels).map(([value, label]) => (
                        <option key={value} value={value}>
                          {label}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>

                <div className="mt-4 grid gap-4 md:grid-cols-4">
                  <label className="grid gap-2 text-sm font-medium text-slate-700">
                    Τύπος καταχώρισης
                    <select
                      value={form.listingType}
                      onChange={(event) =>
                        updateForm(
                          "listingType",
                          event.target.value as ListingType,
                        )
                      }
                      className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-base text-slate-950 outline-none transition focus:border-[#032360] focus:ring-2 focus:ring-[#032360]/10"
                    >
                      {Object.entries(listingTypeLabels).map(
                        ([value, label]) => (
                          <option key={value} value={value}>
                            {label}
                          </option>
                        ),
                      )}
                    </select>
                  </label>

                  <label className="grid gap-2 text-sm font-medium text-slate-700">
                    Τύπος ακινήτου
                    <select
                      value={form.propertyType}
                      onChange={(event) =>
                        updateForm(
                          "propertyType",
                          event.target.value as PropertyType,
                        )
                      }
                      className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-base text-slate-950 outline-none transition focus:border-[#032360] focus:ring-2 focus:ring-[#032360]/10"
                    >
                      {Object.entries(propertyTypeLabels).map(
                        ([value, label]) => (
                          <option key={value} value={value}>
                            {label}
                          </option>
                        ),
                      )}
                    </select>
                  </label>

                  <label className="grid gap-2 text-sm font-medium text-slate-700">
                    Τιμή
                    <input
                      type="number"
                      value={form.price}
                      onChange={(event) =>
                        updateForm("price", event.target.value)
                      }
                      className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-base text-slate-950 outline-none transition focus:border-[#032360] focus:ring-2 focus:ring-[#032360]/10"
                      placeholder="π.χ. 320000"
                    />
                  </label>

                  <label className="grid gap-2 text-sm font-medium text-slate-700">
                    Τ.μ.
                    <input
                      type="number"
                      value={form.sizeSqm}
                      onChange={(event) =>
                        updateForm("sizeSqm", event.target.value)
                      }
                      className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-base text-slate-950 outline-none transition focus:border-[#032360] focus:ring-2 focus:ring-[#032360]/10"
                      placeholder="π.χ. 92"
                    />
                  </label>
                </div>

                <div className="mt-4 grid gap-4 md:grid-cols-4">
                  <label className="grid gap-2 text-sm font-medium text-slate-700 md:col-span-2">
                    Διεύθυνση
                    <input
                      value={form.address}
                      onChange={(event) =>
                        updateForm("address", event.target.value)
                      }
                      className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-base text-slate-950 outline-none transition focus:border-[#032360] focus:ring-2 focus:ring-[#032360]/10"
                      placeholder="π.χ. Λ. Βουλιαγμένης 120"
                    />
                  </label>

                  <label className="grid gap-2 text-sm font-medium text-slate-700">
                    Περιοχή
                    <input
                      value={form.area}
                      onChange={(event) =>
                        updateForm("area", event.target.value)
                      }
                      className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-base text-slate-950 outline-none transition focus:border-[#032360] focus:ring-2 focus:ring-[#032360]/10"
                      placeholder="π.χ. Γλυφάδα"
                    />
                  </label>

                  <label className="grid gap-2 text-sm font-medium text-slate-700">
                    Πόλη
                    <input
                      value={form.city}
                      onChange={(event) =>
                        updateForm("city", event.target.value)
                      }
                      className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-base text-slate-950 outline-none transition focus:border-[#032360] focus:ring-2 focus:ring-[#032360]/10"
                    />
                  </label>
                </div>

                <div className="mt-4 grid gap-4 md:grid-cols-6">
                  <label className="grid gap-2 text-sm font-medium text-slate-700">
                    Υ/Δ
                    <input
                      type="number"
                      value={form.bedrooms}
                      onChange={(event) =>
                        updateForm("bedrooms", event.target.value)
                      }
                      className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-base text-slate-950 outline-none transition focus:border-[#032360] focus:ring-2 focus:ring-[#032360]/10"
                    />
                  </label>

                  <label className="grid gap-2 text-sm font-medium text-slate-700">
                    Μπάνια
                    <input
                      type="number"
                      step="0.5"
                      value={form.bathrooms}
                      onChange={(event) =>
                        updateForm("bathrooms", event.target.value)
                      }
                      className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-base text-slate-950 outline-none transition focus:border-[#032360] focus:ring-2 focus:ring-[#032360]/10"
                    />
                  </label>

                  <label className="grid gap-2 text-sm font-medium text-slate-700">
                    Όροφος
                    <input
                      value={form.floor}
                      onChange={(event) =>
                        updateForm("floor", event.target.value)
                      }
                      className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-base text-slate-950 outline-none transition focus:border-[#032360] focus:ring-2 focus:ring-[#032360]/10"
                    />
                  </label>

                  <label className="grid gap-2 text-sm font-medium text-slate-700">
                    Έτος
                    <input
                      type="number"
                      value={form.constructionYear}
                      onChange={(event) =>
                        updateForm("constructionYear", event.target.value)
                      }
                      className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-base text-slate-950 outline-none transition focus:border-[#032360] focus:ring-2 focus:ring-[#032360]/10"
                    />
                  </label>

                  <label className="grid gap-2 text-sm font-medium text-slate-700">
                    Θέρμανση
                    <input
                      value={form.heatingType}
                      onChange={(event) =>
                        updateForm("heatingType", event.target.value)
                      }
                      className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-base text-slate-950 outline-none transition focus:border-[#032360] focus:ring-2 focus:ring-[#032360]/10"
                    />
                  </label>

                  <label className="grid gap-2 text-sm font-medium text-slate-700">
                    Parking
                    <input
                      type="number"
                      value={form.parkingSpaces}
                      onChange={(event) =>
                        updateForm("parkingSpaces", event.target.value)
                      }
                      className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-base text-slate-950 outline-none transition focus:border-[#032360] focus:ring-2 focus:ring-[#032360]/10"
                    />
                  </label>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 p-4">
                <h3 className="font-semibold text-[#032360]">
                  Ελληνικά νομικά / έγγραφα
                </h3>

                <div className="mt-4 grid gap-4 lg:grid-cols-3">
                  <label className="grid gap-2 text-sm font-medium text-slate-700">
                    ΚΑΕΚ
                    <input
                      value={form.kaek}
                      onChange={(event) =>
                        updateForm("kaek", event.target.value)
                      }
                      className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-base text-slate-950 outline-none transition focus:border-[#032360] focus:ring-2 focus:ring-[#032360]/10"
                      placeholder="012345678901/0/0"
                    />
                  </label>

                  <label className="grid gap-2 text-sm font-medium text-slate-700">
                    Κλάση ΠΕΑ
                    <input
                      value={form.peaEnergyClass}
                      onChange={(event) =>
                        updateForm("peaEnergyClass", event.target.value)
                      }
                      className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-base text-slate-950 outline-none transition focus:border-[#032360] focus:ring-2 focus:ring-[#032360]/10"
                      placeholder="π.χ. Β+"
                    />
                  </label>

                  <label className="grid gap-2 text-sm font-medium text-slate-700">
                    Ημερομηνία ΠΕΑ
                    <input
                      type="date"
                      value={form.peaIssueDate}
                      onChange={(event) =>
                        updateForm("peaIssueDate", event.target.value)
                      }
                      className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-base text-slate-950 outline-none transition focus:border-[#032360] focus:ring-2 focus:ring-[#032360]/10"
                    />
                  </label>
                </div>

                <div className="mt-4 grid gap-4 lg:grid-cols-3">
                  <label className="grid gap-2 text-sm font-medium text-slate-700">
                    ΗΤΚ
                    <select
                      value={form.htkStatus}
                      onChange={(event) =>
                        updateForm("htkStatus", event.target.value as HtkStatus)
                      }
                      className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-base text-slate-950 outline-none transition focus:border-[#032360] focus:ring-2 focus:ring-[#032360]/10"
                    >
                      {Object.entries(htkStatusLabels).map(([value, label]) => (
                        <option key={value} value={value}>
                          {label}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="grid gap-2 text-sm font-medium text-slate-700">
                    Τακτοποίηση
                    <select
                      value={form.arbitrarySettlementStatus}
                      onChange={(event) =>
                        updateForm(
                          "arbitrarySettlementStatus",
                          event.target.value as SettlementStatus,
                        )
                      }
                      className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-base text-slate-950 outline-none transition focus:border-[#032360] focus:ring-2 focus:ring-[#032360]/10"
                    >
                      {Object.entries(settlementStatusLabels).map(
                        ([value, label]) => (
                          <option key={value} value={value}>
                            {label}
                          </option>
                        ),
                      )}
                    </select>
                  </label>

                  <label className="grid gap-2 text-sm font-medium text-slate-700">
                    Μηχανικός
                    <input
                      value={form.responsibleEngineerName}
                      onChange={(event) =>
                        updateForm(
                          "responsibleEngineerName",
                          event.target.value,
                        )
                      }
                      className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-base text-slate-950 outline-none transition focus:border-[#032360] focus:ring-2 focus:ring-[#032360]/10"
                    />
                  </label>
                </div>

                <div className="mt-4 grid gap-3 md:grid-cols-3">
                  {[
                    ["titleDeedAvailable", "Τίτλοι"],
                    ["buildingPermitAvailable", "Οικοδομική άδεια"],
                    ["topographicDiagramAvailable", "Τοπογραφικό"],
                    ["floorPlanAvailable", "Κάτοψη"],
                    ["thousandthsTableAvailable", "Πίνακας χιλιοστών"],
                    ["enfiaAvailable", "ΕΝΦΙΑ"],
                  ].map(([field, label]) => (
                    <label
                      key={field}
                      className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-700"
                    >
                      <input
                        type="checkbox"
                        checked={Boolean(
                          form[field as keyof PropertyFormState],
                        )}
                        onChange={(event) =>
                          updateForm(
                            field as keyof PropertyFormState,
                            event.target.checked as never,
                          )
                        }
                      />
                      {label}
                    </label>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 p-4">
                <h3 className="font-semibold text-[#032360]">
                  Ιδιοκτήτης / περιγραφή
                </h3>

                <div className="mt-4 grid gap-4 md:grid-cols-3">
                  <label className="grid gap-2 text-sm font-medium text-slate-700">
                    Ιδιοκτήτης
                    <input
                      value={form.ownerName}
                      onChange={(event) =>
                        updateForm("ownerName", event.target.value)
                      }
                      className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-base text-slate-950 outline-none transition focus:border-[#032360] focus:ring-2 focus:ring-[#032360]/10"
                    />
                  </label>

                  <label className="grid gap-2 text-sm font-medium text-slate-700">
                    Τηλέφωνο
                    <input
                      value={form.ownerPhone}
                      onChange={(event) =>
                        updateForm("ownerPhone", event.target.value)
                      }
                      className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-base text-slate-950 outline-none transition focus:border-[#032360] focus:ring-2 focus:ring-[#032360]/10"
                    />
                  </label>

                  <label className="grid gap-2 text-sm font-medium text-slate-700">
                    Email
                    <input
                      type="email"
                      value={form.ownerEmail}
                      onChange={(event) =>
                        updateForm("ownerEmail", event.target.value)
                      }
                      className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-base text-slate-950 outline-none transition focus:border-[#032360] focus:ring-2 focus:ring-[#032360]/10"
                    />
                  </label>
                </div>

                <div className="mt-4 grid gap-4 lg:grid-cols-2">
                  <label className="grid gap-2 text-sm font-medium text-slate-700">
                    Περιγραφή
                    <textarea
                      rows={4}
                      value={form.description}
                      onChange={(event) =>
                        updateForm("description", event.target.value)
                      }
                      className="resize-none rounded-xl border border-slate-300 bg-white px-4 py-3 text-base text-slate-950 outline-none transition focus:border-[#032360] focus:ring-2 focus:ring-[#032360]/10"
                      placeholder="Περιγραφή ακινήτου..."
                    />
                  </label>

                  <label className="grid gap-2 text-sm font-medium text-slate-700">
                    Εσωτερικές σημειώσεις
                    <textarea
                      rows={4}
                      value={form.notes}
                      onChange={(event) =>
                        updateForm("notes", event.target.value)
                      }
                      className="resize-none rounded-xl border border-slate-300 bg-white px-4 py-3 text-base text-slate-950 outline-none transition focus:border-[#032360] focus:ring-2 focus:ring-[#032360]/10"
                      placeholder="Σημειώσεις μόνο για την ομάδα..."
                    />
                  </label>
                </div>
              </div>

              <div className="flex justify-end border-t border-slate-200 pt-4">
                <button
                  type="submit"
                  disabled={saveState.status === "loading"}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#032360] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saveState.status === "loading" ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Plus className="h-4 w-4" />
                  )}
                  Δημιουργία ακινήτου
                </button>
              </div>
            </form>
          </section>
        )}

        <section className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white py-3 pl-11 pr-4 text-base text-slate-950 outline-none transition focus:border-[#032360] focus:ring-2 focus:ring-[#032360]/10"
                placeholder="Αναζήτηση με τίτλο, περιοχή, ΚΑΕΚ, διεύθυνση ή ιδιοκτήτη..."
              />
            </div>

            <div className="grid gap-3 sm:grid-cols-3 xl:w-[660px]">
              <select
                value={statusFilter}
                onChange={(event) =>
                  setStatusFilter(event.target.value as PropertyStatus | "all")
                }
                className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-medium text-slate-700 outline-none focus:border-[#032360]"
              >
                <option value="all">Όλες οι καταστάσεις</option>
                {Object.entries(statusLabels).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>

              <select
                value={typeFilter}
                onChange={(event) =>
                  setTypeFilter(event.target.value as PropertyType | "all")
                }
                className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-medium text-slate-700 outline-none focus:border-[#032360]"
              >
                <option value="all">Όλοι οι τύποι</option>
                {Object.entries(propertyTypeLabels).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>

              <select
                value={publishabilityFilter}
                onChange={(event) =>
                  setPublishabilityFilter(
                    event.target.value as
                      | "all"
                      | "ready"
                      | "partial"
                      | "blocked",
                  )
                }
                className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-medium text-slate-700 outline-none focus:border-[#032360]"
              >
                <option value="all">Όλα τα publish statuses</option>
                <option value="ready">Έτοιμα για δημοσίευση</option>
                <option value="partial">Μπορούν να προχωρήσουν</option>
                <option value="blocked">Λείπουν κρίσιμα στοιχεία</option>
              </select>
            </div>
          </div>
        </section>

        {loadError && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-900">
            {loadError}
          </div>
        )}

        {isLoading ? (
          <div className="flex items-center justify-center rounded-3xl bg-white p-12 text-slate-500 shadow-sm ring-1 ring-slate-200">
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Φόρτωση ακινήτων...
          </div>
        ) : filteredProperties.length > 0 ? (
          <section className="grid gap-5 lg:grid-cols-2 xl:grid-cols-3">
            {filteredProperties.map((property) => {
              const publishability = getPublishability(property);

              return (
                <button
                  key={property.id}
                  type="button"
                  onClick={() => setSelectedProperty(property)}
                  className="overflow-hidden rounded-3xl bg-white text-left shadow-sm ring-1 ring-slate-200 transition hover:-translate-y-0.5 hover:shadow-md"
                >
                  <div className="relative h-40 bg-gradient-to-br from-[#032360] to-[#009688]">
                    <div className="absolute inset-0 flex items-center justify-center text-white/80">
                      <Home className="h-16 w-16" />
                    </div>

                    <div className="absolute left-4 top-4 flex flex-wrap gap-2">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ring-1 ${getStatusClasses(
                          property.status,
                        )}`}
                      >
                        {statusLabels[property.status]}
                      </span>

                      <span className="rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-[#032360]">
                        {listingTypeLabels[property.listing_type]}
                      </span>
                    </div>
                  </div>

                  <div className="p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="line-clamp-2 text-lg font-semibold text-slate-950">
                          {property.title}
                        </h3>

                        <p className="mt-2 inline-flex items-center gap-1 text-sm text-slate-500">
                          <MapPin className="h-4 w-4" />
                          {formatLocation(property)}
                        </p>
                      </div>

                      <p className="shrink-0 text-right text-lg font-semibold text-[#032360]">
                        {formatPrice(property.price, property.currency)}
                      </p>
                    </div>

                    <div className="mt-4 grid grid-cols-3 gap-3 rounded-2xl bg-slate-50 p-3 text-sm text-slate-600">
                      <span className="inline-flex items-center gap-1">
                        <Square className="h-4 w-4" />
                        {property.size_sqm ? `${property.size_sqm} τ.μ.` : "—"}
                      </span>

                      <span className="inline-flex items-center gap-1">
                        <BedDouble className="h-4 w-4" />
                        {property.bedrooms ?? "—"}
                      </span>

                      <span className="inline-flex items-center gap-1">
                        <Bath className="h-4 w-4" />
                        {property.bathrooms ?? "—"}
                      </span>
                    </div>

                    <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-sm">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ring-1 ${publishability.className}`}
                      >
                        {publishability.label}
                      </span>

                      <span className="text-slate-500">
                        {property.owner_name || "Χωρίς ιδιοκτήτη"}
                      </span>
                    </div>
                  </div>
                </button>
              );
            })}
          </section>
        ) : (
          <section className="rounded-3xl bg-white p-12 text-center shadow-sm ring-1 ring-slate-200">
            <Building2 className="mx-auto h-12 w-12 text-slate-300" />
            <h2 className="mt-4 text-xl font-semibold text-slate-950">
              Δεν υπάρχουν ακόμα ακίνητα
            </h2>
            <p className="mx-auto mt-2 max-w-lg text-slate-500">
              Δημιούργησε το πρώτο ακίνητο για να αρχίσεις να συνδέεις ραντεβού,
              πελάτες, ιδιοκτήτες, offers και vendor reports.
            </p>

            <button
              type="button"
              onClick={() => {
                resetForm();
                setIsFormOpen(true);
              }}
              className="mt-5 inline-flex items-center justify-center gap-2 rounded-xl bg-[#032360] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:opacity-90"
            >
              <Plus className="h-4 w-4" />
              Νέο Ακίνητο
            </button>
          </section>
        )}
      </div>

      {selectedProperty && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/40 p-4">
          <div className="max-h-[90vh] w-full max-w-5xl overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="mb-3 flex flex-wrap gap-2">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ring-1 ${getStatusClasses(
                      selectedProperty.status,
                    )}`}
                  >
                    {statusLabels[selectedProperty.status]}
                  </span>

                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                    {propertyTypeLabels[selectedProperty.property_type]}
                  </span>

                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                    {listingTypeLabels[selectedProperty.listing_type]}
                  </span>

                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ring-1 ${
                      getPublishability(selectedProperty).className
                    }`}
                  >
                    {getPublishability(selectedProperty).label}
                  </span>
                </div>

                <h2 className="text-2xl font-semibold text-[#032360]">
                  {selectedProperty.title}
                </h2>

                <p className="mt-2 inline-flex items-center gap-2 text-slate-600">
                  <MapPin className="h-4 w-4" />
                  {[
                    selectedProperty.address,
                    selectedProperty.area,
                    selectedProperty.city,
                  ]
                    .filter(Boolean)
                    .join(", ") || "Χωρίς διεύθυνση"}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedProperty(null)}
                className="rounded-full p-2 text-slate-500 transition hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-4">
              <div className="rounded-2xl bg-slate-50 p-4">
                <Euro className="h-5 w-5 text-[#032360]" />
                <p className="mt-2 text-sm text-slate-500">Τιμή</p>
                <p className="font-semibold text-slate-950">
                  {formatPrice(
                    selectedProperty.price,
                    selectedProperty.currency,
                  )}
                </p>
              </div>

              <div className="rounded-2xl bg-slate-50 p-4">
                <Square className="h-5 w-5 text-[#032360]" />
                <p className="mt-2 text-sm text-slate-500">Μέγεθος</p>
                <p className="font-semibold text-slate-950">
                  {selectedProperty.size_sqm
                    ? `${selectedProperty.size_sqm} τ.μ.`
                    : "—"}
                </p>
              </div>

              <div className="rounded-2xl bg-slate-50 p-4">
                <BedDouble className="h-5 w-5 text-[#032360]" />
                <p className="mt-2 text-sm text-slate-500">Υπνοδωμάτια</p>
                <p className="font-semibold text-slate-950">
                  {selectedProperty.bedrooms ?? "—"}
                </p>
              </div>

              <div className="rounded-2xl bg-slate-50 p-4">
                <Bath className="h-5 w-5 text-[#032360]" />
                <p className="mt-2 text-sm text-slate-500">Μπάνια</p>
                <p className="font-semibold text-slate-950">
                  {selectedProperty.bathrooms ?? "—"}
                </p>
              </div>
            </div>

            <div className="mt-6 grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
              <div className="rounded-2xl border border-slate-200 p-4">
                <h3 className="flex items-center gap-2 font-semibold text-[#032360]">
                  <ClipboardCheck className="h-4 w-4" />
                  Publishability checklist
                </h3>

                <div className="mt-4 grid gap-3 md:grid-cols-2">
                  {getLegalChecklist(selectedProperty).map((item) => (
                    <div
                      key={item.label}
                      className="flex items-start gap-3 rounded-xl bg-slate-50 p-3"
                    >
                      {item.ok ? (
                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                      ) : (
                        <FileWarning className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
                      )}

                      <div>
                        <p className="text-sm font-semibold text-slate-800">
                          {item.label}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          {item.detail}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 p-4">
                <h3 className="flex items-center gap-2 font-semibold text-[#032360]">
                  <User className="h-4 w-4" />
                  Ιδιοκτήτης
                </h3>

                <div className="mt-4 space-y-2 text-sm text-slate-600">
                  <p>{selectedProperty.owner_name || "Δεν έχει οριστεί"}</p>

                  {selectedProperty.owner_phone && (
                    <p>{selectedProperty.owner_phone}</p>
                  )}

                  {selectedProperty.owner_email && (
                    <p>{selectedProperty.owner_email}</p>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-6 grid gap-4 lg:grid-cols-2">
              <div className="rounded-2xl border border-slate-200 p-4">
                <h3 className="font-semibold text-[#032360]">
                  Στοιχεία ακινήτου
                </h3>

                <div className="mt-3 grid grid-cols-2 gap-3 text-sm text-slate-600">
                  <p>Όροφος: {selectedProperty.floor || "—"}</p>
                  <p>Έτος: {selectedProperty.construction_year || "—"}</p>
                  <p>Θέρμανση: {selectedProperty.heating_type || "—"}</p>
                  <p>Parking: {selectedProperty.parking_spaces ?? "—"}</p>
                  <p>ΚΑΕΚ: {selectedProperty.kaek || "—"}</p>
                  <p>ΠΕΑ: {selectedProperty.pea_energy_class || "—"}</p>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 p-4">
                <h3 className="font-semibold text-[#032360]">
                  Νομική ετοιμότητα
                </h3>

                <div className="mt-3 grid grid-cols-2 gap-3 text-sm text-slate-600">
                  <p>ΗΤΚ: {htkStatusLabels[selectedProperty.htk_status]}</p>
                  <p>
                    Τακτοποίηση:{" "}
                    {
                      settlementStatusLabels[
                        selectedProperty.arbitrary_settlement_status
                      ]
                    }
                  </p>
                  <p>
                    Τίτλοι:{" "}
                    {selectedProperty.title_deed_available ? "Ναι" : "Όχι"}
                  </p>
                  <p>
                    Τοπογραφικό:{" "}
                    {selectedProperty.topographic_diagram_available
                      ? "Ναι"
                      : "Όχι"}
                  </p>
                  <p>
                    Κάτοψη:{" "}
                    {selectedProperty.floor_plan_available ? "Ναι" : "Όχι"}
                  </p>
                  <p>
                    ΕΝΦΙΑ: {selectedProperty.enfia_available ? "Ναι" : "Όχι"}
                  </p>
                </div>
              </div>
            </div>

            {selectedProperty.description && (
              <div className="mt-6 rounded-2xl border border-slate-200 p-4">
                <h3 className="font-semibold text-[#032360]">Περιγραφή</h3>
                <p className="mt-3 whitespace-pre-wrap text-sm text-slate-600">
                  {selectedProperty.description}
                </p>
              </div>
            )}

            {selectedProperty.notes && (
              <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-4">
                <h3 className="font-semibold text-amber-900">
                  Εσωτερικές σημειώσεις
                </h3>
                <p className="mt-3 whitespace-pre-wrap text-sm text-amber-900/80">
                  {selectedProperty.notes}
                </p>
              </div>
            )}

            <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <h3 className="font-semibold text-[#032360]">
                Best-in-class modules reserved for this property
              </h3>

              <div className="mt-4 grid gap-3 md:grid-cols-3">
                {[
                  [
                    "Matching Engine",
                    Sparkles,
                    "Reverse match buyers + auto-alerts",
                  ],
                  ["Viewings", Eye, "Feedback, interest level, price feedback"],
                  [
                    "Offers",
                    Handshake,
                    "Offer history, counter, accept/reject",
                  ],
                  [
                    "Price History",
                    TrendingUp,
                    "Track reductions and notify buyers",
                  ],
                  ["Vendor Reports", FileText, "Weekly seller PDF reports"],
                  ["Portal Publishing", Megaphone, "XE / partner bridge later"],
                  ["Calendar", CalendarDays, "Linked viewings and follow-ups"],
                  ["Documents", FileCheck2, "ΠΕΑ, ΗΤΚ, τίτλοι, κατόψεις"],
                  ["Auto Alerts", Bell, "Email/Viber/WhatsApp later"],
                ].map(([label, Icon, description]) => {
                  const TypedIcon = Icon as typeof CalendarDays;

                  return (
                    <div
                      key={String(label)}
                      className="rounded-xl border border-slate-200 bg-white p-3 text-sm"
                    >
                      <TypedIcon className="h-4 w-4 text-[#009688]" />
                      <p className="mt-2 font-semibold text-slate-700">
                        {String(label)}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        {String(description)}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};
