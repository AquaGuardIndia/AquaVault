import { GROUNDWATER_DATA, SIGHTINGS } from "../data/sightingsData";

export const getAvailableStates = () => {
  return [...new Set(SIGHTINGS.map((s) => s.State_Name))].sort();
};

export const getAvailableDistricts = (selectedState) => {
  if (!selectedState) return [];
  return [
    ...new Set(
      SIGHTINGS.filter((s) => s.State_Name === selectedState).map(
        (s) => s.District_Name
      )
    ),
  ].sort();
};

export const getAvailableCities = (selectedState, selectedDistrict) => {
  if (!selectedState || !selectedDistrict) return [];

  const stateData = GROUNDWATER_DATA[selectedState];
  if (!stateData) return [];

  const districtData = stateData[selectedDistrict];
  if (!districtData) return [];

  if (districtData.year) {
    return []; // Direct district data, no cities
  }

  return Object.keys(districtData)
    .sort()
    .filter((city) => city === String(city).toUpperCase());
};

export const getCurrentData = (state, district, city) => {
  if (!state || !district) return null;

  const stateData = GROUNDWATER_DATA[state];
  if (!stateData) return null;

  const districtData = stateData[district];
  if (!districtData) return null;

  if (city && districtData[city]) {
    return districtData[city]; // City data
  }

  if (!city && districtData.year) {
    return districtData; // District-level data
  }

  return null;
};

export const handleStateChange = (state, onSelect) => {
  const station = SIGHTINGS.find((s) => s.State_Name === state) || null;
  if (onSelect) onSelect(station);

  return {
    selectedState: state,
    selectedDistrict: "",
    selectedCity: "",
  };
};

export const handleDistrictChange = (state, district, onSelect) => {
  const station =
    SIGHTINGS.find(
      (s) => s.State_Name === state && s.District_Name === district
    ) || null;
  if (onSelect) onSelect(station);

  return {
    selectedDistrict: district,
    selectedCity: "",
  };
};

export const handleCityChange = (state, district, city, onSelect) => {
  // City data exists only in GROUNDWATER_DATA, so we still link via district
  const station =
    SIGHTINGS.find(
      (s) => s.State_Name === state && s.District_Name === district
    ) || null;
  if (onSelect) onSelect(station);

  return { selectedCity: city };
};
