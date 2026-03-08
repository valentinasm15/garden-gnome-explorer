import { useMemo } from "react";
import type { GeoFeature, FieldPlotProperties, TreeProperties } from "@/lib/api";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, ScatterChart, Scatter, CartesianGrid } from "recharts";

const COLORS = ["#2D6A4F", "#5B8C5A", "#A3B18A", "#DDA15E", "#BC6C25", "#6B7280", "#457B9D", "#E76F51"];

interface StatsChartsProps {
  fieldPlots?: GeoFeature<FieldPlotProperties>[];
  trees?: GeoFeature<TreeProperties>[];
}

const SPECIES_MAP: Record<number, string> = {
  1: "Picea abies",
  2: "Pinus sylvestris",
  3: "Betula pendula",
  4: "Acer pseudoplatanus",
  5: "Fagus sylvatica",
};

export default function StatsCharts({ fieldPlots, trees }: StatsChartsProps) {
  const speciesDistribution = useMemo(() => {
    if (!fieldPlots) return [];
    const counts: Record<string, number> = {};
    fieldPlots.forEach((fp) => {
      const s = fp.properties.last_dominating_species;
      counts[s] = (counts[s] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([name, value]) => ({ name: name.split(" ").map(w => w[0]).join(""), fullName: name, value }))
      .sort((a, b) => b.value - a.value);
  }, [fieldPlots]);

  const basalAreaData = useMemo(() => {
    if (!fieldPlots) return [];
    return fieldPlots
      .slice(0, 30)
      .map((fp) => ({
        id: fp.properties.external_id,
        basalArea: fp.properties.last_basal_area_hectare,
        stems: fp.properties.last_stem_count,
      }))
      .sort((a, b) => b.basalArea - a.basalArea);
  }, [fieldPlots]);

  const treeScatter = useMemo(() => {
    if (!trees) return [];
    return trees.features
      ? []
      : trees
          .slice(0, 500)
          .map((t) => ({
            dbh: t.properties.dbh_cm,
            height: t.properties.height_m,
            species: SPECIES_MAP[t.properties.species] || `#${t.properties.species}`,
          }));
  }, [trees]);

  const treeScatterData = useMemo(() => {
    if (!trees) return [];
    return trees
      .slice(0, 500)
      .map((t) => ({
        dbh: t.properties.dbh_cm,
        height: t.properties.height_m,
      }));
  }, [trees]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Species pie */}
      <div className="rounded-lg border border-border bg-card p-4">
        <h3 className="text-sm font-semibold mb-3">Dominating Species Distribution</h3>
        <div className="h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={speciesDistribution}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={90}
                dataKey="value"
                nameKey="fullName"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {speciesDistribution.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(val: number, _: string, props: any) => [val, props.payload.fullName]} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Basal area bar */}
      <div className="rounded-lg border border-border bg-card p-4">
        <h3 className="text-sm font-semibold mb-3">Top Plots by Basal Area (m²/ha)</h3>
        <div className="h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={basalAreaData.slice(0, 15)} margin={{ left: 0, right: 8 }}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
              <XAxis dataKey="id" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip />
              <Bar dataKey="basalArea" fill="#2D6A4F" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* DBH vs Height scatter */}
      <div className="rounded-lg border border-border bg-card p-4 lg:col-span-2">
        <h3 className="text-sm font-semibold mb-3">Tree DBH vs Height</h3>
        <div className="h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ left: 0, right: 8 }}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
              <XAxis dataKey="dbh" name="DBH (cm)" tick={{ fontSize: 10 }} label={{ value: "DBH (cm)", position: "bottom", fontSize: 11 }} />
              <YAxis dataKey="height" name="Height (m)" tick={{ fontSize: 10 }} label={{ value: "Height (m)", angle: -90, position: "insideLeft", fontSize: 11 }} />
              <Tooltip cursor={{ strokeDasharray: "3 3" }} />
              <Scatter data={treeScatterData} fill="#5B8C5A" fillOpacity={0.6} />
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
