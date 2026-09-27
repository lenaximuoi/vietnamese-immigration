// Map anchor for the country of origin, [lng, lat]
export const ORIGIN = { iso: "VNM", name: "Viet Nam", coords: [106.3, 16.0] };

// One entry per destination, in a fixed order: the order sets the color slot, so a
// country keeps its color on every chart and the map. Add new destinations here.
// Coordinates are in the Americas, shifted +360° so arcs cross the Pacific eastward.
export const DESTINATIONS = [
  { iso: "USA", name: "United States", color: "--series-1", coords: [-98.5 + 360, 39.5] },
  { iso: "CAN", name: "Canada", color: "--series-2", coords: [-106.0 + 360, 56.0] },
];

export const METRICS = [
  { key: "refugees", label: "Refugees" },
  { key: "asylum_seekers", label: "Asylum-seekers" },
];
