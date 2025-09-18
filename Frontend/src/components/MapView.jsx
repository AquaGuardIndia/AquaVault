import { useEffect, useState, useRef } from "react";
import {
  MapContainer,
  TileLayer,
  Polygon,
  Popup,
  useMap,
  useMapEvents,
  ZoomControl,
  CircleMarker,
  GeoJSON,
} from "react-leaflet";
import Toast from "./Toast";
import EnhancedCityPopup from "./EnhancedCityPopup";
import { GROUNDWATER_DATA } from "../data/sightingsData";
import "leaflet/dist/leaflet.css";
import "leaflet.heat";
import { OCEAN_DATA, getLayerColor } from "../data/oceanData";
import L from "leaflet";
import district from "../data/district"; // Your geojson file
import { SIGHTINGS } from "../data/sightingsData";

// Function to get all cities with coordinates from GROUNDWATER_DATA
const getCitiesWithCoordinates = () => {
  const cities = [];

  Object.entries(GROUNDWATER_DATA).forEach(([stateName, stateData]) => {
    Object.entries(stateData).forEach(([districtName, districtData]) => {
      // Check if district has city-level data
      if (!districtData.year) {
        // District has cities
        Object.entries(districtData).forEach(([cityName, cityData]) => {
          if (cityData.latitude && cityData.longitude) {
            cities.push({
              id: `${stateName}_${districtName}_${cityName}`,
              State_Name: stateName,
              District_Name: districtName,
              City_Name: cityName,
              Latitude: parseFloat(cityData.latitude),
              Longitude: parseFloat(cityData.longitude),
              color: cityData.color || "#64B5F6",
              data: cityData,
            });
          }
        });
      } else {
        // District has direct data, check if it has coordinates
        if (districtData.latitude && districtData.longitude) {
          cities.push({
            id: `${stateName}_${districtName}`,
            State_Name: stateName,
            District_Name: districtName,
            City_Name: districtName, // Use district name as city name
            Latitude: parseFloat(districtData.latitude),
            Longitude: parseFloat(districtData.longitude),
            color: districtData.color || "#64B5F6",
            data: districtData,
          });
        }
      }
    });
  });

  return cities;
};
function ZoomToLocation({ lat, lng, zoom }) {
  const map = useMap();

  // Trigger zoom when component is rendered or props change
  useEffect(() => {
    if (lat && lng) {
      map.setView([lat, lng], zoom); // Or map.flyTo([lat, lng], zoom)
    }
  }, [lat, lng, zoom, map]);

  return null;
}
// Function to calculate groundwater assessment category
const getGroundwaterCategory = (data) => {
  if (!data || !data.groundWaterExtraction) return "No Data";

  // Use existing category if available
  if (data.category) {
    return data.category.charAt(0).toUpperCase() + data.category.slice(1);
  }

  const annualExtractable =
    data.annualExtractable || data.annualExtractableResources || 0;
  if (annualExtractable === 0) return "No Data";

  const extractionRatio = data.groundWaterExtraction / annualExtractable;

  // Classification based on extraction ratio
  if (extractionRatio > 1.0) return "Over Exploited";
  if (extractionRatio > 0.9) return "Critical";
  if (extractionRatio > 0.7) return "Semi Critical";
  if (data.rainfall < 700) return "Saline"; // Low rainfall areas tend to have saline issues
  return "Safe";
};

// Function to get color based on groundwater category
const getCategoryColor = (category) => {
  const colors = {
    Safe: "#22c55e", // Green
    "Semi-critical": "#3b82f6", // Blue
    "Semi Critical": "#3b82f6", // Blue
    Critical: "#eab308", // Yellow
    "Over Exploited": "#ef4444", // Red
    Saline: "#059669", // Dark Green
    "Hilly Area": "#6b7280", // Gray
    "No Data": "#d1d5db", // Light Gray
  };
  return colors[category] || colors["No Data"];
};

const LightTiles = () => (
  <TileLayer
    attribution=""
    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
    noWrap={false}
    continuousWorld={true}
  />
);
function ResetView({ triggerReset, defaultCenter, defaultZoom }) {
  const map = useMap();
  useEffect(() => {
    if (triggerReset) {
      map.setView(defaultCenter, defaultZoom);
    }
  }, [triggerReset, map, defaultCenter, defaultZoom]);
  return null;
}

function HeatmapLayer({ data, layerType }) {
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

function MapWatcher({
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

function getDistrictColor(state, district) {
  const data = GROUNDWATER_DATA[state] && GROUNDWATER_DATA[state][district];
  if (!data) return "#d1d5db"; // No Data

  const category = getGroundwaterCategory(data);
  return getCategoryColor(category);
}

function getDistrictPopup(state, district) {
  const data = GROUNDWATER_DATA[state] && GROUNDWATER_DATA[state][district];
  if (!data) return `${district}, ${state}<br/>No Data`;

  const category = getGroundwaterCategory(data);
  const annualExtractable =
    data.annualExtractable || data.annualExtractableResources || 0;

  return `
    <div>
      <strong>${district}</strong> (${state})<br/>
      Rainfall: ${data.rainfall || "N/A"} mm<br/>
      Annual Extractable: ${annualExtractable} MCM<br/>
      Extraction: ${data.groundWaterExtraction || "N/A"} MCM<br/>
      Category: ${category}
    </div>
  `;
}

export default function MapView({
  markers,
  currentData,
  selectedCity,
  onResetMarkers,
  triggerReset,
  selectedRegionBounds,
  activeLayer,
}) {
  
  // Default center and zoom for India
  const defaultCenter = [20.5937, 78.9629];
  const defaultZoom = 5;

  // State for dynamic center/zoom
  const [mapCenter, setMapCenter] = useState(defaultCenter);
  const [mapZoom, setMapZoom] = useState(defaultZoom);
  
  useEffect(() => {
    // Only zoom if selectedCity is valid and has coordinates
    if (
      selectedCity &&
      typeof selectedCity.Latitude === "number" &&
      typeof selectedCity.Longitude === "number" &&
      !isNaN(selectedCity.Latitude) &&
      !isNaN(selectedCity.Longitude)
    ) {
      setMapCenter([selectedCity.Latitude, selectedCity.Longitude]);
      setMapZoom(8); // City-level zoom
    } else {
      setMapCenter(defaultCenter);
      setMapZoom(defaultZoom);
    }
  }, [selectedCity]);

  const [showWarning, setShowWarning] = useState(false);
  const [showResetButton, setShowResetButton] = useState(false);
  const isResetting = useRef(false);
  const defaultMarkers = SIGHTINGS.map((s) => ({
    id: s.id,
    State_Name: s.State_Name,
    District_Name: s.District_Name,
    City_Name: s.Station_Name,
    Latitude: s.Latitude,
    Longitude: s.Longitude,
    color: s.color || "#64B5F6",
    data: s,
  }));

  const allCityMarkers = getCitiesWithCoordinates();

  markers = selectedCity
    ? allCityMarkers.filter(
        (city) =>
          city.State_Name === selectedCity.State_Name &&
          city.District_Name === selectedCity.District_Name &&
          (selectedCity.City_Name
            ? city.City_Name === selectedCity.City_Name
            : true)
      )
    : [];

  useEffect(() => {
    if (activeLayer !== "none" && markers.length === 0) {
      setShowWarning(true);
      const timer = setTimeout(() => {
        setShowWarning(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [activeLayer, markers.length]);

  const visibleRegions = markers.reduce((acc, marker) => {
    if (OCEAN_DATA[marker.regionKey]) {
      acc[marker.regionKey] = OCEAN_DATA[marker.regionKey];
    }
    return acc;
  }, {});

  function FloatingPanel() {
    if (!showResetButton) return null;
    return (
      <div
        style={{
          position: "absolute",
          top: "20px",
          right: "20px",
          zIndex: 1000,
        }}
      >
        <button
          onClick={() => {
            setShowResetButton(false);
            isResetting.current = true;
            onResetMarkers();
            setTimeout(() => {
              isResetting.current = false;
            }, 1000);
          }}
          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md shadow-md"
        >
          RESET VIEW
        </button>
      </div>
    );
  }

  // If no city is selected, show CircleMarkers for all districts from SIGHTINGS
  const showDefaultMarkers =
    !selectedCity || !selectedCity.Latitude || !selectedCity.Longitude;

  return (
    <div className="relative h-full w-full">
      {showWarning && (
        <Toast
          message="No city coordinates available for the selected area"
          onClose={() => setShowWarning(false)}
        />
      )}
      <MapContainer
        center={mapCenter}
        zoom={mapZoom}
        zoomControl={false}
        className="h-full w-full"
        style={{ height: "100%", width: "100%" }}
        maxBoundsViscosity={1.0}
        worldCopyJump={true}
        key={mapCenter.join(",") + mapZoom} // Force re-render on center/zoom change
      >
        <LightTiles />
        <FloatingPanel />
        {currentData &&(<ZoomToLocation lat={currentData.latitude} lng={currentData.longitude} zoom={12} />)}
        <HeatmapLayer data={visibleRegions} layerType={activeLayer} />
        <ResetView
          triggerReset={triggerReset}
          defaultCenter={defaultCenter}
          defaultZoom={defaultZoom}
        />
        <MapWatcher
          defaultCenter={defaultCenter}
          defaultZoom={defaultZoom}
          setShowResetButton={setShowResetButton}
          isResetting={isResetting}
        />

        {/* Show CircleMarkers for all districts when no city is selected */}
        {showDefaultMarkers &&
          defaultMarkers.map((district, idx) => (
            <CircleMarker
              key={district.id}
              center={[district.Latitude, district.Longitude]}
              radius={8}
              pathOptions={{
                color: "#333",
                fillColor: district.color,
                fillOpacity: 0.85,
                weight: 2,
              }}
            >
              <Popup>
                <div>
                  <div className="font-semibold">{district.City_Name}</div>
                  <div className="text-xs text-gray-600">
                    {district.District_Name}, {district.State_Name}
                  </div>
                  <div className="mt-2 text-[11px] opacity-60">
                    Lat {district.Latitude}, Lng {district.Longitude}
                  </div>
                </div>
              </Popup>
            </CircleMarker>
          ))}

        {/* Existing city polygons when a city is selected */}
        {markers &&
          markers.length > 0 &&
          markers.map((city, idx) => {
            const category = getGroundwaterCategory(city.data);
            const categoryColor = getCategoryColor(category);

            // Create city polygon
            const regionPoints = [];
            const baseRadius = 0.02;
            const sides = 8;
            for (let i = 0; i < sides; i++) {
              const angle = (i * 2 * Math.PI) / sides;
              const radiusVariation = baseRadius * (0.8 + 0.4 * Math.random());
              const lat = city.Latitude + radiusVariation * Math.cos(angle);
              const lng = city.Longitude + radiusVariation * Math.sin(angle);
              regionPoints.push([lat, lng]);
            }

            return (
              <Polygon
                key={`${city.id}-${idx}`}
                positions={regionPoints}
                pathOptions={{
                  color: "#000",
                  fillColor: categoryColor,
                  fillOpacity: 0.8,
                  weight: 2,
                  opacity: 0.8,
                }}
              >
                <Popup minWidth={280} maxWidth={320}>
                  <EnhancedCityPopup city={city} />
                </Popup>
              </Polygon>
            );
          })}
      </MapContainer>
    </div>
  );
}
