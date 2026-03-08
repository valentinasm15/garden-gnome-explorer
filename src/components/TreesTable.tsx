import { useMemo, useState } from "react";
import type { GeoFeature, TreeProperties } from "@/lib/api";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";

const SPECIES_MAP: Record<number, string> = {
  1: "Picea abies",
  2: "Pinus sylvestris",
  3: "Betula pendula",
  4: "Acer pseudoplatanus",
  5: "Fagus sylvatica",
};

interface TreesTableProps {
  data: GeoFeature<TreeProperties>[];
  filterPlotId?: number | null;
}

export default function TreesTable({ data, filterPlotId }: TreesTableProps) {
  const [speciesFilter, setSpeciesFilter] = useState<string>("all");
  const [search, setSearch] = useState("");

  const speciesList = useMemo(() => {
    const s = new Set(data.map((t) => t.properties.species));
    return Array.from(s).sort();
  }, [data]);

  const filtered = useMemo(() => {
    return data
      .filter((t) => (filterPlotId ? t.properties.fieldplot === filterPlotId : true))
      .filter((t) => (speciesFilter !== "all" ? t.properties.species === Number(speciesFilter) : true))
      .filter((t) => {
        if (!search) return true;
        const s = search.toLowerCase();
        return (
          String(t.id).includes(s) ||
          String(t.properties.fieldplot).includes(s) ||
          (SPECIES_MAP[t.properties.species] || "").toLowerCase().includes(s)
        );
      })
      .slice(0, 200); // limit for performance
  }, [data, filterPlotId, speciesFilter, search]);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-3">
        <Input
          placeholder="Search trees..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-xs"
        />
        <Select value={speciesFilter} onValueChange={setSpeciesFilter}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="All species" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All species</SelectItem>
            {speciesList.map((sp) => (
              <SelectItem key={sp} value={String(sp)}>
                {SPECIES_MAP[sp] || `Species ${sp}`}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-lg border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead>ID</TableHead>
              <TableHead>Plot</TableHead>
              <TableHead>Species</TableHead>
              <TableHead className="text-right">DBH (cm)</TableHead>
              <TableHead className="text-right">Height (m)</TableHead>
              <TableHead className="text-right">Crown (m)</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((t) => (
              <TableRow key={t.id} className="hover:bg-muted/30">
                <TableCell className="font-mono text-sm">{t.id}</TableCell>
                <TableCell className="font-mono text-sm">{t.properties.fieldplot}</TableCell>
                <TableCell className="text-sm italic">{SPECIES_MAP[t.properties.species] || `#${t.properties.species}`}</TableCell>
                <TableCell className="text-right font-mono">{t.properties.dbh_cm}</TableCell>
                <TableCell className="text-right font-mono">{t.properties.height_m}</TableCell>
                <TableCell className="text-right font-mono">{t.properties.crown_width_m ?? "—"}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <p className="text-xs text-muted-foreground">
        Showing {filtered.length} trees{filterPlotId ? ` in plot #${filterPlotId}` : ""}
        {data.length > 200 && !filterPlotId ? " (limited to 200)" : ""}
      </p>
    </div>
  );
}
