import { useEffect } from "react";
import { TileLayer, useMap, useMapEvents } from "react-leaflet";

export const LightTiles = () => (
  <TileLayer
    attribution=""
    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
    noWrap={false}
    continuousWorld={true}
  />
);
export function ZoomToLocation({ lat, lng, zoom }) {
  const map = useMap();

  // Trigger zoom when component is rendered or props change
  useEffect(() => {
    if (lat && lng) {
      map.flyTo([lat, lng], zoom); // Or map.flyTo([lat, lng], zoom)
    }
  }, [lat, lng, zoom, map]);

  return null;
}
export function ResetView({ triggerReset, defaultCenter, defaultZoom }) {
  const map = useMap();
  useEffect(() => {
    if (triggerReset) {
      map.setView(defaultCenter, defaultZoom);
    }
  }, [triggerReset, map, defaultCenter, defaultZoom]);
  return null;
}
export function MapWatcher({
  defaultCenter,
  defaultZoom,
  setShowResetButton,
  isResetting,
}) {
  useMapEvents({
    moveend(e) {
      if (isResetting.current) return;

      const map = e.target;
      const center = map.getCenter();
      const zoom = map.getZoom();

      if (
        Math.abs(center.lat - defaultCenter[0]) > 0.001 ||
        Math.abs(center.lng - defaultCenter[1]) > 0.001 ||
        zoom !== defaultZoom
      ) {
        setShowResetButton(true);
      } else {
        setShowResetButton(false);
      }
    },
  });
  return null;
}