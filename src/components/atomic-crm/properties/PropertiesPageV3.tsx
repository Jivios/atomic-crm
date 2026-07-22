import {
  type FormEvent,
  type ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  Activity,
  AlertCircle,
  Bath,
  BedDouble,
  Building2,
  CalendarDays,
  CheckCircle2,
  ClipboardCheck,
  Edit3,
  Euro,
  Factory,
  FileText,
  Home,
  ImageIcon,
  KeyRound,
  Landmark,
  Link as LinkIcon,
  Loader2,
  MapPin,
  NotebookPen,
  Paperclip,
  Plus,
  Search,
  Square,
  User,
  X,
  type LucideIcon,
} from "lucide-react";

import { getSupabaseClient } from "../providers/supabase/supabase";

type PropertyCategory = "residential" | "land" | "commercial" | "other";
type ListingType = "sale" | "rent";
type PropertyStatus =
  | "draft"
  | "active"
  | "reserved"
  | "under_offer"
  | "sold"
  | "rented"
  | "withdrawn"
  | "archived";

type DetailTab =
  | "summary"
  | "media"
  | "assignment"
  | "attachments"
  | "notes"
  | "calendar"
  | "actions";

type FormTab = "basic" | "features" | "legal" | "assignment" | "notes";

type SaveState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; message: string }
  | { status: "error"; message: string };

type PropertyRecord = {
  id: string;
  title: string;
  internal_code: string | null;
  category: PropertyCategory | null;
  subtype: string | null;
  listing_type: ListingType | null;
  status: PropertyStatus | null;
  price: number | string | null;
  currency: string | null;
  built_sqm: number | string | null;
  plot_sqm: number | string | null;
  usable_sqm: number | string | null;
  city: string | null;
  municipality: string | null;
  area: string | null;
  neighborhood: string | null;
  address: string | null;
  postal_code: string | null;
  distance_from_sea_meters: number | null;
  description_el: string | null;
  private_notes: string | null;
  owner_name: string | null;
  owner_phone: string | null;
  owner_email: string | null;
  assigned_agent_name: string | null;
  assignment_status: string | null;
  keys_status: string | null;
  keys_location: string | null;
  assignment_started_at: string | null;
  assignment_expires_at: string | null;
  is_currently_leased: boolean | null;
  leased_until: string | null;
  current_monthly_rent: number | string | null;
  current_tenant_name: string | null;
  spitogatos_url: string | null;
  xe_url: string | null;
  other_portal_url: string | null;
  portal_notes: string | null;
  created_at: string;
};

type ResidentialDetail = {
  property_id: string;
  floor: string | null;
  total_floors: number | null;
  level_count: number | null;
  bedrooms: number | null;
  master_bedrooms: number | null;
  bathrooms: number | string | null;
  wc: number | null;
  kitchens: number | null;
  kitchen_type: string | null;
  living_rooms: number | null;
  construction_year: number | null;
  renovation_year: number | null;
  condition: string | null;
  energy_class: string | null;
  heating_type: string | null;
  heating_medium: string | null;
  parking_spaces: number | null;
  parking_type: string | null;
  storage_sqm: number | string | null;
  balcony_sqm: number | string | null;
  veranda_sqm: number | string | null;
  orientation: string | null;
  view_type: string | null;
  residential_features: string[] | null;
};

type LandDetail = {
  property_id: string;
  land_sqm: number | string | null;
  building_factor: number | string | null;
  coverage_percent: number | string | null;
  allowed_build_sqm: number | string | null;
  remaining_build_sqm: number | string | null;
  frontage_meters: number | string | null;
  slope_type: string | null;
  land_use: string | null;
  buildable: boolean | null;
  complete_and_buildable: boolean | null;
  land_features: string[] | null;
};

type CommercialDetail = {
  property_id: string;
  commercial_subtype: string | null;
  floor: string | null;
  levels: number | null;
  rooms: number | null;
  offices_count: number | null;
  wc: number | null;
  height_meters: number | string | null;
  mezzanine_sqm: number | string | null;
  frontage_meters: number | string | null;
  showcase_length_meters: number | string | null;
  power_capacity_kva: number | string | null;
  suitable_for: string[] | null;
  commercial_features: string[] | null;
};

type LegalDetail = {
  property_id: string;
  kaek: string | null;
  pea_required: boolean;
  pea_certificate_number: string | null;
  pea_energy_class: string | null;
  pea_issue_date: string | null;
  pea_expires_at: string | null;
  htk_status: string | null;
  htk_certificate_number: string | null;
  responsible_engineer_name: string | null;
  arbitrary_settlement_status: string | null;
  building_permit_number: string | null;
  legal_notes: string | null;
  title_deed_available: boolean;
  building_permit_available: boolean;
  topographic_diagram_available: boolean;
  floor_plan_available: boolean;
  thousandths_table_available: boolean;
  enfia_available: boolean;
  tax_clearance_available: boolean;
};

type InvestmentDetail = {
  property_id: string;
  is_investment: boolean;
  is_leased: boolean;
  monthly_rent: number | string | null;
  lease_expires_at: string | null;
  yield_percent: number | string | null;
  short_term_rental_license: boolean;
  ama_number: string | null;
  eot_license_number: string | null;
  tenant_name: string | null;
};

type PropertyNote = {
  id: string;
  property_id: string;
  note: string;
  created_at: string;
};

type PropertyMedia = {
  id: string;
  property_id: string;
  media_type: string | null;
  file_name: string | null;
  external_url: string | null;
  storage_path: string | null;
  caption: string | null;
  created_at: string;
};

type PropertyDocument = {
  id: string;
  property_id: string;
  document_type: string | null;
  file_name: string | null;
  storage_path: string | null;
  notes: string | null;
  created_at: string;
};

type PropertyViewing = {
  id: string;
  property_id: string;
  viewing_at: string | null;
  buyer_name: string | null;
  demand_reference: string | null;
  interest_level: string | null;
  buyer_feedback: string | null;
  created_at: string;
};

type PropertyActivity = {
  id: string;
  property_id: string;
  action: string;
  message: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
};

type FormState = {
  title: string;
  internalCode: string;
  category: PropertyCategory;
  subtype: string;
  listingType: ListingType;
  status: PropertyStatus;
  price: string;
  builtSqm: string;
  plotSqm: string;
  usableSqm: string;
  city: string;
  municipality: string;
  area: string;
  neighborhood: string;
  address: string;
  postalCode: string;
  distanceFromSeaMeters: string;
  ownerName: string;
  ownerPhone: string;
  ownerEmail: string;
  assignedAgentName: string;
  descriptionEl: string;
  privateNotes: string;

  floor: string;
  totalFloors: string;
  levelCount: string;
  bedrooms: string;
  masterBedrooms: string;
  bathrooms: string;
  wc: string;
  kitchens: string;
  kitchenType: string;
  livingRooms: string;
  constructionYear: string;
  renovationYear: string;
  condition: string;
  energyClass: string;
  heatingType: string;
  heatingMedium: string;
  parkingSpaces: string;
  parkingType: string;
  storageSqm: string;
  balconySqm: string;
  verandaSqm: string;
  orientation: string;
  viewType: string;
  residentialFeatures: string[];

  landSqm: string;
  buildingFactor: string;
  coveragePercent: string;
  allowedBuildSqm: string;
  remainingBuildSqm: string;
  frontageMeters: string;
  slopeType: string;
  landUse: string;
  landFeatures: string[];

  commercialFloor: string;
  commercialLevels: string;
  commercialRooms: string;
  officesCount: string;
  commercialWc: string;
  heightMeters: string;
  mezzanineSqm: string;
  showcaseLengthMeters: string;
  powerCapacityKva: string;
  suitableFor: string[];
  commercialFeatures: string[];

  kaek: string;
  peaRequired: boolean;
  peaCertificateNumber: string;
  peaEnergyClass: string;
  peaIssueDate: string;
  peaExpiresAt: string;
  htkStatus: string;
  htkCertificateNumber: string;
  responsibleEngineerName: string;
  arbitrarySettlementStatus: string;
  buildingPermitNumber: string;
  legalNotes: string;
  titleDeedAvailable: boolean;
  buildingPermitAvailable: boolean;
  topographicDiagramAvailable: boolean;
  floorPlanAvailable: boolean;
  thousandthsTableAvailable: boolean;
  enfiaAvailable: boolean;
  taxClearanceAvailable: boolean;

  assignmentStatus: string;
  keysStatus: string;
  keysLocation: string;
  assignmentStartedAt: string;
  assignmentExpiresAt: string;
  isCurrentlyLeased: boolean;
  leasedUntil: string;
  currentMonthlyRent: string;
  currentTenantName: string;
  spitogatosUrl: string;
  xeUrl: string;
  otherPortalUrl: string;
  portalNotes: string;

  isInvestment: boolean;
  isLeased: boolean;
  monthlyRent: string;
  leaseExpiresAt: string;
  yieldPercent: string;
  shortTermRentalLicense: boolean;
  amaNumber: string;
  eotLicenseNumber: string;
  tenantName: string;
};

const categoryLabels: Record<PropertyCategory, string> = {
  residential: "Κατοικία",
  land: "Γη / Οικόπεδο",
  commercial: "Επαγγελματικό",
  other: "Άλλο",
};

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

const residentialSubtypes: string[][] = [
  ["apartment", "Διαμέρισμα"],
  ["floor_apartment", "Οροφοδιαμέρισμα"],
  ["studio", "Studio"],
  ["garsoniera", "Γκαρσονιέρα"],
  ["maisonette", "Μεζονέτα"],
  ["floor_maisonette", "Οροφομεζονέτα"],
  ["detached_house", "Μονοκατοικία"],
  ["semi_detached_house", "Διπλοκατοικία"],
  ["villa", "Βίλα"],
  ["loft", "Loft"],
  ["building", "Κτίριο"],
  ["holiday_home", "Εξοχική κατοικία"],
  ["preserved", "Διατηρητέο"],
  ["neoclassical", "Νεοκλασικό"],
  ["traditional", "Παραδοσιακό"],
  ["stone_house", "Πέτρινο"],
  ["wooden_house", "Ξύλινη κατοικία"],
  ["prefab", "Προκατασκευή"],
  ["other", "Άλλο"],
];

const landSubtypes: string[][] = [
  ["plot", "Οικόπεδο"],
  ["land_parcel", "Αγροτεμάχιο"],
  ["farm", "Αγροκτήμα / Κτήμα"],
  ["seaside_plot", "Παραθαλάσσιο οικόπεδο"],
  ["island", "Νησί"],
  ["forest_area", "Δασική έκταση"],
  ["other", "Άλλο"],
];

const commercialSubtypes: string[][] = [
  ["office", "Γραφείο"],
  ["store", "Κατάστημα"],
  ["warehouse", "Αποθήκη"],
  ["industrial_space", "Βιομηχανικός χώρος"],
  ["craft_space", "Βιοτεχνικός χώρος"],
  ["hotel", "Ξενοδοχείο"],
  ["commercial_building", "Επαγγελματικό κτίριο"],
  ["hall", "Αίθουσα"],
  ["showroom", "Εκθεσιακός χώρος"],
  ["business_for_sale", "Επιχείρηση"],
  ["garage_parking", "Γκαράζ / Parking"],
  ["tourist_accommodation", "Τουριστικό κατάλυμα"],
  ["other", "Άλλο"],
];

const baseResidentialFeatures: string[][] = [
  ["security_door", "Πόρτα ασφαλείας"],
  ["alarm", "Συναγερμός"],
  ["bright", "Φωτεινό"],
  ["airy", "Διαμπερές"],
  ["corner", "Γωνιακό"],
  ["furnished", "Επιπλωμένο"],
  ["wardrobes", "Εντοιχισμένες ντουλάπες"],
  ["satellite", "Δορυφορική"],
  ["internet", "Internet"],
  ["smart_home", "Smart home"],
  ["awnings", "Τέντες"],
];

const maisonetteResidentialFeatures: string[][] = [
  ["internal_staircase", "Εσωτερική σκάλα"],
  ["attic", "Σοφίτα"],
  ["playroom", "Playroom"],
  ["independent_entrance", "Ανεξάρτητη είσοδος"],
];

const houseResidentialFeatures: string[][] = [
  ["pool", "Πισίνα"],
  ["garden", "Κήπος"],
  ["bbq", "BBQ"],
  ["jacuzzi", "Τζακούζι"],
];

const landFeatureOptions: string[][] = [
  ["buildable", "Οικοδομήσιμο"],
  ["complete_and_buildable", "Άρτιο & οικοδομήσιμο"],
  ["road_access", "Πρόσβαση σε δρόμο"],
  ["electricity", "Ρεύμα"],
  ["water", "Νερό"],
  ["drilling", "Γεώτρηση"],
  ["fenced", "Περίφραξη"],
  ["seaside", "Παραθαλάσσιο"],
  ["panoramic_view", "Πανοραμική θέα"],
  ["suitable_for_tourism", "Κατάλληλο για τουριστική χρήση"],
  ["can_be_divided", "Δυνατότητα κατάτμησης"],
];

const commercialFeatureOptions: string[][] = [
  ["loading_ramp", "Ράμπα φορτοεκφόρτωσης"],
  ["crane_bridge", "Γερανογέφυρα"],
  ["three_phase_power", "Τριφασικό ρεύμα"],
  ["industrial_floor", "Βιομηχανικό δάπεδο"],
  ["fire_detection", "Πυρανίχνευση"],
  ["fire_suppression", "Πυρόσβεση"],
  ["cameras", "Κάμερες"],
  ["front_facing", "Πρόσοψη"],
  ["corner", "Γωνιακό"],
];

const emptyForm: FormState = {
  title: "",
  internalCode: "",
  category: "residential",
  subtype: "apartment",
  listingType: "sale",
  status: "draft",
  price: "",
  builtSqm: "",
  plotSqm: "",
  usableSqm: "",
  city: "Αθήνα",
  municipality: "",
  area: "",
  neighborhood: "",
  address: "",
  postalCode: "",
  distanceFromSeaMeters: "",
  ownerName: "",
  ownerPhone: "",
  ownerEmail: "",
  assignedAgentName: "",
  descriptionEl: "",
  privateNotes: "",

  floor: "",
  totalFloors: "",
  levelCount: "",
  bedrooms: "",
  masterBedrooms: "",
  bathrooms: "",
  wc: "",
  kitchens: "",
  kitchenType: "",
  livingRooms: "",
  constructionYear: "",
  renovationYear: "",
  condition: "",
  energyClass: "",
  heatingType: "",
  heatingMedium: "",
  parkingSpaces: "",
  parkingType: "",
  storageSqm: "",
  balconySqm: "",
  verandaSqm: "",
  orientation: "",
  viewType: "",
  residentialFeatures: [],

  landSqm: "",
  buildingFactor: "",
  coveragePercent: "",
  allowedBuildSqm: "",
  remainingBuildSqm: "",
  frontageMeters: "",
  slopeType: "",
  landUse: "",
  landFeatures: [],

  commercialFloor: "",
  commercialLevels: "",
  commercialRooms: "",
  officesCount: "",
  commercialWc: "",
  heightMeters: "",
  mezzanineSqm: "",
  showcaseLengthMeters: "",
  powerCapacityKva: "",
  suitableFor: [],
  commercialFeatures: [],

  kaek: "",
  peaRequired: true,
  peaCertificateNumber: "",
  peaEnergyClass: "",
  peaIssueDate: "",
  peaExpiresAt: "",
  htkStatus: "missing",
  htkCertificateNumber: "",
  responsibleEngineerName: "",
  arbitrarySettlementStatus: "unknown",
  buildingPermitNumber: "",
  legalNotes: "",
  titleDeedAvailable: false,
  buildingPermitAvailable: false,
  topographicDiagramAvailable: false,
  floorPlanAvailable: false,
  thousandthsTableAvailable: false,
  enfiaAvailable: false,
  taxClearanceAvailable: false,

  assignmentStatus: "not_assigned",
  keysStatus: "unknown",
  keysLocation: "",
  assignmentStartedAt: "",
  assignmentExpiresAt: "",
  isCurrentlyLeased: false,
  leasedUntil: "",
  currentMonthlyRent: "",
  currentTenantName: "",
  spitogatosUrl: "",
  xeUrl: "",
  otherPortalUrl: "",
  portalNotes: "",

  isInvestment: false,
  isLeased: false,
  monthlyRent: "",
  leaseExpiresAt: "",
  yieldPercent: "",
  shortTermRentalLicense: false,
  amaNumber: "",
  eotLicenseNumber: "",
  tenantName: "",
};

function textOrNull(value: string) {
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

function stringValue(value: unknown) {
  return value === null || value === undefined ? "" : String(value);
}

function numberOrNull(value: string) {
  if (!value.trim()) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function integerOrNull(value: string) {
  const parsed = numberOrNull(value);
  return parsed === null ? null : Math.trunc(parsed);
}

function dateOrNull(value: string) {
  return value.trim() ? value : null;
}

function formatDate(value?: string | null) {
  if (!value) return "—";

  const options: Intl.DateTimeFormatOptions = { dateStyle: "medium" };

  if (value.includes("T")) {
    options.timeStyle = "short";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat("el-GR", options).format(date);
}

function formatPrice(price: PropertyRecord["price"], currency = "EUR") {
  const parsed = Number(price ?? 0);

  if (!Number.isFinite(parsed) || parsed <= 0) {
    return "Τιμή κατόπιν επικοινωνίας";
  }

  return new Intl.NumberFormat("el-GR", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(parsed);
}

function getSubtypeOptions(category: PropertyCategory) {
  if (category === "land") return landSubtypes;
  if (category === "commercial") return commercialSubtypes;
  return residentialSubtypes;
}

function getSubtypeLabel(
  category: PropertyCategory | null,
  subtype: string | null,
) {
  return (
    getSubtypeOptions(category ?? "residential").find(
      ([value]) => value === subtype,
    )?.[1] ??
    subtype ??
    "—"
  );
}

function formatTitlePrice(value: string) {
  const cleaned = value.replace(/[^0-9]/g, "");

  if (!cleaned) return "";

  return `€${Number(cleaned).toLocaleString("el-GR")}`;
}

function buildAutoTitle(
  form: Pick<
    FormState,
    | "category"
    | "subtype"
    | "builtSqm"
    | "plotSqm"
    | "price"
    | "area"
    | "neighborhood"
  >,
) {
  const subtypeLabel = getSubtypeLabel(form.category, form.subtype);
  const sqm =
    form.builtSqm.trim() ||
    (form.category === "land" ? form.plotSqm.trim() : "");
  const price = formatTitlePrice(form.price);
  const location = [form.neighborhood.trim(), form.area.trim()]
    .filter(Boolean)
    .join(", ");

  const main = [
    subtypeLabel,
    sqm ? `${sqm} τ.μ.` : "",
    price ? `, ${price}` : "",
  ]
    .filter(Boolean)
    .join(" ")
    .replace(" ,", ",");

  return [main, location ? `| ${location}` : ""].filter(Boolean).join(" ");
}

function isMaisonetteLike(subtype: string) {
  return ["maisonette", "floor_maisonette"].includes(subtype);
}

function isHouseLike(subtype: string) {
  return [
    "detached_house",
    "semi_detached_house",
    "villa",
    "holiday_home",
    "traditional",
    "stone_house",
    "wooden_house",
  ].includes(subtype);
}

function getResidentialFeatures(subtype: string) {
  const options = [...baseResidentialFeatures];

  if (isMaisonetteLike(subtype)) {
    options.push(...maisonetteResidentialFeatures);
  }

  if (isHouseLike(subtype) || isMaisonetteLike(subtype)) {
    options.push(...houseResidentialFeatures);
  }

  return options;
}

function getPublishability(property: PropertyRecord, legal?: LegalDetail) {
  const missing: string[] = [];

  if (!property.price) missing.push("τιμή");
  if (!property.area && !property.city) missing.push("περιοχή");
  if (!property.built_sqm && !property.plot_sqm) missing.push("τ.μ.");
  if (!legal?.kaek) missing.push("ΚΑΕΚ");
  if (legal?.pea_required !== false && !legal?.pea_energy_class)
    missing.push("ΠΕΑ");

  if (
    !legal ||
    legal.htk_status === "missing" ||
    legal.htk_status === "pending"
  ) {
    missing.push("ΗΤΚ");
  }

  if (missing.length === 0) {
    return {
      label: "Έτοιμο για publish",
      className: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    };
  }

  return {
    label: `Λείπει: ${missing.slice(0, 3).join(", ")}${missing.length > 3 ? "…" : ""}`,
    className: "bg-amber-50 text-amber-700 ring-amber-200",
  };
}

function toOneMap<T extends { property_id: string }>(items: T[]) {
  return Object.fromEntries(items.map((item) => [item.property_id, item]));
}

function toManyMap<T extends { property_id: string }>(items: T[]) {
  return items.reduce<Record<string, T[]>>((accumulator, item) => {
    accumulator[item.property_id] = [
      ...(accumulator[item.property_id] ?? []),
      item,
    ];
    return accumulator;
  }, {});
}

export const PropertiesPage = () => {
  const [properties, setProperties] = useState<PropertyRecord[]>([]);
  const [residentialDetails, setResidentialDetails] = useState<
    Record<string, ResidentialDetail>
  >({});
  const [landDetails, setLandDetails] = useState<Record<string, LandDetail>>(
    {},
  );
  const [commercialDetails, setCommercialDetails] = useState<
    Record<string, CommercialDetail>
  >({});
  const [legalDetails, setLegalDetails] = useState<Record<string, LegalDetail>>(
    {},
  );
  const [investmentDetails, setInvestmentDetails] = useState<
    Record<string, InvestmentDetail>
  >({});
  const [notes, setNotes] = useState<Record<string, PropertyNote[]>>({});
  const [media, setMedia] = useState<Record<string, PropertyMedia[]>>({});
  const [documents, setDocuments] = useState<
    Record<string, PropertyDocument[]>
  >({});
  const [viewings, setViewings] = useState<Record<string, PropertyViewing[]>>(
    {},
  );
  const [activity, setActivity] = useState<Record<string, PropertyActivity[]>>(
    {},
  );

  const [selectedProperty, setSelectedProperty] =
    useState<PropertyRecord | null>(null);
  const [detailTab, setDetailTab] = useState<DetailTab>("summary");
  const [formTab, setFormTab] = useState<FormTab>("basic");
  const [editingPropertyId, setEditingPropertyId] = useState<string | null>(
    null,
  );
  const [form, setForm] = useState<FormState>(emptyForm);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [saveState, setSaveState] = useState<SaveState>({ status: "idle" });
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<
    PropertyCategory | "all"
  >("all");

  const [newNote, setNewNote] = useState("");
  const [newMediaUrl, setNewMediaUrl] = useState("");
  const [newMediaCaption, setNewMediaCaption] = useState("");
  const [newDocumentName, setNewDocumentName] = useState("");
  const [newDocumentUrl, setNewDocumentUrl] = useState("");
  const [newActionMessage, setNewActionMessage] = useState("");
  const [newDemandReference, setNewDemandReference] = useState("");

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

      const rows = (data ?? []) as PropertyRecord[];
      const ids = rows.map((property) => property.id);

      setProperties(rows);

      if (ids.length === 0) {
        setResidentialDetails({});
        setLandDetails({});
        setCommercialDetails({});
        setLegalDetails({});
        setInvestmentDetails({});
        setNotes({});
        setMedia({});
        setDocuments({});
        setViewings({});
        setActivity({});
        return;
      }

      const [
        residential,
        land,
        commercial,
        legal,
        investment,
        notesResult,
        mediaResult,
        documentsResult,
        viewingsResult,
        activityResult,
      ] = await Promise.all([
        supabaseClient
          .from("property_residential_details")
          .select("*")
          .in("property_id", ids),
        supabaseClient
          .from("property_land_details")
          .select("*")
          .in("property_id", ids),
        supabaseClient
          .from("property_commercial_details")
          .select("*")
          .in("property_id", ids),
        supabaseClient
          .from("property_legal_details")
          .select("*")
          .in("property_id", ids),
        supabaseClient
          .from("property_investment_details")
          .select("*")
          .in("property_id", ids),
        supabaseClient
          .from("property_notes")
          .select("*")
          .in("property_id", ids)
          .order("created_at", { ascending: false }),
        supabaseClient
          .from("property_media")
          .select("*")
          .in("property_id", ids)
          .order("created_at", { ascending: false }),
        supabaseClient
          .from("property_documents")
          .select("*")
          .in("property_id", ids)
          .order("created_at", { ascending: false }),
        supabaseClient
          .from("property_viewings")
          .select("*")
          .in("property_id", ids)
          .order("created_at", { ascending: false }),
        supabaseClient
          .from("property_activity")
          .select("*")
          .in("property_id", ids)
          .order("created_at", { ascending: false }),
      ]);

      if (residential.error) console.warn(residential.error.message);
      if (land.error) console.warn(land.error.message);
      if (commercial.error) console.warn(commercial.error.message);
      if (legal.error) console.warn(legal.error.message);
      if (investment.error) console.warn(investment.error.message);
      if (notesResult.error) console.warn(notesResult.error.message);
      if (mediaResult.error) console.warn(mediaResult.error.message);
      if (documentsResult.error) console.warn(documentsResult.error.message);
      if (viewingsResult.error) console.warn(viewingsResult.error.message);
      if (activityResult.error) console.warn(activityResult.error.message);

      setResidentialDetails(
        toOneMap((residential.data ?? []) as ResidentialDetail[]),
      );
      setLandDetails(toOneMap((land.data ?? []) as LandDetail[]));
      setCommercialDetails(
        toOneMap((commercial.data ?? []) as CommercialDetail[]),
      );
      setLegalDetails(toOneMap((legal.data ?? []) as LegalDetail[]));
      setInvestmentDetails(
        toOneMap((investment.data ?? []) as InvestmentDetail[]),
      );
      setNotes(toManyMap((notesResult.data ?? []) as PropertyNote[]));
      setMedia(toManyMap((mediaResult.data ?? []) as PropertyMedia[]));
      setDocuments(
        toManyMap((documentsResult.data ?? []) as PropertyDocument[]),
      );
      setViewings(toManyMap((viewingsResult.data ?? []) as PropertyViewing[]));
      setActivity(toManyMap((activityResult.data ?? []) as PropertyActivity[]));
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

  const stats = useMemo(
    () => ({
      total: properties.length,
      residential: properties.filter(
        (property) => property.category === "residential",
      ).length,
      land: properties.filter((property) => property.category === "land")
        .length,
      commercial: properties.filter(
        (property) => property.category === "commercial",
      ).length,
      active: properties.filter((property) => property.status === "active")
        .length,
    }),
    [properties],
  );

  const filteredProperties = useMemo(() => {
    const query = search.trim().toLowerCase();

    return properties.filter((property) => {
      const category = property.category ?? "residential";
      const legal = legalDetails[property.id];

      const matchesCategory =
        categoryFilter === "all" || category === categoryFilter;

      const matchesSearch =
        !query ||
        [
          property.title,
          property.internal_code,
          property.city,
          property.area,
          property.neighborhood,
          property.address,
          property.owner_name,
          legal?.kaek,
        ]
          .filter(Boolean)
          .some((value) => String(value).toLowerCase().includes(query));

      return matchesCategory && matchesSearch;
    });
  }, [properties, search, categoryFilter, legalDetails]);

  const autoGeneratedTitle = useMemo(
    () => buildAutoTitle(form),
    [
      form.area,
      form.builtSqm,
      form.category,
      form.neighborhood,
      form.plotSqm,
      form.price,
      form.subtype,
    ],
  );

  useEffect(() => {
    setForm((current) =>
      current.title === autoGeneratedTitle
        ? current
        : { ...current, title: autoGeneratedTitle },
    );
  }, [autoGeneratedTitle]);

  const updateForm = <K extends keyof FormState>(
    field: K,
    value: FormState[K],
  ) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const toggleArrayValue = (
    field:
      | "residentialFeatures"
      | "landFeatures"
      | "commercialFeatures"
      | "suitableFor",
    value: string,
  ) => {
    setForm((current) => {
      const currentValues = current[field];

      return {
        ...current,
        [field]: currentValues.includes(value)
          ? currentValues.filter((item) => item !== value)
          : [...currentValues, value],
      };
    });
  };

  const handleCategoryChange = (category: PropertyCategory) => {
    const subtype =
      category === "land"
        ? "plot"
        : category === "commercial"
          ? "office"
          : category === "other"
            ? "other"
            : "apartment";

    setForm((current) => ({
      ...current,
      category,
      subtype,
      residentialFeatures: [],
      landFeatures: [],
      commercialFeatures: [],
    }));
  };

  const openCreateForm = () => {
    setEditingPropertyId(null);
    setForm(emptyForm);
    setFormTab("basic");
    setSaveState({ status: "idle" });
    setIsFormOpen(true);
  };

  const openEditForm = (property: PropertyRecord) => {
    setSelectedProperty(null);
    const residential = residentialDetails[property.id];
    const land = landDetails[property.id];
    const commercial = commercialDetails[property.id];
    const legal = legalDetails[property.id];
    const investment = investmentDetails[property.id];

    setEditingPropertyId(property.id);
    setForm({
      ...emptyForm,
      title: property.title ?? "",
      internalCode: property.internal_code ?? "",
      category: property.category ?? "residential",
      subtype: property.subtype ?? "apartment",
      listingType: property.listing_type ?? "sale",
      status: property.status ?? "draft",
      price: stringValue(property.price),
      builtSqm: stringValue(property.built_sqm),
      plotSqm: stringValue(property.plot_sqm),
      usableSqm: stringValue(property.usable_sqm),
      city: property.city ?? "Αθήνα",
      municipality: property.municipality ?? "",
      area: property.area ?? "",
      neighborhood: property.neighborhood ?? "",
      address: property.address ?? "",
      postalCode: property.postal_code ?? "",
      distanceFromSeaMeters: stringValue(property.distance_from_sea_meters),
      ownerName: property.owner_name ?? "",
      ownerPhone: property.owner_phone ?? "",
      ownerEmail: property.owner_email ?? "",
      assignedAgentName: property.assigned_agent_name ?? "",
      descriptionEl: property.description_el ?? "",
      privateNotes: property.private_notes ?? "",

      floor: residential?.floor ?? "",
      totalFloors: stringValue(residential?.total_floors),
      levelCount: stringValue(residential?.level_count),
      bedrooms: stringValue(residential?.bedrooms),
      masterBedrooms: stringValue(residential?.master_bedrooms),
      bathrooms: stringValue(residential?.bathrooms),
      wc: stringValue(residential?.wc),
      kitchens: stringValue(residential?.kitchens),
      kitchenType: residential?.kitchen_type ?? "",
      livingRooms: stringValue(residential?.living_rooms),
      constructionYear: stringValue(residential?.construction_year),
      renovationYear: stringValue(residential?.renovation_year),
      condition: residential?.condition ?? "",
      energyClass: residential?.energy_class ?? "",
      heatingType: residential?.heating_type ?? "",
      heatingMedium: residential?.heating_medium ?? "",
      parkingSpaces: stringValue(residential?.parking_spaces),
      parkingType: residential?.parking_type ?? "",
      storageSqm: stringValue(residential?.storage_sqm),
      balconySqm: stringValue(residential?.balcony_sqm),
      verandaSqm: stringValue(residential?.veranda_sqm),
      orientation: residential?.orientation ?? "",
      viewType: residential?.view_type ?? "",
      residentialFeatures: residential?.residential_features ?? [],

      landSqm: stringValue(land?.land_sqm),
      buildingFactor: stringValue(land?.building_factor),
      coveragePercent: stringValue(land?.coverage_percent),
      allowedBuildSqm: stringValue(land?.allowed_build_sqm),
      remainingBuildSqm: stringValue(land?.remaining_build_sqm),
      frontageMeters: stringValue(land?.frontage_meters),
      slopeType: land?.slope_type ?? "",
      landUse: land?.land_use ?? "",
      landFeatures: land?.land_features ?? [],

      commercialFloor: commercial?.floor ?? "",
      commercialLevels: stringValue(commercial?.levels),
      commercialRooms: stringValue(commercial?.rooms),
      officesCount: stringValue(commercial?.offices_count),
      commercialWc: stringValue(commercial?.wc),
      heightMeters: stringValue(commercial?.height_meters),
      mezzanineSqm: stringValue(commercial?.mezzanine_sqm),
      showcaseLengthMeters: stringValue(commercial?.showcase_length_meters),
      powerCapacityKva: stringValue(commercial?.power_capacity_kva),
      suitableFor: commercial?.suitable_for ?? [],
      commercialFeatures: commercial?.commercial_features ?? [],

      kaek: legal?.kaek ?? "",
      peaRequired: legal?.pea_required ?? true,
      peaCertificateNumber: legal?.pea_certificate_number ?? "",
      peaEnergyClass: legal?.pea_energy_class ?? "",
      peaIssueDate: legal?.pea_issue_date ?? "",
      peaExpiresAt: legal?.pea_expires_at ?? "",
      htkStatus: legal?.htk_status ?? "missing",
      htkCertificateNumber: legal?.htk_certificate_number ?? "",
      responsibleEngineerName: legal?.responsible_engineer_name ?? "",
      arbitrarySettlementStatus:
        legal?.arbitrary_settlement_status ?? "unknown",
      buildingPermitNumber: legal?.building_permit_number ?? "",
      legalNotes: legal?.legal_notes ?? "",
      titleDeedAvailable: legal?.title_deed_available ?? false,
      buildingPermitAvailable: legal?.building_permit_available ?? false,
      topographicDiagramAvailable:
        legal?.topographic_diagram_available ?? false,
      floorPlanAvailable: legal?.floor_plan_available ?? false,
      thousandthsTableAvailable: legal?.thousandths_table_available ?? false,
      enfiaAvailable: legal?.enfia_available ?? false,
      taxClearanceAvailable: legal?.tax_clearance_available ?? false,

      assignmentStatus: property.assignment_status ?? "not_assigned",
      keysStatus: property.keys_status ?? "unknown",
      keysLocation: property.keys_location ?? "",
      assignmentStartedAt: property.assignment_started_at ?? "",
      assignmentExpiresAt: property.assignment_expires_at ?? "",
      isCurrentlyLeased: property.is_currently_leased ?? false,
      leasedUntil: property.leased_until ?? "",
      currentMonthlyRent: stringValue(property.current_monthly_rent),
      currentTenantName: property.current_tenant_name ?? "",
      spitogatosUrl: property.spitogatos_url ?? "",
      xeUrl: property.xe_url ?? "",
      otherPortalUrl: property.other_portal_url ?? "",
      portalNotes: property.portal_notes ?? "",

      isInvestment: investment?.is_investment ?? false,
      isLeased: investment?.is_leased ?? false,
      monthlyRent: stringValue(investment?.monthly_rent),
      leaseExpiresAt: investment?.lease_expires_at ?? "",
      yieldPercent: stringValue(investment?.yield_percent),
      shortTermRentalLicense: investment?.short_term_rental_license ?? false,
      amaNumber: investment?.ama_number ?? "",
      eotLicenseNumber: investment?.eot_license_number ?? "",
      tenantName: investment?.tenant_name ?? "",
    });
    setFormTab("basic");
    setSaveState({ status: "idle" });
    setIsFormOpen(true);
  };

  const handleSaveProperty = async (event: FormEvent<HTMLFormElement>) => {
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

      const propertyPayload = {
        title: form.title.trim(),
        internal_code: textOrNull(form.internalCode),
        category: form.category,
        subtype: form.subtype,
        listing_type: form.listingType,
        status: form.status,
        price: numberOrNull(form.price),
        currency: "EUR",
        built_sqm: numberOrNull(form.builtSqm),
        plot_sqm: numberOrNull(form.plotSqm),
        usable_sqm: numberOrNull(form.usableSqm),
        city: textOrNull(form.city),
        municipality: textOrNull(form.municipality),
        area: textOrNull(form.area),
        neighborhood: textOrNull(form.neighborhood),
        address: textOrNull(form.address),
        postal_code: textOrNull(form.postalCode),
        distance_from_sea_meters: integerOrNull(form.distanceFromSeaMeters),
        owner_name: textOrNull(form.ownerName),
        owner_phone: textOrNull(form.ownerPhone),
        owner_email: textOrNull(form.ownerEmail),
        assigned_agent_name: textOrNull(form.assignedAgentName),
        description_el: textOrNull(form.descriptionEl),
        private_notes: textOrNull(form.privateNotes),
        assignment_status: form.assignmentStatus,
        keys_status: form.keysStatus,
        keys_location: textOrNull(form.keysLocation),
        assignment_started_at: dateOrNull(form.assignmentStartedAt),
        assignment_expires_at: dateOrNull(form.assignmentExpiresAt),
        is_currently_leased: form.isCurrentlyLeased,
        leased_until: dateOrNull(form.leasedUntil),
        current_monthly_rent: numberOrNull(form.currentMonthlyRent),
        current_tenant_name: textOrNull(form.currentTenantName),
        spitogatos_url: textOrNull(form.spitogatosUrl),
        xe_url: textOrNull(form.xeUrl),
        other_portal_url: textOrNull(form.otherPortalUrl),
        portal_notes: textOrNull(form.portalNotes),
      };

      const propertyResult = editingPropertyId
        ? await supabaseClient
            .from("properties")
            .update(propertyPayload)
            .eq("id", editingPropertyId)
            .select("*")
            .single()
        : await supabaseClient
            .from("properties")
            .insert(propertyPayload)
            .select("*")
            .single();

      if (propertyResult.error) throw propertyResult.error;

      const property = propertyResult.data as PropertyRecord;
      const propertyId = property.id;

      if (form.category === "residential") {
        const { error } = await supabaseClient
          .from("property_residential_details")
          .upsert(
            {
              property_id: propertyId,
              floor: textOrNull(form.floor),
              total_floors: integerOrNull(form.totalFloors),
              level_count: integerOrNull(form.levelCount),
              bedrooms: integerOrNull(form.bedrooms),
              master_bedrooms: integerOrNull(form.masterBedrooms),
              bathrooms: numberOrNull(form.bathrooms),
              wc: integerOrNull(form.wc),
              kitchens: integerOrNull(form.kitchens),
              kitchen_type: textOrNull(form.kitchenType),
              living_rooms: integerOrNull(form.livingRooms),
              construction_year: integerOrNull(form.constructionYear),
              renovation_year: integerOrNull(form.renovationYear),
              condition: textOrNull(form.condition),
              energy_class: textOrNull(form.energyClass),
              heating_type: textOrNull(form.heatingType),
              heating_medium: textOrNull(form.heatingMedium),
              parking_spaces: integerOrNull(form.parkingSpaces),
              parking_type: textOrNull(form.parkingType),
              storage_sqm: numberOrNull(form.storageSqm),
              balcony_sqm: numberOrNull(form.balconySqm),
              veranda_sqm: numberOrNull(form.verandaSqm),
              orientation: textOrNull(form.orientation),
              view_type: textOrNull(form.viewType),
              residential_features: form.residentialFeatures,
            },
            { onConflict: "property_id" },
          );

        if (error) console.warn(error.message);
      }

      if (form.category === "land") {
        const { error } = await supabaseClient
          .from("property_land_details")
          .upsert(
            {
              property_id: propertyId,
              land_sqm: numberOrNull(form.landSqm),
              building_factor: numberOrNull(form.buildingFactor),
              coverage_percent: numberOrNull(form.coveragePercent),
              allowed_build_sqm: numberOrNull(form.allowedBuildSqm),
              remaining_build_sqm: numberOrNull(form.remainingBuildSqm),
              frontage_meters: numberOrNull(form.frontageMeters),
              slope_type: textOrNull(form.slopeType),
              land_use: textOrNull(form.landUse),
              buildable: form.landFeatures.includes("buildable"),
              complete_and_buildable: form.landFeatures.includes(
                "complete_and_buildable",
              ),
              land_features: form.landFeatures,
            },
            { onConflict: "property_id" },
          );

        if (error) console.warn(error.message);
      }

      if (form.category === "commercial") {
        const { error } = await supabaseClient
          .from("property_commercial_details")
          .upsert(
            {
              property_id: propertyId,
              commercial_subtype: form.subtype,
              floor: textOrNull(form.commercialFloor),
              levels: integerOrNull(form.commercialLevels),
              rooms: integerOrNull(form.commercialRooms),
              offices_count: integerOrNull(form.officesCount),
              wc: integerOrNull(form.commercialWc),
              height_meters: numberOrNull(form.heightMeters),
              mezzanine_sqm: numberOrNull(form.mezzanineSqm),
              frontage_meters: numberOrNull(form.frontageMeters),
              showcase_length_meters: numberOrNull(form.showcaseLengthMeters),
              power_capacity_kva: numberOrNull(form.powerCapacityKva),
              suitable_for: form.suitableFor,
              commercial_features: form.commercialFeatures,
            },
            { onConflict: "property_id" },
          );

        if (error) console.warn(error.message);
      }

      const { error: legalError } = await supabaseClient
        .from("property_legal_details")
        .upsert(
          {
            property_id: propertyId,
            kaek,
            pea_required: form.peaRequired,
            pea_certificate_number: textOrNull(form.peaCertificateNumber),
            pea_energy_class: textOrNull(form.peaEnergyClass),
            pea_issue_date: dateOrNull(form.peaIssueDate),
            pea_expires_at: dateOrNull(form.peaExpiresAt),
            htk_status: form.htkStatus,
            htk_certificate_number: textOrNull(form.htkCertificateNumber),
            responsible_engineer_name: textOrNull(form.responsibleEngineerName),
            arbitrary_settlement_status: form.arbitrarySettlementStatus,
            building_permit_number: textOrNull(form.buildingPermitNumber),
            legal_notes: textOrNull(form.legalNotes),
            title_deed_available: form.titleDeedAvailable,
            building_permit_available: form.buildingPermitAvailable,
            topographic_diagram_available: form.topographicDiagramAvailable,
            floor_plan_available: form.floorPlanAvailable,
            thousandths_table_available: form.thousandthsTableAvailable,
            enfia_available: form.enfiaAvailable,
            tax_clearance_available: form.taxClearanceAvailable,
          },
          { onConflict: "property_id" },
        );

      if (legalError) console.warn(legalError.message);

      const { error: investmentError } = await supabaseClient
        .from("property_investment_details")
        .upsert(
          {
            property_id: propertyId,
            is_investment: form.isInvestment,
            is_leased: form.isLeased,
            monthly_rent: numberOrNull(form.monthlyRent),
            lease_expires_at: dateOrNull(form.leaseExpiresAt),
            yield_percent: numberOrNull(form.yieldPercent),
            short_term_rental_license: form.shortTermRentalLicense,
            ama_number: textOrNull(form.amaNumber),
            eot_license_number: textOrNull(form.eotLicenseNumber),
            tenant_name: textOrNull(form.tenantName),
          },
          { onConflict: "property_id" },
        );

      if (investmentError) console.warn(investmentError.message);

      await supabaseClient.from("property_activity").insert({
        property_id: propertyId,
        action: editingPropertyId ? "updated" : "created",
        message: editingPropertyId
          ? "Το ακίνητο ενημερώθηκε."
          : "Το ακίνητο δημιουργήθηκε στο Home Direct CRM.",
      });

      setSaveState({
        status: "success",
        message: editingPropertyId
          ? "Το ακίνητο ενημερώθηκε."
          : "Το ακίνητο δημιουργήθηκε.",
      });

      setIsFormOpen(false);
      setEditingPropertyId(null);
      setSelectedProperty(property);
      await fetchProperties();
    } catch (error) {
      setSaveState({
        status: "error",
        message:
          error instanceof Error
            ? error.message
            : "Δεν αποθηκεύτηκε το ακίνητο.",
      });
    }
  };

  const handleAddNote = async () => {
    if (!selectedProperty || !newNote.trim()) return;

    const supabaseClient = getSupabaseClient();
    const { error } = await supabaseClient.from("property_notes").insert({
      property_id: selectedProperty.id,
      note: newNote.trim(),
    });

    if (error) {
      setSaveState({ status: "error", message: error.message });
      return;
    }

    await supabaseClient.from("property_activity").insert({
      property_id: selectedProperty.id,
      action: "note_added",
      message: "Προστέθηκε νέα σημείωση.",
    });

    setNewNote("");
    await fetchProperties();
  };

  const handleAddMedia = async () => {
    if (!selectedProperty || !newMediaUrl.trim()) return;

    const supabaseClient = getSupabaseClient();
    const { error } = await supabaseClient.from("property_media").insert({
      property_id: selectedProperty.id,
      media_type: "photo",
      external_url: newMediaUrl.trim(),
      caption: textOrNull(newMediaCaption),
      file_name: textOrNull(newMediaCaption) ?? "Media link",
    });

    if (error) {
      setSaveState({ status: "error", message: error.message });
      return;
    }

    await supabaseClient.from("property_activity").insert({
      property_id: selectedProperty.id,
      action: "media_added",
      message: "Προστέθηκε φωτογραφία / media link.",
    });

    setNewMediaUrl("");
    setNewMediaCaption("");
    await fetchProperties();
  };

  const handleAddDocument = async () => {
    if (!selectedProperty || !newDocumentName.trim() || !newDocumentUrl.trim())
      return;

    const supabaseClient = getSupabaseClient();
    const { error } = await supabaseClient.from("property_documents").insert({
      property_id: selectedProperty.id,
      document_type: "other",
      file_name: newDocumentName.trim(),
      storage_path: newDocumentUrl.trim(),
      notes: "External URL / manual attachment reference",
    });

    if (error) {
      setSaveState({ status: "error", message: error.message });
      return;
    }

    await supabaseClient.from("property_activity").insert({
      property_id: selectedProperty.id,
      action: "document_added",
      message: `Προστέθηκε επισύναψη: ${newDocumentName.trim()}`,
    });

    setNewDocumentName("");
    setNewDocumentUrl("");
    await fetchProperties();
  };

  const handleAddAction = async () => {
    if (!selectedProperty || !newActionMessage.trim()) return;

    const supabaseClient = getSupabaseClient();
    const { error } = await supabaseClient.from("property_activity").insert({
      property_id: selectedProperty.id,
      action: "manual_action",
      message: newActionMessage.trim(),
      metadata: {
        demand_reference: textOrNull(newDemandReference),
      },
    });

    if (error) {
      setSaveState({ status: "error", message: error.message });
      return;
    }

    setNewActionMessage("");
    setNewDemandReference("");
    await fetchProperties();
  };

  const subtypeOptions = getSubtypeOptions(form.category);
  const visibleResidentialFeatures = getResidentialFeatures(form.subtype);
  const showLevels =
    isMaisonetteLike(form.subtype) || isHouseLike(form.subtype);

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <section className="flex flex-col gap-5 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-700">
              <Building2 className="h-4 w-4" />
              Home Direct CRM
            </div>

            <h1 className="text-3xl font-semibold tracking-tight text-slate-950">
              Ακίνητα
            </h1>

            <p className="mt-3 max-w-3xl text-slate-600">
              Property record με tabs, edit, φωτογραφίες, ανάθεση, επισυνάψεις,
              immutable σημειώσεις, ημερολόγιο και ενέργειες.
            </p>
          </div>

          <button
            type="button"
            onClick={openCreateForm}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#032360] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:opacity-90"
          >
            <Plus className="h-4 w-4" />
            Νέο Ακίνητο
          </button>
        </section>

        {saveState.status === "success" && (
          <Alert tone="success" title={saveState.message} />
        )}

        {saveState.status === "error" && (
          <Alert
            tone="error"
            title="Κάτι πήγε στραβά."
            text={saveState.message}
          />
        )}

        <section className="grid gap-4 md:grid-cols-5">
          <StatCard label="Σύνολο" value={stats.total} icon={Building2} />
          <StatCard label="Κατοικίες" value={stats.residential} icon={Home} />
          <StatCard label="Γη" value={stats.land} icon={Landmark} />
          <StatCard
            label="Επαγγελματικά"
            value={stats.commercial}
            icon={Factory}
          />
          <StatCard label="Ενεργά" value={stats.active} icon={CheckCircle2} />
        </section>

        <section className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white py-3 pl-11 pr-4 text-base text-slate-950 outline-none transition focus:border-[#032360] focus:ring-2 focus:ring-[#032360]/10"
                placeholder="Αναζήτηση με τίτλο, περιοχή, ιδιοκτήτη ή ΚΑΕΚ..."
              />
            </div>

            <select
              value={categoryFilter}
              onChange={(event) =>
                setCategoryFilter(
                  event.target.value as PropertyCategory | "all",
                )
              }
              className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-medium text-slate-700 outline-none focus:border-[#032360]"
            >
              <option value="all">Όλες οι κατηγορίες</option>
              <option value="residential">Κατοικίες</option>
              <option value="land">Γη</option>
              <option value="commercial">Επαγγελματικά</option>
              <option value="other">Άλλο</option>
            </select>
          </div>
        </section>

        {loadError && <Alert tone="error" title={loadError} />}

        {isLoading ? (
          <div className="flex items-center justify-center rounded-3xl bg-white p-12 text-slate-500 shadow-sm ring-1 ring-slate-200">
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Φόρτωση ακινήτων...
          </div>
        ) : filteredProperties.length > 0 ? (
          <section className="grid gap-5 lg:grid-cols-2 xl:grid-cols-3">
            {filteredProperties.map((property) => {
              const category = property.category ?? "residential";
              const legal = legalDetails[property.id];
              const publishability = getPublishability(property, legal);

              return (
                <button
                  key={property.id}
                  type="button"
                  onClick={() => {
                    setSelectedProperty(property);
                    setDetailTab("summary");
                  }}
                  className="overflow-hidden rounded-3xl bg-white text-left shadow-sm ring-1 ring-slate-200 transition hover:-translate-y-0.5 hover:shadow-md"
                >
                  <div className="relative h-36 bg-gradient-to-br from-[#032360] to-[#009688]">
                    <div className="absolute inset-0 flex items-center justify-center text-white/80">
                      {category === "land" ? (
                        <Landmark className="h-14 w-14" />
                      ) : category === "commercial" ? (
                        <Factory className="h-14 w-14" />
                      ) : (
                        <Home className="h-14 w-14" />
                      )}
                    </div>

                    <div className="absolute left-4 top-4 flex flex-wrap gap-2">
                      <Pill>{categoryLabels[category]}</Pill>
                      <Pill>
                        {property.listing_type === "rent"
                          ? "Μίσθωση"
                          : "Πώληση"}
                      </Pill>
                    </div>
                  </div>

                  <div className="p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h3 className="line-clamp-2 text-lg font-semibold text-slate-950">
                          {property.title}
                        </h3>

                        <p className="mt-2 text-sm text-slate-500">
                          {getSubtypeLabel(category, property.subtype)}
                        </p>

                        <p className="mt-2 inline-flex items-center gap-1 text-sm text-slate-500">
                          <MapPin className="h-4 w-4" />
                          {[property.area, property.city]
                            .filter(Boolean)
                            .join(", ") || "Χωρίς περιοχή"}
                        </p>
                      </div>

                      <p className="shrink-0 text-right text-lg font-semibold text-[#032360]">
                        {formatPrice(
                          property.price,
                          property.currency ?? "EUR",
                        )}
                      </p>
                    </div>

                    <div className="mt-4 grid grid-cols-3 gap-3 rounded-2xl bg-slate-50 p-3 text-sm text-slate-600">
                      <span className="inline-flex items-center gap-1">
                        <Square className="h-4 w-4" />
                        {property.built_sqm || property.plot_sqm || "—"} τ.μ.
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <BedDouble className="h-4 w-4" />
                        {residentialDetails[property.id]?.bedrooms ?? "—"}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Bath className="h-4 w-4" />
                        {residentialDetails[property.id]?.bathrooms ?? "—"}
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
              Δημιούργησε το πρώτο ακίνητο με σωστή καρτέλα, legal checklist και
              tabs.
            </p>
          </section>
        )}
      </div>

      {isFormOpen && (
        <Modal onClose={() => setIsFormOpen(false)} maxWidth="max-w-6xl">
          <div className="flex items-start justify-between gap-4 border-b border-slate-200 pb-4">
            <div>
              <h2 className="text-2xl font-semibold text-slate-950">
                {editingPropertyId ? "Επεξεργασία ακινήτου" : "Νέο ακίνητο"}
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Τα πεδία εμφανίζονται ανά τύπο ακινήτου για να μη γεμίζει η
                οθόνη άσχετα inputs.
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

          <TabBar
            value={formTab}
            onChange={(value) => setFormTab(value as FormTab)}
            tabs={[
              ["basic", "Βασικά"],
              ["features", "Χαρακτηριστικά"],
              ["legal", "Νομικά"],
              ["assignment", "Ανάθεση"],
              ["notes", "Σημειώσεις"],
            ]}
          />

          <form onSubmit={handleSaveProperty} className="mt-5 grid gap-6">
            {formTab === "basic" && (
              <div className="grid gap-5">
                <Panel title="Ταυτότητα" icon={Building2}>
                  <div className="grid gap-4 lg:grid-cols-3">
                    <Input
                      label="Τίτλος (αυτόματος)"
                      value={form.title}
                      onChange={(value) => updateForm("title", value)}
                      className="lg:col-span-2"
                    />
                    <Input
                      label="Εσωτερικός κωδικός"
                      value={form.internalCode}
                      onChange={(value) => updateForm("internalCode", value)}
                    />
                  </div>

                  <div className="grid gap-4 md:grid-cols-4">
                    <Select
                      label="Κατηγορία"
                      value={form.category}
                      onChange={(value) =>
                        handleCategoryChange(value as PropertyCategory)
                      }
                      options={[
                        ["residential", "Κατοικία"],
                        ["land", "Γη / Οικόπεδο"],
                        ["commercial", "Επαγγελματικό"],
                        ["other", "Άλλο"],
                      ]}
                    />
                    <Select
                      label="Υποκατηγορία"
                      value={form.subtype}
                      onChange={(value) => updateForm("subtype", value)}
                      options={subtypeOptions}
                    />
                    <Select
                      label="Σκοπός"
                      value={form.listingType}
                      onChange={(value) =>
                        updateForm("listingType", value as ListingType)
                      }
                      options={[
                        ["sale", "Πώληση"],
                        ["rent", "Μίσθωση"],
                      ]}
                    />
                    <Select
                      label="Κατάσταση"
                      value={form.status}
                      onChange={(value) =>
                        updateForm("status", value as PropertyStatus)
                      }
                      options={Object.entries(statusLabels)}
                    />
                  </div>

                  <div className="grid gap-4 md:grid-cols-4">
                    <Input
                      label="Τιμή"
                      type="number"
                      value={form.price}
                      onChange={(value) => updateForm("price", value)}
                    />
                    <Input
                      label="Κτισμένα τ.μ."
                      type="number"
                      value={form.builtSqm}
                      onChange={(value) => updateForm("builtSqm", value)}
                    />
                    <Input
                      label="Οικόπεδο τ.μ."
                      type="number"
                      value={form.plotSqm}
                      onChange={(value) => updateForm("plotSqm", value)}
                    />
                    <Input
                      label="Ωφέλιμα τ.μ."
                      type="number"
                      value={form.usableSqm}
                      onChange={(value) => updateForm("usableSqm", value)}
                    />
                  </div>
                </Panel>

                <Panel title="Διεύθυνση" icon={MapPin}>
                  <div className="grid gap-4 md:grid-cols-4">
                    <Input
                      label="Πόλη"
                      value={form.city}
                      onChange={(value) => updateForm("city", value)}
                    />
                    <Input
                      label="Δήμος"
                      value={form.municipality}
                      onChange={(value) => updateForm("municipality", value)}
                    />
                    <Input
                      label="Περιοχή"
                      value={form.area}
                      onChange={(value) => updateForm("area", value)}
                    />
                    <Input
                      label="Υποπεριοχή"
                      value={form.neighborhood}
                      onChange={(value) => updateForm("neighborhood", value)}
                    />
                  </div>

                  <div className="grid gap-4 md:grid-cols-3">
                    <Input
                      label="Διεύθυνση"
                      value={form.address}
                      onChange={(value) => updateForm("address", value)}
                      className="md:col-span-2"
                    />
                    <Input
                      label="Τ.Κ."
                      value={form.postalCode}
                      onChange={(value) => updateForm("postalCode", value)}
                    />
                  </div>

                  <Input
                    label="Απόσταση από θάλασσα σε μέτρα"
                    type="number"
                    value={form.distanceFromSeaMeters}
                    onChange={(value) =>
                      updateForm("distanceFromSeaMeters", value)
                    }
                  />
                </Panel>
              </div>
            )}

            {formTab === "features" && (
              <div className="grid gap-5">
                {form.category === "residential" && (
                  <Panel title="Χαρακτηριστικά κατοικίας" icon={Home}>
                    <div className="grid gap-4 md:grid-cols-5">
                      <Input
                        label="Όροφος"
                        value={form.floor}
                        onChange={(value) => updateForm("floor", value)}
                      />
                      <Input
                        label="Υ/Δ"
                        type="number"
                        value={form.bedrooms}
                        onChange={(value) => updateForm("bedrooms", value)}
                      />
                      <Input
                        label="Master"
                        type="number"
                        value={form.masterBedrooms}
                        onChange={(value) =>
                          updateForm("masterBedrooms", value)
                        }
                      />
                      <Input
                        label="Μπάνια"
                        type="number"
                        value={form.bathrooms}
                        onChange={(value) => updateForm("bathrooms", value)}
                      />
                      <Input
                        label="WC"
                        type="number"
                        value={form.wc}
                        onChange={(value) => updateForm("wc", value)}
                      />
                    </div>

                    {showLevels && (
                      <div className="grid gap-4 md:grid-cols-3">
                        <Input
                          label="Επίπεδα"
                          type="number"
                          value={form.levelCount}
                          onChange={(value) => updateForm("levelCount", value)}
                        />
                        <Input
                          label="Όροφοι κτιρίου"
                          type="number"
                          value={form.totalFloors}
                          onChange={(value) => updateForm("totalFloors", value)}
                        />
                        <Input
                          label="Θέα"
                          value={form.viewType}
                          onChange={(value) => updateForm("viewType", value)}
                        />
                      </div>
                    )}

                    <div className="grid gap-4 md:grid-cols-4">
                      <Input
                        label="Έτος κατασκευής"
                        type="number"
                        value={form.constructionYear}
                        onChange={(value) =>
                          updateForm("constructionYear", value)
                        }
                      />
                      <Input
                        label="Έτος ανακαίνισης"
                        type="number"
                        value={form.renovationYear}
                        onChange={(value) =>
                          updateForm("renovationYear", value)
                        }
                      />
                      <Select
                        label="Ενεργειακή κλάση"
                        value={form.energyClass}
                        onChange={(value) => updateForm("energyClass", value)}
                        options={[
                          ["", "—"],
                          ["A+", "A+"],
                          ["A", "A"],
                          ["B+", "B+"],
                          ["B", "B"],
                          ["C", "C"],
                          ["D", "D"],
                          ["E", "E"],
                          ["F", "F"],
                          ["G", "G"],
                          ["under_issue", "Υπό έκδοση"],
                          ["exempt", "Εξαιρείται"],
                        ]}
                      />
                      <Input
                        label="Προσανατολισμός"
                        value={form.orientation}
                        onChange={(value) => updateForm("orientation", value)}
                      />
                    </div>

                    <div className="grid gap-4 md:grid-cols-4">
                      <Select
                        label="Θέρμανση"
                        value={form.heatingType}
                        onChange={(value) => updateForm("heatingType", value)}
                        options={[
                          ["", "—"],
                          ["autonomous", "Αυτόνομη"],
                          ["individual", "Ατομική"],
                          ["central", "Κεντρική"],
                          ["underfloor", "Ενδοδαπέδια"],
                          ["none", "Καμία"],
                          ["other", "Άλλη"],
                        ]}
                      />
                      <Select
                        label="Μέσο"
                        value={form.heatingMedium}
                        onChange={(value) => updateForm("heatingMedium", value)}
                        options={[
                          ["", "—"],
                          ["oil", "Πετρέλαιο"],
                          ["natural_gas", "Φυσικό αέριο"],
                          ["electricity", "Ρεύμα"],
                          ["heat_pump", "Αντλία θερμότητας"],
                          ["wood_pellet", "Ξύλα / Pellet"],
                          ["other", "Άλλο"],
                        ]}
                      />
                      <Input
                        label="Parking θέσεις"
                        type="number"
                        value={form.parkingSpaces}
                        onChange={(value) => updateForm("parkingSpaces", value)}
                      />
                      <Input
                        label="Αποθήκη τ.μ."
                        type="number"
                        value={form.storageSqm}
                        onChange={(value) => updateForm("storageSqm", value)}
                      />
                    </div>

                    <FeatureGrid
                      options={visibleResidentialFeatures}
                      selected={form.residentialFeatures}
                      onToggle={(value) =>
                        toggleArrayValue("residentialFeatures", value)
                      }
                    />
                  </Panel>
                )}

                {form.category === "land" && (
                  <Panel title="Χαρακτηριστικά γης" icon={Landmark}>
                    <div className="grid gap-4 md:grid-cols-4">
                      <Input
                        label="Εμβαδόν γης"
                        type="number"
                        value={form.landSqm}
                        onChange={(value) => updateForm("landSqm", value)}
                      />
                      <Input
                        label="Σ.Δ."
                        type="number"
                        value={form.buildingFactor}
                        onChange={(value) =>
                          updateForm("buildingFactor", value)
                        }
                      />
                      <Input
                        label="Κάλυψη %"
                        type="number"
                        value={form.coveragePercent}
                        onChange={(value) =>
                          updateForm("coveragePercent", value)
                        }
                      />
                      <Input
                        label="Επιτρεπόμενη δόμηση"
                        type="number"
                        value={form.allowedBuildSqm}
                        onChange={(value) =>
                          updateForm("allowedBuildSqm", value)
                        }
                      />
                    </div>

                    <div className="grid gap-4 md:grid-cols-3">
                      <Input
                        label="Υπόλοιπο δόμησης"
                        type="number"
                        value={form.remainingBuildSqm}
                        onChange={(value) =>
                          updateForm("remainingBuildSqm", value)
                        }
                      />
                      <Input
                        label="Πρόσοψη μ."
                        type="number"
                        value={form.frontageMeters}
                        onChange={(value) =>
                          updateForm("frontageMeters", value)
                        }
                      />
                      <Input
                        label="Χρήση γης"
                        value={form.landUse}
                        onChange={(value) => updateForm("landUse", value)}
                      />
                    </div>

                    <FeatureGrid
                      options={landFeatureOptions}
                      selected={form.landFeatures}
                      onToggle={(value) =>
                        toggleArrayValue("landFeatures", value)
                      }
                    />
                  </Panel>
                )}

                {form.category === "commercial" && (
                  <Panel title="Επαγγελματικά χαρακτηριστικά" icon={Factory}>
                    <div className="grid gap-4 md:grid-cols-5">
                      <Input
                        label="Όροφος"
                        value={form.commercialFloor}
                        onChange={(value) =>
                          updateForm("commercialFloor", value)
                        }
                      />
                      <Input
                        label="Επίπεδα"
                        type="number"
                        value={form.commercialLevels}
                        onChange={(value) =>
                          updateForm("commercialLevels", value)
                        }
                      />
                      <Input
                        label="Χώροι"
                        type="number"
                        value={form.commercialRooms}
                        onChange={(value) =>
                          updateForm("commercialRooms", value)
                        }
                      />
                      <Input
                        label="Γραφεία"
                        type="number"
                        value={form.officesCount}
                        onChange={(value) => updateForm("officesCount", value)}
                      />
                      <Input
                        label="WC"
                        type="number"
                        value={form.commercialWc}
                        onChange={(value) => updateForm("commercialWc", value)}
                      />
                    </div>

                    <div className="grid gap-4 md:grid-cols-4">
                      <Input
                        label="Ύψος μ."
                        type="number"
                        value={form.heightMeters}
                        onChange={(value) => updateForm("heightMeters", value)}
                      />
                      <Input
                        label="Πατάρι τ.μ."
                        type="number"
                        value={form.mezzanineSqm}
                        onChange={(value) => updateForm("mezzanineSqm", value)}
                      />
                      <Input
                        label="Βιτρίνα μ."
                        type="number"
                        value={form.showcaseLengthMeters}
                        onChange={(value) =>
                          updateForm("showcaseLengthMeters", value)
                        }
                      />
                      <Input
                        label="Ισχύς kVA"
                        type="number"
                        value={form.powerCapacityKva}
                        onChange={(value) =>
                          updateForm("powerCapacityKva", value)
                        }
                      />
                    </div>

                    <FeatureGrid
                      options={commercialFeatureOptions}
                      selected={form.commercialFeatures}
                      onToggle={(value) =>
                        toggleArrayValue("commercialFeatures", value)
                      }
                    />
                  </Panel>
                )}
              </div>
            )}

            {formTab === "legal" && (
              <Panel title="Ελληνικά νομικά / publishability" icon={FileText}>
                <div className="grid gap-4 md:grid-cols-4">
                  <Input
                    label="ΚΑΕΚ"
                    value={form.kaek}
                    onChange={(value) => updateForm("kaek", value)}
                    placeholder="012345678901/0/0"
                  />
                  <Input
                    label="Αριθμός ΠΕΑ"
                    value={form.peaCertificateNumber}
                    onChange={(value) =>
                      updateForm("peaCertificateNumber", value)
                    }
                  />
                  <Input
                    label="Κλάση ΠΕΑ"
                    value={form.peaEnergyClass}
                    onChange={(value) => updateForm("peaEnergyClass", value)}
                  />
                  <Input
                    label="Ημερομηνία ΠΕΑ"
                    type="date"
                    value={form.peaIssueDate}
                    onChange={(value) => updateForm("peaIssueDate", value)}
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-4">
                  <Select
                    label="ΗΤΚ"
                    value={form.htkStatus}
                    onChange={(value) => updateForm("htkStatus", value)}
                    options={[
                      ["missing", "Λείπει"],
                      ["pending", "Σε εκκρεμότητα"],
                      ["complete", "Ολοκληρωμένη"],
                      ["not_required", "Δεν απαιτείται"],
                    ]}
                  />
                  <Input
                    label="Αριθμός ΗΤΚ"
                    value={form.htkCertificateNumber}
                    onChange={(value) =>
                      updateForm("htkCertificateNumber", value)
                    }
                  />
                  <Select
                    label="Τακτοποίηση αυθαιρέτων"
                    value={form.arbitrarySettlementStatus}
                    onChange={(value) =>
                      updateForm("arbitrarySettlementStatus", value)
                    }
                    options={[
                      ["unknown", "Άγνωστο"],
                      ["not_needed", "Δεν απαιτείται"],
                      ["pending", "Σε εκκρεμότητα"],
                      ["completed", "Ολοκληρωμένη"],
                    ]}
                  />
                  <Input
                    label="Μηχανικός"
                    value={form.responsibleEngineerName}
                    onChange={(value) =>
                      updateForm("responsibleEngineerName", value)
                    }
                  />
                </div>

                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  <Checkbox
                    label="Τίτλοι"
                    checked={form.titleDeedAvailable}
                    onChange={(value) =>
                      updateForm("titleDeedAvailable", value)
                    }
                  />
                  <Checkbox
                    label="Οικοδομική άδεια"
                    checked={form.buildingPermitAvailable}
                    onChange={(value) =>
                      updateForm("buildingPermitAvailable", value)
                    }
                  />
                  <Checkbox
                    label="Τοπογραφικό"
                    checked={form.topographicDiagramAvailable}
                    onChange={(value) =>
                      updateForm("topographicDiagramAvailable", value)
                    }
                  />
                  <Checkbox
                    label="Κάτοψη"
                    checked={form.floorPlanAvailable}
                    onChange={(value) =>
                      updateForm("floorPlanAvailable", value)
                    }
                  />
                  <Checkbox
                    label="Πίνακας χιλιοστών"
                    checked={form.thousandthsTableAvailable}
                    onChange={(value) =>
                      updateForm("thousandthsTableAvailable", value)
                    }
                  />
                  <Checkbox
                    label="ΕΝΦΙΑ"
                    checked={form.enfiaAvailable}
                    onChange={(value) => updateForm("enfiaAvailable", value)}
                  />
                  <Checkbox
                    label="Φορολογική ενημερότητα"
                    checked={form.taxClearanceAvailable}
                    onChange={(value) =>
                      updateForm("taxClearanceAvailable", value)
                    }
                  />
                </div>

                <Textarea
                  label="Νομικές σημειώσεις"
                  value={form.legalNotes}
                  onChange={(value) => updateForm("legalNotes", value)}
                />
              </Panel>
            )}

            {formTab === "assignment" && (
              <div className="grid gap-5">
                <Panel title="Ανάθεση / κλειδιά" icon={KeyRound}>
                  <div className="grid gap-4 md:grid-cols-4">
                    <Select
                      label="Κατάσταση ανάθεσης"
                      value={form.assignmentStatus}
                      onChange={(value) =>
                        updateForm("assignmentStatus", value)
                      }
                      options={[
                        ["not_assigned", "Χωρίς ανάθεση"],
                        ["assigned", "Ανάθεση"],
                        ["exclusive", "Αποκλειστική"],
                        ["open_market", "Ελεύθερη αγορά"],
                        ["expired", "Έληξε"],
                      ]}
                    />
                    <Select
                      label="Κλειδιά"
                      value={form.keysStatus}
                      onChange={(value) => updateForm("keysStatus", value)}
                      options={[
                        ["unknown", "Άγνωστο"],
                        ["no_keys", "Δεν έχουμε"],
                        ["keys_in_office", "Στο γραφείο"],
                        ["keys_with_owner", "Στον ιδιοκτήτη"],
                        ["keys_with_agent", "Σε συνεργάτη"],
                        ["lockbox", "Lockbox"],
                      ]}
                    />
                    <Input
                      label="Τοποθεσία κλειδιών"
                      value={form.keysLocation}
                      onChange={(value) => updateForm("keysLocation", value)}
                    />
                    <Input
                      label="Λήξη ανάθεσης"
                      type="date"
                      value={form.assignmentExpiresAt}
                      onChange={(value) =>
                        updateForm("assignmentExpiresAt", value)
                      }
                    />
                  </div>

                  <div className="grid gap-4 md:grid-cols-4">
                    <Checkbox
                      label="Είναι νοικιασμένο"
                      checked={form.isCurrentlyLeased}
                      onChange={(value) =>
                        updateForm("isCurrentlyLeased", value)
                      }
                    />
                    <Input
                      label="Νοικιασμένο μέχρι"
                      type="date"
                      value={form.leasedUntil}
                      onChange={(value) => updateForm("leasedUntil", value)}
                    />
                    <Input
                      label="Τρέχον μίσθωμα"
                      type="number"
                      value={form.currentMonthlyRent}
                      onChange={(value) =>
                        updateForm("currentMonthlyRent", value)
                      }
                    />
                    <Input
                      label="Ενοικιαστής"
                      value={form.currentTenantName}
                      onChange={(value) =>
                        updateForm("currentTenantName", value)
                      }
                    />
                  </div>
                </Panel>

                <Panel title="Portals / αγγελίες" icon={LinkIcon}>
                  <div className="grid gap-4 md:grid-cols-3">
                    <Input
                      label="Spitogatos URL"
                      value={form.spitogatosUrl}
                      onChange={(value) => updateForm("spitogatosUrl", value)}
                    />
                    <Input
                      label="Χρυσή Ευκαιρία / XE URL"
                      value={form.xeUrl}
                      onChange={(value) => updateForm("xeUrl", value)}
                    />
                    <Input
                      label="Άλλο portal URL"
                      value={form.otherPortalUrl}
                      onChange={(value) => updateForm("otherPortalUrl", value)}
                    />
                  </div>

                  <Textarea
                    label="Portal notes"
                    value={form.portalNotes}
                    onChange={(value) => updateForm("portalNotes", value)}
                  />
                </Panel>

                <Panel title="Επένδυση / μίσθωση" icon={Euro}>
                  <div className="grid gap-4 md:grid-cols-4">
                    <Checkbox
                      label="Επενδυτικό"
                      checked={form.isInvestment}
                      onChange={(value) => updateForm("isInvestment", value)}
                    />
                    <Checkbox
                      label="Μισθωμένο"
                      checked={form.isLeased}
                      onChange={(value) => updateForm("isLeased", value)}
                    />
                    <Input
                      label="Μηνιαίο μίσθωμα"
                      type="number"
                      value={form.monthlyRent}
                      onChange={(value) => updateForm("monthlyRent", value)}
                    />
                    <Input
                      label="Yield %"
                      type="number"
                      value={form.yieldPercent}
                      onChange={(value) => updateForm("yieldPercent", value)}
                    />
                  </div>
                </Panel>
              </div>
            )}

            {formTab === "notes" && (
              <Panel
                title="Περιγραφή / editable εσωτερικές σημειώσεις"
                icon={NotebookPen}
              >
                <Textarea
                  label="Περιγραφή αγγελίας"
                  value={form.descriptionEl}
                  onChange={(value) => updateForm("descriptionEl", value)}
                />
                <Textarea
                  label="Εσωτερικές editable σημειώσεις"
                  value={form.privateNotes}
                  onChange={(value) => updateForm("privateNotes", value)}
                />
                <p className="text-sm text-slate-500">
                  Οι μη-editable σημειώσεις μπαίνουν από το tab “Σημειώσεις”
                  μέσα στην καρτέλα του ακινήτου.
                </p>
              </Panel>
            )}

            <div className="flex justify-end border-t border-slate-200 pt-4">
              <button
                type="submit"
                disabled={saveState.status === "loading"}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#032360] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saveState.status === "loading" ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : editingPropertyId ? (
                  <Edit3 className="h-4 w-4" />
                ) : (
                  <Plus className="h-4 w-4" />
                )}
                {editingPropertyId
                  ? "Αποθήκευση αλλαγών"
                  : "Δημιουργία ακινήτου"}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {selectedProperty && (
        <Modal onClose={() => setSelectedProperty(null)} maxWidth="max-w-6xl">
          <div className="flex items-start justify-between gap-4 border-b border-slate-200 pb-4">
            <div className="min-w-0">
              <div className="mb-3 flex flex-wrap gap-2">
                <Pill>
                  {categoryLabels[selectedProperty.category ?? "residential"]}
                </Pill>
                <Pill>
                  {getSubtypeLabel(
                    selectedProperty.category,
                    selectedProperty.subtype,
                  )}
                </Pill>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ring-1 ${getPublishability(selectedProperty, legalDetails[selectedProperty.id]).className}`}
                >
                  {
                    getPublishability(
                      selectedProperty,
                      legalDetails[selectedProperty.id],
                    ).label
                  }
                </span>
              </div>

              <h2 className="text-2xl font-semibold text-[#032360]">
                {selectedProperty.title}
              </h2>

              <p className="mt-2 text-slate-600">
                {[
                  selectedProperty.address,
                  selectedProperty.area,
                  selectedProperty.city,
                ]
                  .filter(Boolean)
                  .join(", ") || "Χωρίς διεύθυνση"}
              </p>
            </div>

            <div className="flex shrink-0 items-center gap-2">
              <button
                type="button"
                onClick={() => openEditForm(selectedProperty)}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                <Edit3 className="h-4 w-4" />
                Επεξεργασία
              </button>

              <button
                type="button"
                onClick={() => setSelectedProperty(null)}
                className="rounded-full p-2 text-slate-500 transition hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          <TabBar
            value={detailTab}
            onChange={(value) => setDetailTab(value as DetailTab)}
            tabs={[
              ["summary", "Σύνοψη"],
              ["media", "Φωτογραφίες / Video"],
              ["assignment", "Ανάθεση"],
              ["attachments", "Επισυνάψεις"],
              ["notes", "Σημειώσεις"],
              ["calendar", "Ημερολόγιο"],
              ["actions", "Ενέργειες"],
            ]}
          />

          <div className="mt-5">
            {detailTab === "summary" && (
              <div className="grid gap-5">
                <div className="grid gap-4 md:grid-cols-4">
                  <InfoCard
                    icon={Euro}
                    label="Τιμή"
                    value={formatPrice(
                      selectedProperty.price,
                      selectedProperty.currency ?? "EUR",
                    )}
                  />
                  <InfoCard
                    icon={Square}
                    label="Τ.μ."
                    value={`${selectedProperty.built_sqm || selectedProperty.plot_sqm || "—"}`}
                  />
                  <InfoCard
                    icon={User}
                    label="Ιδιοκτήτης"
                    value={selectedProperty.owner_name || "—"}
                  />
                  <InfoCard
                    icon={ClipboardCheck}
                    label="ΚΑΕΚ"
                    value={legalDetails[selectedProperty.id]?.kaek || "—"}
                  />
                </div>

                <Panel title="Legal checklist" icon={FileText}>
                  <Checklist
                    items={[
                      ["ΚΑΕΚ", legalDetails[selectedProperty.id]?.kaek],
                      [
                        "ΠΕΑ",
                        legalDetails[selectedProperty.id]?.pea_energy_class,
                      ],
                      ["ΗΤΚ", legalDetails[selectedProperty.id]?.htk_status],
                      [
                        "Τακτοποίηση",
                        legalDetails[selectedProperty.id]
                          ?.arbitrary_settlement_status,
                      ],
                      [
                        "Τίτλοι",
                        legalDetails[selectedProperty.id]?.title_deed_available
                          ? "Ναι"
                          : "",
                      ],
                      [
                        "Τοπογραφικό / κάτοψη",
                        legalDetails[selectedProperty.id]
                          ?.topographic_diagram_available ||
                        legalDetails[selectedProperty.id]?.floor_plan_available
                          ? "Ναι"
                          : "",
                      ],
                    ]}
                  />
                </Panel>

                {selectedProperty.description_el && (
                  <Panel title="Περιγραφή" icon={NotebookPen}>
                    <p className="whitespace-pre-wrap text-sm text-slate-600">
                      {selectedProperty.description_el}
                    </p>
                  </Panel>
                )}
              </div>
            )}

            {detailTab === "media" && (
              <Panel title="Φωτογραφίες / video links" icon={ImageIcon}>
                <div className="grid gap-3 md:grid-cols-3">
                  <Input
                    label="URL φωτογραφίας / video"
                    value={newMediaUrl}
                    onChange={setNewMediaUrl}
                  />
                  <Input
                    label="Caption"
                    value={newMediaCaption}
                    onChange={setNewMediaCaption}
                  />
                  <button
                    type="button"
                    onClick={handleAddMedia}
                    className="self-end rounded-xl bg-[#032360] px-4 py-3 text-sm font-semibold text-white"
                  >
                    + Προσθήκη media
                  </button>
                </div>

                <ListEmptyAware
                  items={media[selectedProperty.id] ?? []}
                  empty="Δεν έχουν προστεθεί φωτογραφίες ή video."
                  render={(item) => (
                    <TimelineItem
                      key={item.id}
                      title={item.caption || item.file_name || "Media"}
                      subtitle={item.external_url || item.storage_path || "—"}
                      date={item.created_at}
                    />
                  )}
                />
              </Panel>
            )}

            {detailTab === "assignment" && (
              <div className="grid gap-5">
                <Panel title="Ανάθεση / μίσθωση / κλειδιά" icon={KeyRound}>
                  <DataGrid
                    items={[
                      [
                        "Κατάσταση ανάθεσης",
                        selectedProperty.assignment_status || "—",
                      ],
                      ["Κλειδιά", selectedProperty.keys_status || "—"],
                      [
                        "Τοποθεσία κλειδιών",
                        selectedProperty.keys_location || "—",
                      ],
                      [
                        "Λήξη ανάθεσης",
                        formatDate(selectedProperty.assignment_expires_at),
                      ],
                      [
                        "Νοικιασμένο",
                        selectedProperty.is_currently_leased ? "Ναι" : "Όχι",
                      ],
                      ["Μέχρι", formatDate(selectedProperty.leased_until)],
                      [
                        "Μίσθωμα",
                        selectedProperty.current_monthly_rent
                          ? `${selectedProperty.current_monthly_rent} €`
                          : "—",
                      ],
                      [
                        "Ενοικιαστής",
                        selectedProperty.current_tenant_name || "—",
                      ],
                    ]}
                  />
                </Panel>

                <Panel title="Portals" icon={LinkIcon}>
                  <DataGrid
                    items={[
                      ["Spitogatos", selectedProperty.spitogatos_url || "—"],
                      ["Χρυσή Ευκαιρία / XE", selectedProperty.xe_url || "—"],
                      ["Άλλο portal", selectedProperty.other_portal_url || "—"],
                      ["Portal notes", selectedProperty.portal_notes || "—"],
                    ]}
                  />
                </Panel>
              </div>
            )}

            {detailTab === "attachments" && (
              <Panel title="Επισυνάψεις / PDF / Κατόψεις" icon={Paperclip}>
                <div className="grid gap-3 md:grid-cols-3">
                  <Input
                    label="Όνομα αρχείου"
                    value={newDocumentName}
                    onChange={setNewDocumentName}
                  />
                  <Input
                    label="URL / Storage path"
                    value={newDocumentUrl}
                    onChange={setNewDocumentUrl}
                  />
                  <button
                    type="button"
                    onClick={handleAddDocument}
                    className="self-end rounded-xl bg-[#032360] px-4 py-3 text-sm font-semibold text-white"
                  >
                    + Προσθήκη επισύναψης
                  </button>
                </div>

                <ListEmptyAware
                  items={documents[selectedProperty.id] ?? []}
                  empty="Δεν υπάρχουν επισυνάψεις."
                  render={(item) => (
                    <TimelineItem
                      key={item.id}
                      title={item.file_name || "Επισύναψη"}
                      subtitle={item.storage_path || item.notes || "—"}
                      date={item.created_at}
                    />
                  )}
                />
              </Panel>
            )}

            {detailTab === "notes" && (
              <Panel
                title="Σημειώσεις — δεν αλλάζουν μετά την καταχώρηση"
                icon={NotebookPen}
              >
                <div className="grid gap-3">
                  <Textarea
                    label="+ Νέα Σημείωση"
                    value={newNote}
                    onChange={setNewNote}
                  />
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={handleAddNote}
                      className="rounded-xl bg-[#032360] px-4 py-3 text-sm font-semibold text-white"
                    >
                      + Νέα Σημείωση
                    </button>
                  </div>
                </div>

                <ListEmptyAware
                  items={notes[selectedProperty.id] ?? []}
                  empty="Δεν υπάρχουν σημειώσεις."
                  render={(item) => (
                    <TimelineItem
                      key={item.id}
                      title={item.note}
                      date={item.created_at}
                    />
                  )}
                />
              </Panel>
            )}

            {detailTab === "calendar" && (
              <Panel title="Ημερολόγιο / viewings" icon={CalendarDays}>
                <p className="text-sm text-slate-500">
                  Εδώ θα συνδεθεί το ακίνητο με το CRM + Google Calendar. Για
                  τώρα δείχνει τα viewings που έχουν ήδη συνδεθεί στη βάση.
                </p>

                <ListEmptyAware
                  items={viewings[selectedProperty.id] ?? []}
                  empty="Δεν υπάρχουν ακόμα viewings."
                  render={(item) => (
                    <TimelineItem
                      key={item.id}
                      title={item.buyer_name || "Viewing"}
                      subtitle={[
                        item.demand_reference,
                        item.interest_level,
                        item.buyer_feedback,
                      ]
                        .filter(Boolean)
                        .join(" · ")}
                      date={item.viewing_at || item.created_at}
                    />
                  )}
                />
              </Panel>
            )}

            {detailTab === "actions" && (
              <Panel title="Ενέργειες / ζήτηση / activity log" icon={Activity}>
                <div className="grid gap-3 md:grid-cols-[1fr_220px_auto]">
                  <Input
                    label="Ενέργεια"
                    value={newActionMessage}
                    onChange={setNewActionMessage}
                    placeholder="Π.χ. Δείξαμε το ακίνητο σε πελάτη..."
                  />
                  <Input
                    label="Αριθμός ζήτησης"
                    value={newDemandReference}
                    onChange={setNewDemandReference}
                  />
                  <button
                    type="button"
                    onClick={handleAddAction}
                    className="self-end rounded-xl bg-[#032360] px-4 py-3 text-sm font-semibold text-white"
                  >
                    + Νέα Ενέργεια
                  </button>
                </div>

                <ListEmptyAware
                  items={activity[selectedProperty.id] ?? []}
                  empty="Δεν υπάρχουν ακόμα ενέργειες."
                  render={(item) => (
                    <TimelineItem
                      key={item.id}
                      title={item.message || item.action}
                      subtitle={
                        item.metadata?.demand_reference
                          ? `Ζήτηση: ${String(item.metadata.demand_reference)}`
                          : item.action
                      }
                      date={item.created_at}
                    />
                  )}
                />
              </Panel>
            )}
          </div>
        </Modal>
      )}
    </main>
  );
};

function Alert({
  tone,
  title,
  text,
}: {
  tone: "success" | "error";
  title: string;
  text?: string;
}) {
  const isSuccess = tone === "success";

  return (
    <div
      className={`flex items-start gap-3 rounded-2xl border p-4 text-sm ${
        isSuccess
          ? "border-emerald-200 bg-emerald-50 text-emerald-900"
          : "border-red-200 bg-red-50 text-red-900"
      }`}
    >
      {isSuccess ? (
        <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />
      ) : (
        <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
      )}
      <div>
        <p className="font-semibold">{title}</p>
        {text && <p className="mt-1">{text}</p>}
      </div>
    </div>
  );
}

function Modal({
  children,
  onClose,
  maxWidth,
}: {
  children: ReactNode;
  onClose: () => void;
  maxWidth: string;
}) {
  return (
    <div className="fixed inset-0 z-[9999] flex items-start justify-center overflow-y-auto bg-slate-950/50 p-4 sm:items-center">
      <button
        aria-label="Κλείσιμο"
        className="fixed inset-0 cursor-default"
        onClick={onClose}
        type="button"
      />
      <div
        className={`relative z-10 max-h-[92vh] w-full overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl ${maxWidth}`}
      >
        {children}
      </div>
    </div>
  );
}

function TabBar({
  value,
  onChange,
  tabs,
}: {
  value: string;
  onChange: (value: string) => void;
  tabs: string[][];
}) {
  return (
    <div className="mt-5 flex gap-2 overflow-x-auto border-b border-slate-200 pb-2">
      {tabs.map(([tabValue, label]) => (
        <button
          key={tabValue}
          type="button"
          onClick={() => onChange(tabValue)}
          className={`shrink-0 rounded-xl px-4 py-2 text-sm font-semibold transition ${
            value === tabValue
              ? "bg-[#032360] text-white"
              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

function StatCard({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: number;
  icon: LucideIcon;
}) {
  return (
    <div className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
      <Icon className="h-5 w-5 text-[#032360]" />
      <p className="mt-3 text-sm text-slate-500">{label}</p>
      <p className="mt-2 text-3xl font-semibold text-[#032360]">{value}</p>
    </div>
  );
}

function InfoCard({
  icon: Icon,
  label,
  value,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl bg-slate-50 p-4">
      <Icon className="h-5 w-5 text-[#032360]" />
      <p className="mt-2 text-sm text-slate-500">{label}</p>
      <p className="break-words font-semibold text-slate-950">{value}</p>
    </div>
  );
}

function Panel({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: LucideIcon;
  children: ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-slate-200 p-4">
      <h3 className="mb-4 flex items-center gap-2 font-semibold text-[#032360]">
        <Icon className="h-4 w-4" />
        {title}
      </h3>
      <div className="grid gap-4">{children}</div>
    </section>
  );
}

function Pill({ children }: { children: ReactNode }) {
  return (
    <span className="rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-[#032360]">
      {children}
    </span>
  );
}

function Input({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  className = "",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  placeholder?: string;
  className?: string;
}) {
  return (
    <label
      className={`grid min-w-0 gap-2 text-sm font-medium text-slate-700 ${className}`}
    >
      {label}
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className="min-w-0 rounded-xl border border-slate-300 bg-white px-4 py-3 text-base text-slate-950 outline-none transition focus:border-[#032360] focus:ring-2 focus:ring-[#032360]/10"
      />
    </label>
  );
}

function Textarea({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <label className="grid min-w-0 gap-2 text-sm font-medium text-slate-700">
      {label}
      <textarea
        rows={4}
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className="min-w-0 resize-none rounded-xl border border-slate-300 bg-white px-4 py-3 text-base text-slate-950 outline-none transition focus:border-[#032360] focus:ring-2 focus:ring-[#032360]/10"
      />
    </label>
  );
}

function Select({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: string[][];
}) {
  return (
    <label className="grid min-w-0 gap-2 text-sm font-medium text-slate-700">
      {label}
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="min-w-0 rounded-xl border border-slate-300 bg-white px-4 py-3 text-base text-slate-950 outline-none transition focus:border-[#032360] focus:ring-2 focus:ring-[#032360]/10"
      >
        {options.map(([optionValue, label]) => (
          <option key={optionValue} value={optionValue}>
            {label}
          </option>
        ))}
      </select>
    </label>
  );
}

function Checkbox({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="flex min-w-0 items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm font-medium text-slate-700">
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
      />
      <span className="min-w-0 truncate">{label}</span>
    </label>
  );
}

function FeatureGrid({
  options,
  selected,
  onToggle,
}: {
  options: string[][];
  selected: string[];
  onToggle: (value: string) => void;
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {options.map(([value, label]) => (
        <label
          key={value}
          className="flex min-w-0 items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-700"
        >
          <input
            type="checkbox"
            checked={selected.includes(value)}
            onChange={() => onToggle(value)}
          />
          <span className="min-w-0 truncate">{label}</span>
        </label>
      ))}
    </div>
  );
}

function Checklist({ items }: { items: Array<[string, unknown]> }) {
  return (
    <div className="grid gap-3 md:grid-cols-2">
      {items.map(([label, value]) => (
        <div
          key={label}
          className="flex items-start gap-3 rounded-xl bg-slate-50 p-3 text-sm"
        >
          {value ? (
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
          ) : (
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
          )}
          <div>
            <p className="font-semibold text-slate-800">{label}</p>
            <p className="mt-1 text-xs text-slate-500">
              {String(value || "Λείπει")}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

function DataGrid({ items }: { items: Array<[string, ReactNode]> }) {
  return (
    <div className="grid gap-3 md:grid-cols-2">
      {items.map(([label, value]) => (
        <div key={label} className="rounded-xl bg-slate-50 p-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            {label}
          </p>
          <p className="mt-1 break-words text-sm font-medium text-slate-800">
            {value || "—"}
          </p>
        </div>
      ))}
    </div>
  );
}

function TimelineItem({
  title,
  subtitle,
  date,
}: {
  title: string;
  subtitle?: string;
  date?: string | null;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3 text-sm">
      <p className="font-semibold text-slate-900">{title}</p>
      {subtitle && (
        <p className="mt-1 break-words text-slate-500">{subtitle}</p>
      )}
      {date && (
        <p className="mt-2 text-xs text-slate-400">{formatDate(date)}</p>
      )}
    </div>
  );
}

function ListEmptyAware<T>({
  items,
  empty,
  render,
}: {
  items: T[];
  empty: string;
  render: (item: T) => ReactNode;
}) {
  if (items.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 p-6 text-center text-sm text-slate-500">
        {empty}
      </div>
    );
  }

  return <div className="grid gap-3">{items.map(render)}</div>;
}
