import { Building2, Home, MapPin, Plus, Ruler, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const demoProperties = [
  {
    title: "Διαμέρισμα στο Κολωνάκι",
    location: "Κολωνάκι, Αθήνα",
    type: "Διαμέρισμα",
    size: "92 τ.μ.",
    price: "€420.000",
    status: "Ενεργό",
  },
  {
    title: "Μεζονέτα στη Γλυφάδα",
    location: "Γλυφάδα, Νότια Προάστια",
    type: "Μεζονέτα",
    size: "145 τ.μ.",
    price: "€780.000",
    status: "Προς εκτίμηση",
  },
  {
    title: "Οικόπεδο στην Πάρο",
    location: "Νάουσα, Πάρος",
    type: "Οικόπεδο",
    size: "1.250 τ.μ.",
    price: "€310.000",
    status: "Νέα εισαγωγή",
  },
];

const stats = [
  { label: "Σύνολο ακινήτων", value: "3" },
  { label: "Ενεργές αγγελίες", value: "1" },
  { label: "Προς εκτίμηση", value: "1" },
  { label: "Νέες εισαγωγές", value: "1" },
];

export const PropertiesPage = () => {
  return (
    <div className="mx-auto max-w-6xl space-y-6 p-4 md:p-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Home className="size-4" />
            Real Estate CRM
          </div>
          <h1 className="mt-1 text-3xl font-semibold">Ακίνητα</h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            Κεντρική εικόνα των ακινήτων, εκτιμήσεων, ενεργών αγγελιών και νέων
            εισαγωγών.
          </p>
        </div>

        <Button type="button" disabled>
          <Plus className="size-4" />
          Νέο ακίνητο
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        {stats.map((item) => (
          <Card key={item.label}>
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">{item.label}</p>
              <p className="mt-2 text-2xl font-semibold">{item.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="border-b p-4">
            <h2 className="text-lg font-semibold">Χαρτοφυλάκιο ακινήτων</h2>
            <p className="text-sm text-muted-foreground">
              Demo προβολή. Το επόμενο βήμα είναι σύνδεση με Supabase database.
            </p>
          </div>

          <div className="divide-y">
            {demoProperties.map((property) => (
              <div
                key={property.title}
                className="flex flex-col gap-4 p-4 md:flex-row md:items-center md:justify-between"
              >
                <div className="flex gap-3">
                  <div className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-muted">
                    <Building2 className="size-6 text-muted-foreground" />
                  </div>

                  <div>
                    <h3 className="font-medium">{property.title}</h3>
                    <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                      <span className="inline-flex items-center gap-1">
                        <MapPin className="size-3" />
                        {property.location}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Home className="size-3" />
                        {property.type}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Ruler className="size-3" />
                        {property.size}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-4 md:justify-end">
                  <div className="text-right">
                    <p className="font-semibold">{property.price}</p>
                    <p className="inline-flex items-center gap-1 text-sm text-muted-foreground">
                      <TrendingUp className="size-3" />
                      {property.status}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
