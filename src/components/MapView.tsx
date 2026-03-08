import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { GeoFeature, FieldPlotProperties, TreeProperties, RasterProperties } from "@/lib/api";

interface MapViewProps {
  fieldPlots?: GeoFeature<FieldPlotProperties>[];
  trees?: GeoFeature<TreeProperties>[];
  rasters?: GeoFeature<RasterProperties>[];
  selectedPlotId?: number | null;
  onPlotClick?: (id: number) => void;
}

const SPECIES_COLORS: Record<string, string> = {
  "Pinus sylvestris": "#5B8C5A",
  "Picea abies": "#2D6A4F",
  "Betula pendula": "#A3B18A",
  "Acer pseudoplatanus": "#DDA15E",
  "Fagus sylvatica": "#BC6C25",
};

const getSpeciesColor = (species: string) =>
  SPECIES_COLORS[species] || "#6B7280";

export default function MapView({ fieldPlots, trees, rasters, selectedPlotId, onPlotClick }: MapViewProps) {
  const mapRef = useRef<L.Map | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, {
      zoomControl: true,
      attributionControl: true,
    }).setView([55, 15], 4);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>',
      maxZoom: 19,
    }).addTo(map);

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // Clear existing layers (except tile)
    map.eachLayer((layer) => {
      if (!(layer instanceof L.TileLayer)) map.removeLayer(layer);
    });

    const bounds = L.latLngBounds([]);

    // Rasters as rectangles
    if (rasters?.length) {
      rasters.forEach((r) => {
        if (r.geometry.type === "Polygon") {
          const coords = (r.geometry.coordinates as number[][][])[0];
          const latlngs = coords.map(([lng, lat]) => L.latLng(lat, lng));
          L.polygon(latlngs, {
            color: "hsl(205, 55%, 48%)",
            weight: 1,
            fillOpacity: 0.08,
          })
            .bindPopup(
              `<strong>${r.properties.name}</strong><br/>
              Family: ${r.properties.family.name}<br/>
              ${r.properties.metadata.long_name || ""}`
            )
            .addTo(map);
          latlngs.forEach((ll) => bounds.extend(ll));
        }
      });
    }

    // Field plots as circles
    if (fieldPlots?.length) {
      fieldPlots.forEach((fp) => {
        const [lng, lat] = fp.geometry.coordinates as number[];
        const isSelected = fp.id === selectedPlotId;
        const circle = L.circleMarker(L.latLng(lat, lng), {
          radius: isSelected ? 10 : 7,
          color: isSelected ? "hsl(36, 55%, 55%)" : getSpeciesColor(fp.properties.last_dominating_species),
          fillColor: getSpeciesColor(fp.properties.last_dominating_species),
          fillOpacity: 0.8,
          weight: isSelected ? 3 : 1.5,
        })
          .bindPopup(
            `<strong>Plot ${fp.properties.external_id}</strong><br/>
            Species: <em>${fp.properties.last_dominating_species}</em><br/>
            Stems: ${fp.properties.last_stem_count}<br/>
            Basal area: ${fp.properties.last_basal_area_hectare} m²/ha`
          )
          .addTo(map);

        if (onPlotClick) {
          circle.on("click", () => onPlotClick(fp.id));
        }
        bounds.extend(L.latLng(lat, lng));
      });
    }

    // Trees as small dots
    if (trees?.length) {
      trees.forEach((t) => {
        const [lng, lat] = t.geometry.coordinates as number[];
        L.circleMarker(L.latLng(lat, lng), {
          radius: Math.max(2, t.properties.dbh_cm / 5),
          color: "hsl(152, 45%, 28%)",
          fillColor: "hsl(145, 35%, 42%)",
          fillOpacity: 0.6,
          weight: 0.5,
        })
          .bindPopup(
            `<strong>Tree #${t.id}</strong><br/>
            Plot: ${t.properties.fieldplot}<br/>
            DBH: ${t.properties.dbh_cm} cm<br/>
            Height: ${t.properties.height_m} m`
          )
          .addTo(map);
        bounds.extend(L.latLng(lat, lng));
      });
    }

    if (bounds.isValid()) {
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 12 });
    }
  }, [fieldPlots, trees, rasters, selectedPlotId, onPlotClick]);

  return (
    <div
      ref={containerRef}
      className="h-full w-full min-h-[400px] rounded-lg border border-border"
    />
  );
}
