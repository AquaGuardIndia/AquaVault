import {
  useState,
  useMemo,
  useEffect,
  useRef,
  forwardRef,
  useImperativeHandle,
} from "react";
import { ChevronDown, X, Search, MapPin } from "lucide-react";
import {
  getAvailableStates,
  getAvailableDistricts,
  getAvailableCities,
  getCurrentData,
  handleStateChange,
  handleDistrictChange,
  handleCityChange,
} from "../services/GroundWaterDashboardServices";

const GroundWaterDashboard = forwardRef(function GroundWaterDashboard(
  { onSelect, onSendData },
  ref
) {
  const [selectedCountry] = useState("INDIA");
  const [selectedState, setSelectedState] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchMode, setIsSearchMode] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const searchInputRef = useRef(null);

  const availableStates = useMemo(() => getAvailableStates(), []);
  const availableDistricts = useMemo(
    () => getAvailableDistricts(selectedState),
    [selectedState]
  );
  const availableCities = useMemo(
    () => getAvailableCities(selectedState, selectedDistrict),
    [selectedState, selectedDistrict]
  );

  const currentData = useMemo(
    () => getCurrentData(selectedState, selectedDistrict, selectedCity),
    [selectedState, selectedDistrict, selectedCity]
  );

  // Create searchable items from all available options
  const searchableItems = useMemo(() => {
    const items = [];

    // Add states
    availableStates.forEach((state) => {
      items.push({
        type: "state",
        name: state,
        displayName: `${state} (State)`,
        state: state,
        district: null,
        city: null,
      });

      // Add districts for this state
      const districts = getAvailableDistricts(state);
      districts.forEach((district) => {
        items.push({
          type: "district",
          name: district,
          displayName: `${district}, ${state} (District)`,
          state: state,
          district: district,
          city: null,
        });

        // Add cities for this district
        const cities = getAvailableCities(state, district);
        cities.forEach((city) => {
          items.push({
            type: "city",
            name: city,
            displayName: `${city}, ${district}, ${state} (City)`,
            state: state,
            district: district,
            city: city,
          });
        });
      });
    });

    return items;
  }, [availableStates]);

  // Filter search results based on query
  useEffect(() => {
    if (searchQuery.length < 2) {
      setSearchResults([]);
      setShowSearchDropdown(false);
      return;
    }

    const filtered = searchableItems
      .filter(
        (item) =>
          item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.displayName.toLowerCase().includes(searchQuery.toLowerCase())
      )
      .slice(0, 10); // Limit to 10 results

    setSearchResults(filtered);
    setShowSearchDropdown(filtered.length > 0);
  }, [searchQuery, searchableItems]);

  useEffect(() => {
    if (onSendData) onSendData(currentData);
  }, [currentData, onSendData]);

  const handleSearchSelect = (item) => {
    // Use the same service functions as SelectionMode
    if (item.type === "state") {
      // Only state selected
      const { selectedState, selectedDistrict, selectedCity } =
        handleStateChange(item.state, onSelect);
      setSelectedState(selectedState);
      setSelectedDistrict(selectedDistrict);
      setSelectedCity(selectedCity);
    } else if (item.type === "district") {
      // State and district selected
      const stateResult = handleStateChange(item.state, null); // Don't call onSelect yet
      setSelectedState(stateResult.selectedState);

      const { selectedDistrict, selectedCity } = handleDistrictChange(
        item.state,
        item.district,
        onSelect
      );
      setSelectedDistrict(selectedDistrict);
      setSelectedCity(selectedCity);
    } else if (item.type === "city") {
      // State, district, and city selected
      const stateResult = handleStateChange(item.state, null); // Don't call onSelect yet
      setSelectedState(stateResult.selectedState);

      const districtResult = handleDistrictChange(
        item.state,
        item.district,
        null
      ); // Don't call onSelect yet
      setSelectedDistrict(districtResult.selectedDistrict);

      const { selectedCity } = handleCityChange(
        item.state,
        item.district,
        item.city,
        onSelect
      );
      setSelectedCity(selectedCity);
    }

    // Update UI state
    setSearchQuery(item.displayName);
    setShowSearchDropdown(false);
    setIsSearchMode(false);
  };

  const resetSelection = () => {
    setSelectedState("");
    setSelectedDistrict("");
    setSelectedCity("");
    setSearchQuery("");
    setIsSearchMode(false);
    setShowSearchDropdown(false);
    if (onSelect) onSelect(null);
  };

  // Expose resetSelection method to parent component
  useImperativeHandle(ref, () => ({
    resetSelection,
  }));

  const toggleSearchMode = () => {
    setIsSearchMode(!isSearchMode);
    if (!isSearchMode) {
      setTimeout(() => searchInputRef.current?.focus(), 100);
    } else {
      setSearchQuery("");
      setShowSearchDropdown(false);
    }
  };

  const getDisplayText = () => {
    if (selectedCity) return `${selectedCity} (CITY)`;
    if (selectedDistrict) return `${selectedDistrict} (DISTRICT)`;
    if (selectedState) return `${selectedState} (STATE)`;
    return "Select Location";
  };

  if (!isOpen) {
    return (
      <div className="w-full">
        <button
          onClick={() => setIsOpen(true)}
          className="w-full bg-gray-800 text-white p-4 rounded-lg shadow-lg flex items-center justify-between hover:bg-gray-700 transition-colors"
        >
          <div className="text-left">
            <div className="font-medium">{getDisplayText()}</div>
          </div>
          <ChevronDown size={20} />
        </button>
      </div>
    );
  }

  return (
    <div className="w-full bg-gray-800 text-white rounded-lg shadow-xl overflow-visible">
      <div className="bg-gray-900 p-4 flex items-center justify-between">
        <div>
          <div className="font-medium">{getDisplayText()}</div>
        </div>
        <button
          onClick={() => setIsOpen(false)}
          className="text-gray-400 hover:text-white transition-colors"
        >
          <X size={20} />
        </button>
      </div>

      {/* Search/Select Toggle */}
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center gap-2 mb-4">
          <button
            onClick={toggleSearchMode}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
              isSearchMode
                ? "bg-blue-600 text-white"
                : "bg-gray-700 text-gray-300 hover:bg-gray-600"
            }`}
          >
            <Search size={16} />
            Search
          </button>
          <button
            onClick={() => setIsSearchMode(false)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
              !isSearchMode
                ? "bg-blue-600 text-white"
                : "bg-gray-700 text-gray-300 hover:bg-gray-600"
            }`}
          >
            <ChevronDown size={16} />
            Select
          </button>
        </div>

        {/* Search Mode */}
        {isSearchMode && (
          <div className="relative">
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={16}
              />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for state, district, or city..."
                className="w-full bg-gray-700 text-white pl-10 pr-4 py-2 rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
              />
            </div>

            {/* Search Results Dropdown */}
            {showSearchDropdown && (
              <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-gray-700 border border-gray-600 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                {searchResults.map((item, index) => (
                  <button
                    key={index}
                    onClick={() => handleSearchSelect(item)}
                    className="w-full text-left px-4 py-3 hover:bg-gray-600 transition-colors border-b border-gray-600 last:border-b-0"
                  >
                    <div className="flex items-center gap-2">
                      <MapPin
                        size={14}
                        className="text-blue-400 flex-shrink-0"
                      />
                      <div>
                        <div className="text-sm text-white">{item.name}</div>
                        <div className="text-xs text-gray-400">
                          {item.displayName}
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Selection Mode */}
        {!isSearchMode && (
          <>
            <div className="text-blue-400 text-sm mb-3 flex items-center">
              <span>{selectedCountry}</span>
              {selectedState && (
                <>
                  <span className="mx-2 text-gray-500">/</span>
                  <span>{selectedState}</span>
                </>
              )}
              {selectedDistrict && (
                <>
                  <span className="mx-2 text-gray-500">/</span>
                  <span>{selectedDistrict}</span>
                </>
              )}
              {selectedCity && (
                <>
                  <span className="mx-2 text-gray-500">/</span>
                  <span className="text-white font-medium">{selectedCity}</span>
                </>
              )}
              {(selectedState || selectedDistrict || selectedCity) && (
                <button
                  onClick={resetSelection}
                  className="ml-2 text-red-400 hover:text-red-300 text-xs"
                >
                  Reset
                </button>
              )}
            </div>

            {/* State */}
            <div className="mb-4">
              <label className="block text-sm text-gray-300 mb-2">
                Select State:
              </label>
              <select
                value={selectedState}
                onChange={(e) => {
                  const { selectedState, selectedDistrict, selectedCity } =
                    handleStateChange(e.target.value, onSelect);
                  setSelectedState(selectedState);
                  setSelectedDistrict(selectedDistrict);
                  setSelectedCity(selectedCity);
                }}
                className="w-full bg-gray-700 text-white p-2 rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
              >
                <option value="">-- Select State --</option>
                {availableStates.map((state) => (
                  <option key={state} value={state}>
                    {state}
                  </option>
                ))}
              </select>
            </div>

            {/* District */}
            {selectedState && (
              <div className="mb-4">
                <label className="block text-sm text-gray-300 mb-2">
                  Select District:
                </label>
                <select
                  value={selectedDistrict}
                  onChange={(e) => {
                    const { selectedDistrict, selectedCity } =
                      handleDistrictChange(
                        selectedState,
                        e.target.value,
                        onSelect
                      );
                    setSelectedDistrict(selectedDistrict);
                    setSelectedCity(selectedCity);
                  }}
                  className="w-full bg-gray-700 text-white p-2 rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
                >
                  <option value="">-- Select District --</option>
                  {availableDistricts.map((district) => (
                    <option key={district} value={district}>
                      {district}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* City */}
            {selectedState &&
              selectedDistrict &&
              availableCities.length > 0 && (
                <div className="mb-4">
                  <label className="block text-sm text-gray-300 mb-2">
                    Select City:
                  </label>
                  <select
                    value={selectedCity}
                    onChange={(e) => {
                      const { selectedCity } = handleCityChange(
                        selectedState,
                        selectedDistrict,
                        e.target.value,
                        onSelect
                      );
                      setSelectedCity(selectedCity);
                    }}
                    className="w-full bg-gray-700 text-white p-2 rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
                  >
                    <option value="">-- Select City --</option>
                    {availableCities.map((city) => (
                      <option key={city} value={city}>
                        {city}
                      </option>
                    ))}
                  </select>
                </div>
              )}
          </>
        )}
      </div>

      {/* Data Display */}
      {currentData && (
        <div className="p-4">
          {/* Main Metrics */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="bg-gray-700 p-4 rounded-lg text-center">
              <div className="text-xs text-gray-300 mb-1">
                Annual Extractable
              </div>
              <div className="text-xs text-gray-300 mb-1">Ground Water</div>
              <div className="text-xs text-gray-300 mb-2">Resources (ham)</div>
              <div className="text-2xl text-blue-400 font-bold">
                {(currentData.annualExtractable || 0).toFixed(2)}
              </div>
            </div>
            <div className="bg-gray-700 p-4 rounded-lg text-center">
              <div className="text-xs text-gray-300 mb-1">Ground Water</div>
              <div className="text-xs text-gray-300 mb-1">
                Extraction for all uses
              </div>
              <div className="text-xs text-gray-300 mb-2">(ham)</div>
              <div className="text-2xl text-blue-400 font-bold">
                {(currentData.groundWaterExtraction || 0).toFixed(2)}
              </div>
            </div>
          </div>
          {/* Expandable Sections */}
          <div className="space-y-2">
            <div className="bg-gray-700 p-3 rounded-lg flex items-center justify-between">
              <span className="text-sm">Rainfall (mm)</span>
              <div className="flex items-center">
                <span className="text-blue-400 mr-2">
                  {currentData.rainfall || "N/A"}
                </span>
                <ChevronDown size={16} className="text-gray-400" />
              </div>
            </div>
            <div className="bg-gray-700 p-3 rounded-lg flex items-center justify-between">
              <span className="text-sm">Ground Water Recharge (ham)</span>
              <div className="flex items-center">
                <span className="text-blue-400 mr-2">
                  {(currentData.groundWaterRecharge || 0).toFixed(1)}
                </span>
                <ChevronDown size={16} className="text-blue-400" />
              </div>
            </div>
            <div className="bg-gray-700 p-3 rounded-lg flex items-center justify-between">
              <span className="text-sm">Natural Discharges (ham)</span>
              <div className="flex items-center">
                <span className="text-blue-400 mr-2">
                  {(currentData.naturalDischarges || 0).toFixed(2)}
                </span>
                <ChevronDown size={16} className="text-blue-400" />
              </div>
            </div>
            <div className="bg-gray-700 p-3 rounded-lg flex items-center justify-between">
              <span className="text-sm">
                Annual Extractable Ground Water Resources (ham)
              </span>
              <div className="flex items-center">
                <span className="text-blue-400 mr-2">
                  {currentData.annualExtractableResources || "N/A"}
                </span>
                <ChevronDown size={16} className="text-blue-400" />
              </div>
            </div>
            <div className="bg-gray-700 p-3 rounded-lg flex items-center justify-between">
              <span className="text-sm">Ground Water Extraction (ham)</span>
              <div className="flex items-center">
                <span className="text-blue-400 mr-2">
                  {currentData.extraction || "N/A"}
                </span>
                <ChevronDown size={16} className="text-blue-400" />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

export default GroundWaterDashboard;
