import React, { useState } from "react";

function darkenColor(hex, percent = 30) {
  if (!hex || typeof hex !== "string") return "#1e293b";
  let num = parseInt(hex.replace("#", ""), 16);
  if (isNaN(num)) return "#1e293b";
  let r = (num >> 16) - Math.round(255 * (percent / 100));
  let g = ((num >> 8) & 0x00ff) - Math.round(255 * (percent / 100));
  let b = (num & 0x0000ff) - Math.round(255 * (percent / 100));
  r = Math.max(0, r);
  g = Math.max(0, g);
  b = Math.max(0, b);
  return `#${(g | (r << 8) | (b << 16)).toString(16).padStart(6, "0")}`;
}

// Smart callout arrangement algorithm to prevent vertical text collisions
function arrangeCallouts(slices, isRight, minY, maxY, gap) {
  const sideSlices = slices
    .filter((slice) => slice.isRight === isRight)
    .sort((a, b) => a.naturalLabelY - b.naturalLabelY);

  if (sideSlices.length === 0) return new Map();

  const positions = new Map();
  let previousY = minY - gap;

  sideSlices.forEach((slice) => {
    const y = Math.max(minY, slice.naturalLabelY, previousY + gap);
    positions.set(slice.key, y);
    previousY = y;
  });

  // Pull upward if bottom extends past maxY while maintaining gap
  let nextY = Math.min(maxY, positions.get(sideSlices.at(-1)?.key) ?? maxY);
  [...sideSlices].reverse().forEach((slice) => {
    const y = Math.min(positions.get(slice.key), nextY);
    positions.set(slice.key, y);
    nextY = y - gap;
  });

  return positions;
}

export default function GoogleSheets3DPieChart({
  data = [],
  title = "EE Placement Statistics 2026",
  bgColor = "#ffffff",
  is3D = true,
  donutHole = 0,
  fontFamily = "Plus Jakarta Sans, Outfit, sans-serif",
  titleColor = "#0f172a",
  titleFontSize = 22,
  titleBold = true,
  titleItalic = false,
  titleAlign = "left",
  labelType = "percentage",
  sliceBorderColor = "#ffffff",
  selectedSliceId = null,
  explodeDistance = 0,
}) {
  const [groupSmallSlices, setGroupSmallSlices] = useState(false);

  if (!data || data.length === 0) {
    return (
      <div className="w-full h-[380px] flex flex-col items-center justify-center text-slate-400 p-8 text-center border-2 border-dashed border-slate-200 rounded-2xl bg-white">
        <svg
          className="w-16 h-16 text-slate-300 mb-3"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z"
          />
        </svg>
        <p className="text-base font-extrabold text-slate-700">
          No Placement Data Added Yet
        </p>
        <p className="text-xs text-slate-400 mt-1">
          Add company rows or upload an Excel sheet to generate your 3D pie chart.
        </p>
      </div>
    );
  }

  // Optional: Group small slices (< 2% or > 12 items) into an "Others" slice if groupSmallSlices toggle is active
  let processedData = data;
  if (groupSmallSlices && data.length > 10) {
    const sorted = [...data].sort((a, b) => (Number(b.offers) || 0) - (Number(a.offers) || 0));
    const topItems = sorted.slice(0, 9);
    const otherItems = sorted.slice(9);
    const otherOffers = otherItems.reduce((acc, curr) => acc + (Number(curr.offers) || 0), 0);
    const otherAvgCtc = otherItems.reduce((acc, curr) => acc + (Number(curr.ctc) || 0), 0) / (otherItems.length || 1);

    if (otherOffers > 0) {
      processedData = [
        ...topItems,
        {
          id: "others_grouped",
          name: `Others (${otherItems.length} Cos)`,
          offers: otherOffers,
          ctc: Number(otherAvgCtc.toFixed(2)),
          color: "#94a3b8"
        }
      ];
    }
  }

  const totalOffers = processedData.reduce(
    (acc, curr) => acc + (Number(curr.offers) || 0),
    0
  );
  if (totalOffers === 0) return null;

  // Ultra-Wide 1150 x 720 Canvas Dimensions to prevent left/right text truncation!
  const width = 1150;
  const height = 720;
  const cx = 575;
  const cy = 370;

  const outerRx = 235;
  const outerRy = is3D ? 142 : 235;
  const innerRx = (outerRx * donutHole) / 100;
  const innerRy = (outerRy * donutHole) / 100;
  const h = is3D ? 40 : 0; // 3D cylinder depth

  let currentAngle = -Math.PI / 2;

  const slices = processedData.map((item, key) => {
    const val = Number(item.offers) || 0;
    const fraction = val / totalOffers;
    const angleSpan = fraction * 2 * Math.PI;
    const startAngle = currentAngle;
    const endAngle = currentAngle + angleSpan;
    const midAngle = startAngle + angleSpan / 2;
    currentAngle = endAngle;

    const isExploded = item.id === selectedSliceId && explodeDistance > 0;
    const explodeOffset = isExploded ? explodeDistance * 0.4 : 0;
    const sliceCx = cx + explodeOffset * Math.cos(midAngle);
    const sliceCy = cy + explodeOffset * Math.sin(midAngle);

    // Top Surface Arc Coordinates
    const x1 = sliceCx + outerRx * Math.cos(startAngle);
    const y1 = sliceCy + outerRy * Math.sin(startAngle);
    const x2 = sliceCx + outerRx * Math.cos(endAngle);
    const y2 = sliceCy + outerRy * Math.sin(endAngle);

    // Inner Donut Hole Coordinates
    const ix1 = sliceCx + innerRx * Math.cos(startAngle);
    const iy1 = sliceCy + innerRy * Math.sin(startAngle);
    const ix2 = sliceCx + innerRx * Math.cos(endAngle);
    const iy2 = sliceCy + innerRy * Math.sin(endAngle);

    const largeArc = angleSpan > Math.PI ? 1 : 0;

    // Text position centered inside top slice
    const textRadiusX =
      innerRx > 0 ? innerRx + (outerRx - innerRx) * 0.58 : outerRx * 0.58;
    const textRadiusY =
      innerRy > 0 ? innerRy + (outerRy - innerRy) * 0.58 : outerRy * 0.58;
    const tx = sliceCx + textRadiusX * Math.cos(midAngle);
    const ty = sliceCy + textRadiusY * Math.sin(midAngle);

    return {
      ...item,
      key,
      fraction,
      percentage: (fraction * 100).toFixed(1),
      startAngle,
      endAngle,
      midAngle,
      sliceCx,
      sliceCy,
      x1,
      y1,
      x2,
      y2,
      ix1,
      iy1,
      ix2,
      iy2,
      largeArc,
      isRight: Math.cos(midAngle) >= 0,
      naturalLabelY: sliceCy + (outerRy + 36) * Math.sin(midAngle),
      tx,
      ty,
      darkColor: darkenColor(item.color || "#3b82f6", 32),
    };
  });

  // Calculate dynamic vertical gap based on slice density per side
  const rightSlicesCount = slices.filter(s => s.isRight).length;
  const leftSlicesCount = slices.filter(s => !s.isRight).length;

  const rightGap = Math.max(14, Math.min(26, Math.floor(510 / (rightSlicesCount || 1))));
  const leftGap = Math.max(14, Math.min(26, Math.floor(510 / (leftSlicesCount || 1))));

  const leftCallouts = arrangeCallouts(slices, false, 110, 660, leftGap);
  const rightCallouts = arrangeCallouts(slices, true, 110, 660, rightGap);

  // Dynamic font sizing when many slices are displayed
  const maxSideCount = Math.max(leftSlicesCount, rightSlicesCount);
  const fontTitleSize = maxSideCount > 13 ? 11 : maxSideCount > 9 ? 12 : 13;
  const fontValueSize = maxSideCount > 13 ? 9.5 : 11;

  return (
    <div className="w-full flex flex-col items-center" style={{ fontFamily }}>
      
      {/* Smart Grouping Control Banner if > 10 items */}
      {data.length > 10 && (
        <div className="w-full flex items-center justify-between px-4 py-2 bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-700 rounded-t-2xl mb-2">
          <span>Total Companies: <strong>{data.length}</strong></span>
          <button
            onClick={() => setGroupSmallSlices(!groupSmallSlices)}
            className={`px-3 py-1 rounded-lg border transition-all text-xs font-extrabold ${
              groupSmallSlices
                ? "bg-indigo-600 text-white border-indigo-600 shadow-sm"
                : "bg-white text-indigo-600 border-indigo-200 hover:bg-indigo-50"
            }`}
          >
            {groupSmallSlices ? "Showing Top 9 + Others" : "Clean Up View (Group Small Slices)"}
          </button>
        </div>
      )}

      {/* SVG Canvas with explicit xmlns attribute for clean PNG export */}
      <svg
        data-chart-export="placement-pie-chart"
        xmlns="http://www.w3.org/2000/svg"
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        className="select-none max-w-full h-auto"
        style={{ backgroundColor: bgColor }}
      >
        {/* Background Rectangle for canvas exports */}
        <rect width={width} height={height} fill={bgColor} rx={16} />

        {/* Title rendered directly inside SVG for PNG export */}
        <text
          x={
            titleAlign === "center"
              ? width / 2
              : titleAlign === "right"
                ? width - 40
                : 40
          }
          y={50}
          fill={titleColor}
          fontSize={titleFontSize}
          fontWeight={titleBold ? "900" : "600"}
          fontStyle={titleItalic ? "italic" : "normal"}
          textAnchor={
            titleAlign === "center"
              ? "middle"
              : titleAlign === "right"
                ? "end"
                : "start"
          }
          fontFamily={fontFamily}
        >
          {title}
        </text>

        {/* 1. 3D Side Walls */}
        {is3D && (
          <g id="pie-3d-sides">
            {slices.map((slice, i) => {
              const isFront =
                Math.sin(slice.startAngle) > -0.15 ||
                Math.sin(slice.endAngle) > -0.15;
              if (!isFront) return null;

              return (
                <path
                  key={`side-${slice.id || i}`}
                  d={`M ${slice.x1} ${slice.y1} A ${outerRx} ${outerRy} 0 ${slice.largeArc} 1 ${slice.x2} ${slice.y2} L ${slice.x2} ${slice.y2 + h} A ${outerRx} ${outerRy} 0 ${slice.largeArc} 0 ${slice.x1} ${slice.y1 + h} Z`}
                  fill={slice.darkColor}
                  stroke={
                    sliceBorderColor !== "none" ? sliceBorderColor : "none"
                  }
                  strokeWidth={0.5}
                />
              );
            })}
          </g>
        )}

        {/* 2. Top Surface Elliptical Pie Slices */}
        <g id="pie-top-surfaces">
          {slices.map((slice, i) => {
            let pathD = "";
            if (donutHole > 0) {
              pathD = `M ${slice.x1} ${slice.y1} A ${outerRx} ${outerRy} 0 ${slice.largeArc} 1 ${slice.x2} ${slice.y2} L ${slice.ix2} ${slice.iy2} A ${innerRx} ${innerRy} 0 ${slice.largeArc} 0 ${slice.ix1} ${slice.iy1} Z`;
            } else {
              pathD = `M ${slice.sliceCx} ${slice.sliceCy} L ${slice.x1} ${slice.y1} A ${outerRx} ${outerRy} 0 ${slice.largeArc} 1 ${slice.x2} ${slice.y2} Z`;
            }

            return (
              <path
                key={`top-${slice.id || i}`}
                d={pathD}
                fill={slice.color}
                stroke={sliceBorderColor !== "none" ? sliceBorderColor : "none"}
                strokeWidth={1.5}
                className="hover:opacity-90 transition-all cursor-pointer"
              >
                <title>{`${slice.name}: ${slice.offers} offers (${slice.percentage}%)`}</title>
              </path>
            );
          })}
        </g>

        {/* 3. High-contrast inner labels for major slices */}
        <g id="pie-inner-labels">
          {slices.map((slice, i) => {
            if (slice.fraction < 0.08) return null;
            return (
              <g key={`inner-grp-${slice.id || i}`}>
                {/* White text outline for guaranteed legibility */}
                <text
                  x={slice.tx}
                  y={slice.ty}
                  fill="#ffffff"
                  stroke="#ffffff"
                  strokeWidth="3.5px"
                  strokeLinejoin="round"
                  textAnchor="middle"
                  dominantBaseline="central"
                  fontSize={13}
                  fontWeight="900"
                  fontFamily={fontFamily}
                  className="pointer-events-none"
                >
                  {slice.name.length > 14
                    ? `${slice.name.substring(0, 12)}...`
                    : slice.name}
                </text>
                <text
                  x={slice.tx}
                  y={slice.ty}
                  fill="#0f172a"
                  textAnchor="middle"
                  dominantBaseline="central"
                  fontSize={13}
                  fontWeight="900"
                  fontFamily={fontFamily}
                  className="pointer-events-none"
                >
                  {slice.name.length > 14
                    ? `${slice.name.substring(0, 12)}...`
                    : slice.name}
                </text>
              </g>
            );
          })}
        </g>

        {/* 4. Spreadsheet-style non-overlapping callout columns with ample left/right text margins */}
        <g id="pie-leader-lines">
          {slices.map((slice, i) => {
            if (labelType === "none") return null;

            const isRight = slice.isRight;
            const calloutY = (isRight ? rightCallouts : leftCallouts).get(
              slice.key
            );

            // Generous horizontal anchors so company names never clip off left/right edges!
            const bendX = isRight ? 890 : 260;
            const endX = isRight ? 960 : 190;
            const textX = isRight ? 970 : 180;
            const textAnchor = isRight ? "start" : "end";

            const anchorX =
              slice.sliceCx + outerRx * 0.94 * Math.cos(slice.midAngle);
            const anchorY =
              slice.sliceCy + outerRy * 0.94 * Math.sin(slice.midAngle);

            let displayVal = `${slice.percentage}%`;
            if (labelType === "name") displayVal = slice.name;
            if (labelType === "value") displayVal = `${slice.offers} offers`;

            return (
              <g key={`leader-${slice.id || i}`}>
                {/* Connector Polyline */}
                <polyline
                  points={`${anchorX},${anchorY} ${bendX},${calloutY} ${endX},${calloutY}`}
                  stroke="#94a3b8"
                  strokeWidth={1.2}
                  fill="none"
                />

                {/* Dot at slice boundary */}
                <circle
                  cx={anchorX}
                  cy={anchorY}
                  r={2.5}
                  fill="#475569"
                />

                {/* Company Name */}
                <text
                  x={textX}
                  y={calloutY - 4}
                  fill="#0f172a"
                  textAnchor={textAnchor}
                  fontSize={fontTitleSize}
                  fontWeight="800"
                  fontFamily={fontFamily}
                >
                  {slice.name.length > 20
                    ? `${slice.name.substring(0, 18)}...`
                    : slice.name}
                </text>

                {/* Percentage / Value */}
                <text
                  x={textX}
                  y={calloutY + (maxSideCount > 13 ? 8 : 10)}
                  fill="#64748b"
                  textAnchor={textAnchor}
                  fontSize={fontValueSize}
                  fontWeight="700"
                  fontFamily={fontFamily}
                >
                  {displayVal}
                </text>
              </g>
            );
          })}
        </g>
      </svg>
    </div>
  );
}
