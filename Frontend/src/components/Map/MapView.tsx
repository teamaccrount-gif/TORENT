import React, { useEffect, useMemo, useState } from 'react';
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polygon,
  Tooltip,
  useMap,
  useMapEvents,
  LayersControl,
  LayerGroup,
} from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useAppDispatch, useAppSelector } from '../../Redux/Store';
import { fetchMapData } from '../../Redux/Slices/mapSlice';
import { GeoJSON } from 'react-leaflet';
import indiaGeoJSON from '../../assets/india.geo.json';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/Badge';
import { Loader2, AlertCircle, Maximize2, X, Map as MapIcon, Signal, Activity, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Fix Leaflet default marker icon broken by Vite bundling
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

// @ts-ignore
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});

// ---------- Zoom thresholds ----------
const ZOOM_SHOW_AREAS = 7;
const ZOOM_SHOW_STATIONS = 10;

// ---------- Types ----------
interface MapPolygonFeature {
  type: 'region' | 'area';
  name: string;
  coordinates: [number, number][];
  properties: Record<string, unknown>;
}

interface MapStationFeature {
  type: 'station';
  name: string;
  position: [number, number]; // [lat, lng]
  properties: Record<string, unknown>;
}

type MapFeature = MapPolygonFeature | MapStationFeature;

// ---------- GeoJSON → Leaflet parser ----------
const swapLatLng = (coord: number[]): [number, number] => [coord[1], coord[0]];

interface GeoJSONFeature {
  type: string;
  geometry: { type: string; coordinates: number[] | number[][] | number[][][] };
  properties: Record<string, unknown>;
}
interface GeoJSONCollection { type: string; features: GeoJSONFeature[] }
interface MapAPIResponse {
  success: boolean;
  data: { regions: GeoJSONCollection; areas: GeoJSONCollection; stations: GeoJSONCollection };
}

const parsePolygons = (
  collection: GeoJSONCollection | undefined,
  featureType: 'region' | 'area'
): MapPolygonFeature[] => {
  if (!collection?.features) return [];
  return collection.features.flatMap((f) => {
    if (f.geometry?.type !== 'Polygon') return [];
    const outerRing = (f.geometry.coordinates as number[][][])[0];
    if (!outerRing) return [];
    return [{
      type: featureType,
      name: typeof f.properties?.name === 'string' ? f.properties.name : featureType,
      coordinates: outerRing.map(swapLatLng),
      properties: f.properties,
    }];
  });
};

const parseStations = (collection: GeoJSONCollection | undefined): MapStationFeature[] => {
  if (!collection?.features) return [];
  return collection.features.flatMap((f) => {
    if (f.geometry?.type !== 'Point') return [];
    const coords = f.geometry.coordinates as number[];
    if (coords.length < 2) return [];
    return [{
      type: 'station' as const,
      name: typeof f.properties?.name === 'string' ? f.properties.name : 'Station',
      position: swapLatLng(coords),
      properties: f.properties,
    }];
  });
};

const getBoundsFromCoords = (coords: [number, number][]): L.LatLngBounds => {
  return L.latLngBounds(coords);
};

// ---------- Sub-components ----------
const ZoomTracker: React.FC<{ onZoomChange: (z: number) => void }> = ({ onZoomChange }) => {
  useMapEvents({
    zoomend: (e) => onZoomChange(e.target.getZoom()),
  });
  return null;
};

const FitIndia: React.FC = () => {
  const map = useMap();
  useEffect(() => {
    // Standard India bounds
    map.fitBounds([
      [6.5, 68],
      [35.5, 97],
    ]);
  }, [map]);
  return null;
};

const STYLE = {
  region: { fillColor: '#2563eb', fillOpacity: 0.15, color: '#1d4ed8', weight: 1.5 },
  area:   { fillColor: '#059669', fillOpacity: 0.15, color: '#047857', weight: 1.5 },
};

const MapView: React.FC = () => {
  console.log('[MAP_VIEW] Rendering MapView');
  const dispatch = useAppDispatch();

  const mapDataResponse = useAppSelector((s) => s.mapSlice.data.fetchMapData);
  const loadingState = useAppSelector((s) => s.mapSlice.loading.fetchMapData);
  const errorState = useAppSelector((s) => s.mapSlice.error.fetchMapData);

  const [zoom, setZoom] = useState(5);
  const [mapRef, setMapRef] = useState<L.Map | null>(null);
  const [selectedKpi, setSelectedKpi] = useState<{ type: 'region' | 'area', name: string } | null>(null);

  useEffect(() => {
    dispatch(fetchMapData({ method: 'GET' }));
  }, [dispatch]);

  const { regions, areas, stations } = useMemo(() => {
    if (!mapDataResponse?.success) return { regions: [], areas: [], stations: [] };
    const d = mapDataResponse.data;
    return {
      regions: parsePolygons(d.regions, 'region'),
      areas:   parsePolygons(d.areas, 'area'),
      stations: parseStations(d.stations),
    };
  }, [mapDataResponse]);

  const showAreas = zoom >= ZOOM_SHOW_AREAS;
  const showStations = zoom >= ZOOM_SHOW_STATIONS;

  const handleRegionClick = (feature: MapPolygonFeature) => {
    if (!mapRef) return;
    const bounds = getBoundsFromCoords(feature.coordinates);
    if (bounds.isValid()) mapRef.fitBounds(bounds, { padding: [40, 40] });
    setSelectedKpi({ type: 'region', name: feature.name });
  };

  const handleAreaClick = (feature: MapPolygonFeature) => {
    if (!mapRef) return;
    const bounds = getBoundsFromCoords(feature.coordinates);
    if (bounds.isValid()) mapRef.fitBounds(bounds, { padding: [30, 30] });
    setSelectedKpi({ type: 'area', name: feature.name });
  };

  const isLoading = loadingState === 'pending' || loadingState === undefined;
  const is404 = typeof errorState === 'string' && errorState.includes('404');
  const hasError = loadingState === 'rejected' && !is404;

  // Mock metrics
  const mockTopMetrics = {
    totalRegions: 5,
    totalAreas: 24,
    onlineStations: 120,
    totalStations: 150,
    faultyStations: 15,
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full w-full bg-slate-50 gap-4">
        <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
        <div className="flex flex-col items-center gap-1 text-center">
          <h3 className="text-lg font-semibold text-slate-900">Synchronizing Spatial Data</h3>
          <p className="text-sm text-slate-500">Retrieving operational boundaries and terminal coordinates...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="absolute inset-0 overflow-hidden bg-[#4989b4ff] animate-in fade-in duration-700">
      {hasError && (
        <div className="absolute inset-0 z-[2000] flex items-center justify-center bg-slate-50/80 backdrop-blur-sm p-4 text-center">
          <Card className="max-w-md border-red-100 shadow-2xl">
            <CardHeader className="text-center pb-2">
              <div className="mx-auto bg-red-50 h-12 w-12 rounded-full flex items-center justify-center mb-4">
                <AlertCircle className="h-6 w-6 text-red-600" />
              </div>
              <CardTitle className="text-xl font-bold text-slate-900">Map Load Failure</CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-6">
              <p className="text-slate-500 text-sm">{errorState || 'The mapping server could not be reached. Please check your connection.'}</p>
              <Button
                onClick={() => dispatch(fetchMapData({ method: 'GET' }))}
                variant="default"
                className="w-full"
              >
                Retry Connection
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Status Notifications */}
      {is404 && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000] w-full max-w-md px-4">
          <Alert className="bg-amber-50/90 border-amber-200 text-amber-800 backdrop-blur shadow-md">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription className="text-xs font-medium">
              Geographic endpoint offline. Displaying base operational layers.
            </AlertDescription>
          </Alert>
        </div>
      )}

      {/* Primary Metrics Dashboard Overlay */}
      <div className="absolute top-4 right-4 z-[1000] hidden lg:block pointer-events-auto">
        <Card className="bg-white/90 backdrop-blur shadow-xl border-slate-100 overflow-hidden">
          <div className="flex divide-x divide-slate-100">
            <div className="px-6 py-4 text-center">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Regions</p>
              <p className="text-2xl font-black text-blue-600 leading-none">{mockTopMetrics.totalRegions}</p>
            </div>
            <div className="px-6 py-4 text-center">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Areas</p>
              <p className="text-2xl font-black text-emerald-600 leading-none">{mockTopMetrics.totalAreas}</p>
            </div>
            <div className="px-6 py-4 text-center">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Online</p>
              <div className="flex items-baseline justify-center gap-0.5">
                <p className="text-2xl font-black text-green-600 leading-none">{mockTopMetrics.onlineStations}</p>
                <span className="text-xs font-bold text-slate-300">/{mockTopMetrics.totalStations}</span>
              </div>
            </div>
            <div className="px-6 py-4 text-center bg-red-50/30">
              <p className="text-[10px] font-bold text-red-400 uppercase tracking-widest mb-1">Faults</p>
              <p className="text-2xl font-black text-red-500 leading-none">{mockTopMetrics.faultyStations}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* KPI Inspection Panel */}
      {selectedKpi && (
        <div className="absolute top-4 left-4 z-[1000] w-80 animate-in slide-in-from-left-4 duration-300 pointer-events-auto">
          <Card className="bg-white/95 backdrop-blur-md shadow-2xl border-slate-200 overflow-hidden">
            <CardHeader className="py-4 border-b border-slate-100 flex flex-row items-center justify-between space-y-0">
              <div className="flex items-center gap-2">
                <MapIcon className="h-4 w-4 text-blue-500" />
                <CardTitle className="text-base font-bold capitalize truncate max-w-[180px]">
                  {selectedKpi.name}
                </CardTitle>
              </div>
              <button 
                onClick={() => setSelectedKpi(null)} 
                className="h-7 w-7 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors text-slate-500"
              >
                <X className="h-4 w-4" />
              </button>
            </CardHeader>
            <CardContent className="pt-5 pb-6 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400 uppercase">Scope</span>
                <Badge variant="secondary" className="uppercase text-[10px]">{selectedKpi.type}</Badge>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-green-500" />
                    <span className="text-sm text-slate-600">Online Nodes</span>
                  </div>
                  <span className="font-bold text-slate-900">{selectedKpi.type === 'region' ? '45' : '12'}</span>
                </div>
                <div className="flex justify-between items-center bg-red-50/50 p-2.5 rounded-lg border border-red-100">
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-red-500" />
                    <span className="text-sm text-red-700">Active Faults</span>
                  </div>
                  <span className="font-bold text-red-700">{selectedKpi.type === 'region' ? '3' : '1'}</span>
                </div>
              </div>

              <div className="pt-3 flex items-center justify-between border-t border-slate-100">
                <div className="flex items-center gap-2">
                   <Activity className="h-4 w-4 text-indigo-500" />
                   <span className="text-sm font-semibold text-slate-600">Total Sales</span>
                </div>
                <span className="text-lg font-black text-indigo-600">
                  {selectedKpi.type === 'region' ? '₹1.2M' : '₹300K'}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Information Overlays */}
      <div className="absolute bottom-6 left-6 z-[1000] flex flex-col gap-2 pointer-events-none">
        <Badge className="bg-white/90 border-slate-200 text-slate-700 backdrop-blur shadow-sm py-1.5 px-3 flex items-center gap-2 font-semibold">
           <Maximize2 className="h-3 w-3 text-blue-500" />
           {zoom < ZOOM_SHOW_AREAS && 'Regions View'}
           {zoom >= ZOOM_SHOW_AREAS && zoom < ZOOM_SHOW_STATIONS && 'Areas Drill-down'}
           {zoom >= ZOOM_SHOW_STATIONS && 'Detailed Stations'}
           <span className="text-slate-300 mx-1">|</span>
           Level {zoom}
        </Badge>
      </div>

      <MapContainer
        center={[22.5, 82]}
        zoom={5}
        className="h-full w-full z-10"
        style={{ background: '#4989b4ff' }}
        scrollWheelZoom={true}
        ref={(ref) => { if (ref) setMapRef(ref); }}
      >
        <TileLayer
          url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        <GeoJSON 
          data={indiaGeoJSON as any} 
          style={{
            fillColor: '#ffffffff',
            fillOpacity: 0.1,
            color: '#2563eb',
            weight: 1,
            dashArray: '5, 5'
          }}
        />

        <FitIndia />
        <ZoomTracker onZoomChange={setZoom} />

        <LayersControl position="topright">
          <LayersControl.Overlay checked name="Regions">
            <LayerGroup>
              {regions.map((feature, idx) => (
                <Polygon
                  key={`region-${idx}`}
                  positions={feature.coordinates}
                  pathOptions={STYLE.region}
                  eventHandlers={{ click: () => handleRegionClick(feature) }}
                >
                  <Tooltip sticky>
                    <div className="px-2 py-1">
                      <div className="text-xs font-bold text-blue-800 uppercase tracking-wider">Region</div>
                      <div className="text-sm font-black text-slate-900">{feature.name}</div>
                      <div className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
                        <Signal className="h-3 w-3" />
                        Click to inspect hierarchy
                      </div>
                    </div>
                  </Tooltip>
                </Polygon>
              ))}
            </LayerGroup>
          </LayersControl.Overlay>

          {showAreas && (
            <LayersControl.Overlay checked name="Areas">
              <LayerGroup>
                {areas.map((feature, idx) => (
                  <Polygon
                    key={`area-${idx}`}
                    positions={feature.coordinates}
                    pathOptions={STYLE.area}
                    eventHandlers={{ click: () => handleAreaClick(feature) }}
                  >
                    <Tooltip sticky>
                       <div className="px-2 py-1">
                        <div className="text-xs font-bold text-emerald-800 uppercase tracking-wider">Area</div>
                        <div className="text-sm font-black text-slate-900">{feature.name}</div>
                        {typeof feature.properties.region === 'string' && (
                          <div className="text-[10px] text-slate-500">Parent: {feature.properties.region}</div>
                        )}
                      </div>
                    </Tooltip>
                  </Polygon>
                ))}
              </LayerGroup>
            </LayersControl.Overlay>
          )}

          {showStations && (
            <LayersControl.Overlay checked name="Stations">
              <LayerGroup>
                {stations.map((feature, idx) => (
                  <Marker key={`station-${idx}`} position={feature.position}>
                    <Tooltip direction="top" offset={[0, -20]} opacity={1}>
                      <div className="p-2 min-w-[160px] shadow-xl border-0">
                        <h3 className="font-black text-slate-900 border-b border-slate-100 pb-1.5 mb-2 flex items-center gap-1.5">
                          <div className={`h-2 w-2 rounded-full ${idx % 10 === 0 ? 'bg-red-500' : 'bg-green-500'}`} />
                          {feature.name}
                        </h3>
                        <div className="space-y-1.5">
                          <div className="flex justify-between text-[10px]">
                            <span className="text-slate-400 font-bold uppercase tracking-tighter">Status</span>
                            <span className={`font-black ${idx % 10 === 0 ? 'text-red-500' : 'text-green-600'}`}>
                              {idx % 10 === 0 ? 'FAULTY' : 'NOMINAL'}
                            </span>
                          </div>
                          <div className="flex justify-between text-[10px]">
                            <span className="text-slate-400 font-bold uppercase tracking-tighter">Event</span>
                            <span className="font-black text-slate-700">
                              {idx % 10 === 0 ? 'PRESSURE_LOW' : 'NONE'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </Tooltip>
                    <Popup>
                      <div className="min-w-[180px]">
                        <h3 className="font-black text-slate-900 border-b border-slate-100 pb-2 mb-3 text-sm">
                          Terminal Information
                        </h3>
                        <div className="space-y-2">
                          {Object.entries(feature.properties)
                            .filter(([, v]) => v !== null && v !== undefined)
                            .map(([key, value]) => (
                              <div key={key} className="flex flex-col">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                  {key.replace(/_/g, ' ')}
                                </span>
                                <span className="text-xs text-slate-900 font-bold">{String(value)}</span>
                              </div>
                            ))}
                        </div>
                      </div>
                    </Popup>
                  </Marker>
                ))}
              </LayerGroup>
            </LayersControl.Overlay>
          )}
        </LayersControl>
      </MapContainer>
    </div>
  );
};

export default MapView;
