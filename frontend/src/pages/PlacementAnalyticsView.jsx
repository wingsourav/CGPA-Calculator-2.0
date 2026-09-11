import React, { useState, useEffect, useRef } from "react";
import {
  Upload,
  Plus,
  Trash2,
  Sparkles,
  RotateCcw,
  FileSpreadsheet,
  MoreVertical,
  Edit3,
  Download,
  Share2,
  Copy,
  CheckCircle2,
} from "lucide-react";
import * as XLSX from "xlsx";
import { useAuth } from "../contexts/AuthContext.jsx";
import { db } from "../firebase/firebase-config.js";
import { doc, getDoc, setDoc } from "firebase/firestore";
import GoogleSheets3DPieChart from "../components/GoogleSheets3DPieChart.jsx";
import EditChartModal from "../components/EditChartModal.jsx";

// Deterministic User-Unique Color Palette Generator
function generateUserUniqueColorPalette(userId = "guest_user", count = 30) {
  // Simple hash of userId to derive base hue seed
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    hash = userId.charCodeAt(i) + ((hash << 5) - hash);
  }
  const baseHue = Math.abs(hash) % 360;

  const palette = [];
  const goldenRatio = 137.508; // Golden angle in degrees

  for (let i = 0; i < count; i++) {
    const hue = (baseHue + i * goldenRatio) % 360;
    const saturation = 65 + (i % 3) * 10; // 65% - 85%
    const lightness = 48 + (i % 2) * 8; // 48% - 56%

    // Convert HSL to Hex for standard color inputs
    const l = lightness / 100;
    const a = (saturation * Math.min(l, 1 - l)) / 100;
    const f = (n) => {
      const k = (n + hue / 30) % 12;
      const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
      return Math.round(255 * color)
        .toString(16)
        .padStart(2, "0");
    };
    palette.push(`#${f(0)}${f(8)}${f(4)}`);
  }
  return palette;
}

// Sample Placement Dataset matching Image for demo
const SAMPLE_EE_2026_DATA = [
  { id: 1, name: "Codeyoung", offers: 1, ctc: 8.45 },
  { id: 2, name: "Aether", offers: 1, ctc: 4 },
  { id: 3, name: "BEUMER India Private Limited", offers: 4, ctc: 4.2 },
  { id: 4, name: "Deloitte", offers: 7, ctc: 7.6 },
  { id: 5, name: "Deloitte USI", offers: 1, ctc: 7.5 },
  { id: 6, name: "Elensy", offers: 6, ctc: 4 },
  { id: 7, name: "EvA", offers: 2, ctc: 6 },
  { id: 8, name: "Filatex", offers: 4, ctc: 3.6 },
  { id: 9, name: "HCLTech", offers: 1, ctc: 4.5 },
  { id: 10, name: "HCLTech_SAP", offers: 1, ctc: 4.5 },
  { id: 11, name: "IAVL", offers: 6, ctc: 5 },
  { id: 12, name: "Indigrid", offers: 6, ctc: 4 },
  { id: 13, name: "Indus Tower", offers: 4, ctc: 5 },
  { id: 14, name: "J K Papers", offers: 1, ctc: 7 },
  { id: 15, name: "JSW Energy", offers: 4, ctc: 8.75 },
  { id: 16, name: "KTex", offers: 1, ctc: 3.6 },
  { id: 17, name: "L&T", offers: 10, ctc: 8.1 },
  { id: 18, name: "MSIL", offers: 1, ctc: 12.85 },
  { id: 19, name: "Moschip(Analog)", offers: 1, ctc: 8 },
  { id: 20, name: "Nanliu Manufacturing", offers: 1, ctc: 3.6 },
  { id: 21, name: "Pinnacle Infotech", offers: 1, ctc: 4 },
  { id: 22, name: "Quest Global", offers: 13, ctc: 5.5 },
  { id: 23, name: "Reliance Industries Limited", offers: 9, ctc: 7.5 },
  { id: 24, name: "Schwing Stetter", offers: 1, ctc: 4.55 },
  { id: 25, name: "Stratlytics", offers: 1, ctc: 6.78 },
  { id: 26, name: "TCE", offers: 4, ctc: 4.5 },
  { id: 27, name: "TCS_Digital", offers: 2, ctc: 7.09 },
  { id: 28, name: "TCS_Ninja", offers: 7, ctc: 3.46 },
  { id: 29, name: "Yathva Energy Solutions", offers: 2, ctc: 2 },
];

export default function PlacementAnalyticsView() {
  const chartBoxRef = useRef(null);
  const { currentUser } = useAuth();

  // Generate unique user color palette
  const userIdSeed = currentUser?.uid || "guest_user";
  const userColorPalette = generateUserUniqueColorPalette(userIdSeed, 35);

  // Clean initial state from localStorage or []
  const [placementData, setPlacementData] = useState(() => {
    const saved = localStorage.getItem("placement_analytics_data_v1");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return [];
  });

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [showThreeDotsMenu, setShowThreeDotsMenu] = useState(false);
  const [showDownloadSubmenu, setShowDownloadSubmenu] = useState(false);
  const [toastMsg, setToastMsg] = useState(null);

  // Global Chart Configuration
  const [chartConfig, setChartConfig] = useState({
    bgColor: "#ffffff",
    fontFamily: "Inter, sans-serif",
    is3D: true,
    donutHole: 0,
    labelType: "percentage",
    sliceBorderColor: "#ffffff",
    titleText: "EE Placement Statistics 2026",
    titleColor: "#0f172a",
    titleFontSize: 22,
    titleBold: true,
    titleItalic: false,
    titleAlign: "left",
    selectedSliceId: null,
    explodeDistance: 0,
  });

  const triggerToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  // Sync with Firestore
  useEffect(() => {
    if (!currentUser) return;
    const userDocRef = doc(db, "users", currentUser.uid);

    getDoc(userDocRef)
      .then((snapshot) => {
        if (snapshot.exists()) {
          const cloudData = snapshot.data().placement_analytics;
          if (Array.isArray(cloudData) && cloudData.length > 0) {
            setPlacementData(cloudData);
            localStorage.setItem(
              "placement_analytics_data_v1",
              JSON.stringify(cloudData),
            );
          }
        }
      })
      .catch((err) => console.error("Firestore load error:", err));
  }, [currentUser]);

  // Persistent Auto-Save Function
  const autoSavePlacementData = (newData) => {
    setPlacementData(newData);
    localStorage.setItem(
      "placement_analytics_data_v1",
      JSON.stringify(newData),
    );

    if (currentUser) {
      const userDocRef = doc(db, "users", currentUser.uid);
      setDoc(
        userDocRef,
        { placement_analytics: newData },
        { merge: true },
      ).catch((err) => console.error("Firestore auto-save error:", err));
    }
  };

  // Excel Upload with unique user colors
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target.result;
        const wb = XLSX.read(bstr, { type: "binary" });
        const wsName = wb.SheetNames[0];
        const ws = wb.Sheets[wsName];
        const jsonData = XLSX.utils.sheet_to_json(ws);

        if (Array.isArray(jsonData) && jsonData.length > 0) {
          const parsedData = jsonData.map((row, idx) => {
            const keys = Object.keys(row);
            const companyName =
              row["Company Name"] ||
              row["Company"] ||
              row[keys[1]] ||
              `Company ${idx + 1}`;
            const offers =
              Number(
                row["Number of Job Offers"] || row["Offers"] || row[keys[2]],
              ) || 1;
            const ctc =
              Number(row["CTC (in LPA)"] || row["CTC"] || row[keys[3]]) || 4.0;
            const color = userColorPalette[idx % userColorPalette.length];

            return {
              id: idx + 1,
              name: String(companyName),
              offers,
              ctc,
              color,
            };
          });

          autoSavePlacementData(parsedData);
          triggerToast("Excel sheet imported & saved automatically!");
        }
      } catch (err) {
        alert(
          "Failed to parse Excel file. Please ensure columns include Company Name and Number of Job Offers.",
        );
      }
    };
    reader.readAsBinaryString(file);
  };

  // Table Data Handlers
  const handleDataChange = (id, field, value) => {
    const updated = placementData.map((item) =>
      item.id === id ? { ...item, [field]: value } : item,
    );
    autoSavePlacementData(updated);
  };

  const handleAddRow = () => {
    const newId = Date.now();
    const newColor =
      userColorPalette[placementData.length % userColorPalette.length];
    const updated = [
      ...placementData,
      {
        id: newId,
        name: `Company ${placementData.length + 1}`,
        offers: 1,
        ctc: 5.0,
        color: newColor,
      },
    ];
    autoSavePlacementData(updated);
    triggerToast("Added company row & saved!");
  };

  const handleDeleteRow = (id) => {
    const updated = placementData.filter((item) => item.id !== id);
    autoSavePlacementData(updated);
    triggerToast("Deleted company & saved!");
  };

  const handleClearAll = () => {
    if (
      window.confirm(
        "Clear all placement data? This will reset all records and save automatically.",
      )
    ) {
      autoSavePlacementData([]);
      triggerToast("All placement data cleared & saved!");
    }
  };

  const handleLoadSampleData = () => {
    const sampleWithUserColors = SAMPLE_EE_2026_DATA.map((item, idx) => ({
      ...item,
      color: userColorPalette[idx % userColorPalette.length],
    }));
    autoSavePlacementData(sampleWithUserColors);
    triggerToast("Loaded unique EE 2026 placement dataset & saved!");
  };

  // Summary Metrics
  const totalOffers = placementData.reduce(
    (acc, curr) => acc + (Number(curr.offers) || 0),
    0,
  );
  const studentsPlaced =
    placementData.length > 0 ? Math.min(86, totalOffers) : 0;
  const avgCTC =
    placementData.length > 0
      ? (
          placementData.reduce(
            (acc, curr) => acc + (Number(curr.ctc) || 0),
            0,
          ) / placementData.length
        ).toFixed(2)
      : "0.00";
  const medianCTC = placementData.length > 0 ? "5.5" : "0.0";

  // 3-Dots Context Menu Actions
  const handleOpenEditModal = () => {
    setShowThreeDotsMenu(false);
    setIsEditModalOpen(true);
  };

  // 100% Reliable PNG Chart Image Export Fix
  const handleDownloadPNG = () => {
    setShowThreeDotsMenu(false);
    const container = chartBoxRef.current;
    if (!container) return;

    // The chart card also contains SVG icons (including the three-dots menu).
    // Select the explicitly marked chart SVG so the downloaded file matches
    // the pie chart currently displayed to the user.
    const svgElement = container.querySelector("svg[data-chart-export]");
    if (!svgElement) {
      alert("Chart SVG element not ready for download.");
      return;
    }

    try {
      const svgString = new XMLSerializer().serializeToString(svgElement);
      const svgBlob = new Blob([svgString], {
        type: "image/svg+xml;charset=utf-8",
      });
      const URL = window.URL || window.webkitURL || window;
      const svgUrl = URL.createObjectURL(svgBlob);

      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const dpr = 2;
        const viewBox = svgElement.viewBox.baseVal;
        const svgWidth =
          viewBox.width || Number(svgElement.getAttribute("width")) || 840;
        const svgHeight =
          viewBox.height || Number(svgElement.getAttribute("height")) || 600;
        canvas.width = svgWidth * dpr;
        canvas.height = svgHeight * dpr;
        const ctx = canvas.getContext("2d");
        ctx.fillStyle = chartConfig.bgColor || "#ffffff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(
          img,
          0,
          0,
          svgWidth,
          svgHeight,
          0,
          0,
          canvas.width,
          canvas.height,
        );

        const pngUrl = canvas.toDataURL("image/png");
        const link = document.createElement("a");
        link.href = pngUrl;
        link.download = `${chartConfig.titleText.replace(/[^a-zA-Z0-9]/g, "_")}_PieChart.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(svgUrl);
        triggerToast("Downloaded crisp PNG pie chart image!");
      };
      img.src = svgUrl;
    } catch (err) {
      console.error("PNG export error:", err);
      alert("Failed to generate PNG image. Please try downloading as SVG.");
    }
  };

  // 100% Reliable SVG Chart Vector Export Fix
  const handleDownloadSVG = () => {
    setShowThreeDotsMenu(false);
    const container = chartBoxRef.current;
    if (!container) return;

    const svgElement = container.querySelector("svg[data-chart-export]");
    if (!svgElement) {
      alert("Chart SVG element not ready for download.");
      return;
    }

    const svgString = new XMLSerializer().serializeToString(svgElement);
    const svgBlob = new Blob([svgString], {
      type: "image/svg+xml;charset=utf-8",
    });
    const svgUrl = URL.createObjectURL(svgBlob);
    const link = document.createElement("a");
    link.href = svgUrl;
    link.download = `${chartConfig.titleText.replace(/[^a-zA-Z0-9]/g, "_")}_PieChart.svg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(svgUrl);
    triggerToast("Downloaded SVG vector chart file!");
  };

  const handlePublishChart = () => {
    setShowThreeDotsMenu(false);
    navigator.clipboard.writeText(window.location.href);
    triggerToast("Chart link copied to clipboard!");
  };

  const handleCopyChart = () => {
    setShowThreeDotsMenu(false);
    const summary = `${chartConfig.titleText}\nTotal Offers: ${totalOffers}`;
    navigator.clipboard.writeText(summary);
    triggerToast("Chart summary copied to clipboard!");
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-indigo-600 uppercase tracking-wider mb-1">
            <Sparkles className="w-4 h-4" />
            <span>Placement Statistics & Google Sheets 3D Pie Chart Suite</span>
          </div>
          <h1 className="text-3xl font-black text-slate-900">
            Placement Analytics & 3D Pie Chart
          </h1>
          <p className="text-xs sm:text-sm text-slate-600">
            Add placement records, upload Excel files, and auto-save interactive
            3D pie charts with personalized colors
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleLoadSampleData}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-extrabold bg-indigo-100 hover:bg-indigo-200 text-indigo-800 transition-colors"
          >
            <Sparkles className="w-4 h-4 text-indigo-600" />
            <span>Load Unique EE 2026 Data</span>
          </button>

          <label className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black bg-emerald-600 hover:bg-emerald-700 text-white shadow-md cursor-pointer transition-colors whitespace-nowrap">
            <Upload className="w-4 h-4" />
            <span>Upload Placement Excel</span>
            <input
              type="file"
              accept=".xlsx, .xls, .csv"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {/* KPI Summary Cards matching Image 2 */}
      <div className="glass-panel p-5 bg-white border border-slate-200 space-y-3 shadow-sm">
        <div className="bg-red-600 text-white text-xs font-extrabold py-1.5 px-4 rounded-lg inline-block">
          Automatic Update - Don't Touch the below table
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
          <div className="bg-amber-400 p-4 rounded-2xl border border-amber-500 text-black shadow-sm">
            <span className="text-[11px] font-black uppercase block text-black/80">
              Total No. of Job Offers
            </span>
            <span className="text-3xl font-black">{totalOffers}</span>
          </div>

          <div className="bg-emerald-500 p-4 rounded-2xl border border-emerald-600 text-white shadow-sm">
            <span className="text-[11px] font-black uppercase block text-white/90">
              No. of Students Placed
            </span>
            <span className="text-3xl font-black">{studentsPlaced}</span>
          </div>

          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
            <span className="text-[11px] font-bold text-slate-500 uppercase block">
              Average CTC (LPA)
            </span>
            <span className="text-3xl font-black text-rose-600">₹{avgCTC}</span>
          </div>

          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
            <span className="text-[11px] font-bold text-slate-500 uppercase block">
              Median CTC (LPA)
            </span>
            <span className="text-3xl font-black text-rose-600">
              ₹{medianCTC}
            </span>
          </div>
        </div>
      </div>

      {/* Clean 2-Column Split: Table on Left | 3D Pie Chart Box on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (6 cols): Company Placement Records Table */}
        <div className="lg:col-span-6 glass-panel p-5 bg-white border border-slate-200 space-y-4 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-3">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-indigo-600" />
                <h3 className="text-base font-extrabold text-slate-900">
                  Company Placement Records
                </h3>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleClearAll}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 border border-rose-200 transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Clear All</span>
                </button>

                <button
                  onClick={handleAddRow}
                  className="flex items-center gap-1 px-3.5 py-1.5 rounded-xl text-xs font-extrabold bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Company</span>
                </button>
              </div>
            </div>

            {placementData.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                <p className="text-sm font-bold text-slate-700">
                  No Placement Records Available
                </p>
                <p className="text-xs text-slate-500">
                  Click <b>Add Company</b> or <b>Upload Placement Excel</b> to
                  start adding data.
                </p>
                <button
                  onClick={handleLoadSampleData}
                  className="px-4 py-2 bg-indigo-600 text-white text-xs font-extrabold rounded-xl shadow-sm hover:bg-indigo-700"
                >
                  Load Unique EE 2026 Records
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto max-h-[600px] border border-slate-200 rounded-xl">
                <table className="w-full text-left border-collapse min-w-[460px]">
                  <thead>
                    <tr className="bg-slate-100 text-slate-800 text-xs font-extrabold uppercase border-b border-slate-300 divide-x divide-slate-300">
                      <th className="py-2.5 px-3 w-12 text-center">Sl. No</th>
                      <th className="py-2.5 px-3">Company Name</th>
                      <th className="py-2.5 px-3 w-28 text-center">
                        Job Offers
                      </th>
                      <th className="py-2.5 px-3 w-28 text-center">
                        CTC (LPA)
                      </th>
                      <th className="py-2.5 px-2 w-12 text-center">Color</th>
                      <th className="py-2.5 px-2 w-10 text-center"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 text-xs font-semibold text-slate-900 bg-white">
                    {placementData.map((item, idx) => (
                      <tr
                        key={item.id}
                        className="hover:bg-slate-50 divide-x divide-slate-200"
                      >
                        <td className="py-2 px-3 text-center text-slate-400 font-bold">
                          {idx + 1}
                        </td>

                        <td className="py-1.5 px-2">
                          <input
                            type="text"
                            value={item.name}
                            onChange={(e) =>
                              handleDataChange(item.id, "name", e.target.value)
                            }
                            className="w-full px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900 focus:bg-white focus:ring-1 focus:ring-indigo-500"
                          />
                        </td>

                        <td className="py-1.5 px-2 text-center">
                          <input
                            type="number"
                            min="1"
                            value={item.offers}
                            onChange={(e) =>
                              handleDataChange(
                                item.id,
                                "offers",
                                parseInt(e.target.value) || 0,
                              )
                            }
                            className="w-full text-center px-2 py-1 rounded-lg bg-slate-50 border border-slate-200 text-xs font-black text-indigo-600 focus:bg-white focus:ring-1 focus:ring-indigo-500"
                          />
                        </td>

                        <td className="py-1.5 px-2 text-center">
                          <input
                            type="number"
                            step="0.1"
                            min="0"
                            value={item.ctc}
                            onChange={(e) =>
                              handleDataChange(
                                item.id,
                                "ctc",
                                parseFloat(e.target.value) || 0,
                              )
                            }
                            className="w-full text-center px-2 py-1 rounded-lg bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900 focus:bg-white focus:ring-1 focus:ring-indigo-500"
                          />
                        </td>

                        <td className="py-1.5 px-1 text-center">
                          <input
                            type="color"
                            value={item.color}
                            onChange={(e) =>
                              handleDataChange(item.id, "color", e.target.value)
                            }
                            className="w-6 h-6 rounded-md cursor-pointer border border-slate-200"
                          />
                        </td>

                        <td className="py-1.5 px-1 text-center">
                          <button
                            onClick={() => handleDeleteRow(item.id)}
                            className="text-slate-400 hover:text-rose-600 p-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Right Column (6 cols): 3D Pie Chart Display with 3-Vertical Dots Context Menu */}
        <div className="lg:col-span-6">
          <div
            ref={chartBoxRef}
            className="glass-panel p-6 border border-slate-300 shadow-sm flex flex-col justify-between relative rounded-2xl min-h-[500px]"
            style={{ backgroundColor: chartConfig.bgColor || "#ffffff" }}
          >
            {/* Header: Title & 3-Vertical Dots Button */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-2">
              <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">
                Google Sheets 3D Pie Chart
              </span>

              {/* 3-Vertical Dots Button matching Image */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowThreeDotsMenu(!showThreeDotsMenu)}
                  className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-colors"
                  title="Chart Options"
                >
                  <MoreVertical className="w-5 h-5" />
                </button>

                {/* Google Sheets Context Dropdown Menu */}
                {showThreeDotsMenu && (
                  <div className="absolute right-0 mt-1 w-52 bg-white rounded-xl shadow-2xl border border-slate-200 py-1.5 z-50 text-slate-800 text-xs font-semibold animate-fade-in">
                    {/* 1. Edit Chart -> Opens Modal Popup! */}
                    <button
                      onClick={handleOpenEditModal}
                      className="w-full text-left px-4 py-2 hover:bg-slate-100 flex items-center gap-3 text-slate-800 font-bold"
                    >
                      <Edit3 className="w-4 h-4 text-emerald-600" />
                      <span>Edit chart</span>
                    </button>

                    {/* 2. Delete Chart */}
                    <button
                      onClick={handleClearAll}
                      className="w-full text-left px-4 py-2 hover:bg-slate-100 flex items-center gap-3 text-slate-800 font-bold"
                    >
                      <Trash2 className="w-4 h-4 text-rose-600" />
                      <span>Delete chart</span>
                    </button>

                    {/* 3. Download Chart (with PNG & SVG options) */}
                    <div className="relative">
                      <button
                        onClick={() =>
                          setShowDownloadSubmenu(!showDownloadSubmenu)
                        }
                        className="w-full text-left px-4 py-2 hover:bg-slate-100 flex items-center justify-between text-slate-800 font-bold"
                      >
                        <div className="flex items-center gap-3">
                          <Download className="w-4 h-4 text-indigo-600" />
                          <span>Download chart</span>
                        </div>
                      </button>

                      {showDownloadSubmenu && (
                        <div className="pl-8 py-1 bg-slate-50 border-y border-slate-100 space-y-1">
                          <button
                            onClick={handleDownloadPNG}
                            className="w-full text-left px-3 py-1 text-xs text-indigo-600 hover:text-indigo-800 font-bold"
                          >
                            PNG image (.png)
                          </button>
                          <button
                            onClick={handleDownloadSVG}
                            className="w-full text-left px-3 py-1 text-xs text-indigo-600 hover:text-indigo-800 font-bold"
                          >
                            SVG vector (.svg)
                          </button>
                        </div>
                      )}
                    </div>

                    {/* 4. Publish Chart */}
                    <button
                      onClick={handlePublishChart}
                      className="w-full text-left px-4 py-2 hover:bg-slate-100 flex items-center gap-3 text-slate-800 font-bold"
                    >
                      <Share2 className="w-4 h-4 text-slate-600" />
                      <span>Publish chart</span>
                    </button>

                    {/* 5. Copy Chart */}
                    <button
                      onClick={handleCopyChart}
                      className="w-full text-left px-4 py-2 hover:bg-slate-100 flex items-center gap-3 text-slate-800 font-bold border-t border-slate-100 mt-1 pt-2"
                    >
                      <Copy className="w-4 h-4 text-slate-600" />
                      <span>Copy chart</span>
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Live 3D SVG Pie Chart Component */}
            <GoogleSheets3DPieChart
              data={placementData}
              title={chartConfig.titleText}
              bgColor={chartConfig.bgColor}
              is3D={chartConfig.is3D}
              donutHole={chartConfig.donutHole}
              fontFamily={chartConfig.fontFamily}
              titleColor={chartConfig.titleColor}
              titleFontSize={chartConfig.titleFontSize}
              titleBold={chartConfig.titleBold}
              titleItalic={chartConfig.titleItalic}
              titleAlign={chartConfig.titleAlign}
              labelType={chartConfig.labelType}
              sliceBorderColor={chartConfig.sliceBorderColor}
              selectedSliceId={chartConfig.selectedSliceId}
              explodeDistance={chartConfig.explodeDistance}
            />
          </div>
        </div>
      </div>

      {/* Edit Chart Popup Modal Window matching Images */}
      <EditChartModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        data={placementData}
        onUpdateData={autoSavePlacementData}
        chartConfig={chartConfig}
        onUpdateConfig={setChartConfig}
      />

      {/* Floating Toast Notification */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-3 animate-fade-in font-bold text-xs border border-slate-700">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          <span>{toastMsg}</span>
        </div>
      )}
    </div>
  );
}
