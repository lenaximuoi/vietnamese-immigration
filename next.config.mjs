// GitHub Pages serves project sites at /<repo-name>; the deploy workflow sets this
const basePath = process.env.PAGES_BASE_PATH || "";

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Static HTML export to `out/` for GitHub Pages
  output: "export",
  basePath,
  // Exposed to the browser for files loaded by URL outside Next, like the map worker
  env: { NEXT_PUBLIC_BASE_PATH: basePath },
  // The default next/image loader needs a server, which GitHub Pages doesn't have
  images: { unoptimized: true },
};

export default nextConfig;
