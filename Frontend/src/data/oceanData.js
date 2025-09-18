// Mock oceanographic data for regions
export const OCEAN_DATA = {
  west_bengal: {
    temperature: {
      min: 26,
      max: 29,
      points: [
        { lat: 21.8, lng: 87.75, value: 28 },
        { lat: 21.2, lng: 88.0, value: 27.5 },
        { lat: 22.0, lng: 88.5, value: 26.8 },
      ],
    },
    salinity: {
      min: 32,
      max: 35,
      points: [
        { lat: 21.8, lng: 87.75, value: 33.5 },
        { lat: 21.2, lng: 88.0, value: 34.2 },
        { lat: 22.0, lng: 88.5, value: 32.8 },
      ],
    },
    ph: {
      min: 7.8,
      max: 8.4,
      points: [
        { lat: 21.8, lng: 87.75, value: 8.1 },
        { lat: 21.2, lng: 88.0, value: 8.2 },
        { lat: 22.0, lng: 88.5, value: 7.9 },
      ],
    },
  },
  goa: {
    temperature: {
      min: 27,
      max: 30,
      points: [
        { lat: 15.3, lng: 74.0, value: 29 },
        { lat: 15.5, lng: 73.8, value: 28.5 },
        { lat: 15.1, lng: 73.9, value: 27.8 },
      ],
    },
    salinity: {
      min: 33,
      max: 36,
      points: [
        { lat: 15.3, lng: 74.0, value: 34.5 },
        { lat: 15.5, lng: 73.8, value: 35.2 },
        { lat: 15.1, lng: 73.9, value: 33.8 },
      ],
    },
    ph: {
      min: 7.9,
      max: 8.3,
      points: [
        { lat: 15.3, lng: 74.0, value: 8.0 },
        { lat: 15.5, lng: 73.8, value: 8.2 },
        { lat: 15.1, lng: 73.9, value: 7.9 },
      ],
    },
  },
  mumbai: {
    temperature: {
      min: 27,
      max: 31,
      points: [
        { lat: 19.2, lng: 73.0, value: 29.5 },
        { lat: 19.0, lng: 72.8, value: 30 },
        { lat: 18.8, lng: 72.9, value: 28.5 },
      ],
    },
    salinity: {
      min: 33,
      max: 36,
      points: [
        { lat: 19.2, lng: 73.0, value: 34.8 },
        { lat: 19.0, lng: 72.8, value: 35.5 },
        { lat: 18.8, lng: 72.9, value: 33.9 },
      ],
    },
    ph: {
      min: 7.8,
      max: 8.4,
      points: [
        { lat: 19.2, lng: 73.0, value: 8.1 },
        { lat: 19.0, lng: 72.8, value: 8.3 },
        { lat: 18.8, lng: 72.9, value: 7.9 },
      ],
    },
  },
  andaman: {
    temperature: {
      min: 28,
      max: 32,
      points: [
        { lat: 10.0, lng: 93.2, value: 30 },
        { lat: 11.5, lng: 92.8, value: 31 },
        { lat: 9.5, lng: 93.5, value: 29.5 },
      ],
    },
    salinity: {
      min: 32,
      max: 35,
      points: [
        { lat: 10.0, lng: 93.2, value: 33.5 },
        { lat: 11.5, lng: 92.8, value: 34.2 },
        { lat: 9.5, lng: 93.5, value: 32.8 },
      ],
    },
    ph: {
      min: 7.9,
      max: 8.3,
      points: [
        { lat: 10.0, lng: 93.2, value: 8.1 },
        { lat: 11.5, lng: 92.8, value: 8.2 },
        { lat: 9.5, lng: 93.5, value: 8.0 },
      ],
    },
  },
  lakshadweep: {
    temperature: {
      min: 28,
      max: 31,
      points: [
        { lat: 10.2, lng: 73.0, value: 29.5 },
        { lat: 10.8, lng: 73.5, value: 30 },
        { lat: 9.8, lng: 72.8, value: 28.8 },
      ],
    },
    salinity: {
      min: 34,
      max: 36,
      points: [
        { lat: 10.2, lng: 73.0, value: 35 },
        { lat: 10.8, lng: 73.5, value: 35.5 },
        { lat: 9.8, lng: 72.8, value: 34.2 },
      ],
    },
    ph: {
      min: 7.9,
      max: 8.4,
      points: [
        { lat: 10.2, lng: 73.0, value: 8.2 },
        { lat: 10.8, lng: 73.5, value: 8.3 },
        { lat: 9.8, lng: 72.8, value: 8.0 },
      ],
    },
  },
};

// Helper function to get color based on value and parameter type
export function getLayerColor(value, type) {
  const colors = {
    temperature: [
      { threshold: 26, color: "#313695" },
      { threshold: 27, color: "#4575b4" },
      { threshold: 28, color: "#74add1" },
      { threshold: 29, color: "#abd9e9" },
      { threshold: 30, color: "#fdae61" },
      { threshold: 31, color: "#f46d43" },
      { threshold: 32, color: "#d73027" },
    ],
    salinity: [
      { threshold: 32, color: "#2c7bb6" },
      { threshold: 33, color: "#abd9e9" },
      { threshold: 34, color: "#ffffbf" },
      { threshold: 35, color: "#fdae61" },
      { threshold: 36, color: "#d7191c" },
    ],
    ph: [
      { threshold: 7.8, color: "#d73027" },
      { threshold: 7.9, color: "#f46d43" },
      { threshold: 8.0, color: "#fdae61" },
      { threshold: 8.1, color: "#fee090" },
      { threshold: 8.2, color: "#e0f3f8" },
      { threshold: 8.3, color: "#abd9e9" },
      { threshold: 8.4, color: "#74add1" },
    ],
  };

  const scale = colors[type];
  for (let i = scale.length - 1; i >= 0; i--) {
    if (value >= scale[i].threshold) {
      return scale[i].color;
    }
  }
  return scale[0].color;
}
