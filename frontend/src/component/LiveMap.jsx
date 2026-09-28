import { useEffect, useRef } from "react";
import axios from "axios";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

const vehicleIcons = {
  bike: "🏍️",
  motorcycle: "🏍️",
  auto: "🛺",
  car: "🚕",
  economy: "🚗",
  premium: "🚘",
};

function getVehicleIcon(vehicleType) {
  return vehicleIcons[String(vehicleType || "car").toLowerCase()] || "🚕";
}

function createMarkerElement(vehicleType, kind) {
  const element = document.createElement("div");
  element.className = `live-map-marker live-map-marker-${kind}`;
  element.textContent = kind === "captain" ? getVehicleIcon(vehicleType) : kind === "pickup" ? "●" : "■";
  element.setAttribute("aria-label", kind === "captain" ? "Captain location" : kind);
  return element;
}

function toLngLat(coordinates) {
  if (!coordinates) return null;
  const latitude = Number(coordinates.latitude ?? coordinates.ltd);
  const longitude = Number(coordinates.longitude ?? coordinates.log);
  return Number.isFinite(longitude) && Number.isFinite(latitude) ? [longitude, latitude] : null;
}

function LiveMap({
  pickup,
  destination,
  captainLocation,
  route,
  vehicleType,
  className = "",
  onEtaChange,
}) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const captainMarkerRef = useRef(null);
  const endpointMarkersRef = useRef([]);
  const lastCaptainPointRef = useRef(null);
  const routeRef = useRef(route);
  const token = import.meta.env.VITE_MAPBOX_TOKEN || import.meta.env.VITE_MAPBOX_API;

  useEffect(() => {
    routeRef.current = route;
    const map = mapRef.current;
    if (!map || !route) return;
    const source = map.getSource("live-route");
    if (source) source.setData(route);
  }, [route]);

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
      map.addSource("live-route", {
        type: "geojson",
        data: routeRef.current || { type: "FeatureCollection", features: [] },
      });
      map.addLayer({
        id: "live-route-casing",
        type: "line",
        source: "live-route",
        paint: { "line-color": "#ffffff", "line-width": 7, "line-opacity": 0.85 },
      });
      map.addLayer({
        id: "live-route-line",
        type: "line",
        source: "live-route",
        paint: { "line-color": "#0f766e", "line-width": 4, "line-opacity": 0.95 },
      });
    });
    mapRef.current = map;

    return () => {
      endpointMarkersRef.current.forEach((marker) => marker.remove());
      captainMarkerRef.current?.remove();
      map.remove();
      mapRef.current = null;
    };
  }, [token]);

  useEffect(() => {
    if (!token || !mapRef.current || (!pickup && !destination)) return undefined;
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
      if (cancelled || !mapRef.current) return;

      endpointMarkersRef.current.forEach((marker) => marker.remove());
      endpointMarkersRef.current = [];
      const bounds = new mapboxgl.LngLatBounds();
      results.forEach((coordinates, index) => {
        const point = toLngLat(coordinates);
        if (!point) return;
        const marker = new mapboxgl.Marker(createMarkerElement(index === 0 ? "pickup" : "destination", index === 0 ? "pickup" : "destination"))
          .setLngLat(point)
          .addTo(mapRef.current);
        endpointMarkersRef.current.push(marker);
        bounds.extend(point);
      });
      const captainPoint = toLngLat(lastCaptainPointRef.current);
      if (captainPoint) bounds.extend(captainPoint);
      if (!bounds.isEmpty()) mapRef.current.fitBounds(bounds, { padding: 80, maxZoom: 15, duration: 700 });
    };

    loadEndpoints();
    return () => { cancelled = true; };
  }, [pickup, destination, token]);

  useEffect(() => {
    const map = mapRef.current;
    const point = toLngLat(captainLocation);
    if (!map || !point) return;
    lastCaptainPointRef.current = captainLocation;

    if (!captainMarkerRef.current) {
      captainMarkerRef.current = new mapboxgl.Marker(createMarkerElement(vehicleType, "captain"))
        .setLngLat(point)
        .addTo(map);
    } else {
      const marker = captainMarkerRef.current;
      const start = marker.getLngLat();
      const startedAt = performance.now();
      const duration = 650;
      const animate = (timestamp) => {
        const progress = Math.min(1, (timestamp - startedAt) / duration);
        marker.setLngLat([
          start.lng + (point[0] - start.lng) * progress,
          start.lat + (point[1] - start.lat) * progress,
        ]);
        if (progress < 1) requestAnimationFrame(animate);
      };
      requestAnimationFrame(animate);
    }
    map.easeTo({ center: point, duration: 650, essential: true });
    if (onEtaChange) onEtaChange();
  }, [captainLocation, vehicleType, onEtaChange]);

  if (!token) {
    return <div className={`flex h-full items-center justify-center bg-slate-200 p-6 text-center text-sm font-semibold text-slate-600 ${className}`}>Mapbox is not configured. Set VITE_MAPBOX_TOKEN to enable live maps.</div>;
  }

  return <div ref={containerRef} className={`h-full w-full ${className}`} />;
}

export default LiveMap;
