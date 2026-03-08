import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useFieldPlots, useTrees, useRasters } from "@/hooks/use-api-data";
import { LoadingState, ErrorState } from "@/components/DataStates";
import MapView from "@/components/MapView";
import FieldPlotsTable from "@/components/FieldPlotsTable";
import TreesTable from "@/components/TreesTable";
import RastersList from "@/components/RastersList";
import StatsCharts from "@/components/StatsCharts";
import { TreePine, Map, BarChart3, Grid3X3, Layers } from "lucide-react";

export default function Dashboard() {
  const fieldPlots = useFieldPlots();
  const trees = useTrees();
  const rasters = useRasters();

  const [selectedPlotId, setSelectedPlotId] = useState<number | null>(null);

  const isLoading = fieldPlots.isLoading || trees.isLoading || rasters.isLoading;
  const hasError = fieldPlots.isError || trees.isError || rasters.isError;

  const plotFeatures = fieldPlots.data?.features ?? [];
  const treeFeatures = trees.data?.features ?? [];
  const rasterFeatures = rasters.data?.features ?? [];

  // Summary stats
  const totalPlots = plotFeatures.length;
  const totalTrees = treeFeatures.length;
  const totalRasters = rasterFeatures.length;
  const uniqueSpecies = new Set(plotFeatures.map((f) => f.properties.last_dominating_species)).size;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 flex items-center gap-3">
          <TreePine className="h-6 w-6 text-primary" />
          <div>
            <h1 className="text-lg font-bold leading-tight">Forest Data Explorer</h1>
            <p className="text-xs text-muted-foreground">Field plots, trees & raster analysis</p>
          </div>

          {!isLoading && !hasError && (
            <div className="ml-auto flex gap-4 text-xs text-muted-foreground">
              <span><strong className="text-foreground">{totalPlots}</strong> plots</span>
              <span><strong className="text-foreground">{totalTrees}</strong> trees</span>
              <span><strong className="text-foreground">{totalRasters}</strong> rasters</span>
              <span><strong className="text-foreground">{uniqueSpecies}</strong> species</span>
            </div>
          )}
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* Map Section */}
        <section className="animate-fade-in">
          <div className="flex items-center gap-2 mb-3">
            <Map className="h-4 w-4 text-primary" />
            <h2 className="text-sm font-semibold">Geospatial Overview</h2>
          </div>
          <div className="h-[450px] rounded-lg overflow-hidden border border-border">
            {isLoading ? (
              <LoadingState message="Loading map data..." />
            ) : hasError ? (
              <ErrorState
                message="Failed to load geospatial data"
                onRetry={() => { fieldPlots.refetch(); trees.refetch(); rasters.refetch(); }}
              />
            ) : (
              <MapView
                fieldPlots={plotFeatures}
                trees={selectedPlotId ? treeFeatures.filter((t) => t.properties.fieldplot === selectedPlotId) : undefined}
                rasters={rasterFeatures}
                selectedPlotId={selectedPlotId}
                onPlotClick={(id) => setSelectedPlotId(id === selectedPlotId ? null : id)}
              />
            )}
          </div>
          {selectedPlotId && (
            <p className="text-xs text-muted-foreground mt-2">
              Showing trees for plot #{selectedPlotId} ·{" "}
              <button className="text-primary hover:underline" onClick={() => setSelectedPlotId(null)}>
                Clear selection
              </button>
            </p>
          )}
        </section>

        {/* Tabs */}
        <Tabs defaultValue="overview" className="animate-fade-in">
          <TabsList className="bg-muted/50">
            <TabsTrigger value="overview" className="gap-1.5 text-xs">
              <BarChart3 className="h-3.5 w-3.5" /> Overview
            </TabsTrigger>
            <TabsTrigger value="fieldplots" className="gap-1.5 text-xs">
              <Grid3X3 className="h-3.5 w-3.5" /> Field Plots
            </TabsTrigger>
            <TabsTrigger value="trees" className="gap-1.5 text-xs">
              <TreePine className="h-3.5 w-3.5" /> Trees
            </TabsTrigger>
            <TabsTrigger value="rasters" className="gap-1.5 text-xs">
              <Layers className="h-3.5 w-3.5" /> Rasters
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-4">
            {isLoading ? (
              <LoadingState />
            ) : hasError ? (
              <ErrorState message="Failed to load data" onRetry={() => { fieldPlots.refetch(); trees.refetch(); }} />
            ) : (
              <StatsCharts fieldPlots={plotFeatures} trees={treeFeatures} />
            )}
          </TabsContent>

          <TabsContent value="fieldplots" className="mt-4">
            {fieldPlots.isLoading ? (
              <LoadingState message="Loading field plots..." />
            ) : fieldPlots.isError ? (
              <ErrorState message="Failed to load field plots" onRetry={fieldPlots.refetch} />
            ) : (
              <FieldPlotsTable
                data={plotFeatures}
                selectedId={selectedPlotId}
                onRowClick={(id) => setSelectedPlotId(id === selectedPlotId ? null : id)}
              />
            )}
          </TabsContent>

          <TabsContent value="trees" className="mt-4">
            {trees.isLoading ? (
              <LoadingState message="Loading trees..." />
            ) : trees.isError ? (
              <ErrorState message="Failed to load trees" onRetry={trees.refetch} />
            ) : (
              <TreesTable data={treeFeatures} filterPlotId={selectedPlotId} />
            )}
          </TabsContent>

          <TabsContent value="rasters" className="mt-4">
            {rasters.isLoading ? (
              <LoadingState message="Loading rasters..." />
            ) : rasters.isError ? (
              <ErrorState message="Failed to load rasters" onRetry={rasters.refetch} />
            ) : (
              <RastersList data={rasterFeatures} />
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
