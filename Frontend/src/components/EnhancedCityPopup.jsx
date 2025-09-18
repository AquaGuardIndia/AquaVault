import React, { useState } from "react";
import { Line, Bar, Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import AdvancedVisualizationModal from "./AdvancedVisualizationModal";
import "./EnhancedCityPopup.css";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const EnhancedCityPopup = ({ city }) => {
  const { data } = city;
  const [showVisualizationModal, setShowVisualizationModal] = useState(false);

  // Function to determine status color class
  const getStatusColorClass = (quality) => {
    switch (quality) {
      case "Good":
        return "bg-green-50 text-green-700";
      case "Moderate":
        return "bg-yellow-50 text-yellow-700";
      case "Poor":
        return "bg-red-50 text-red-700";
      default:
        return "bg-blue-50 text-blue-700";
    }
  };

  // Prepare data for historical levels chart
  const getHistoricalLevelsData = () => {
    if (!data.historicalLevels || !data.historicalLevels.length) {
      return null;
    }

    return {
      labels: data.historicalLevels.map((item) => item.year),
      datasets: [
        {
          label: "Groundwater Level (m)",
          data: data.historicalLevels.map((item) => item.level),
          fill: true,
          backgroundColor: "rgba(75, 192, 192, 0.2)",
          borderColor: "rgba(75, 192, 192, 1)",
          tension: 0.4,
        },
      ],
    };
  };

  // Prepare data for monthly rainfall chart
  const getMonthlyRainfallData = () => {
    if (!data.monthlyRainfall || !data.monthlyRainfall.length) {
      return null;
    }

    return {
      labels: data.monthlyRainfall.map((item) => item.month),
      datasets: [
        {
          label: "Monthly Rainfall (mm)",
          data: data.monthlyRainfall.map((item) => item.rainfall),
          backgroundColor: "rgba(54, 162, 235, 0.5)",
          borderColor: "rgba(54, 162, 235, 1)",
          borderWidth: 1,
        },
      ],
    };
  };

  // Prepare data for extraction status chart
  const getExtractionStatusData = () => {
    if (!data.extraction) {
      return null;
    }

    return {
      labels: ["Used", "Available"],
      datasets: [
        {
          data: [data.extraction, 100 - data.extraction],
          backgroundColor: [
            "rgba(255, 99, 132, 0.8)",
            "rgba(54, 162, 235, 0.8)",
          ],
          borderColor: ["rgba(255, 99, 132, 1)", "rgba(54, 162, 235, 1)"],
          borderWidth: 1,
        },
      ],
    };
  };

  // Chart options
  const lineChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        mode: "index",
        intersect: false,
        bodyFont: {
          size: 10,
        },
        titleFont: {
          size: 10,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: false,
        ticks: {
          font: {
            size: 8,
          },
        },
        grid: {
          display: false,
        },
      },
      x: {
        ticks: {
          font: {
            size: 8,
          },
        },
        grid: {
          display: false,
        },
      },
    },
    maintainAspectRatio: false,
  };

  const barChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        mode: "index",
        intersect: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
    maintainAspectRatio: false,
  };

  const doughnutChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "bottom",
        labels: {
          boxWidth: 8,
          padding: 3,
          font: {
            size: 9,
          },
        },
      },
      tooltip: {
        bodyFont: {
          size: 10,
        },
        titleFont: {
          size: 10,
        },
        callbacks: {
          label: function (context) {
            return `${context.label}: ${context.formattedValue}%`;
          },
          title: function (context) {
            return "Extraction Status";
          },
        },
      },
    },
    cutout: "50%",
    maintainAspectRatio: false,
  };

  // Format numbers with commas for thousands
  const formatNumber = (num) => {
    return num
      ? num.toLocaleString(undefined, { maximumFractionDigits: 2 })
      : "N/A";
  };

  const historicalLevelsData = getHistoricalLevelsData();
  const monthlyRainfallData = getMonthlyRainfallData();
  const extractionStatusData = getExtractionStatusData();

  return (
    <div className="enhanced-popup text-sm bg-gray-50 p-2 rounded-lg">
      {/* Header */}
      <div className="flex justify-between items-start mb-2">
        <div>
          <div className="font-bold text-md text-gray-900">
            {city.City_Name}
          </div>
          <div className="text-[10px] text-gray-600 font-medium">
            {city.District_Name}, {city.State_Name}
          </div>
        </div>
        <div
          className={`px-1.5 py-0.5 rounded-full text-[10px] ${getStatusColorClass(
            data.quality
          )} font-medium shadow-sm`}
        >
          {data.quality}
        </div>
      </div>

      {/* Compact info display */}
      <div className="bg-white p-2 rounded-lg shadow-md border border-gray-100 mb-2">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-1 text-xs">
          <div className="bg-blue-50 p-1 rounded-md shadow-sm border border-blue-100">
            <span className="block text-gray-500 text-[9px] uppercase tracking-wide">
              Rainfall
            </span>
            <span className="font-semibold text-blue-700">
              {formatNumber(data.rainfall)} mm
            </span>
          </div>
          <div className="bg-green-50 p-1 rounded-md shadow-sm border border-green-100">
            <span className="block text-gray-500 text-[9px] uppercase tracking-wide">
              Extractable
            </span>
            <span className="font-semibold text-green-700">
              {formatNumber(data.annualExtractable)} MCM
            </span>
          </div>
          <div className="bg-amber-50 p-1 rounded-md shadow-sm border border-amber-100">
            <span className="block text-gray-500 text-[9px] uppercase tracking-wide">
              Extraction
            </span>
            <span className="font-semibold text-amber-700">
              {formatNumber(data.groundWaterExtraction)} MCM
            </span>
          </div>
          <div className="bg-cyan-50 p-1 rounded-md shadow-sm border border-cyan-100">
            <span className="block text-gray-500 text-[9px] uppercase tracking-wide">
              Recharge
            </span>
            <span className="font-semibold text-cyan-700">
              {formatNumber(data.groundWaterRecharge)} MCM
            </span>
          </div>
          <div className="bg-indigo-50 p-1 rounded-md shadow-sm border border-indigo-100">
            <span className="block text-gray-500 text-[9px] uppercase tracking-wide">
              Discharges
            </span>
            <span className="font-semibold text-indigo-700">
              {formatNumber(data.naturalDischarges)} MCM
            </span>
          </div>
          <div className="bg-rose-50 p-1 rounded-md shadow-sm border border-rose-100">
            <span className="block text-gray-500 text-[9px] uppercase tracking-wide">
              Extraction %
            </span>
            <span className="font-semibold text-rose-700">
              {formatNumber(data.extraction)}%
            </span>
          </div>
        </div>
      </div>

      {/* Primary Chart - Show either extraction status or historical data */}
      <div className="bg-white p-1.5 rounded-lg shadow-md border border-gray-100 mb-2">
        <div className="flex justify-between items-center mb-1">
          <h3 className="font-medium text-gray-800 text-[10px] uppercase tracking-wide">
            Groundwater Status
          </h3>
          <button
            onClick={() => setShowVisualizationModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white text-[10px] rounded px-1.5 py-0.5 shadow-sm transition-all duration-200 font-medium flex items-center gap-0.5"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-2.5 w-2.5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path d="M2 10a8 8 0 018-8v8h8a8 8 0 11-16 0z" />
              <path d="M12 2.252A8.014 8.014 0 0117.748 8H12V2.252z" />
            </svg>
            Visualize
          </button>
        </div>

        <div className="h-24 flex bg-gray-50 p-1 rounded-md">
          {extractionStatusData && (
            <div className="w-1/2 doughnut-container">
              <Doughnut
                data={extractionStatusData}
                options={doughnutChartOptions}
              />
            </div>
          )}
          {historicalLevelsData && (
            <div className="w-1/2 doughnut-container">
              <Line data={historicalLevelsData} options={lineChartOptions} />
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="text-[8px] text-gray-500 text-center bg-white rounded-md py-0.5 px-1 border border-gray-100 shadow-sm">
        {city.Latitude.toFixed(4)}, {city.Longitude.toFixed(4)} • {city.id}
      </div>

      {/* Advanced Visualization Modal */}
      <AdvancedVisualizationModal
        isOpen={showVisualizationModal}
        onClose={() => setShowVisualizationModal(false)}
        city={city}
      />
    </div>
  );
};

export default EnhancedCityPopup;
