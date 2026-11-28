import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // Izinkan akses dev server dari HP di jaringan Wi-Fi yang sama
  allowedDevOrigins: ["192.168.*.*", "10.*.*.*", "172.16.*.*"],
  cacheComponents: true,
  // ExcelJS memakai API Node; adapter S3 opsional unzipper tidak digunakan aplikasi.
  serverExternalPackages: ["exceljs"],
  // Cover album galeri dari bucket Storage publik 'konten' (lib/content/schema.ts).
  images: {
    remotePatterns: [{ protocol: "https", hostname: "*.supabase.co", pathname: "/storage/v1/object/public/konten/**" }],
  },
  // Service worker PWA: jangan di-cache agar versi baru langsung terpakai.
  async headers() {
    return [
      {
        source: "/sw.js",
        headers: [
          { key: "Content-Type", value: "application/javascript; charset=utf-8" },
          { key: "Cache-Control", value: "no-cache, no-store, must-revalidate" },
          { key: "Content-Security-Policy", value: "default-src 'self'; script-src 'self'" },
        ],
      },
    ];
  },
  partialPrefetching: true,
  // Upload sampul album (maks 2 MB) lewat Server Action + overhead multipart.
  experimental: { serverActions: { bodySizeLimit: "2200kb" } },
  turbopack: {
    rules: {
      "*.css": {
        // Preserve CSS Module exports instead of converting them to global CSS.
        condition: { not: { path: /\.module\.css$/ } },
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
