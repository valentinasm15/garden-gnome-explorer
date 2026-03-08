// API calls go through Vite's dev server proxy to avoid CORS issues.
// The proxy is configured in vite.config.ts to forward /api/* to the Django backend.
const API_BASE = "/api";

export interface FieldPlotProperties {
  external_id: string;
  precision_level: string;
  radius_m: number;
  area_m2: number;
  last_stem_count: number;
  last_basal_area_hectare: number;
  last_dominating_species: string;
}

export interface TreeProperties {
  fieldplot: number;
  species: number;
  dbh_cm: number;
  height_m: number;
  crown_width_m: number | null;
}

export interface RasterProperties {
  name: string;
  percentiles: {
    global: { p2: number; p98: number };
    per_band: Record<string, { p2: number; p98: number }>;
  };
  band_metadata: Record<string, { name: string }>;
  band_id: number | null;
  is_categorical: boolean;
  family: { id: number; name: string };
  metadata: Record<string, string>;
}

export interface GeoFeature<T> {
  id: number;
  type: "Feature";
  geometry: {
    type: string;
    coordinates: number[] | number[][] | number[][][];
  };
  properties: T;
}

export interface FeatureCollection<T> {
  type: "FeatureCollection";
  features: GeoFeature<T>[];
}

async function fetchEndpoint<T>(path: string): Promise<FeatureCollection<T>> {
  return fetchEndpointRaw<FeatureCollection<T>>(path);
}

export const api = {
  getFieldPlots: () => fetchEndpoint<FieldPlotProperties>("fieldplots"),
  getTrees: () => fetchEndpoint<TreeProperties>("trees"),
  getRasters: () => fetchEndpoint<RasterProperties>("rasters"),
};
