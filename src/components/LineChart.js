"use client";

import { useEffect, useRef, useState } from "react";

const MARGIN = { top: 24, right: 72, bottom: 32, left: 64 };
const fmt = new Intl.NumberFormat("en-US");

// Round the axis max up to a clean 1 / 2 / 5 step so ticks read 0, 50,000, 100,000...
function niceTicks(max, count = 4) {
  if (max <= 0) return [0];
  const raw = max / count;
  const mag = 10 ** Math.floor(Math.log10(raw));
  const step = [1, 2, 5, 10].map((m) => m * mag).find((s) => s >= raw);
  const ticks = [];
  for (let v = 0; v <= max + step * 0.999; v += step) ticks.push(v);
  return ticks;
}

/**
 * Multi-series line chart over years. `value: null` means no data for that year and
 * breaks the line. Year state is lifted to the parent so several charts (and the
 * map) share one crosshair: `activeYear` is drawn, `onHoverYear` reports the pointer.
 */
export default function LineChart({
  years, // [1988, 1989, ...]
  series, // [{ key, label, color, values: { [year]: number | null } }]
  title,
  subtitle,
  activeYear,
  onHoverYear,
  labelPeakOf, // series key whose maximum gets a direct label
  height = 280,
}) {
  const wrapRef = useRef(null);
  const [width, setWidth] = useState(720);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => setWidth(entry.contentRect.width));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const minYear = years[0];
  const maxYear = years[years.length - 1];
  const allValues = series.flatMap((s) => years.map((yr) => s.values[yr] ?? 0));
  const ticks = niceTicks(Math.max(...allValues));
  const yMax = ticks[ticks.length - 1] || 1;

  const innerW = Math.max(width - MARGIN.left - MARGIN.right, 10);
  const innerH = height - MARGIN.top - MARGIN.bottom;
  const x = (year) => MARGIN.left + ((year - minYear) / (maxYear - minYear)) * innerW;
  const y = (v) => MARGIN.top + innerH - (v / yMax) * innerH;

  // Start a new subpath after every gap so missing years aren't drawn as zero
  const pathFor = (s) => {
    let d = "";
    let pen = false;
    for (const yr of years) {
      const v = s.values[yr];
      if (v == null) {
        pen = false;
        continue;
      }
      d += `${pen ? "L" : "M"}${x(yr)},${y(v)}`;
      pen = true;
    }
    return d;
  };

  const xStep = innerW < 400 ? 10 : 5; // fewer year labels on narrow screens
  const xTicks = years.filter((yr) => yr % xStep === 0);

  // End labels only when they're far enough apart; converging lines fall back to legend + tooltip
  const ends = series
    .map((s) => ({ s, v: s.values[maxYear] }))
    .filter((e) => e.v != null);
  const endYs = ends.map((e) => y(e.v)).sort((a, b) => a - b);
  const endsFit = endYs.every((yy, i) => i === 0 || yy - endYs[i - 1] >= 14);

  const peakSeries = series.find((s) => s.key === labelPeakOf);
  const peakYear =
    peakSeries && years.reduce((a, b) => ((peakSeries.values[b] ?? 0) > (peakSeries.values[a] ?? 0) ? b : a));

  function yearFromPointer(e) {
    const rect = e.currentTarget.getBoundingClientRect();
    const px = e.clientX - rect.left;
    const yr = Math.round(minYear + ((px - MARGIN.left) / innerW) * (maxYear - minYear));
    return Math.min(maxYear, Math.max(minYear, yr));
  }

  function onKeyDown(e) {
    const current = activeYear ?? maxYear;
    if (e.key === "ArrowLeft") onHoverYear(Math.max(minYear, current - 1));
    else if (e.key === "ArrowRight") onHoverYear(Math.min(maxYear, current + 1));
    else if (e.key === "Home") onHoverYear(minYear);
    else if (e.key === "End") onHoverYear(maxYear);
    else return;
    e.preventDefault();
  }

  // Tooltip shows while the pointer or keyboard is on this chart
  const [engaged, setEngaged] = useState(false);
  const showTooltip = engaged && activeYear != null;
  const tooltipLeft = activeYear != null ? x(activeYear) : 0;
  const flip = tooltipLeft > width / 2;

  return (
    <figure className="viz-card">
      <figcaption>
        <h3 className="viz-title">{title}</h3>
        {subtitle && <p className="viz-subtitle">{subtitle}</p>}
      </figcaption>

      <ul className="viz-legend">
        {series.map((s) => (
          <li key={s.key}>
            <span className="viz-key" style={{ background: `var(${s.color})` }} />
            {s.label}
          </li>
        ))}
      </ul>

      <div ref={wrapRef} className="viz-plot">
        <svg
          width={width}
          height={height}
          role="img"
          aria-label={`${title}. Use left and right arrow keys to move between years.`}
          tabIndex={0}
          onPointerMove={(e) => {
            setEngaged(true);
            onHoverYear(yearFromPointer(e));
          }}
          onPointerLeave={() => {
            setEngaged(false);
            onHoverYear(null);
          }}
          onFocus={() => setEngaged(true)}
          onBlur={() => {
            setEngaged(false);
            onHoverYear(null);
          }}
          onKeyDown={onKeyDown}
        >
          {ticks.map((t) => (
            <g key={t}>
              <line
                x1={MARGIN.left}
                x2={MARGIN.left + innerW}
                y1={y(t)}
                y2={y(t)}
                className={t === 0 ? "viz-baseline" : "viz-grid"}
              />
              <text x={MARGIN.left - 8} y={y(t)} dy="0.32em" textAnchor="end" className="viz-tick">
                {fmt.format(t)}
              </text>
            </g>
          ))}
          {xTicks.map((yr) => (
            <text key={yr} x={x(yr)} y={height - 8} textAnchor="middle" className="viz-tick">
              {yr}
            </text>
          ))}

          {activeYear != null && (
            <line x1={x(activeYear)} x2={x(activeYear)} y1={MARGIN.top} y2={y(0)} className="viz-crosshair" />
          )}

          {series.map((s) => (
            <path
              key={s.key}
              d={pathFor(s)}
              fill="none"
              stroke={`var(${s.color})`}
              strokeWidth={2}
              strokeLinejoin="round"
              strokeLinecap="round"
            />
          ))}

          {peakSeries && peakYear !== maxYear && (
            <text x={x(peakYear)} y={y(peakSeries.values[peakYear]) - 10} textAnchor="middle" className="viz-label">
              {fmt.format(peakSeries.values[peakYear])} in {peakYear}
            </text>
          )}

          {ends.map(({ s, v }) => (
            <g key={s.key}>
              <circle cx={x(maxYear)} cy={y(v)} r={4} fill={`var(${s.color})`} className="viz-dot" />
              {endsFit && (
                <text x={x(maxYear) + 8} y={y(v)} dy="0.32em" className="viz-label">
                  {fmt.format(v)}
                </text>
              )}
            </g>
          ))}

          {activeYear != null &&
            series.map(
              (s) =>
                s.values[activeYear] != null && (
                  <circle
                    key={s.key}
                    cx={x(activeYear)}
                    cy={y(s.values[activeYear])}
                    r={4}
                    fill={`var(${s.color})`}
                    className="viz-dot"
                    pointerEvents="none"
                  />
                )
            )}
        </svg>

        {showTooltip && (
          <div
            className="viz-tooltip"
            style={{
              left: tooltipLeft,
              transform: flip ? "translateX(calc(-100% - 12px))" : "translateX(12px)",
            }}
          >
            <div className="viz-tooltip-year">{activeYear}</div>
            {series.map((s) => (
              <div key={s.key} className="viz-tooltip-row">
                <span className="viz-key" style={{ background: `var(${s.color})` }} />
                <strong>{s.values[activeYear] == null ? "No data" : fmt.format(s.values[activeYear])}</strong>
                <span>{s.label}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </figure>
  );
}
