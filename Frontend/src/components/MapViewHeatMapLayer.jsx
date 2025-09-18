import { useEffect } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet.heat";
import { getLayerColor } from "../data/oceanData";

export default function HeatmapLayer({ data, layerType }) {
  const map = useMap();

  useEffect(() => {
    if (
      !data ||
      !layerType ||
      layerType === "none" ||
      Object.keys(data).length === 0
    ) {
      return;
    }

    try {
      const points = [];
      Object.values(data).forEach((region) => {
        if (region[layerType]) {
          points.push(
            ...region[layerType].points.map((p) => ({
              lat: p.lat,
              lng: p.lng,
              value: p.value,
            }))
          );
        }
      });

      if (points.length === 0) return;

      const heatLayer = L.heatLayer(
        points.map((p) => [p.lat, p.lng, p.value]),
        {
          radius: 35,
          blur: 25,
          maxZoom: 8,
          minOpacity: 0.4,
          max: Math.max(...points.map((p) => p.value)),
          gradient: {
            0.2: getLayerColor(points[0].value, layerType),
            0.5: getLayerColor(
              points[Math.floor(points.length / 2)].value,
              layerType
            ),
            0.8: getLayerColor(points[points.length - 1].value, layerType),
          },
        }
      ).addTo(map);

      return () => {
        map.removeLayer(heatLayer);
      };
    } catch (error) {
      console.error("Error rendering heatmap:", error);
    }
  }, [map, data, layerType]);

  return null;
}