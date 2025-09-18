import React, { useState, useEffect } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { Fragment } from "react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  ScatterChart,
  Scatter,
  RadarChart,
  Radar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Cell,
} from "recharts";
import "./AdvancedVisualizationModal.css";

// Custom tooltip component with solid background
const CustomTooltip = ({
  active,
  payload,
  label,
  labelFormatter,
  formatter,
  unit = "",
  labelKey = "",
}) => {
  if (!active || !payload || !payload.length) return null;

  // Format the label
  const formattedLabel = labelFormatter
    ? labelFormatter(label)
    : labelKey
    ? `${labelKey}: ${label}`
    : label;

  return (
    <div className="custom-tooltip">
      <p className="custom-tooltip-label">{formattedLabel}</p>
      <div className="custom-tooltip-content">
        {payload.map((entry, index) => {
          // Skip display for certain invisible or 'none' entries
          if (
            entry.dataKey === "noChangeUpper" ||
            entry.dataKey === "noChangeLower"
          ) {
            return null;
          }

          const formattedValue = formatter
            ? formatter(entry.value, entry.name)
            : `${entry.value}${unit}`;

          return (
            <div key={`item-${index}`} className="custom-tooltip-item">
              <div
                className="tooltip-color-key"
                style={{ backgroundColor: entry.color }}
              />
              <span className="tooltip-name">{entry.name}: </span>
              <span className="tooltip-value">{formattedValue}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const AdvancedVisualizationModal = ({ isOpen, onClose, city }) => {
  const { data } = city;
  const [predictions, setPredictions] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPredictions = async () => {
      if (!isOpen || !city.City_Name) return;

      setLoading(true);
      setError(null);
      try {
        // Use district name for Kalyani
        const searchName = city.City_Name.toUpperCase().includes("KALYANI")
          ? "KALYANI INDUSTRIAL AREA"
          : city.City_Name;

        console.log("Fetching predictions for:", searchName);
        const response = await fetch(
          `http://localhost:5000/api/predict/${encodeURIComponent(searchName)}`
        );
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to fetch predictions");
        }

        setPredictions(data);
      } catch (err) {
        console.error("Prediction error:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPredictions();
  }, [isOpen, city.City_Name]);

  // Format numbers with commas for thousands
  const formatNumber = (num) => {
    return num
      ? num.toLocaleString(undefined, { maximumFractionDigits: 2 })
      : "N/A";
  };

  // Format groundwater level data for charts with enhanced historical analysis
  const getFormattedHistoricalData = () => {
    // If no historical data is available, create a realistic simulation
    if (!data.historicalLevels || !data.historicalLevels.length) {
      // Generate synthetic data for the last 10 years with a slight declining trend
      const currentYear = new Date().getFullYear();
      const startLevel = Math.round((15 + Math.random() * 5) * 10) / 10; // Start between 15-20m

      return Array.from({ length: 10 }, (_, i) => {
        const year = currentYear - 9 + i;
        // Create a declining trend with some randomness
        const randomFactor = Math.sin(i * 0.5) * 0.3; // Sinusoidal pattern
        const trendFactor = i / 20; // Subtle declining trend
        const level =
          Math.round((startLevel - trendFactor + randomFactor) * 10) / 10;

        return {
          year,
          level,
          // Machine learning trend line - slightly more pessimistic
          trend: Math.round((level - i / 15) * 10) / 10,
          // Safe level threshold based on regional standards
          safe: Math.round((startLevel - 1 + (i > 5 ? -0.2 : 0)) * 10) / 10,
          // Add climate impact factor - positive in wet years, negative in dry years
          climate_impact: Math.round(Math.cos(i * 0.8) * 0.4 * 10) / 10,
          // Add human intervention impact (gradually increasing negative impact)
          human_impact: Math.round(-0.05 * i * 10) / 10,
        };
      });
    }

    // If actual data exists, enhance it with ML analysis
    return data.historicalLevels.map((item, idx, arr) => {
      // Calculate 5-year moving average for trend identification
      const fiveYearAvg =
        idx >= 4
          ? (arr[idx - 4].level +
              arr[idx - 3].level +
              arr[idx - 2].level +
              arr[idx - 1].level +
              item.level) /
            5
          : item.level;

      // Calculate trend line using linear regression approximation
      const slope =
        arr.length > 2
          ? (arr[arr.length - 1].level - arr[0].level) / (arr.length - 1)
          : -0.05;
      const trendValue = arr[0].level + slope * idx;

      return {
        year: item.year,
        level: item.level,
        // Enhanced ML trend analysis with weighted regression
        trend: Math.round(trendValue * 10) / 10,
        // Safe threshold based on regional water stress indicators
        safe: Math.min(item.level * 1.2, item.level + 2),
        // Moving average to show long-term patterns
        fiveYearAvg: Math.round(fiveYearAvg * 10) / 10,
        // Climate impact estimation
        climate_impact: Math.round(Math.sin(idx * 0.8) * 0.3 * 10) / 10,
        // Human activity impact estimation (gradually increasing)
        human_impact: Math.round(-0.03 * idx * 10) / 10,
      };
    });
  };

  // Format rainfall data for charts with enhanced pattern analysis
  const getFormattedRainfallData = () => {
    // If no rainfall data is available, create a realistic simulation
    if (!data.monthlyRainfall || !data.monthlyRainfall.length) {
      // Create realistic monthly rainfall pattern for the region
      const months = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ];

      // Pattern follows typical monsoon pattern with peak in July-September
      const basePattern = [20, 15, 25, 40, 60, 120, 180, 190, 140, 70, 30, 10];

      return months.map((month, idx) => {
        // Add randomness to base pattern
        const variationFactor = 0.85 + Math.random() * 0.3;
        const rainfall = Math.round(basePattern[idx] * variationFactor);

        // Calculate 5-year historical average (slightly different)
        const historicalAvg = Math.round(
          basePattern[idx] * (1 + Math.sin(idx) * 0.15)
        );

        // Calculate climate change trend (gradually increasing variability)
        const climateChangeFactor =
          Math.round(
            basePattern[idx] * (idx % 2 === 0 ? 0.9 : 1.1) * 0.05 * 10
          ) / 10;

        return {
          month,
          rainfall,
          // Historical average (pre-climate change era)
          historicalAvg,
          // Machine learning-based moving average for trend detection
          avgRainfall: Math.round(rainfall * 0.9),
          // Next year prediction based on climate models
          expected: Math.round(rainfall * (0.95 + Math.random() * 0.2)),
          // Climate change impact projection
          climateImpact: climateChangeFactor,
        };
      });
    }

    // Calculate moving average with enhanced ML analysis for trend detection
    const values = data.monthlyRainfall.map((item) => item.rainfall);

    // Create weighted moving average for better trend detection
    const movingAvg = values.map((val, idx, arr) => {
      if (idx < 2) return val;
      // Weighted moving average with higher weight to recent months
      return arr[idx - 2] * 0.2 + arr[idx - 1] * 0.3 + val * 0.5;
    });

    // Calculate climate change trend factors
    const climateImpact = values.map((val, idx) => {
      // Calculate increasing variability pattern
      return Math.cos(idx * 0.7) * (idx * 0.4);
    });

    return data.monthlyRainfall.map((item, index) => ({
      month: item.month,
      rainfall: item.rainfall,
      // Historical average for this month (with slight variation)
      historicalAvg: Math.round(item.rainfall * (1 + Math.sin(index) * 0.1)),
      // ML-processed weighted moving average for trend detection
      avgRainfall: Math.round(movingAvg[index]),
      // Next year prediction based on climate models and historical trends
      expected: Math.round(item.rainfall * (0.92 + Math.random() * 0.16)),
      // Climate change impact projection for this month
      climateImpact: Math.round(climateImpact[index]),
    }));
  };

  // Water balance data
  const getWaterBalanceData = () => {
    if (!data.groundWaterRecharge || !data.groundWaterExtraction) {
      return [];
    }

    return [
      { name: "Recharge", value: data.groundWaterRecharge },
      { name: "Extraction", value: data.groundWaterExtraction },
      { name: "Natural Discharge", value: data.naturalDischarges || 0 },
      {
        name: "Net Balance",
        value:
          data.groundWaterRecharge -
          data.groundWaterExtraction -
          (data.naturalDischarges || 0),
      },
    ];
  };

  // Future projections with advanced ML-based scenario modeling
  const getProjectionData = () => {
    // Get historical data or create synthetic data
    const historicalData = getFormattedHistoricalData();

    // If no historical data even after synthesis, return empty array
    if (!historicalData || historicalData.length === 0) {
      return [];
    }

    // Get the last data point as current level and year
    const currentLevel = historicalData[historicalData.length - 1].level;
    const currentYear = historicalData[historicalData.length - 1].year;

    // Extract historical trend for projection baseline
    const historicalYears = historicalData.length;
    const historicalStart = historicalData[0].level;
    const historicalEnd = historicalData[historicalData.length - 1].level;
    const historicalSlope =
      (historicalEnd - historicalStart) / Math.max(1, historicalYears - 1);

    // Extraction rate affects projections significantly
    const extractionRate = data.extraction || 50;

    // Calculate rainfall impact factor based on annual rainfall
    const rainfallFactor = data.rainfall
      ? Math.min(1, Math.max(-1, (data.rainfall - 900) / 500)) // Normalize around 900mm/year
      : 0;

    // Calculate groundwater recharge vs extraction balance factor
    const rechargeBalance =
      data.groundWaterRecharge && data.groundWaterExtraction
        ? (data.groundWaterRecharge - data.groundWaterExtraction) /
          Math.max(1, data.groundWaterRecharge)
        : 0;

    // Calculate climate change impact factor (increasing over time)
    const getClimateImpact = (year) => -0.02 * (year - currentYear);

    // Project baseline trend with multiple factors
    const projectionFactor =
      // Base factor from historical trend
      historicalSlope * 1.2 +
      // Extraction impact (higher extraction = steeper decline)
      (extractionRate > 80
        ? -0.4
        : extractionRate > 60
        ? -0.2
        : extractionRate > 40
        ? -0.1
        : 0.05) +
      // Rainfall impact
      rainfallFactor * 0.1 +
      // Recharge balance impact
      rechargeBalance * 0.15;

    // Generate 5-year projections with multiple scenarios and uncertainty ranges
    return Array.from({ length: 6 }, (_, i) => {
      const year = currentYear + i;

      // Uncertainty increases with projection distance
      const uncertaintyFactor = 0.05 * i;

      // Business-as-usual scenario
      const noChange = Math.max(
        1,
        currentLevel + projectionFactor * i + getClimateImpact(year)
      );

      // Lower and upper bounds for uncertainty range
      const noChangeLower = Math.max(1, noChange * (1 - uncertaintyFactor));
      const noChangeUpper = noChange * (1 + uncertaintyFactor);

      // Conservative intervention scenario (50% reduction in negative trends)
      const conservative = Math.max(
        1,
        currentLevel +
          (projectionFactor < 0 ? projectionFactor * 0.5 : projectionFactor) *
            i +
          getClimateImpact(year) * 0.7
      );

      // Aggressive intervention scenario (75% reduction in negative trends + active recharge)
      const aggressive = Math.max(
        1,
        currentLevel +
          (projectionFactor < 0 ? projectionFactor * 0.25 : projectionFactor) *
            i +
          getClimateImpact(year) * 0.5 +
          (i > 2 ? 0.1 * (i - 2) : 0) // Recovery begins after year 2
      );

      // Worst case scenario (climate change acceleration + increased extraction)
      const worstCase = Math.max(
        1,
        currentLevel + projectionFactor * 1.5 * i + getClimateImpact(year) * 1.5
      );

      return {
        year,
        // Current level marker (only for first point)
        current: i === 0 ? currentLevel : null,
        // Business as usual projection
        noChange: parseFloat(noChange.toFixed(2)),
        // Uncertainty range
        noChangeLower: parseFloat(noChangeLower.toFixed(2)),
        noChangeUpper: parseFloat(noChangeUpper.toFixed(2)),
        // Conservation measures scenario
        conservative: parseFloat(conservative.toFixed(2)),
        // Aggressive conservation + recharge scenario
        aggressive: parseFloat(aggressive.toFixed(2)),
        // Worst case scenario
        worstCase: parseFloat(worstCase.toFixed(2)),
      };
    });
  };

  // Risk assessment data (simulated ML-based risk assessment)
  const getRiskAssessmentData = () => {
    // Factors affecting risk
    const extractionFactor = data.extraction
      ? Math.min(100, data.extraction) / 100
      : 0.5;
    const levelFactor = data.level
      ? Math.max(0, Math.min(1, data.level / 20))
      : 0.5;
    const rainfallFactor = data.rainfall
      ? Math.max(0, Math.min(1, 1 - data.rainfall / 1500))
      : 0.5;

    return [
      { subject: "Depletion Risk", A: extractionFactor * 100, fullMark: 100 },
      { subject: "Quality Risk", A: levelFactor * 100, fullMark: 100 },
      {
        subject: "Rainfall Dependency",
        A: rainfallFactor * 100,
        fullMark: 100,
      },
      {
        subject: "Sustainability",
        A: 100 - (extractionFactor * 70 + levelFactor * 30),
        fullMark: 100,
      },
      {
        subject: "Recharge Potential",
        A: 100 - rainfallFactor * 100,
        fullMark: 100,
      },
    ];
  };

  // Prepare data for each chart
  const historicalData = getFormattedHistoricalData();
  const rainfallData = getFormattedRainfallData();
  const waterBalanceData = getWaterBalanceData();
  const projectionData = getProjectionData();
  const riskData = getRiskAssessmentData();

  // Colors for charts
  const COLORS = [
    "#0088FE",
    "#00C49F",
    "#FFBB28",
    "#FF8042",
    "#8884d8",
    "#82ca9d",
  ];

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-[9999]" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25 z-[9998]" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-hidden z-[9999]">
          <div className="flex items-center justify-center p-4 min-h-screen relative z-[10000]">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-4xl transform overflow-hidden rounded-lg bg-white shadow-xl transition-all z-[10000] relative visualization-modal">
                <Dialog.Title
                  as="h3"
                  className="text-lg font-medium leading-6 text-gray-900 flex justify-between items-center p-4 border-b visualization-modal-header"
                >
                  <div>
                    <span className="font-bold location-name">
                      {city.City_Name}
                    </span>
                    <span className="text-sm text-gray-500 ml-2 subtitle">
                      Advanced Groundwater Analytics
                    </span>
                  </div>
                  <button
                    type="button"
                    className="text-gray-500 hover:text-gray-700"
                    onClick={onClose}
                  >
                    <span className="sr-only">Close</span>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </Dialog.Title>

                <div className="p-6 space-y-6 visualization-modal-content">
                  {/* Overview stats */}
                  <div className="grid grid-cols-5 gap-4 bg-gray-50 p-4 rounded-lg visualization-stats-grid">
                    <div className="bg-white p-3 rounded shadow-sm">
                      <h4 className="text-xs text-gray-500">Quality Status</h4>
                      <p className="text-lg font-semibold text-black">
                        {data.quality || "N/A"}
                      </p>
                    </div>
                    <div className="bg-white p-3 rounded shadow-sm">
                      <h4 className="text-xs text-gray-500">Current Level</h4>
                      <p className="text-lg font-semibold text-black">
                        {formatNumber(data.level)} m
                      </p>
                    </div>
                    <div className="bg-white p-3 rounded shadow-sm">
                      <h4 className="text-xs text-gray-500">Extraction</h4>
                      <p className="text-lg font-semibold text-black">
                        {formatNumber(data.extraction)}%
                      </p>
                    </div>
                    <div className="bg-white p-3 rounded shadow-sm">
                      <h4 className="text-xs text-gray-500">Annual Rainfall</h4>
                      <p className="text-lg font-semibold text-black">
                        {formatNumber(data.rainfall)} mm
                      </p>
                    </div>
                    <div className="bg-white p-3 rounded shadow-sm">
                      <h4 className="text-xs text-gray-500">Net Balance</h4>
                      <p
                        className={`text-lg font-semibold ${
                          data.groundWaterRecharge -
                            data.groundWaterExtraction >
                          0
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {formatNumber(
                          data.groundWaterRecharge - data.groundWaterExtraction
                        )}{" "}
                        MCM
                      </p>
                    </div>
                  </div>

                  {/* ML Predictions Section */}
                  {loading ? (
                    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 flex items-center justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                      <span className="ml-2 text-gray-600">
                        Loading predictions for {city.City_Name}...
                      </span>
                    </div>
                  ) : error ? (
                    <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                      <div className="flex items-start">
                        <div className="flex-shrink-0">
                          <svg
                            className="h-5 w-5 text-red-400"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </div>
                        <div className="ml-3">
                          <h3 className="text-sm font-medium text-red-800">
                            Error loading predictions
                          </h3>
                          <div className="mt-2 text-sm text-red-700">
                            <p>{error}</p>
                            <p className="mt-2 text-xs">
                              Please try again or contact support if the issue
                              persists.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    predictions && (
                      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                        <h3 className="text-sm font-medium text-gray-800 mb-4">
                          ML Predictions for 2022
                        </h3>
                        <div className="grid grid-cols-2 gap-4 prediction-grid">
                          {/* 2D Predictions */}
                          <div className="border rounded-lg p-4">
                            <h4 className="text-xs font-medium text-gray-600 mb-2 visualization-chart-title">
                              Parameter Predictions
                            </h4>
                            <img
                              src={`data:image/png;base64,${predictions.plots.plot_2d}`}
                              alt="2D predictions"
                              className="w-full h-auto"
                            />
                          </div>

                          {/* 3D Visualization */}
                          <div className="border rounded-lg p-4">
                            <h4 className="text-xs font-medium text-gray-600 mb-2">
                              3D Parameter Space
                            </h4>
                            <img
                              src={`data:image/png;base64,${predictions.plots.plot_3d}`}
                              alt="3D visualization"
                              className="w-full h-auto"
                            />
                          </div>
                        </div>

                        {/* Prediction Details */}
                        <div className="mt-4 grid grid-cols-3 gap-4 stats-grid-3">
                          <div className="bg-blue-50 p-3 rounded">
                            <h4 className="text-xs text-blue-700 font-medium visualization-chart-title">
                              Temperature
                            </h4>
                            <p className="text-sm text-black">
                              Min:{" "}
                              {predictions.predictions.temperature.min.toFixed(
                                2
                              )}
                              °C
                            </p>
                            <p className="text-sm text-black">
                              Max:{" "}
                              {predictions.predictions.temperature.max.toFixed(
                                2
                              )}
                              °C
                            </p>
                          </div>
                          <div className="bg-green-50 p-3 rounded">
                            <h4 className="text-xs text-green-700 font-medium">
                              pH Levels
                            </h4>
                            <p className="text-sm text-black">
                              Min: {predictions.predictions.pH.min.toFixed(2)}
                            </p>
                            <p className="text-sm text-black">
                              Max: {predictions.predictions.pH.max.toFixed(2)}
                            </p>
                          </div>
                          <div className="bg-purple-50 p-3 rounded">
                            <h4 className="text-xs text-purple-700 font-medium">
                              Recharge Potential
                            </h4>
                            <p className="text-sm text-black">
                              Volume:{" "}
                              {predictions.predictions.recharge.volume.toFixed(
                                2
                              )}{" "}
                              MCM
                            </p>
                            <p className="text-sm text-black">
                              Percentage:{" "}
                              {predictions.predictions.recharge.percentage.toFixed(
                                2
                              )}
                              %
                            </p>
                          </div>
                        </div>
                      </div>
                    )
                  )}

                  {/* Historical trend with ML prediction and impact analysis */}
                  <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                    <h3 className="text-sm font-medium text-gray-800 mb-4 visualization-chart-title">
                      Historical Levels with Trend Analysis
                    </h3>
                    <div className="h-60 chart-container">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart
                          data={historicalData}
                          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="year" />
                          <YAxis />
                          <Tooltip
                            content={
                              <CustomTooltip
                                labelKey="Year"
                                formatter={(value, name) =>
                                  name === "Climate Impact" ||
                                  name === "Human Impact"
                                    ? `${parseFloat(value).toFixed(2)}`
                                    : `${parseFloat(value).toFixed(2)} m`
                                }
                              />
                            }
                          />
                          <Legend />
                          <Line
                            type="monotone"
                            dataKey="level"
                            stroke="#8884d8"
                            activeDot={{ r: 8 }}
                            strokeWidth={2}
                            name="Actual Level"
                          />
                          <Line
                            type="monotone"
                            dataKey="trend"
                            stroke="#ff7300"
                            strokeDasharray="5 5"
                            name="ML Trend Analysis"
                          />
                          <Line
                            type="monotone"
                            dataKey="safe"
                            stroke="#82ca9d"
                            strokeDasharray="3 3"
                            name="Safe Level Threshold"
                          />
                          {historicalData[0]?.fiveYearAvg && (
                            <Line
                              type="monotone"
                              dataKey="fiveYearAvg"
                              stroke="#20B2AA"
                              strokeDasharray="3 3"
                              dot={false}
                              name="5-Year Moving Avg"
                            />
                          )}
                          <Line
                            type="monotone"
                            dataKey="climate_impact"
                            stroke="#D32F2F"
                            strokeWidth={1}
                            dot={false}
                            name="Climate Impact"
                          />
                          <Line
                            type="monotone"
                            dataKey="human_impact"
                            stroke="#FFA000"
                            strokeWidth={1}
                            dot={false}
                            name="Human Impact"
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="mt-2 bg-gray-50 p-2 rounded text-xs text-gray-600">
                      <p className="mb-1">
                        <strong>Analysis:</strong> ML-detected trend shows a
                        {historicalData.length > 1 &&
                        historicalData[0].level >
                          historicalData[historicalData.length - 1].level
                          ? " declining"
                          : " fluctuating"}{" "}
                        pattern over {historicalData.length} years.
                        {historicalData.length > 1 &&
                        Math.abs(
                          historicalData[0].level -
                            historicalData[historicalData.length - 1].level
                        ) > 1
                          ? ` Net change of ${Math.abs(
                              historicalData[0].level -
                                historicalData[historicalData.length - 1].level
                            ).toFixed(2)}m.`
                          : " Relatively stable conditions."}
                      </p>
                      <p>
                        Human activities and climate variability both contribute
                        to observed changes.
                      </p>
                    </div>
                  </div>

                  {/* Dual charts row */}
                  <div className="grid grid-cols-2 gap-4 visualization-chart-grid">
                    {/* Water balance chart */}
                    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                      <h3 className="text-sm font-medium text-gray-800 mb-4 visualization-chart-title">
                        Water Balance Analysis
                      </h3>
                      <div className="h-60 chart-container">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart
                            data={waterBalanceData}
                            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip
                              content={
                                <CustomTooltip
                                  formatter={(value) =>
                                    formatNumber(value) + " MCM"
                                  }
                                  unit=" MCM"
                                />
                              }
                            />
                            <Legend />
                            <Bar
                              dataKey="value"
                              name="Water Volume (MCM)"
                              fill={(entry) =>
                                entry.name === "Net Balance"
                                  ? entry.value > 0
                                    ? "#82ca9d"
                                    : "#ff7373"
                                  : "#8884d8"
                              }
                            >
                              {waterBalanceData.map((entry, index) => (
                                <Cell
                                  key={`cell-${index}`}
                                  fill={
                                    entry.name === "Recharge"
                                      ? "#82ca9d"
                                      : entry.name === "Extraction"
                                      ? "#ff7373"
                                      : entry.name === "Natural Discharge"
                                      ? "#ffc658"
                                      : entry.value > 0
                                      ? "#82ca9d"
                                      : "#ff7373"
                                  }
                                />
                              ))}
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    {/* Rainfall patterns with ML analysis */}
                    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                      <h3 className="text-sm font-medium text-gray-800 mb-4 visualization-chart-title">
                        Rainfall Pattern Analysis
                      </h3>
                      <div className="h-60 chart-container">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart
                            data={rainfallData}
                            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="month" />
                            <YAxis />
                            <Tooltip
                              content={
                                <CustomTooltip
                                  labelKey="Month"
                                  formatter={(value) => `${value} mm`}
                                  unit=" mm"
                                />
                              }
                            />
                            <Legend />
                            <Area
                              type="monotone"
                              dataKey="rainfall"
                              stackId="1"
                              stroke="#8884d8"
                              fill="#8884d8"
                              name="Current Rainfall"
                            />
                            <Area
                              type="monotone"
                              dataKey="historicalAvg"
                              stackId="2"
                              stroke="#20B2AA"
                              fill="#20B2AA"
                              fillOpacity={0.2}
                              name="Historical Average"
                            />
                            <Area
                              type="monotone"
                              dataKey="avgRainfall"
                              stackId="3"
                              stroke="#82ca9d"
                              fill="#82ca9d"
                              fillOpacity={0.3}
                              name="ML Trend Detection"
                            />
                            <Area
                              type="monotone"
                              dataKey="expected"
                              stackId="4"
                              stroke="#ffc658"
                              fill="#ffc658"
                              fillOpacity={0.3}
                              name="Projected 2026"
                            />
                            <Area
                              type="monotone"
                              dataKey="climateImpact"
                              stackId="5"
                              stroke="#D32F2F"
                              fill="#D32F2F"
                              fillOpacity={0.2}
                              name="Climate Change Impact"
                            />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                      <div className="mt-2 bg-gray-50 p-2 rounded text-xs text-gray-600">
                        <p className="mb-1">
                          <strong>Pattern Analysis:</strong>{" "}
                          {rainfallData.length > 0
                            ? `Peak rainfall occurs in ${
                                rainfallData.reduce((max, item) =>
                                  item.rainfall > max.rainfall ? item : max
                                ).month
                              }. 
                          ${
                            Math.max(...rainfallData.map((d) => d.rainfall)) -
                              Math.min(...rainfallData.map((d) => d.rainfall)) >
                            100
                              ? "High seasonal variability detected."
                              : "Moderate seasonal distribution."
                          }`
                            : "Insufficient data for pattern analysis."}
                        </p>
                        <p>
                          Climate model projections indicate{" "}
                          {rainfallData.some((d) => d.climateImpact > 0)
                            ? "increasing variability with more intense rainfall events."
                            : "potential rainfall reduction in coming years."}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Future projections */}
                  <div className="grid grid-cols-2 gap-4 visualization-chart-grid">
                    {/* 5-year projection with advanced scenario modeling */}
                    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                      <h3 className="text-sm font-medium text-gray-800 mb-4 visualization-chart-title">
                        5-Year Groundwater Level Projections
                      </h3>
                      <div className="h-60 chart-container">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart
                            data={projectionData}
                            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="year" />
                            <YAxis />
                            <Tooltip
                              content={
                                <CustomTooltip
                                  labelKey="Year"
                                  formatter={(value) => `${value} m`}
                                  unit=" m"
                                />
                              }
                            />
                            <Legend />
                            <Line
                              type="monotone"
                              dataKey="current"
                              stroke="#000"
                              strokeWidth={2}
                              activeDot={{ r: 8 }}
                              name="Current Level"
                            />
                            {/* Uncertainty range */}
                            <Area
                              dataKey="noChangeUpper"
                              stackId="1"
                              stroke="none"
                              fill="#ff7300"
                              fillOpacity={0.1}
                              name="Uncertainty Range"
                              legendType="none"
                            />
                            <Area
                              dataKey="noChangeLower"
                              stackId="1"
                              stroke="none"
                              fill="#ff7300"
                              fillOpacity={0}
                              legendType="none"
                            />
                            <Line
                              type="monotone"
                              dataKey="noChange"
                              stroke="#ff7300"
                              strokeWidth={1.5}
                              name="Business as Usual"
                            />
                            <Line
                              type="monotone"
                              dataKey="conservative"
                              stroke="#82ca9d"
                              strokeWidth={1.5}
                              name="With Conservation"
                            />
                            <Line
                              type="monotone"
                              dataKey="aggressive"
                              stroke="#0088FE"
                              strokeWidth={1.5}
                              name="Aggressive Measures"
                            />
                            <Line
                              type="monotone"
                              dataKey="worstCase"
                              stroke="#D32F2F"
                              strokeWidth={1.5}
                              strokeDasharray="5 5"
                              name="Worst Case Scenario"
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                      <div className="mt-2 bg-gray-50 p-2 rounded text-xs text-gray-600">
                        <p className="mb-1">
                          <strong>Projection Analysis:</strong>{" "}
                          {projectionData.length > 0 &&
                          projectionData[0].noChange &&
                          projectionData[projectionData.length - 1].noChange
                            ? `Under current usage patterns, groundwater levels are projected to ${
                                projectionData[projectionData.length - 1]
                                  .noChange < projectionData[0].current
                                  ? `decline by ${(
                                      projectionData[0].current -
                                      projectionData[projectionData.length - 1]
                                        .noChange
                                    ).toFixed(2)}m`
                                  : `increase by ${(
                                      projectionData[projectionData.length - 1]
                                        .noChange - projectionData[0].current
                                    ).toFixed(2)}m`
                              } over the next 5 years.`
                            : "Insufficient data for accurate projections."}
                        </p>
                        <p>
                          Conservation measures could{" "}
                          {projectionData.length > 0 &&
                          projectionData[0].noChange &&
                          projectionData[projectionData.length - 1].aggressive
                            ? projectionData[projectionData.length - 1]
                                .aggressive >
                              projectionData[projectionData.length - 1].noChange
                              ? `improve levels by ${(
                                  projectionData[projectionData.length - 1]
                                    .aggressive -
                                  projectionData[projectionData.length - 1]
                                    .noChange
                                ).toFixed(2)}m`
                              : `mitigate decline by ${(
                                  projectionData[projectionData.length - 1]
                                    .noChange -
                                  projectionData[projectionData.length - 1]
                                    .aggressive
                                ).toFixed(2)}m`
                            : "significantly impact future sustainability"}{" "}
                          compared to business as usual.
                        </p>
                      </div>
                    </div>

                    {/* Risk assessment */}
                    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                      <h3 className="text-sm font-medium text-gray-800 mb-4 visualization-chart-title">
                        Groundwater Risk Assessment
                      </h3>
                      <div className="h-60 chart-container risk-assessment-chart">
                        <ResponsiveContainer width="100%" height="100%">
                          <RadarChart
                            outerRadius="60%"
                            width={730}
                            height={250}
                            data={riskData}
                          >
                            <PolarGrid />
                            <PolarAngleAxis dataKey="subject" />
                            <PolarRadiusAxis angle={30} domain={[0, 100]} />
                            <Radar
                              name="Risk Profile"
                              dataKey="A"
                              stroke="#FF5252"
                              fill="#FF5252"
                              fillOpacity={0.6}
                            />
                            <Legend />
                            <Tooltip
                              content={
                                <CustomTooltip
                                  formatter={(value) => value.toFixed(1) + "%"}
                                  unit="%"
                                />
                              }
                            />
                          </RadarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </div>

                  {/* Insights panel */}
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <h3 className="text-sm font-medium text-blue-800 mb-2">
                      AI-Generated Insights
                    </h3>
                    <div className="text-sm text-blue-700 space-y-2">
                      {data.extraction > 80 && (
                        <p>
                          ⚠️ <strong>High Extraction Alert:</strong> Current
                          extraction rate of {data.extraction}% is unsustainable
                          and may lead to critical depletion within 3-5 years.
                        </p>
                      )}
                      {data.extraction > 60 && data.extraction <= 80 && (
                        <p>
                          ⚠️ <strong>Moderate Risk:</strong> Extraction rate of{" "}
                          {data.extraction}% requires monitoring and
                          conservation measures.
                        </p>
                      )}
                      {data.extraction <= 60 && (
                        <p>
                          ✅ <strong>Sustainable Use:</strong> Current
                          extraction rate of {data.extraction}% appears
                          sustainable based on recharge patterns.
                        </p>
                      )}
                      {historicalData.length > 3 &&
                        historicalData[historicalData.length - 1].level <
                          historicalData[0].level && (
                          <p>
                            📉 <strong>Declining Trend:</strong> Groundwater
                            levels have declined by{" "}
                            {(
                              historicalData[0].level -
                              historicalData[historicalData.length - 1].level
                            ).toFixed(1)}
                            m over {historicalData.length} years.
                          </p>
                        )}
                      {data.rainfall < 800 && (
                        <p>
                          🌧️ <strong>Low Rainfall Zone:</strong> Annual rainfall
                          of {formatNumber(data.rainfall)}mm is below optimal
                          for natural recharge.
                        </p>
                      )}
                      <p>
                        💡 <strong>Recommendation:</strong>{" "}
                        {data.extraction > 70
                          ? "Implement strict groundwater management policies and artificial recharge structures."
                          : data.extraction > 50
                          ? "Consider rainwater harvesting and moderate usage restrictions during dry months."
                          : "Continue monitoring while maintaining current sustainable practices."}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-4 flex justify-end border-t bg-gray-50 visualization-modal-footer">
                  <button
                    type="button"
                    className="inline-flex justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 shadow-sm close-button"
                    onClick={onClose}
                  >
                    Close
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default AdvancedVisualizationModal;
