"use client";

import { useEffect, useMemo, useState } from "react";
import Map, { Layer, Marker, NavigationControl, Source } from "react-map-gl/maplibre";
import { setWorkerUrl } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { DESTINATIONS, ORIGIN } from "@/lib/destinations";

// Free CARTO basemaps (no API key). To use Mapbox instead, import from
// "react-map-gl/mapbox", pass mapboxAccessToken, and swap these style URLs.
const STYLES = {
  light: "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json",
  dark: "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json",
};

// Worker file copied into public/ by scripts/copy-maplibre-worker.mjs (the bundler
// moves MapLibre's own copy). This module only loads in the browser, so `location` exists.
setWorkerUrl(new URL(`${process.env.NEXT_PUBLIC_BASE_PATH}/maplibre/maplibre-gl-worker.mjs`, location.origin).href);

const fmt = new Intl.NumberFormat("en-US");
const MAX_WIDTH = 14;
const MIN_WIDTH = 1.5;

// Curved path from origin to destination, bowed north like a flight route
function arc([x0, y0], [x1, y1], steps = 48) {
  const cx = (x0 + x1) / 2;
  const cy = (y0 + y1) / 2 + Math.abs(x1 - x0) * 0.2;
  return Array.from({ length: steps + 1 }, (_, i) => {
    const t = i / steps;
    const u = 1 - t;
    return [u * u * x0 + 2 * u * t * cx + t * t * x1, u * u * y0 + 2 * u * t * cy + t * t * y1];
  });
}

// Theme + series colors from the CSS tokens, re-read when the color scheme changes
function useThemeColors() {
  const [theme, setTheme] = useState({ dark: false, colors: {} });
  useEffect(() => {
    const read = () => {
      const css = getComputedStyle(document.documentElement);
      const attr = document.documentElement.dataset.theme;
      const dark = attr ? attr === "dark" : window.matchMedia("(prefers-color-scheme: dark)").matches;
      const colors = Object.fromEntries(DESTINATIONS.map((d) => [d.color, css.getPropertyValue(d.color).trim()]));
      setTheme({ dark, colors });
    };
    read();
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    mq.addEventListener("change", read);
    const mo = new MutationObserver(read);
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    return () => {
      mq.removeEventListener("change", read);
      mo.disconnect();
    };
  }, []);
  return theme;
}

/**
 * totals: { [iso]: number | null } — refugees + asylum-seekers for the shown year
 * maxTotal: the largest total in any year, so widths are comparable across years
 */
export default function MigrationMap({ year, totals, maxTotal }) {
  const { dark, colors } = useThemeColors();

  const routes = useMemo(
    () => ({
      type: "FeatureCollection",
      features: DESTINATIONS.filter((d) => totals[d.iso] > 0).map((d) => ({
        type: "Feature",
        properties: {
          color: colors[d.color] || "#888",
          // sqrt so line width tracks area-ish perception rather than exploding at the peak
          width: MIN_WIDTH + (MAX_WIDTH - MIN_WIDTH) * Math.sqrt(totals[d.iso] / maxTotal),
        },
        geometry: { type: "LineString", coordinates: arc(ORIGIN.coords, d.coords) },
      })),
    }),
    [totals, maxTotal, colors]
  );

  return (
    <div className="viz-map" aria-label={`Map of people from Viet Nam in each destination in ${year}`}>
      <Map
        initialViewState={{ bounds: [[98, 2], [268, 66]], fitBoundsOptions: { padding: 32 } }}
        mapStyle={dark ? STYLES.dark : STYLES.light}
        scrollZoom={false}
        dragRotate={false}
        attributionControl={{ compact: true }}
      >
        <NavigationControl position="top-right" showCompass={false} />
        <Source id="routes" type="geojson" data={routes}>
          <Layer
            id="routes"
            type="line"
            layout={{ "line-cap": "round", "line-join": "round" }}
            paint={{ "line-color": ["get", "color"], "line-width": ["get", "width"], "line-opacity": 0.85 }}
          />
        </Source>

        <Marker longitude={ORIGIN.coords[0]} latitude={ORIGIN.coords[1]} anchor="top">
          <div className="viz-map-label">
            <span className="viz-map-origin" />
            <strong>{ORIGIN.name}</strong>
          </div>
        </Marker>

        {DESTINATIONS.map((d) => (
          // Labels sit west of the endpoint, over the Pacific, so the map edge never clips them
          <Marker key={d.iso} longitude={d.coords[0]} latitude={d.coords[1]} anchor="right" offset={[-8, 0]}>
            <div className="viz-map-label">
              <span>
                <strong>{totals[d.iso] == null ? "No data" : fmt.format(totals[d.iso])}</strong>{" "}
                {d.name}
              </span>
              <span className="viz-key viz-key-dot" style={{ background: `var(${d.color})` }} />
            </div>
          </Marker>
        ))}
      </Map>
    </div>
  );
}
