import { Component, useEffect, useRef, useState } from "react";
import axios from "axios";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

function updateMarkerElement(element, vehicleType, kind, bearing = 0) {
  if (!element) return;
  element.className = `live-map-marker live-map-marker-${kind}`;
  if (kind === "captain") {
    let vehicle = element.querySelector(".live-map-marker-vehicle");
    if (!vehicle) {
      vehicle = document.createElement("span");
      vehicle.className = "live-map-marker-vehicle";
      vehicle.innerHTML = '<svg viewBox="0 0 32 52" aria-hidden="true"><path d="M10.3 3.8C11 2 12.3 1 14.2 1h3.6c1.9 0 3.2 1 3.9 2.8l3.9 10.1c.6 1.6.9 3.2.9 4.9v21.9c0 3-2.4 5.3-5.3 5.3H10.8c-2.9 0-5.3-2.3-5.3-5.3V20.8c0-1.7.3-3.3.9-4.9L10.3 3.8Z"/><path class="live-map-marker-window" d="M10.2 12.8h11.6l-1.9-6.1c-.2-.6-.8-1-1.4-1h-5c-.6 0-1.2.4-1.4 1l-1.9 6.1Z"/><path class="live-map-marker-light" d="M9.2 18.2h13.6v5.1H9.2z"/><circle cx="8.8" cy="39.4" r="2.1"/><circle cx="23.2" cy="39.4" r="2.1"/></svg>';
      element.appendChild(vehicle);
    }
    vehicle.dataset.vehicleType = String(vehicleType || "car").toLowerCase();
    vehicle.style.transform = `rotate(${bearing}deg)`;
  } else {
    element.textContent = kind === "pickup" ? "●" : "■";
  }
  element.setAttribute("aria-label", kind === "captain" ? "Captain location" : kind);
}

function createMarkerElement(vehicleType, kind, bearing = 0) {
  const element = document.createElement("div");
  updateMarkerElement(element, vehicleType, kind, bearing);
  return element;
}

function toLngLat(coordinates) {
  if (!coordinates) return null;
  const latitude = Number(coordinates.latitude ?? coordinates.ltd);
  const longitude = Number(coordinates.longitude ?? coordinates.log);
  return Number.isFinite(longitude) && Number.isFinite(latitude) ? [longitude, latitude] : null;
}

function toRouteData(route) {
  if (route?.type === "FeatureCollection" && Array.isArray(route.features)) return route;
  if (route?.type === "Feature" && route.geometry) return route;
  if (route?.geometry?.type && Array.isArray(route.geometry.coordinates)) {
    return { type: "Feature", properties: {}, geometry: route.geometry };
  }
  return { type: "FeatureCollection", features: [] };
}

function getBearing(location, point, previousPoint, fallback) {
  const explicitBearing = Number(location?.heading ?? location?.bearing);
  if (Number.isFinite(explicitBearing)) return explicitBearing;
  if (!previousPoint) return fallback;

  const [previousLongitude, previousLatitude] = previousPoint;
  const [longitude, latitude] = point;
  const longitudeDelta = (longitude - previousLongitude) * Math.PI / 180;
  const latitude1 = previousLatitude * Math.PI / 180;
  const latitude2 = latitude * Math.PI / 180;
  const y = Math.sin(longitudeDelta) * Math.cos(latitude2);
  const x = Math.cos(latitude1) * Math.sin(latitude2)
    - Math.sin(latitude1) * Math.cos(latitude2) * Math.cos(longitudeDelta);
  return Math.abs(x) > Number.EPSILON || Math.abs(y) > Number.EPSILON
    ? (Math.atan2(y, x) * 180 / Math.PI + 360) % 360
    : fallback;
}

function fitMapToMarkers(map, endpointPoints, captainPoint) {
  const points = [...endpointPoints, captainPoint].filter(Boolean);
  if (points.length === 0 || !map?.fitBounds) return;
  const bounds = new mapboxgl.LngLatBounds();
  points.forEach((point) => bounds.extend(point));
  map.fitBounds(bounds, { padding: 80, maxZoom: 15, duration: 500 });
}

class MapErrorBoundary extends Component {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return <div className="flex h-full items-center justify-center bg-slate-200 p-6 text-center text-sm font-semibold text-slate-600">The live map is temporarily unavailable.</div>;
    }
    return this.props.children;
  }
}

function LiveMapContent({
  pickup,
  destination,
  captainLocation,
  route,
  vehicleType,
  followCaptain = false,
  className = "",
  onEtaChange,
}) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const captainMarkerRef = useRef(null);
  const endpointMarkersRef = useRef([]);
  const lastCaptainPointRef = useRef(null);
  const animationFrameRef = useRef(null);
  const animationTargetRef = useRef(null);
  const lastPointRef = useRef(null);
  const bearingRef = useRef(0);
  const endpointPointsRef = useRef([]);
  const fitBoundsTimeoutRef = useRef(null);
  const mapLoadedRef = useRef(false);
  const [mapReady, setMapReady] = useState(false);
  const routeRef = useRef(route);
  const token = import.meta.env.VITE_MAPBOX_TOKEN || import.meta.env.VITE_MAPBOX_API;

  useEffect(() => {
    routeRef.current = route;
    const map = mapRef.current;
    if (!map || !mapLoadedRef.current) return;
    const source = map.getSource?.("live-route");
    if (source?.setData) source.setData(toRouteData(route));
  }, [route, mapReady]);

  useEffect(() => {
    if (!token || !containerRef.current || mapRef.current) return undefined;

    mapboxgl.accessToken = token;
    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: [78.9629, 20.5937],
      zoom: 4,
      attributionControl: false,
    });
    map.addControl(new mapboxgl.NavigationControl(), "top-right");
    map.on("load", () => {
      if (mapRef.current !== map) return;
      mapLoadedRef.current = true;
      if (!map.getSource?.("live-route")) map.addSource("live-route", {
        type: "geojson",
        data: toRouteData(routeRef.current),
      });
      if (!map.getLayer?.("live-route-casing")) map.addLayer({
        id: "live-route-casing",
        type: "line",
        source: "live-route",
        paint: { "line-color": "#ffffff", "line-width": 10, "line-opacity": 0.95 },
      });
      if (!map.getLayer?.("live-route-line")) map.addLayer({
        id: "live-route-line",
        type: "line",
        source: "live-route",
        paint: { "line-color": "#111827", "line-width": 6, "line-opacity": 1 },
      });
      setMapReady(true);
    });
    mapRef.current = map;

    return () => {
      endpointMarkersRef.current.forEach((marker) => marker.remove());
      captainMarkerRef.current?.remove();
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      if (fitBoundsTimeoutRef.current) clearTimeout(fitBoundsTimeoutRef.current);
      endpointPointsRef.current = [];
      mapLoadedRef.current = false;
      setMapReady(false);
      if (mapRef.current === map) map.remove();
      mapRef.current = null;
    };
  }, [token]);

  useEffect(() => {
    if (!token || !mapReady || !mapRef.current || (!pickup && !destination)) return undefined;
    let cancelled = false;

    const loadEndpoints = async () => {
      const addresses = [pickup, destination].filter(Boolean);
      const results = await Promise.all(addresses.map(async (address) => {
        try {
          const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/maps/getCoordinates`, {
            params: { address },
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
          });
          return response.data;
        } catch {
          return null;
        }
      }));
      const map = mapRef.current;
      if (cancelled || !map || !mapLoadedRef.current) return;

      endpointMarkersRef.current.forEach((marker) => marker.remove());
      endpointMarkersRef.current = [];
      const endpointPoints = [];
      results.forEach((coordinates, index) => {
        const point = toLngLat(coordinates);
        if (!point) return;
        const marker = new mapboxgl.Marker(createMarkerElement(index === 0 ? "pickup" : "destination", index === 0 ? "pickup" : "destination"))
          .setLngLat(point)
          .addTo(map);
        endpointMarkersRef.current.push(marker);
        endpointPoints.push(point);
      });
      endpointPointsRef.current = endpointPoints;
      const captainPoint = toLngLat(lastCaptainPointRef.current);
      fitMapToMarkers(map, endpointPoints, captainPoint);
    };

    loadEndpoints();
    return () => { cancelled = true; };
  }, [pickup, destination, token, mapReady]);

  useEffect(() => {
    const map = mapRef.current;
    const point = toLngLat(captainLocation);
    if (!map || !mapLoadedRef.current || !mapReady) return;
    if (!point) {
      captainMarkerRef.current?.remove();
      captainMarkerRef.current = null;
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
      animationTargetRef.current = null;
      lastPointRef.current = null;
      return;
    }
    lastCaptainPointRef.current = captainLocation;
    bearingRef.current = getBearing(captainLocation, point, lastPointRef.current, bearingRef.current);
    lastPointRef.current = point;

    if (followCaptain && endpointPointsRef.current.length > 0) {
      if (fitBoundsTimeoutRef.current) clearTimeout(fitBoundsTimeoutRef.current);
      fitBoundsTimeoutRef.current = setTimeout(() => {
        if (mapRef.current === map && mapLoadedRef.current) {
          fitMapToMarkers(map, endpointPointsRef.current, point);
        }
        fitBoundsTimeoutRef.current = null;
      }, 150);
    }

    if (!captainMarkerRef.current) {
      captainMarkerRef.current = new mapboxgl.Marker(createMarkerElement(vehicleType, "captain", bearingRef.current))
        .setLngLat(point)
        .addTo(map);
    } else {
      const marker = captainMarkerRef.current;
      updateMarkerElement(marker.getElement?.(), vehicleType, "captain", bearingRef.current);
      animationTargetRef.current = point;
      if (!animationFrameRef.current) {
        const startedAt = performance.now();
        const start = marker.getLngLat();
        const duration = 1000;
        const animate = (timestamp) => {
          const target = animationTargetRef.current || point;
          const progress = Math.min(1, (timestamp - startedAt) / duration);
          const easedProgress = 1 - ((1 - progress) ** 3);
          marker.setLngLat([
            start.lng + (target[0] - start.lng) * easedProgress,
            start.lat + (target[1] - start.lat) * easedProgress,
          ]);
          if (progress < 1) {
            animationFrameRef.current = requestAnimationFrame(animate);
          } else {
            animationFrameRef.current = null;
            const finalTarget = animationTargetRef.current;
            if (finalTarget && (finalTarget[0] !== target[0] || finalTarget[1] !== target[1])) {
              const current = marker.getLngLat();
              const nextStartedAt = performance.now();
              const animateNext = (nextTimestamp) => {
                const nextProgress = Math.min(1, (nextTimestamp - nextStartedAt) / duration);
                const nextEasedProgress = 1 - ((1 - nextProgress) ** 3);
                marker.setLngLat([
                  current.lng + (finalTarget[0] - current.lng) * nextEasedProgress,
                  current.lat + (finalTarget[1] - current.lat) * nextEasedProgress,
                ]);
                if (nextProgress < 1) {
                  animationFrameRef.current = requestAnimationFrame(animateNext);
                } else {
                  animationFrameRef.current = null;
                }
              };
              animationFrameRef.current = requestAnimationFrame(animateNext);
            }
          }
        };
        animationFrameRef.current = requestAnimationFrame(animate);
      }
    }
    if (onEtaChange) onEtaChange();
  }, [captainLocation, vehicleType, followCaptain, onEtaChange, mapReady]);

  if (!token) {
    return <div className={`flex h-full items-center justify-center bg-slate-200 p-6 text-center text-sm font-semibold text-slate-600 ${className}`}>Mapbox is not configured. Set VITE_MAPBOX_TOKEN to enable live maps.</div>;
  }

  return <div ref={containerRef} className={`live-map h-full w-full ${className}`} />;
}

function LiveMap(props) {
  return <MapErrorBoundary><LiveMapContent {...props} /></MapErrorBoundary>;
}

export default LiveMap;
