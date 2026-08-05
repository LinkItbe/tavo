import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import { Restaurant } from '../types';
import L from 'leaflet';
import 'leaflet.markercluster';

// Defensive patch for Leaflet Canvas renderer to prevent clearRect on undefined context
if (typeof L !== 'undefined' && L.Canvas && L.Canvas.prototype) {
  const canvasProto = L.Canvas.prototype as any;
  const origClear = canvasProto._clear;
  if (origClear) {
    canvasProto._clear = function (this: any) {
      if (this._ctx) {
        origClear.call(this);
      }
    };
  }
}
import { 
  Star, 
  Compass, 
  Heart, 
  X, 
  ArrowRight, 
  MapPin, 
  Navigation, 
  Maximize2, 
  Clock, 
  UtensilsCrossed, 
  AlertCircle,
  Layers,
  ListFilter
} from 'lucide-react';
import { isVenueSaved } from '../utils/savedVenuesStore';
import { normalizeCoordinates, diagnoseVenueCoordinates } from '../utils/mapUtils';
import { MINSK_DISTRICTS, MinskDistrict } from '../data/minskDistrictsData';

interface RestaurantMapProps {
  restaurants: Restaurant[];
  selectedRestaurant: Restaurant | null;
  onSelectRestaurant: (restaurant: Restaurant) => void;
  favorites: string[];
  onToggleFavorite: (id: string, e: React.MouseEvent) => void;
  onBookRestaurant?: (restaurant: Restaurant) => void;
}

export const RestaurantMap: React.FC<RestaurantMapProps> = ({
  restaurants,
  selectedRestaurant,
  onSelectRestaurant,
  favorites,
  onToggleFavorite,
  onBookRestaurant,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const clusterGroupRef = useRef<L.MarkerClusterGroup | null>(null);
  const districtsLayerRef = useRef<L.LayerGroup | null>(null);
  const districtLabelsLayerRef = useRef<L.LayerGroup | null>(null);
  const markersRef = useRef<{ [key: string]: L.Marker }>({});
  const userMarkerRef = useRef<L.Marker | null>(null);

  const [activeRestaurant, setActiveRestaurant] = useState<Restaurant | null>(selectedRestaurant);
  const [hoveredVenueId, setHoveredVenueId] = useState<string | null>(null);
  const [selectedDistrictId, setSelectedDistrictId] = useState<string | null>(null);
  const [showDistricts, setShowDistricts] = useState<boolean>(true);
  const [isClusterEnabled, setIsClusterEnabled] = useState<boolean>(false); // Default to Variant A (direct price tags)
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [mobileViewMode, setMobileViewMode] = useState<'map' | 'list'>('map');

  // Sync prop selectedRestaurant with internal state without forcing map view jump
  useEffect(() => {
    setActiveRestaurant(selectedRestaurant);
  }, [selectedRestaurant]);

  // Run diagnostics and prepare map venues
  const { mapVenues, invalidVenues } = useMemo(() => {
    diagnoseVenueCoordinates(restaurants);

    const validList: { venue: Restaurant; coords: { lat: number; lng: number } }[] = [];
    const invalidList: Restaurant[] = [];

    restaurants.forEach((r) => {
      const coords = normalizeCoordinates(r);
      if (coords) {
        validList.push({ venue: r, coords });
      } else {
        invalidList.push(r);
      }
    });

    return { mapVenues: validList, invalidVenues: invalidList };
  }, [restaurants]);

  // Key to track dataset structural changes
  const venueIdsKey = useMemo(() => {
    return mapVenues.map((m) => m.venue.id).sort().join(',');
  }, [mapVenues]);

  // Re-fit map bounds smoothly
  const handleFitBounds = useCallback(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (mapVenues.length > 1) {
      const bounds = L.latLngBounds(mapVenues.map((m) => [m.coords.lat, m.coords.lng]));
      map.fitBounds(bounds, { padding: [64, 64], maxZoom: 14, animate: true });
    } else if (mapVenues.length === 1) {
      map.setView([mapVenues[0].coords.lat, mapVenues[0].coords.lng], 14, { animate: true });
    } else {
      map.setView([53.9006, 27.5590], 12, { animate: true });
    }
  }, [mapVenues]);

  // Geolocation request handler
  const handleRequestLocation = useCallback(() => {
    if (!navigator.geolocation) {
      alert('Геолокация не поддерживается вашим браузером');
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsLocating(false);
        const { latitude, longitude } = pos.coords;

        const map = mapInstanceRef.current;
        if (map) {
          if (userMarkerRef.current) {
            userMarkerRef.current.remove();
          }

          const userIcon = L.divIcon({
            className: 'user-loc-marker',
            html: `
              <div class="relative flex items-center justify-center w-6 h-6">
                <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#A64F2C] opacity-75"></span>
                <span class="relative inline-flex rounded-full h-4 w-4 bg-[#A64F2C] border-2 border-white shadow-md"></span>
              </div>
            `,
            iconSize: [24, 24],
            iconAnchor: [12, 12],
          });

          userMarkerRef.current = L.marker([latitude, longitude], { icon: userIcon, title: 'Моё местоположение' }).addTo(map);
          map.setView([latitude, longitude], 15, { animate: true });
        }
      },
      (err) => {
        setIsLocating(false);
        console.warn('[Tavoo Map] Geolocation error:', err);
        alert('Не удалось определить местоположение. Проверьте разрешения браузера.');
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  }, []);

  // 1. Initialize Map Instance (ONCE)
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const defaultLat = 53.9006;
      const defaultLng = 27.5590;

      const map = L.map(mapContainerRef.current, {
        center: [defaultLat, defaultLng],
        zoom: 12,
        zoomControl: false,
        zoomAnimation: false,
        fadeAnimation: false,
        markerZoomAnimation: false,
      });

      // Remove Leaflet prefix flag
      if (map.attributionControl) {
        map.attributionControl.setPrefix(false);
      }

      // Base Map Tile Layer
      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions" target="_blank" rel="noopener">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 19,
      }).addTo(map);

      // Custom Zoom Control
      L.control.zoom({ position: 'bottomright' }).addTo(map);

      // Marker Cluster Group - Variant A default (clustering disabled so individual price badges render directly)
      const clusterGroup = L.markerClusterGroup({
        showCoverageOnHover: false,
        maxClusterRadius: isClusterEnabled ? 40 : 1,
        disableClusteringAtZoom: isClusterEnabled ? 18 : 1,
        spiderfyOnMaxZoom: true,
        zoomToBoundsOnClick: true,
        animate: false,
        animateAddingMarkers: false,
        iconCreateFunction: (cluster) => {
          const count = cluster.getChildCount();
          return L.divIcon({
            html: `<div class="tavoo-cluster-inner">${count}</div>`,
            className: 'tavoo-cluster-icon-wrapper',
            iconSize: L.point(44, 44),
            iconAnchor: L.point(22, 22),
          });
        },
      });

      map.addLayer(clusterGroup);
      clusterGroupRef.current = clusterGroup;

      // Layers for District Polygons and Labels
      const districtsLayer = L.layerGroup().addTo(map);
      const districtLabelsLayer = L.layerGroup().addTo(map);
      districtsLayerRef.current = districtsLayer;
      districtLabelsLayerRef.current = districtLabelsLayer;

      // Zoom listener to hide/show district labels based on zoom
      map.on('zoomend', () => {
        const currentZoom = map.getZoom();
        if (districtLabelsLayerRef.current) {
          if (currentZoom >= 12) {
            map.addLayer(districtLabelsLayerRef.current);
          } else {
            map.removeLayer(districtLabelsLayerRef.current);
          }
        }
      });

      mapInstanceRef.current = map;
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        clusterGroupRef.current = null;
        districtsLayerRef.current = null;
        districtLabelsLayerRef.current = null;
      }
    };
  }, []);

  // 2. ResizeObserver for Map (Invalidate size safely)
  useEffect(() => {
    const container = mapContainerRef.current;
    if (!container) return;

    const observer = new ResizeObserver(() => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize();
      }
    });

    observer.observe(container);

    requestAnimationFrame(() => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize();
      }
    });

    return () => observer.disconnect();
  }, []);

  // 3. Render Minsk District Polygons
  useEffect(() => {
    const districtsLayer = districtsLayerRef.current;
    const labelsLayer = districtLabelsLayerRef.current;
    if (!districtsLayer || !labelsLayer) return;

    districtsLayer.clearLayers();
    labelsLayer.clearLayers();

    if (!showDistricts) return;

    MINSK_DISTRICTS.forEach((d) => {
      const isSelected = selectedDistrictId === d.id;

      const polygon = L.polygon(d.polygon, {
        fillColor: '#FFF4B8',
        fillOpacity: isSelected ? 0.16 : 0.05,
        color: isSelected ? '#A64F2C' : '#707437',
        weight: isSelected ? 2 : 1,
        opacity: isSelected ? 0.6 : 0.25,
      });

      polygon.on('mouseover', () => {
        if (selectedDistrictId !== d.id) {
          polygon.setStyle({ fillOpacity: 0.12, color: '#A64F2C', opacity: 0.5 });
        }
      });

      polygon.on('mouseout', () => {
        if (selectedDistrictId !== d.id) {
          polygon.setStyle({ fillOpacity: 0.05, color: '#707437', opacity: 0.25 });
        }
      });

      polygon.on('click', () => {
        setSelectedDistrictId(isSelected ? null : d.id);
        const map = mapInstanceRef.current;
        if (map) {
          map.fitBounds(polygon.getBounds(), { padding: [40, 40], maxZoom: 14, animate: true });
        }
      });

      districtsLayer.addLayer(polygon);

      // District label badge
      const labelIcon = L.divIcon({
        className: 'tavoo-district-label-wrapper',
        html: `<div class="tavoo-district-label">${d.name.replace(' район', '')}</div>`,
        iconSize: [80, 24],
        iconAnchor: [40, 12],
      });

      const labelMarker = L.marker(d.center, { icon: labelIcon, interactive: false });
      labelsLayer.addLayer(labelMarker);
    });
  }, [showDistricts, selectedDistrictId]);

  // 4. Render Venue Markers in Cluster Group
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Ensure cluster group is created with active isClusterEnabled setting
    if (clusterGroupRef.current) {
      map.removeLayer(clusterGroupRef.current);
      clusterGroupRef.current.clearLayers();
    }

    const clusterGroup = L.markerClusterGroup({
      showCoverageOnHover: false,
      maxClusterRadius: isClusterEnabled ? 40 : 1,
      disableClusteringAtZoom: isClusterEnabled ? 18 : 1,
      spiderfyOnMaxZoom: true,
      zoomToBoundsOnClick: true,
      animate: false,
      animateAddingMarkers: false,
      iconCreateFunction: (cluster) => {
        const count = cluster.getChildCount();
        return L.divIcon({
          html: `<div class="tavoo-cluster-inner">${count}</div>`,
          className: 'tavoo-cluster-icon-wrapper',
          iconSize: L.point(44, 44),
          iconAnchor: L.point(22, 22),
        });
      },
    });

    map.addLayer(clusterGroup);
    clusterGroupRef.current = clusterGroup;
    markersRef.current = {};

    mapVenues.forEach(({ venue, coords }) => {
      const isSelected = activeRestaurant?.id === venue.id;
      const isHovered = hoveredVenueId === venue.id;

      const customIcon = L.divIcon({
        className: 'tavoo-marker-wrapper',
        html: `
          <div 
            class="tavoo-marker-pin ${isSelected ? 'is-selected' : isHovered ? 'is-hovered' : ''}" 
            role="button" 
            tabindex="0" 
            aria-label="${venue.name}, средний чек ${venue.averageCheck} BYN, рейтинг ${venue.rating}"
          >
            <span class="font-bold">${venue.averageCheck} BYN</span>
            <span class="text-[11px] opacity-90">★ ${venue.rating}</span>
          </div>
        `,
        iconSize: [88, 38],
        iconAnchor: [44, 19],
      });

      const marker = L.marker([coords.lat, coords.lng], {
        icon: customIcon,
        title: venue.name,
      });

      if (isSelected || isHovered) {
        marker.setZIndexOffset(1000);
      } else {
        marker.setZIndexOffset(0);
      }

      marker.on('click', () => {
        setActiveRestaurant(venue);
        map.panTo([coords.lat, coords.lng], { animate: true });
      });

      marker.on('mouseover', () => {
        setHoveredVenueId(venue.id);
      });

      marker.on('mouseout', () => {
        setHoveredVenueId(null);
      });

      clusterGroup.addLayer(marker);
      markersRef.current[venue.id] = marker;
    });

  }, [mapVenues, activeRestaurant, hoveredVenueId, isClusterEnabled]);

  // 5. Fit bounds on dataset updates
  useEffect(() => {
    handleFitBounds();
  }, [venueIdsKey, handleFitBounds]);

  return (
    <div className="tavoo-map-section relative w-full h-[calc(100vh-160px)] min-h-[620px] rounded-[24px] overflow-hidden border border-[#D8CFBE] bg-[#FAF5E8] shadow-lg flex flex-col md:flex-row isolation-isolate">
      
      {/* DESKTOP & MOBILE SIDEBAR */}
      <div 
        className={`bg-[#FFFDF7] border-r border-[#D8CFBE] flex flex-col z-20 transition-all duration-300 ${
          mobileViewMode === 'list' ? 'flex w-full h-full' : 'hidden md:flex md:w-80 lg:w-[360px] h-full flex-shrink-0'
        }`}
      >
        {/* Sidebar Header with Protected Typography */}
        <div className="p-5 sm:p-6 border-b border-[#EBE5D8] bg-[#F8F2E7] flex flex-col gap-1 flex-shrink-0">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl lg:text-[28px] font-extrabold text-[#4F5328] tracking-tight leading-snug whitespace-normal break-normal">
              Места на карте
            </h2>
            <span className="px-2.5 py-1 bg-[#FFF4B8] text-[#4F5328] rounded-full text-xs font-bold border border-[#707437]/20">
              {mapVenues.length}
            </span>
          </div>

          <p className="text-sm font-medium text-[#4F5328]/75">
            Минск • {mapVenues.length} доступных заведений
          </p>

          {/* Quick Filters / Toggle Bar */}
          <div className="flex items-center gap-2 mt-3 pt-2 border-t border-[#EBE5D8]/80 text-xs font-bold text-[#4F5328]">
            <button
              onClick={() => setShowDistricts(!showDistricts)}
              className={`px-3 py-1.5 rounded-full border transition-colors flex items-center gap-1.5 cursor-pointer ${
                showDistricts
                  ? 'bg-[#FFF4B8] border-[#707437] text-[#4F5328]'
                  : 'bg-[#FFFDF7] border-[#D8CFBE] text-[#7C725F]'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Районы</span>
            </button>

            <button
              onClick={() => setIsClusterEnabled(!isClusterEnabled)}
              className={`px-3 py-1.5 rounded-full border transition-colors flex items-center gap-1.5 cursor-pointer ${
                isClusterEnabled
                  ? 'bg-[#FFF4B8] border-[#707437] text-[#4F5328]'
                  : 'bg-[#FFFDF7] border-[#D8CFBE] text-[#7C725F]'
              }`}
              title={isClusterEnabled ? 'Кластерный режим включен' : 'Показывать все цены напрямую'}
            >
              <ListFilter className="w-3.5 h-3.5" />
              <span>{isClusterEnabled ? 'Кластеры' : 'Все цены'}</span>
            </button>

            {selectedDistrictId && (
              <button
                onClick={() => setSelectedDistrictId(null)}
                className="px-2.5 py-1.5 rounded-full bg-[#A64F2C] text-white text-[11px] font-bold flex items-center gap-1 hover:bg-[#8A4B2D] transition-colors cursor-pointer"
              >
                <span>Сбросить район</span>
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>

        {/* Sidebar Venues List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 no-scrollbar">
          {invalidVenues.length > 0 && (
            <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
              <span>
                Укажите координаты для отображения на карте ({invalidVenues.length} заведений скрыто)
              </span>
            </div>
          )}

          {mapVenues.length === 0 ? (
            <div className="p-10 text-center text-xs text-[#7C725F] space-y-2">
              <UtensilsCrossed className="w-8 h-8 text-[#A64F2C]/60 mx-auto" />
              <p className="font-semibold">Нет заведений с координатами</p>
              <p className="text-[11px]">Попробуйте сбросить некоторые фильтры</p>
            </div>
          ) : (
            mapVenues.map(({ venue, coords }) => {
              const isSelected = activeRestaurant?.id === venue.id;
              const isHovered = hoveredVenueId === venue.id;
              const isSaved = isVenueSaved(venue.id, favorites);

              return (
                <div
                  key={venue.id}
                  onClick={() => {
                    setActiveRestaurant(venue);
                    if (window.innerWidth < 768) {
                      setMobileViewMode('map');
                    }
                    const map = mapInstanceRef.current;
                    if (map) {
                      map.panTo([coords.lat, coords.lng], { animate: true });
                    }
                  }}
                  onMouseEnter={() => setHoveredVenueId(venue.id)}
                  onMouseLeave={() => setHoveredVenueId(null)}
                  className={`p-3 rounded-2xl border transition-all cursor-pointer flex gap-3 ${
                    isSelected
                      ? 'bg-[#FFF4B8] border-[#A64F2C] shadow-md ring-1 ring-[#A64F2C]'
                      : isHovered
                      ? 'bg-[#F8F2E7] border-[#707437]'
                      : 'bg-[#FFFDF7] border-[#EBE5D8] hover:border-[#707437]'
                  }`}
                >
                  <img
                    src={venue.photos[0]}
                    alt={venue.name}
                    className="w-20 h-20 rounded-xl object-cover flex-shrink-0 warm-food-photo"
                  />

                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between gap-1">
                        <h3 className="text-sm font-bold text-[#211E19] truncate">
                          {venue.name}
                        </h3>
                        <span className="text-xs font-bold text-[#707437] flex-shrink-0">
                          ★ {venue.rating}
                        </span>
                      </div>
                      <p className="text-xs text-[#7C725F] truncate mt-0.5">
                        {venue.primaryCuisine || venue.type} • {venue.district || venue.city}
                      </p>
                    </div>

                    <div className="flex items-center justify-between text-xs mt-2">
                      <span className="font-bold text-[#A64F2C]">
                        ~{venue.averageCheck} BYN
                      </span>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleFavorite(venue.id, e);
                        }}
                        className="p-1 rounded-full hover:bg-black/5 text-[#707437]"
                        title={isSaved ? 'Убрать из сохраненного' : 'Добавить в сохраненное'}
                      >
                        <Heart className={`w-4 h-4 ${isSaved ? 'fill-[#A64F2C] text-[#A64F2C]' : ''}`} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* MAP CONTAINER AREA */}
      <div 
        className={`relative flex-1 h-full w-full z-10 ${
          mobileViewMode === 'list' ? 'hidden md:block' : 'block'
        }`}
      >
        <div ref={mapContainerRef} className="w-full h-full" />

        {/* Top Floating Control Bar */}
        <div className="absolute top-4 left-4 right-4 z-20 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
          {/* Mobile View Toggle */}
          <div className="pointer-events-auto md:hidden flex items-center bg-[#F7F1DC] border border-[#707437]/25 rounded-full p-1 shadow-md">
            <button
              onClick={() => setMobileViewMode('map')}
              className={`px-3 py-1 rounded-full text-xs font-bold transition-colors ${
                mobileViewMode === 'map' ? 'bg-[#707437] text-[#FFF4B8]' : 'text-[#4F5328]'
              }`}
            >
              Карта
            </button>
            <button
              onClick={() => setMobileViewMode('list')}
              className={`px-3 py-1 rounded-full text-xs font-bold transition-colors ${
                mobileViewMode === 'list' ? 'bg-[#707437] text-[#FFF4B8]' : 'text-[#4F5328]'
              }`}
            >
              Список ({mapVenues.length})
            </button>
          </div>

          {/* Desktop Location Badge */}
          <div className="hidden md:flex pointer-events-auto bg-[#F7F1DC] px-4 py-2 rounded-full border border-[#707437]/25 shadow-xs items-center gap-2 text-xs font-bold text-[#4F5328]">
            <MapPin className="w-4 h-4 text-[#A64F2C]" />
            <span>Минск • {mapVenues.length} заведений</span>
          </div>

          {/* Tavoo Styled Control Buttons */}
          <div className="pointer-events-auto flex items-center gap-2">
            <button
              onClick={handleFitBounds}
              className="px-4 py-2 bg-[#F7F1DC] hover:bg-[#FFF4B8] text-[#4F5328] border border-[#707437]/25 rounded-full text-xs font-bold shadow-xs flex items-center gap-2 transition-all cursor-pointer hover:shadow-md"
              title="Показать все заведения на карте"
            >
              <Maximize2 className="w-3.5 h-3.5 text-[#707437]" />
              <span className="hidden sm:inline">Показать все</span>
            </button>

            <button
              onClick={handleRequestLocation}
              disabled={isLocating}
              className="px-4 py-2 bg-[#F7F1DC] hover:bg-[#FFF4B8] text-[#4F5328] border border-[#707437]/25 rounded-full text-xs font-bold shadow-xs flex items-center gap-2 transition-all cursor-pointer hover:shadow-md disabled:opacity-50"
              title="Определить моё местоположение"
            >
              <Navigation className={`w-3.5 h-3.5 text-[#707437] ${isLocating ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">{isLocating ? 'Поиск...' : 'Где я'}</span>
            </button>
          </div>
        </div>

        {/* Selected Venue Floating Overlay Card */}
        {activeRestaurant && (
          <div className="absolute bottom-6 left-4 right-4 sm:left-6 sm:right-auto sm:w-96 z-30 bg-[#FFFDF7] rounded-[24px] shadow-2xl border border-[#D8CFBE] p-4 animate-in slide-in-from-bottom-4 duration-200">
            <button
              onClick={() => setActiveRestaurant(null)}
              className="absolute top-3 right-3 p-1.5 rounded-full bg-[#F8F2E7] hover:bg-[#EBE5D8] text-[#211E19] transition-colors cursor-pointer z-10"
              aria-label="Закрыть карточку"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex gap-3">
              <img
                src={activeRestaurant.photos[0]}
                alt={activeRestaurant.name}
                className="w-24 h-24 rounded-2xl object-cover flex-shrink-0 warm-food-photo"
              />

              <div className="flex flex-col justify-between flex-1 min-w-0 pr-6">
                <div>
                  <div className="flex items-center gap-2 text-xs font-bold text-[#211E19]">
                    <span className="flex items-center gap-1 bg-[#FFF4B8] text-[#4F5328] px-2 py-0.5 rounded-md text-[11px]">
                      <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                      {activeRestaurant.rating}
                    </span>
                    <span className="text-[11px] text-[#7C725F]">({activeRestaurant.reviewCount} отзывов)</span>
                  </div>

                  <h3 className="text-base font-bold text-[#211E19] truncate mt-1">
                    {activeRestaurant.name}
                  </h3>

                  <p className="text-xs text-[#7C725F] truncate mt-0.5">
                    {activeRestaurant.primaryCuisine || activeRestaurant.cuisine.join(', ')} • {activeRestaurant.district || activeRestaurant.address}
                  </p>
                </div>

                <div className="flex items-center gap-2 text-xs font-semibold text-[#211E19] mt-2">
                  <span>Средний чек:</span>
                  <span className="text-[#A64F2C] font-extrabold">{activeRestaurant.averageCheck} BYN</span>
                </div>
              </div>
            </div>

            <div className="mt-3 flex items-center gap-2 text-[11px] text-[#4F5328]">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#E4E3C8] text-[#3E411E] font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                {activeRestaurant.isOpen ? 'Открыто сейчас' : 'Закрыто'}
              </span>

              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#FFF4B8] text-[#4F5328] font-medium">
                <Clock className="w-3 h-3 text-[#707437]" />
                {activeRestaurant.workingHours || '12:00 — 23:00'}
              </span>
            </div>

            <div className="mt-3 pt-3 border-t border-[#EBE5D8] flex items-center justify-between gap-2">
              <button
                onClick={(e) => onToggleFavorite(activeRestaurant.id, e)}
                className="p-2.5 rounded-xl border border-[#D8CFBE] hover:bg-[#FFF4B8] text-[#707437] transition-colors cursor-pointer"
                title={isVenueSaved(activeRestaurant.id, favorites) ? 'Убрать из сохраненного' : 'Добавить в сохраненное'}
              >
                <Heart className={`w-4 h-4 ${isVenueSaved(activeRestaurant.id, favorites) ? 'fill-[#A64F2C] text-[#A64F2C]' : ''}`} />
              </button>

              <button
                onClick={() => onSelectRestaurant(activeRestaurant)}
                className="flex-1 py-2 px-3 bg-[#F8F2E7] hover:bg-[#FFF4B8] text-[#211E19] text-xs font-bold rounded-xl border border-[#D8CFBE] flex items-center justify-center gap-1 transition-colors cursor-pointer"
              >
                <span>Подробнее</span>
              </button>

              <button
                onClick={() => {
                  if (onBookRestaurant) {
                    onBookRestaurant(activeRestaurant);
                  } else {
                    onSelectRestaurant(activeRestaurant);
                  }
                }}
                className="flex-1 py-2 px-3 bg-[#A64F2C] hover:bg-[#8A4B2D] text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1 shadow-sm transition-colors cursor-pointer"
              >
                <span>Забронировать</span>
                <ArrowRight className="w-3.5 h-3.5 text-white" />
              </button>
            </div>
          </div>
        )}
      </div>

    </div>
  );
};
