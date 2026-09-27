// MapLibre loads its web worker from a separate file next to its main script, which the
// Next bundler moves. Copy the worker (and the shared chunk it imports) into public/ so
// MigrationMap can point MapLibre at a stable URL. Runs before `dev` and `build`.
import { copyFileSync, mkdirSync } from "node:fs";

const src = "node_modules/maplibre-gl/dist";
const dest = "public/maplibre";
mkdirSync(dest, { recursive: true });
for (const file of ["maplibre-gl-worker.mjs", "maplibre-gl-shared.mjs"]) {
  copyFileSync(`${src}/${file}`, `${dest}/${file}`);
}
