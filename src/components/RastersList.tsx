import type { GeoFeature, RasterProperties } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { Input } from "@/components/ui/input";

interface RastersListProps {
  data: GeoFeature<RasterProperties>[];
}

export default function RastersList({ data }: RastersListProps) {
  const [search, setSearch] = useState("");

  const filtered = data.filter(
    (r) =>
      r.properties.name?.toLowerCase().includes(search.toLowerCase()) ||
      r.properties.family?.name?.toLowerCase().includes(search.toLowerCase()) ||
      (r.properties.metadata?.long_name || "").toLowerCase().includes(search.toLowerCase())
  );

  // Group by family
  const grouped = filtered.reduce<Record<string, GeoFeature<RasterProperties>[]>>((acc, r) => {
    const fam = r.properties.family?.name ?? "Unknown";
    if (!acc[fam]) acc[fam] = [];
    acc[fam].push(r);
    return acc;
  }, {});

  return (
    <div className="space-y-4">
      <Input
        placeholder="Search rasters by name or family..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="max-w-sm"
      />

      {Object.entries(grouped).map(([family, items]) => (
        <div key={family} className="space-y-2">
          <h3 className="text-sm font-semibold flex items-center gap-2">
            <span className="inline-block h-2 w-2 rounded-full bg-primary" />
            {family}
            <Badge variant="outline" className="text-xs font-normal">{items.length}</Badge>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
            {items.slice(0, 30).map((r) => (
              <div
                key={r.id}
                className="rounded-lg border border-border bg-card p-3 hover:border-primary/30 transition-colors"
              >
                <p className="text-sm font-medium font-mono">{r.properties.name}</p>
                <p className="text-xs text-muted-foreground mt-1">{r.properties.metadata.long_name}</p>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {r.properties.metadata.units && (
                    <Badge variant="secondary" className="text-xs">{r.properties.metadata.units}</Badge>
                  )}
                  {r.properties.is_categorical && (
                    <Badge variant="outline" className="text-xs">Categorical</Badge>
                  )}
                  {Object.entries(r.properties.band_metadata).map(([k, v]) => (
                    <Badge key={k} variant="outline" className="text-xs">Band {k}: {v.name}</Badge>
                  ))}
                </div>
              </div>
            ))}
          </div>
          {items.length > 30 && (
            <p className="text-xs text-muted-foreground">Showing 30 of {items.length} rasters</p>
          )}
        </div>
      ))}

      <p className="text-xs text-muted-foreground">{filtered.length} of {data.length} rasters</p>
    </div>
  );
}
