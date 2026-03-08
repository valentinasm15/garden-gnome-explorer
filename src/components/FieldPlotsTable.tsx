import { useMemo, useState } from "react";
import type { GeoFeature, FieldPlotProperties } from "@/lib/api";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

interface FieldPlotsTableProps {
  data: GeoFeature<FieldPlotProperties>[];
  onRowClick?: (id: number) => void;
  selectedId?: number | null;
}

export default function FieldPlotsTable({ data, onRowClick, selectedId }: FieldPlotsTableProps) {
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<"external_id" | "last_stem_count" | "last_basal_area_hectare" | "last_dominating_species">("external_id");
  const [sortAsc, setSortAsc] = useState(true);

  const filtered = useMemo(() => {
    let items = data.filter(
      (f) =>
        f.properties.external_id.toLowerCase().includes(search.toLowerCase()) ||
        f.properties.last_dominating_species.toLowerCase().includes(search.toLowerCase())
    );
    items.sort((a, b) => {
      const av = a.properties[sortKey];
      const bv = b.properties[sortKey];
      if (typeof av === "number" && typeof bv === "number") return sortAsc ? av - bv : bv - av;
      return sortAsc ? String(av).localeCompare(String(bv)) : String(bv).localeCompare(String(av));
    });
    return items;
  }, [data, search, sortKey, sortAsc]);

  const toggleSort = (key: typeof sortKey) => {
    if (sortKey === key) setSortAsc(!sortAsc);
    else { setSortKey(key); setSortAsc(true); }
  };

  const SortIcon = ({ active, asc }: { active: boolean; asc: boolean }) => (
    <span className="ml-1 text-xs">{active ? (asc ? "↑" : "↓") : "↕"}</span>
  );

  return (
    <div className="space-y-3">
      <Input
        placeholder="Search by ID or species..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="max-w-sm"
      />
      <div className="rounded-lg border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="cursor-pointer select-none" onClick={() => toggleSort("external_id")}>
                Plot ID <SortIcon active={sortKey === "external_id"} asc={sortAsc} />
              </TableHead>
              <TableHead className="cursor-pointer select-none" onClick={() => toggleSort("last_dominating_species")}>
                Species <SortIcon active={sortKey === "last_dominating_species"} asc={sortAsc} />
              </TableHead>
              <TableHead className="cursor-pointer select-none text-right" onClick={() => toggleSort("last_stem_count")}>
                Stems <SortIcon active={sortKey === "last_stem_count"} asc={sortAsc} />
              </TableHead>
              <TableHead className="cursor-pointer select-none text-right" onClick={() => toggleSort("last_basal_area_hectare")}>
                Basal Area (m²/ha) <SortIcon active={sortKey === "last_basal_area_hectare"} asc={sortAsc} />
              </TableHead>
              <TableHead className="text-right">Radius (m)</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((f) => (
              <TableRow
                key={f.id}
                onClick={() => onRowClick?.(f.id)}
                className={`cursor-pointer transition-colors ${
                  selectedId === f.id ? "bg-primary/10" : "hover:bg-muted/30"
                }`}
              >
                <TableCell className="font-mono text-sm">{f.properties.external_id}</TableCell>
                <TableCell>
                  <Badge variant="secondary" className="text-xs font-normal">
                    {f.properties.last_dominating_species}
                  </Badge>
                </TableCell>
                <TableCell className="text-right font-mono">{f.properties.last_stem_count}</TableCell>
                <TableCell className="text-right font-mono">{f.properties.last_basal_area_hectare.toFixed(2)}</TableCell>
                <TableCell className="text-right font-mono">{f.properties.radius_m}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <p className="text-xs text-muted-foreground">{filtered.length} of {data.length} plots</p>
    </div>
  );
}
