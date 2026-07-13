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
  Building2,
  CheckCircle2,
  ClipboardCheck,
  Euro,
  Factory,
  FileCheck2,
  Home,
  Landmark,
  Loader2,
  MapPin,
  Plus,
  Search,
  Square,
  User,
  X,
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

  commercialSubtype: string;
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
  city: string | null;
  municipality: string | null;
  area: string | null;
  neighborhood: string | null;
  address: string | null;
  owner_name: string | null;
  owner_phone: string | null;
  owner_email: string | null;
  description_el: string | null;
  private_notes: string | null;
  created_at: string;
};

type ResidentialDetail = {
  property_id: string;
  bedrooms: number | null;
  bathrooms: number | string | null;
  floor: string | null;
  energy_class: string | null;
  heating_type: string | null;
  heating_medium: string | null;
  parking_spaces: number | null;
  parking_type: string | null;
  residential_features: string[] | null;
};

type LandDetail = {
  property_id: string;
  land_sqm: number | string | null;
  building_factor: number | string | null;
  coverage_percent: number | string | null;
  allowed_build_sqm: number | string | null;
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
  wc: number | null;
  height_meters: number | string | null;
  suitable_for: string[] | null;
};

type LegalDetail = {
  property_id: string;
  kaek: string | null;
  pea_required: boolean;
  pea_energy_class: string | null;
  pea_issue_date: string | null;
  htk_status: string | null;
  arbitrary_settlement_status: string | null;
  title_deed_available: boolean;
  topographic_diagram_available: boolean;
  floor_plan_available: boolean;
  enfia_available: boolean;
};

type SaveState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; message: string }
  | { status: "error"; message: string };

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

const listingTypeLabels: Record<ListingType, string> = {
  sale: "Πώληση",
  rent: "Μίσθωση",
};

const residentialSubtypes = [
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

const landSubtypes = [
  ["plot", "Οικόπεδο"],
  ["land_parcel", "Αγροτεμάχιο"],
  ["farm", "Αγροκτήμα / Κτήμα"],
  ["seaside_plot", "Παραθαλάσσιο οικόπεδο"],
  ["island", "Νησί"],
  ["forest_area", "Δασική έκταση"],
  ["other", "Άλλο"],
];

const commercialSubtypes = [
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

const residentialFeatureOptions = [
  ["security_door", "Πόρτα ασφαλείας"],
  ["alarm", "Συναγερμός"],
  ["bright", "Φωτεινό"],
  ["airy", "Διαμπερές"],
  ["corner", "Γωνιακό"],
  ["furnished", "Επιπλωμένο"],
  ["internal_staircase", "Εσωτερική σκάλα"],
  ["attic", "Σοφίτα"],
  ["playroom", "Playroom"],
  ["jacuzzi", "Τζακούζι"],
  ["pool", "Πισίνα"],
  ["garden", "Κήπος"],
  ["bbq", "BBQ"],
  ["wardrobes", "Εντοιχισμένες ντουλάπες"],
  ["satellite", "Δορυφορική"],
  ["internet", "Internet"],
  ["smart_home", "Smart home"],
  ["awnings", "Τέντες"],
];

const landFeatureOptions = [
  ["seaside", "Παραθαλάσσιο"],
  ["panoramic_view", "Πανοραμική θέα"],
  ["suitable_for_tourism", "Κατάλληλο για τουριστική χρήση"],
  ["suitable_for_residential", "Κατάλληλο για κατοικία"],
  ["suitable_for_commercial", "Κατάλληλο για επαγγελματική χρήση"],
  ["suitable_for_agriculture", "Κατάλληλο για αγροτική χρήση"],
  ["can_be_divided", "Δυνατότητα κατάτμησης"],
];

const commercialFeatureOptions = [
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

const initialForm: FormState = {
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

  commercialSubtype: "",
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

function getSubtypeLabel(
  category: PropertyCategory | null,
  subtype: string | null,
) {
  const options =
    category === "land"
      ? landSubtypes
      : category === "commercial"
        ? commercialSubtypes
        : residentialSubtypes;

  return options.find(([value]) => value === subtype)?.[1] ?? subtype ?? "—";
}

function getPublishability(property: PropertyRecord, legal?: LegalDetail) {
  const missing: string[] = [];

  if (!property.price) missing.push("τιμή");
  if (!property.area && !property.city) missing.push("περιοχή");
  if (!property.built_sqm && !property.plot_sqm) missing.push("τ.μ.");
  if (!legal?.kaek) missing.push("ΚΑΕΚ");

  if (legal?.pea_required !== false && !legal?.pea_energy_class) {
    missing.push("ΠΕΑ");
  }

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
      missing,
    };
  }

  return {
    label: `Λείπει: ${missing.slice(0, 3).join(", ")}${missing.length > 3 ? "…" : ""}`,
    className: "bg-amber-50 text-amber-700 ring-amber-200",
    missing,
  };
}

export const PropertiesPage = () => {
  const [properties, setProperties] = useState<PropertyRecord[]>([]);
  const [residentialDetails, setResidentialDetails] = useState<
    Record<string, ResidentialDetail>
  >({});
  const [_landDetails, setLandDetails] = useState<Record<string, LandDetail>>(
    {},
  );
  const [_commercialDetails, setCommercialDetails] = useState<
    Record<string, CommercialDetail>
  >({});
  const [legalDetails, setLegalDetails] = useState<Record<string, LegalDetail>>(
    {},
  );
  const [selectedProperty, setSelectedProperty] =
    useState<PropertyRecord | null>(null);
  const [form, setForm] = useState<FormState>(initialForm);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [saveState, setSaveState] = useState<SaveState>({ status: "idle" });
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<
    PropertyCategory | "all"
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

      const rows = (data ?? []) as PropertyRecord[];
      setProperties(rows);

      const ids = rows.map((property) => property.id);

      if (ids.length === 0) {
        setResidentialDetails({});
        setLandDetails({});
        setCommercialDetails({});
        setLegalDetails({});
        return;
      }

      const [residential, land, commercial, legal] = await Promise.all([
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
      ]);

      if (residential.error) throw residential.error;
      if (land.error) throw land.error;
      if (commercial.error) throw commercial.error;
      if (legal.error) throw legal.error;

      setResidentialDetails(
        Object.fromEntries(
          ((residential.data ?? []) as ResidentialDetail[]).map((detail) => [
            detail.property_id,
            detail,
          ]),
        ),
      );

      setLandDetails(
        Object.fromEntries(
          ((land.data ?? []) as LandDetail[]).map((detail) => [
            detail.property_id,
            detail,
          ]),
        ),
      );

      setCommercialDetails(
        Object.fromEntries(
          ((commercial.data ?? []) as CommercialDetail[]).map((detail) => [
            detail.property_id,
            detail,
          ]),
        ),
      );

      setLegalDetails(
        Object.fromEntries(
          ((legal.data ?? []) as LegalDetail[]).map((detail) => [
            detail.property_id,
            detail,
          ]),
        ),
      );
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
      const category = property.category ?? "residential";

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
          legalDetails[property.id]?.kaek,
        ]
          .filter(Boolean)
          .some((value) => String(value).toLowerCase().includes(query));

      return matchesCategory && matchesSearch;
    });
  }, [properties, search, categoryFilter, legalDetails]);

  const stats = useMemo(() => {
    return {
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
    };
  }, [properties]);

  const updateForm = <K extends keyof FormState>(
    field: K,
    value: FormState[K],
  ) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
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
      const nextValues = currentValues.includes(value)
        ? currentValues.filter((item) => item !== value)
        : [...currentValues, value];

      return {
        ...current,
        [field]: nextValues,
      };
    });
  };

  const handleCategoryChange = (category: PropertyCategory) => {
    const defaultSubtype =
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
      subtype: defaultSubtype,
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

      const { data: property, error: propertyError } = await supabaseClient
        .from("properties")
        .insert({
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
        })
        .select("*")
        .single();

      if (propertyError) throw propertyError;

      if (form.category === "residential") {
        const { error } = await supabaseClient
          .from("property_residential_details")
          .insert({
            property_id: property.id,
            floor: textOrNull(form.floor),
            total_floors: integerOrNull(form.totalFloors),
            level_count: integerOrNull(form.levelCount),
            is_floor_maisonette: form.subtype === "floor_maisonette",
            has_independent_entrance: form.residentialFeatures.includes(
              "independent_entrance",
            ),
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
          });

        if (error) throw error;
      }

      if (form.category === "land") {
        const { error } = await supabaseClient
          .from("property_land_details")
          .insert({
            property_id: property.id,
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
            road_access: form.landFeatures.includes("road_access"),
            electricity_available: form.landFeatures.includes("electricity"),
            water_available: form.landFeatures.includes("water"),
            drilling_available: form.landFeatures.includes("drilling"),
            fenced: form.landFeatures.includes("fenced"),
            land_features: form.landFeatures,
          });

        if (error) throw error;
      }

      if (form.category === "commercial") {
        const { error } = await supabaseClient
          .from("property_commercial_details")
          .insert({
            property_id: property.id,
            commercial_subtype: textOrNull(
              form.commercialSubtype || form.subtype,
            ),
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
            loading_ramp: form.commercialFeatures.includes("loading_ramp"),
            crane_bridge: form.commercialFeatures.includes("crane_bridge"),
            three_phase_power:
              form.commercialFeatures.includes("three_phase_power"),
            industrial_floor:
              form.commercialFeatures.includes("industrial_floor"),
            fire_detection: form.commercialFeatures.includes("fire_detection"),
            fire_suppression:
              form.commercialFeatures.includes("fire_suppression"),
            cameras: form.commercialFeatures.includes("cameras"),
            corner: form.commercialFeatures.includes("corner"),
            front_facing: form.commercialFeatures.includes("front_facing"),
          });

        if (error) throw error;
      }

      const { error: legalError } = await supabaseClient
        .from("property_legal_details")
        .insert({
          property_id: property.id,
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
        });

      if (legalError) throw legalError;

      if (
        form.isInvestment ||
        form.isLeased ||
        form.monthlyRent ||
        form.yieldPercent
      ) {
        const { error } = await supabaseClient
          .from("property_investment_details")
          .insert({
            property_id: property.id,
            is_investment: form.isInvestment,
            is_leased: form.isLeased,
            monthly_rent: numberOrNull(form.monthlyRent),
            lease_expires_at: dateOrNull(form.leaseExpiresAt),
            yield_percent: numberOrNull(form.yieldPercent),
            short_term_rental_license: form.shortTermRentalLicense,
            ama_number: textOrNull(form.amaNumber),
            eot_license_number: textOrNull(form.eotLicenseNumber),
            tenant_name: textOrNull(form.tenantName),
          });

        if (error) throw error;
      }

      if (property.price) {
        await supabaseClient.from("property_price_history").insert({
          property_id: property.id,
          old_price: null,
          new_price: property.price,
          reason: "Initial asking price",
        });
      }

      await supabaseClient.from("property_activity").insert({
        property_id: property.id,
        action: "created",
        message: "Το ακίνητο δημιουργήθηκε στο Home Direct CRM.",
      });

      setSaveState({ status: "success", message: "Το ακίνητο δημιουργήθηκε." });
      resetForm();
      setIsFormOpen(false);
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

  const subtypeOptions =
    form.category === "land"
      ? landSubtypes
      : form.category === "commercial"
        ? commercialSubtypes
        : residentialSubtypes;

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

            <p className="mt-3 max-w-3xl text-slate-600">
              Πλήρες property module με κατηγορίες, υποκατηγορίες, ελληνικά
              νομικά πεδία, publishability checklist και foundation για
              matching, viewings, offers και vendor reports.
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

        {isFormOpen && (
          <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold text-slate-950">
                  Νέο ακίνητο
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Τα πεδία αλλάζουν ανάλογα με την κατηγορία: κατοικία, γη ή
                  επαγγελματικό.
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
              <FormSection title="Βασικά στοιχεία" icon={Building2}>
                <div className="grid gap-4 lg:grid-cols-3">
                  <Input
                    label="Τίτλος"
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
              </FormSection>

              <FormSection title="Τοποθεσία" icon={MapPin}>
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
                    label="Γειτονιά"
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
              </FormSection>

              {form.category === "residential" && (
                <FormSection title="Χαρακτηριστικά κατοικίας" icon={Home}>
                  <div className="grid gap-4 md:grid-cols-6">
                    <Input
                      label="Όροφος"
                      value={form.floor}
                      onChange={(value) => updateForm("floor", value)}
                    />
                    <Input
                      label="Όροφοι κτιρίου"
                      type="number"
                      value={form.totalFloors}
                      onChange={(value) => updateForm("totalFloors", value)}
                    />
                    <Input
                      label="Επίπεδα"
                      type="number"
                      value={form.levelCount}
                      onChange={(value) => updateForm("levelCount", value)}
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
                      onChange={(value) => updateForm("masterBedrooms", value)}
                    />
                    <Input
                      label="Μπάνια"
                      type="number"
                      value={form.bathrooms}
                      onChange={(value) => updateForm("bathrooms", value)}
                    />
                  </div>

                  <div className="grid gap-4 md:grid-cols-5">
                    <Input
                      label="WC"
                      type="number"
                      value={form.wc}
                      onChange={(value) => updateForm("wc", value)}
                    />
                    <Input
                      label="Κουζίνες"
                      type="number"
                      value={form.kitchens}
                      onChange={(value) => updateForm("kitchens", value)}
                    />
                    <Select
                      label="Κουζίνα"
                      value={form.kitchenType}
                      onChange={(value) => updateForm("kitchenType", value)}
                      options={[
                        ["", "—"],
                        ["separate", "Ανεξάρτητη"],
                        ["open_plan", "Open-plan"],
                        ["other", "Άλλη"],
                      ]}
                    />
                    <Input
                      label="Σαλόνια"
                      type="number"
                      value={form.livingRooms}
                      onChange={(value) => updateForm("livingRooms", value)}
                    />
                    <Input
                      label="Έτος κατασκευής"
                      type="number"
                      value={form.constructionYear}
                      onChange={(value) =>
                        updateForm("constructionYear", value)
                      }
                    />
                  </div>

                  <div className="grid gap-4 md:grid-cols-4">
                    <Input
                      label="Έτος ανακαίνισης"
                      type="number"
                      value={form.renovationYear}
                      onChange={(value) => updateForm("renovationYear", value)}
                    />
                    <Select
                      label="Κατάσταση"
                      value={form.condition}
                      onChange={(value) => updateForm("condition", value)}
                      options={[
                        ["", "—"],
                        ["new_build", "Νεόδμητο"],
                        ["renovated", "Ανακαινισμένο"],
                        ["excellent", "Άριστη"],
                        ["good", "Καλή"],
                        ["needs_renovation", "Χρήζει ανακαίνισης"],
                        ["under_construction", "Υπό κατασκευή"],
                        ["under_renovation", "Υπό ανακαίνιση"],
                      ]}
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

                  <div className="grid gap-4 md:grid-cols-5">
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
                      label="Μέσο θέρμανσης"
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
                    <Select
                      label="Parking τύπος"
                      value={form.parkingType}
                      onChange={(value) => updateForm("parkingType", value)}
                      options={[
                        ["", "—"],
                        ["none", "Καμία"],
                        ["open", "Ανοιχτό"],
                        ["closed", "Κλειστό"],
                        ["pilotis", "Πυλωτή"],
                        ["garage", "Γκαράζ"],
                        ["underground", "Υπόγειο"],
                      ]}
                    />
                    <Input
                      label="Αποθήκη τ.μ."
                      type="number"
                      value={form.storageSqm}
                      onChange={(value) => updateForm("storageSqm", value)}
                    />
                  </div>

                  <FeatureGrid
                    options={residentialFeatureOptions}
                    selected={form.residentialFeatures}
                    onToggle={(value) =>
                      toggleArrayValue("residentialFeatures", value)
                    }
                  />
                </FormSection>
              )}

              {form.category === "land" && (
                <FormSection title="Χαρακτηριστικά γης" icon={Landmark}>
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
                      onChange={(value) => updateForm("buildingFactor", value)}
                    />
                    <Input
                      label="Κάλυψη %"
                      type="number"
                      value={form.coveragePercent}
                      onChange={(value) => updateForm("coveragePercent", value)}
                    />
                    <Input
                      label="Επιτρεπόμενη δόμηση"
                      type="number"
                      value={form.allowedBuildSqm}
                      onChange={(value) => updateForm("allowedBuildSqm", value)}
                    />
                  </div>

                  <div className="grid gap-4 md:grid-cols-4">
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
                      onChange={(value) => updateForm("frontageMeters", value)}
                    />
                    <Select
                      label="Κλίση"
                      value={form.slopeType}
                      onChange={(value) => updateForm("slopeType", value)}
                      options={[
                        ["", "—"],
                        ["flat", "Επίπεδο"],
                        ["sloping", "Επικλινές"],
                        ["amphitheatrical", "Αμφιθεατρικό"],
                        ["other", "Άλλο"],
                      ]}
                    />
                    <Input
                      label="Χρήση γης"
                      value={form.landUse}
                      onChange={(value) => updateForm("landUse", value)}
                    />
                  </div>

                  <FeatureGrid
                    options={[
                      ["buildable", "Οικοδομήσιμο"],
                      ["complete_and_buildable", "Άρτιο & οικοδομήσιμο"],
                      ["road_access", "Πρόσβαση σε δρόμο"],
                      ["electricity", "Ρεύμα"],
                      ["water", "Νερό"],
                      ["drilling", "Γεώτρηση"],
                      ["fenced", "Περίφραξη"],
                      ...landFeatureOptions,
                    ]}
                    selected={form.landFeatures}
                    onToggle={(value) =>
                      toggleArrayValue("landFeatures", value)
                    }
                  />
                </FormSection>
              )}

              {form.category === "commercial" && (
                <FormSection
                  title="Επαγγελματικά χαρακτηριστικά"
                  icon={Factory}
                >
                  <div className="grid gap-4 md:grid-cols-5">
                    <Input
                      label="Όροφος"
                      value={form.commercialFloor}
                      onChange={(value) => updateForm("commercialFloor", value)}
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
                      onChange={(value) => updateForm("commercialRooms", value)}
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
                </FormSection>
              )}

              <FormSection
                title="Ελληνικά νομικά / publishability"
                icon={FileCheck2}
              >
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

                <FeatureGrid
                  options={[
                    ["titleDeedAvailable", "Τίτλοι"],
                    ["buildingPermitAvailable", "Οικοδομική άδεια"],
                    ["topographicDiagramAvailable", "Τοπογραφικό"],
                    ["floorPlanAvailable", "Κάτοψη"],
                    ["thousandthsTableAvailable", "Πίνακας χιλιοστών"],
                    ["enfiaAvailable", "ΕΝΦΙΑ"],
                    ["taxClearanceAvailable", "Φορολογική ενημερότητα"],
                  ]}
                  selected={[
                    form.titleDeedAvailable ? "titleDeedAvailable" : "",
                    form.buildingPermitAvailable
                      ? "buildingPermitAvailable"
                      : "",
                    form.topographicDiagramAvailable
                      ? "topographicDiagramAvailable"
                      : "",
                    form.floorPlanAvailable ? "floorPlanAvailable" : "",
                    form.thousandthsTableAvailable
                      ? "thousandthsTableAvailable"
                      : "",
                    form.enfiaAvailable ? "enfiaAvailable" : "",
                    form.taxClearanceAvailable ? "taxClearanceAvailable" : "",
                  ].filter(Boolean)}
                  onToggle={(value) =>
                    updateForm(
                      value as keyof FormState,
                      !form[value as keyof FormState] as never,
                    )
                  }
                />
              </FormSection>

              <FormSection
                title="Ιδιοκτήτης / επένδυση / περιγραφή"
                icon={User}
              >
                <div className="grid gap-4 md:grid-cols-3">
                  <Input
                    label="Ιδιοκτήτης"
                    value={form.ownerName}
                    onChange={(value) => updateForm("ownerName", value)}
                  />
                  <Input
                    label="Τηλέφωνο"
                    value={form.ownerPhone}
                    onChange={(value) => updateForm("ownerPhone", value)}
                  />
                  <Input
                    label="Email"
                    type="email"
                    value={form.ownerEmail}
                    onChange={(value) => updateForm("ownerEmail", value)}
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-4">
                  <Checkbox
                    label="Επενδυτικό"
                    checked={form.isInvestment}
                    onChange={(checked) => updateForm("isInvestment", checked)}
                  />
                  <Checkbox
                    label="Μισθωμένο"
                    checked={form.isLeased}
                    onChange={(checked) => updateForm("isLeased", checked)}
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

                <div className="grid gap-4 lg:grid-cols-2">
                  <Textarea
                    label="Περιγραφή"
                    value={form.descriptionEl}
                    onChange={(value) => updateForm("descriptionEl", value)}
                  />
                  <Textarea
                    label="Εσωτερικές σημειώσεις"
                    value={form.privateNotes}
                    onChange={(value) => updateForm("privateNotes", value)}
                  />
                </div>
              </FormSection>

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
              const category = property.category ?? "residential";
              const legal = legalDetails[property.id];
              const publishability = getPublishability(property, legal);

              return (
                <button
                  key={property.id}
                  type="button"
                  onClick={() => setSelectedProperty(property)}
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
                      <span className="rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-[#032360]">
                        {categoryLabels[category]}
                      </span>
                      <span className="rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-[#032360]">
                        {listingTypeLabels[property.listing_type ?? "sale"]}
                      </span>
                    </div>
                  </div>

                  <div className="p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div>
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
              Δημιούργησε το πρώτο ακίνητο με πλήρη κατηγοριοποίηση και ελληνικό
              legal checklist.
            </p>
          </section>
        )}
      </div>

      {selectedProperty && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/40 p-4">
          <div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="mb-3 flex flex-wrap gap-2">
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                    {categoryLabels[selectedProperty.category ?? "residential"]}
                  </span>
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                    {getSubtypeLabel(
                      selectedProperty.category,
                      selectedProperty.subtype,
                    )}
                  </span>
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

              <button
                type="button"
                onClick={() => setSelectedProperty(null)}
                className="rounded-full p-2 text-slate-500 transition hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-4">
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

            <div className="mt-6 rounded-2xl border border-slate-200 p-4">
              <h3 className="font-semibold text-[#032360]">Legal checklist</h3>
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                {[
                  ["ΚΑΕΚ", legalDetails[selectedProperty.id]?.kaek],
                  ["ΠΕΑ", legalDetails[selectedProperty.id]?.pea_energy_class],
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
                ].map(([label, value]) => (
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
                        {value || "Λείπει"}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {selectedProperty.description_el && (
              <div className="mt-6 rounded-2xl border border-slate-200 p-4">
                <h3 className="font-semibold text-[#032360]">Περιγραφή</h3>
                <p className="mt-3 whitespace-pre-wrap text-sm text-slate-600">
                  {selectedProperty.description_el}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </main>
  );
};

function StatCard({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: number;
  icon: typeof Building2;
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
  icon: typeof Building2;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl bg-slate-50 p-4">
      <Icon className="h-5 w-5 text-[#032360]" />
      <p className="mt-2 text-sm text-slate-500">{label}</p>
      <p className="font-semibold text-slate-950">{value}</p>
    </div>
  );
}

function FormSection({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: typeof Building2;
  children: React.ReactNode;
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
      className={`grid gap-2 text-sm font-medium text-slate-700 ${className}`}
    >
      {label}
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-base text-slate-950 outline-none transition focus:border-[#032360] focus:ring-2 focus:ring-[#032360]/10"
      />
    </label>
  );
}

function Textarea({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="grid gap-2 text-sm font-medium text-slate-700">
      {label}
      <textarea
        rows={4}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="resize-none rounded-xl border border-slate-300 bg-white px-4 py-3 text-base text-slate-950 outline-none transition focus:border-[#032360] focus:ring-2 focus:ring-[#032360]/10"
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
    <label className="grid gap-2 text-sm font-medium text-slate-700">
      {label}
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-base text-slate-950 outline-none transition focus:border-[#032360] focus:ring-2 focus:ring-[#032360]/10"
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
    <label className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm font-medium text-slate-700">
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
      />
      {label}
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
    <div className="grid gap-3 md:grid-cols-3">
      {options.map(([value, label]) => (
        <label
          key={value}
          className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-700"
        >
          <input
            type="checkbox"
            checked={selected.includes(value)}
            onChange={() => onToggle(value)}
          />
          {label}
        </label>
      ))}
    </div>
  );
}
