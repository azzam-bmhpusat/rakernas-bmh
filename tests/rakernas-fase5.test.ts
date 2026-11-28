import { describe, it, expect } from "vitest";
import fs from "fs";
import path from "path";
import { renderToStaticMarkup } from "react-dom/server";
import { TransportSection } from "../components/rakernas/transport-accordion";
import { buildTransportDirectionsUrl } from "../lib/transport-directions";
import {
  TRANSPORT_DATA,
  INVITED_GUESTS_CONTENT,
  FOOTER_DATA,
} from "../content/rakernas";

describe("Fase 5 — Transportasi, Tamu Undangan, Footer", () => {
  const transportFile = path.join(
    __dirname,
    "../components/rakernas/transport-accordion.tsx"
  );
  const invitedGuestsFile = path.join(
    __dirname,
    "../components/rakernas/invited-guests-section.tsx"
  );
  const footerFile = path.join(
    __dirname,
    "../components/rakernas/site-footer.tsx"
  );
  const pageFile = path.join(__dirname, "../app/(site)/page.tsx");

  const transportContent = fs.readFileSync(transportFile, "utf-8");
  const invitedGuestsContent = fs.readFileSync(invitedGuestsFile, "utf-8");
  const footerContent = fs.readFileSync(footerFile, "utf-8");
  const pageContent = fs.readFileSync(pageFile, "utf-8");

  describe("S6 — Info Transportasi (FR-08 & B.6)", () => {
    it("dideklarasikan sebagai Client Component ('use client')", () => {
      expect(transportContent).toMatch(/^"use client"/);
    });

    it("memakai komponen shadcn Accordion, AccordionItem, AccordionTrigger, AccordionContent", () => {
      expect(transportContent).toContain("Accordion");
      expect(transportContent).toContain("AccordionItem");
      expect(transportContent).toContain("AccordionTrigger");
      expect(transportContent).toContain("AccordionContent");
    });

    it("menerapkan konfigurasi single collapsible dengan default item pertama terbuka ('origin-0')", () => {
      expect(transportContent).toMatch(/defaultValue=\{?\["origin-0"\]\}?/);
    });

    it("menerapkan tata letak responsif dua kolom pada layar besar (lg:grid-cols-12)", () => {
      expect(transportContent).toContain("lg:grid-cols-12");
      expect(transportContent).toContain("lg:col-span-5");
      expect(transportContent).toContain("lg:col-span-7");
    });

    it("menampilkan tiga pemberhentian lokal dan Pasar Senen diikuti Halim dan Soekarno–Hatta", () => {
      expect(TRANSPORT_DATA.items.map((item) => item.name)).toEqual([
        "Halte Hotel Ambhara Blok M",
        "Terminal Blok M / Halte Transjakarta Blok M",
        "Stasiun MRT Blok M BCA",
        "Stasiun Pasar Senen",
        "Bandara Halim Perdanakusuma (HLP)",
        "Bandara Soekarno–Hatta (CGK)",
      ]);
      TRANSPORT_DATA.items.forEach((item) => {
        expect(item.accessInfo).toBeTruthy();
        expect(item.description).toBeTruthy();
        expect(item.mapsQuery).toBeTruthy();
      });
      expect(transportContent).toContain("TRANSPORT_DATA.items.map");
      expect(transportContent).toContain("item.accessInfo");
    });

    it("tautan peta memakai titik turun dan alamat Ambhara dengan moda jalan kaki", () => {
      const html = renderToStaticMarkup(TransportSection());
      const hrefs = [...html.matchAll(/href="([^"]+)"/g)].map(([, href]) => href.replaceAll("&amp;", "&"));
      const walkingLinks = hrefs.filter((href) => href.startsWith("https://www.google.com/maps/dir/"));
      expect(walkingLinks.length).toBeGreaterThan(0);
      for (const href of walkingLinks) {
        const url = new URL(href);
        expect(url.searchParams.get("api")).toBe("1");
        expect(url.searchParams.get("travelmode")).toBe("walking");
        expect(TRANSPORT_DATA.items.map((item) => item.mapsQuery)).toContain(url.searchParams.get("origin"));
        expect(url.searchParams.get("destination")).toBe("Ambhara Hotel Jakarta, Jl. Iskandarsyah I No.1, RT.5/RW.2, Melawai, Kec. Kby. Baru, Kota Jakarta Selatan, Daerah Khusus Ibukota Jakarta 12160");
      }
      expect(html).toContain(TRANSPORT_DATA.travelNote);
      expect(html).not.toContain("Hotel Luminor");
      expect(html).toContain(TRANSPORT_DATA.fareNote);
      expect(html).toContain("Jarak ke hotel");
      expect(html).toContain(TRANSPORT_DATA.items[0].distanceInfo);
      expect(html).toContain("Moda yang cocok");
      expect(html).toContain(TRANSPORT_DATA.items[0].transportMode);
      expect(html).toContain("Estimasi harga");
      expect(html).toContain(TRANSPORT_DATA.items[0].estimatedFare);
    });

    it.each([
      ["Halte Hotel Ambhara Blok M", "walking"],
      ["Terminal Blok M / Halte Transjakarta Blok M", "walking"],
      ["Stasiun MRT Blok M BCA", "walking"],
      ["Stasiun Pasar Senen", "driving"],
      ["Bandara Halim Perdanakusuma (HLP)", "driving"],
      ["Bandara Soekarno–Hatta (CGK)", "driving"],
    ])("rute %s menggunakan moda %s menuju Ambhara", (name, mode) => {
      const item = TRANSPORT_DATA.items.find((stop) => stop.name === name);
      expect(item).toBeDefined();
      const url = new URL(buildTransportDirectionsUrl(item!));
      expect(url.origin).toBe("https://www.google.com");
      expect(url.pathname).toBe("/maps/dir/");
      expect(url.searchParams.get("api")).toBe("1");
      expect(url.searchParams.get("travelmode")).toBe(mode);
      expect(url.searchParams.get("origin")).toBe(item!.mapsQuery);
      expect(url.searchParams.get("destination")).toBe("Ambhara Hotel Jakarta, Jl. Iskandarsyah I No.1, RT.5/RW.2, Melawai, Kec. Kby. Baru, Kota Jakarta Selatan, Daerah Khusus Ibukota Jakarta 12160");
    });

    it("menampilkan pengumuman transit: 'panitia' menaut ke footerUrl dan tombol Google Maps terpisah", () => {
      expect(transportContent).toContain("footerUrl");
      expect(transportContent).toContain("href={footerUrl}");
      expect(transportContent).toContain("announcement.mapsUrl");
      expect(transportContent).toContain("announcement.linkLabel");
      expect(transportContent).toContain('role="note"');
      expect(transportContent.match(/rel="noopener noreferrer"/g)?.length).toBe(3);
      // Halaman beranda meneruskan footer_url dari event settings
      expect(pageContent).toContain("footerUrl={settings.footerUrl}");
    });

    it("merender pengumuman dengan tautan footerUrl kustom dan tombol Maps", () => {
      // TransportSection tidak memakai hook sendiri, jadi cukup dipanggil sebagai fungsi.
      const html = renderToStaticMarkup(
        TransportSection({ venueName: "Hotel Uji", footerUrl: "https://example.com/panitia-baru" })
      );
      expect(html).toContain("Hotel Uji");
      expect(html).toContain("Guest House YPPH Depok");
      expect(html).toContain('href="https://example.com/panitia-baru"');
      expect(html).toContain('href="https://maps.app.goo.gl/LrBzn1tPFqKaRFTTA"');
      expect(html).toContain("Halte Hotel Ambhara Blok M");
    });

    it("menampilkan ikon transportasi di dalam lingkaran hijau lembut (bg-green-100 text-primary)", () => {
      expect(transportContent).toContain("bg-green-100");
      expect(transportContent).toContain("text-primary");
      expect(transportContent).toContain("Footprints");
      expect(transportContent).toContain("Car");
      expect(transportContent).toContain("Plane");
      expect(transportContent).toContain("TrainFront");
      expect(transportContent).toContain("Bus");
    });

    it("memastikan target sentuh trigger minimal 44 px (min-h-[44px])", () => {
      expect(transportContent).toContain("min-h-[44px]");
    });
  });

  describe("S7 — Tamu Undangan", () => {
    it("dideklarasikan sebagai Client Component ('use client')", () => {
      expect(invitedGuestsContent).toMatch(/^"use client"/);
    });

    it("menyediakan pencarian, kartu detail, dan navigasi hasil dengan shadcn", () => {
      for (const component of ["InputGroup", "Label", "Card", "Button", "Badge", "Separator", "Skeleton"]) {
        expect(invitedGuestsContent).toContain(`@/components/ui/${component === "InputGroup" ? "input-group" : component.toLowerCase()}`);
      }
      expect(INVITED_GUESTS_CONTENT.title).toBe("Peserta Rakernas");
      expect(INVITED_GUESTS_CONTENT.detailsTitle).toBe("Detail Peserta");
    });

    it("menghapus rekening, formulir, dan konfirmasi pembayaran dari tampilan", () => {
      expect(invitedGuestsContent).not.toMatch(/REGISTRATION_DATA|navigator.clipboard|forms\.gle|wa\.me/);
      expect(pageContent).not.toContain("RegistrationSection");
      expect(fs.existsSync(path.join(__dirname, "../components/rakernas/registration-section.tsx"))).toBe(false);
    });
  });

  describe("S8 — Footer (B.5 & B.6)", () => {
    it("menampilkan satu logo Rakernas dengan tinggi maksimal 40 px", () => {
      expect(footerContent).toContain("FOOTER_DATA.logoSrc");
      expect(FOOTER_DATA.logoSrc).toBe("/light-logo-dark-bg.png");
      expect(FOOTER_DATA.logoAlt).toBe("Logo Rakernas BMH 2027");
    });

    it("menampilkan teks resmi tanggal, hotel, dan tahun", () => {
      // Tanggal & hotel dari event settings, ditampilkan sebagai baris terpisah di kolom Informasi Acara
      expect(footerContent).toContain("formatEventDateRange(settings.startsAt)");
      expect(footerContent).toContain("settings.venueName");
      expect(FOOTER_DATA.text).toBe(
        "08-10 Desember 2026 | Hotel Luminor Kota Jakarta Barat @2026"
      );
    });

    it("menampilkan tautan resmi ke Panitia Rakernas", () => {
      expect(footerContent).toContain("settings.footerUrl");
      expect(footerContent).toContain("FOOTER_DATA.committee.label");
      expect(FOOTER_DATA.committee.url).toBe("https://wa.me/6289517795206");
      expect(footerContent).toContain('target="_blank"');
      expect(footerContent).toContain('rel="noopener noreferrer"');
    });

    it("tidak memuat penghitung pengunjung (visitor counter)", () => {
      expect(footerContent.toLowerCase()).not.toContain("visitor");
      expect(footerContent.toLowerCase()).not.toContain("pengunjung");
    });
  });

  describe("Integrasi Halaman Utama (app/(site)/page.tsx)", () => {
    it("memasang TransportSection, InvitedGuestsSection, dan SiteFooter", () => {
      expect(pageContent).toContain("TransportSection");
      expect(pageContent).toContain("InvitedGuestsSection");
      expect(pageContent).toContain("SiteFooter");
    });

    it("mengatur id anchor dan latar bagian sesuai Design System", () => {
      expect(pageContent).toContain('id="transportasi"');
      expect(pageContent).toContain("bg-surface");
      expect(pageContent).toContain('id="tamu-undangan"');
      expect(pageContent).toContain("display-theme display-bg");
    });
  });
});
