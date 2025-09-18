# 🌊 AQUAVAULT

Interactive groundwater mapping and visualization platform built with React, Vite, and Tailwind CSS.

![React](https://img.shields.io/badge/React-61DAFB?style=flat-square&logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=flat-square&logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white)

## 🎯 Project Overview

AQUAVAULT is a comprehensive groundwater monitoring platform that enables assessment of water resources through multiple methods: well data analysis, quality testing, and remote sensing. This frontend application provides an intuitive interface for groundwater identification, visualization, and analysis of hydrological data.

## ✨ Features

- 🗺️ **Interactive Map Interface**

  - OpenStreetMap base layer
  - Five key regions coverage where groundwater are harvested:
    - West Bengal 
    - DELHI
    - Maharashtra 
    - Andhra Pradesh
    - Tamil Nadu
  - Real-time region zooming
  - Responsive design for all devices

- 🔍 **Species Search**

  - Fast scientific name search with autocomplete
  - Color-coded region markers
  - Interactive popups with location details

- 📊 **Data Visualization**
  - Mock sightings data structure
  - Precise geographical coordinates
  - Region-wise water distribution
  - Clean, minimalist UI

## 🛠️ Tech Stack

- **Framework:** React + Vite
- **Map Library:** React Leaflet
- **UI Components:** Headless UI
- **Styling:** Tailwind CSS
- **Build Tool:** Vite
- **Development:** ESLint + PostCSS

## ▶️ Quick Start

1. Clone the repository:

   ```bash
   git clone https://github.com/AquaGuardIndia/Frontend.git
   cd Frontend
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Start development server:

   ```bash
   npm run dev
   ```

4. Open http://localhost:5173 in your browser

## 🎨 Design Choices

- **Light Theme**: Optimized for government groundwater data visualization
- **Mobile-First**: Fully responsive layout
- **Minimal UI**: Focus on data and map interaction
- **Modular Components**: Easy to extend and maintain
- **Mock Data Structure**: Ready for backend integration
