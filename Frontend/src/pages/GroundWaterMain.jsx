import { useMemo, useState, useEffect, useRef } from "react";
import MapView from "../components/MapView";
import SearchBar from "../components/SearchBar";
import { REGIONS, SIGHTINGS } from "../data/sightingsData";
import "./GroundWaterMain.css";

export default function GroundWaterMain() {
  const [selected, setSelected] = useState(null);
  const [mapWidthPercent, setMapWidthPercent] = useState(65);
  const [viewportWidth, setViewportWidth] = useState(window.innerWidth);
  const [reset, setReset] = useState(false);
  const [activeLayer, setActiveLayer] = useState("none");
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef(null);
  const draggingRef = useRef(false);
  const searchBarRef = useRef(null);
  const [currentData, setCurrentData] = useState(null);
  const isMobile = viewportWidth < 768;

  useEffect(() => {
    const handleResize = () => setViewportWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // This useEffect will run whenever currentData changes
  useEffect(() => {
    if (currentData) {
      console.log("Received currentData in OceanographicData:", currentData);
      // You can perform any additional processing here
      // For example, update map view, trigger calculations, etc.
    }
  }, [currentData]);

  const handleReset = () => {
    setSelected(null); // Set to null instead of empty array for proper reset
    setCurrentData(null); // Reset the current data as well
    setReset(true);

    // Reset the search bar if the ref is available
    if (searchBarRef.current) {
      searchBarRef.current.resetSelection();
    }

    setTimeout(() => setReset(false), 200);
  };

  const markers = useMemo(() => {
    if (!selected) return [];
    const color = selected.color;

    return SIGHTINGS.filter((d) => d.id === selected.id).map((d) => ({
      ...d,
      color,
      regionName: REGIONS[d.regionKey]?.name || d.regionKey,
    }));
  }, [selected]);

  const selectedRegionBounds = useMemo(() => {
    if (!selected) return null;
    console.log(selected);
    console.log("Current data in selectedRegionBounds:", currentData);
    if (currentData != null) {
      console.log(
        "Current data is not null:",
        currentData.latitude,
        currentData.longitude
      );
    }

    const regions = new Set(
      SIGHTINGS.filter((s) => s.id === selected.id).map((s) => s.State_Name)
    );
    console.log(regions);

    const boundsList = Array.from(regions)
      .map((k) => REGIONS[k]?.bounds)
      .filter(Boolean);
    if (boundsList.length === 0) return null;
    console.log(boundsList);

    const merged = boundsList.reduce((acc, b) => {
      const [[s1w1, s1w2], [n1e1, n1e2]] = b.map((x) => [x[0], x[1]]);
      if (!acc)
        return [
          [s1w1, s1w2],
          [n1e1, n1e2],
        ];
      return [
        [Math.min(acc[0][0], s1w1), Math.min(acc[0][1], s1w2)],
        [Math.max(acc[1][0], n1e1), Math.max(acc[1][1], n1e2)],
      ];
    }, null);
    return merged;
  }, [selected, currentData]);

  const onDragStart = (e) => {
    if (isMobile) return;
    draggingRef.current = true;
    setIsDragging(true);
    document.body.style.userSelect = "none";
  };

  const onDragEnd = () => {
    draggingRef.current = false;
    setIsDragging(false);
    document.body.style.userSelect = "auto";
  };

  const onDrag = (e) => {
    if (!draggingRef.current) return;
    let clientX = e.type === "touchmove" ? e.touches[0].clientX : e.clientX;
    const container = containerRef.current;
    if (!container) return;
    const rect = container.getBoundingClientRect();
    let newPercent = ((clientX - rect.left) / rect.width) * 100;
    if (newPercent < 20) newPercent = 20;
    if (newPercent > 80) newPercent = 80;
    setMapWidthPercent(newPercent);
  };

  useEffect(() => {
    window.addEventListener("mouseup", onDragEnd);
    window.addEventListener("mousemove", onDrag);
    window.addEventListener("touchend", onDragEnd);
    window.addEventListener("touchmove", onDrag, { passive: false });
    return () => {
      window.removeEventListener("mouseup", onDragEnd);
      window.removeEventListener("mousemove", onDrag);
      window.removeEventListener("touchend", onDragEnd);
      window.removeEventListener("touchmove", onDrag);
    };
  }, []);

  return (
    <div className="h-screen w-screen bg-ocean-50 text-slate-900 overflow-hidden flex flex-col">
      <header className="w-full p-3 sm:p-4 flex items-center justify-between bg-white shadow-sm z-50">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-2xl grid place-items-center">
            <span className="text-white text-3xl font-bold">🌊</span>
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-semibold tracking-tight">
              Welcome To AquaVault
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 -mt-0.5">
              GroundWater Specifier
            </p>
          </div>
        </div>
      </header>
      <div
        ref={containerRef}
        className={`flex flex-1 ${
          isMobile ? "flex-col" : "flex-row"
        } overflow-hidden`}
      >
        <div
          className="transition-all duration-200 ease-out relative p-2 md:p-4"
          style={{
            flexBasis: isMobile ? "50%" : `${mapWidthPercent}%`,
            height: isMobile ? "50vh" : "auto",
            minHeight: isMobile ? "300px" : "auto",
          }}
        >
          <div className="h-full w-full rounded-2xl overflow-hidden shadow-md border border-white/10 bg-ocean-800/40 backdrop-blur">
            <MapView
              markers={markers}
              selectedCity={selected}
              selectedRegionBounds={selectedRegionBounds}
              onResetMarkers={handleReset}
              triggerReset={reset}
              isMobile={isMobile}
              activeLayer={activeLayer}
              currentData={currentData} // Pass currentData to MapView if needed
            />
          </div>
        </div>
        {!isMobile && (
          <div
            onMouseDown={onDragStart}
            onTouchStart={onDragStart}
            className="w-[4px] cursor-col-resize bg-slate-700 hover:bg-slate-400 transition-colors duration-150"
          />
        )}
        <div
          className="right-sidebar transition-all duration-200 ease-out"
          style={{
            flexGrow: 1,
            flexShrink: 0,
            height: isMobile ? "50vh" : "100%",
            margin: "0.5rem",
          }}
        >
          <div className="right-sidebar-header">
            <span>Area of Focus</span>
            {selected && (
              <span className="text-xs bg-blue-600 px-2 py-0.5 rounded-full">
                {selected.City_Name || "Selected"}
              </span>
            )}
          </div>
          <div className="right-sidebar-content">
            <div className="relative z-50 mb-4">
              <SearchBar
                ref={searchBarRef}
                onSelect={(s) => setSelected(s)}
                onSendData={setCurrentData}
              />
              <div className="px-4 mt-2 text-center text-xs text-slate-400">
                Search by district name. Tap a result to plot sightings.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
