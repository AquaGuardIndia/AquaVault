import { GROUNDWATER_DATA } from "../data/sightingsData";
export const getCitiesWithCoordinates = () => {
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
export const getGroundwaterCategory = (data) => {
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
export const getCategoryColor = (category) => {
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
}