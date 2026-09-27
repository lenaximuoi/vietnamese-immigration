"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import LineChart from "./LineChart";
import { DESTINATIONS, METRICS } from "@/lib/destinations";

// MapLibre needs `window`, so skip it during the static prerender
const MigrationMap = dynamic(() => import("./MigrationMap"), {
  ssr: false,
  loading: () => <div className="viz-map" />,
});

const fmt = new Intl.NumberFormat("en-US");
const fmtOrNone = (v) => (v == null ? "No data" : fmt.format(v));

export default function MigrationDashboard({ rows }) {
  // byDest[iso][year] = row
  const byDest = {};
  for (const r of rows) (byDest[r.country_of_asylum_iso] ??= {})[r.year] = r;

  const allYears = rows.map((r) => r.year);
  const minYear = Math.min(...allYears);
  const maxYear = Math.max(...allYears);
  const years = Array.from({ length: maxYear - minYear + 1 }, (_, i) => minYear + i);
  const valueOf = (iso, year, key) => byDest[iso]?.[year]?.[key] ?? null;
  const totalOf = (iso, year) => {
    const row = byDest[iso]?.[year];
    return row ? row.refugees + row.asylum_seekers : null;
  };
  const maxTotal = Math.max(...DESTINATIONS.flatMap((d) => years.map((yr) => totalOf(d.iso, yr) ?? 0)));

  // The scrubber picks a year; hovering a chart previews another. A future landing
  // page can drive `selectedYear` from scroll position the same way.
  const [selectedYear, setSelectedYear] = useState(maxYear);
  const [hoverYear, setHoverYear] = useState(null);
  const [playing, setPlaying] = useState(false);
  const year = hoverYear ?? selectedYear;

  useEffect(() => {
    if (!playing) return;
    const id = setInterval(() => {
      setSelectedYear((yr) => {
        if (yr >= maxYear) {
          setPlaying(false);
          return yr;
        }
        return yr + 1;
      });
    }, 350);
    return () => clearInterval(id);
  }, [playing, maxYear]);

  function togglePlay() {
    if (!playing && selectedYear >= maxYear) setSelectedYear(minYear);
    setPlaying(!playing);
  }

  const totals = Object.fromEntries(DESTINATIONS.map((d) => [d.iso, totalOf(d.iso, year)]));

  return (
    <div className="viz-root">
      <div className="viz-scrubber">
        <button type="button" className="viz-button" onClick={togglePlay} aria-pressed={playing}>
          {playing ? "Pause" : "Play"}
        </button>
        <input
          type="range"
          min={minYear}
          max={maxYear}
          value={selectedYear}
          onChange={(e) => {
            setPlaying(false);
            setSelectedYear(Number(e.target.value));
          }}
          aria-label="Year"
        />
        <output className="viz-scrubber-year">{year}</output>
      </div>

      <figure className="viz-card">
        <figcaption>
          <h3 className="viz-title">Where people from Viet Nam found protection, {year}</h3>
          <p className="viz-subtitle">Refugees plus asylum-seekers at year end. Line width shows the total.</p>
        </figcaption>
        <MigrationMap year={year} totals={totals} maxTotal={maxTotal} />
      </figure>

      <section className="viz-tiles">
        {DESTINATIONS.map((d) => (
          <div key={d.iso} className="viz-tile">
            <p className="viz-tile-head">
              <span className="viz-key viz-key-dot" style={{ background: `var(${d.color})` }} />
              {d.name}, {year}
            </p>
            <div className="viz-tile-stats">
              {METRICS.map((m) => (
                <div key={m.key}>
                  <p className="viz-stat-label">{m.label}</p>
                  <p className="viz-stat-value">{fmtOrNone(valueOf(d.iso, year, m.key))}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </section>

      {METRICS.map((m) => (
        <LineChart
          key={m.key}
          title={`${m.label} from Viet Nam, by destination`}
          subtitle={`People counted at year end, ${minYear}–${maxYear}`}
          years={years}
          series={DESTINATIONS.map((d) => ({
            key: d.iso,
            label: d.name,
            color: d.color,
            values: Object.fromEntries(years.map((yr) => [yr, valueOf(d.iso, yr, m.key)])),
          }))}
          labelPeakOf={m.key === "refugees" ? DESTINATIONS[0].iso : undefined}
          activeYear={year}
          onHoverYear={setHoverYear}
        />
      ))}

      <details className="viz-table">
        <summary>View data as a table</summary>
        <div className="viz-table-scroll">
          <table>
            <thead>
              <tr>
                <th scope="col" rowSpan={2}>Year</th>
                {DESTINATIONS.map((d) => (
                  <th key={d.iso} scope="colgroup" colSpan={METRICS.length}>{d.name}</th>
                ))}
              </tr>
              <tr>
                {DESTINATIONS.flatMap((d) =>
                  METRICS.map((m) => <th key={d.iso + m.key} scope="col">{m.label}</th>)
                )}
              </tr>
            </thead>
            <tbody>
              {years.map((yr) => (
                <tr key={yr}>
                  <td>{yr}</td>
                  {DESTINATIONS.flatMap((d) =>
                    METRICS.map((m) => <td key={d.iso + m.key}>{fmtOrNone(valueOf(d.iso, yr, m.key))}</td>)
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </div>
  );
}
