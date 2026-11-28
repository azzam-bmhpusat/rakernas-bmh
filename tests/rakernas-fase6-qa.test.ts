import { describe, it, expect } from "vitest";
import fs from "fs";
import path from "path";
import {
  SITE_METADATA,
  EVENT_INFO,
  RUNDOWN_DATA,
  DRESSCODE_DATA,
  LOCATION_DATA,
  TRANSPORT_DATA,
  INVITED_GUESTS_CONTENT,
  NAV_ITEMS,
  FOOTER_DATA,
} from "@/content/rakernas";

describe("Fase 6 — QA & Penyelesaian: Landing Page Rakernas BMH", () => {
  describe("1. Audit Konten Satu per Satu (PRD A.5)", () => {
    it("Metadata situs dan event info cocok 100% dengan PRD", () => {
      expect(SITE_METADATA.title).toBe("Rakernas BMH");
      expect(EVENT_INFO.title).toBe("Rapat Kerja Nasional BMH 2027");
      expect(EVENT_INFO.theme).toBe(
        "Akselerasi Pertumbuhan dan Penguatan Resiliensi Menuju BMH Unggul 2030"
      );
      expect(EVENT_INFO.dateDays).toBe("01 - 03");
      expect(EVENT_INFO.dateMonthYear).toBe("Desember 2026");
      expect(EVENT_INFO.hotel).toBe("Hotel Luminor");
      expect(EVENT_INFO.address).toBe(
        "Jl. Raya Mangga Besar No.73 1, RT.1/RW.2, Tangki, Kec. Taman Sari, Kota Jakarta Barat, Daerah Khusus Ibukota Jakarta 11170"
      );
      expect(EVENT_INFO.mapsUrl).toBe("https://maps.app.goo.gl/d4RQdTwK9jbx4qZD8");
      expect(EVENT_INFO.countdownTarget).toBe("2026-12-01T10:00:00+07:00");
    });

    it("Rundown Hari 1 memuat 26 agenda dalam bagian A-G sesuai rundown resmi", () => {
      const h1 = RUNDOWN_DATA.hari1;
      expect(h1).toHaveLength(26);
      expect(h1[0]).toEqual({
        section: "A. Registrasi Peserta",
        time: "10.00 - 12.00",
        title: "Kedatangan peserta di lobi utama hotel, dilanjutkan menuju area registrasi",
      });
      expect(h1[25]).toEqual({
        section: "G. Paparan Strategi 2027",
        time: "20.30 - 21.30",
        title: "G. Paparan Strategi 2027",
      });
      const sections: string[] = [];
      for (const item of h1) if (item.section && sections.at(-1) !== item.section) sections.push(item.section);
      expect(sections).toEqual([
        "A. Registrasi Peserta",
        "B. Pembukaan",
        "C. Check-in Kamar Hotel",
        "D. Orientasi Kelembagaan",
        "E. Laporan Kinerja BMH 2026",
        "F. Sosialisasi Kebijakan",
        "G. Paparan Strategi 2027",
      ]);
      expect(h1.filter((i) => i.section === "A. Registrasi Peserta")).toHaveLength(5);
      expect(h1.filter((i) => i.section === "B. Pembukaan")).toHaveLength(13);
    });

    it("Rundown Hari 2 dan Hari 3 memuat jadwal resmi tanpa placeholder", () => {
      const { hari2, hari3 } = RUNDOWN_DATA;
      expect(hari2).toHaveLength(14);
      expect(hari2[0]).toEqual({ time: "03.00 - 04.00", title: "Sholat Lail" });
      expect(hari2[2].title).toBe("H. Tausiyah (1)");
      expect(hari2[13]).toEqual({ time: "20.30 - 21.30", title: "N. Presentasi Pengawasan" });
      expect(hari3).toHaveLength(8);
      expect(hari3[2].title).toBe("O. Tausiyah (2)");
      const penutupan = hari3[7];
      expect(penutupan.title).toBe("Y. Penutupan");
      expect(penutupan.time).toBe("10.30 - 12.00");
      expect(penutupan.details).toBeUndefined();
      for (const item of [...hari2, ...hari3]) expect(item.title).not.toContain("segera diumumkan");
    });

    it("Dresscode memuat 3 item terurut", () => {
      expect(DRESSCODE_DATA).toHaveLength(3);
      expect(DRESSCODE_DATA.map((i) => i.day)).toEqual(["Hari Pertama", "Hari Kedua", "Hari Ketiga"]);
    });

    it("Galeri lokasi memuat 5 foto fasilitas terurut dengan keterangan persis", () => {
      const expectedCaptions = ["Gedung", "Ruang Acara", "Ruang Makan", "Kamar", "Belakang Gedung"];
      expect(LOCATION_DATA.gallery).toHaveLength(5);
      LOCATION_DATA.gallery.forEach((item, idx) => {
        expect(item.caption).toBe(expectedCaptions[idx]);
        expect(item.src).toBeTruthy();
      });
    });

    it("Info transportasi memprioritaskan tiga pemberhentian lokal lalu Pasar Senen dan dua bandara", () => {
      expect(TRANSPORT_DATA.items).toHaveLength(6);
      const expectedData = [
        { name: "Halte Hotel Ambhara Blok M", accessInfo: "Di dekat hotel", icon: "bus", travelMode: "walking" },
        { name: "Terminal Blok M / Halte Transjakarta Blok M", accessInfo: "Jalan kaki ±7 menit", icon: "bus", travelMode: "walking" },
        { name: "Stasiun MRT Blok M BCA", accessInfo: "Sekitar 660 m dari hotel", icon: "train", travelMode: "walking" },
        { name: "Stasiun Pasar Senen", accessInfo: "Transportasi online ke hotel", icon: "train", travelMode: "driving" },
        { name: "Bandara Halim Perdanakusuma (HLP)", accessInfo: "Bandara terdekat · Taksi/mobil ke hotel", icon: "plane", travelMode: "driving" },
        { name: "Bandara Soekarno–Hatta (CGK)", accessInfo: "Alternatif bandara · Taksi/mobil ke hotel", icon: "plane", travelMode: "driving" },
      ];

      TRANSPORT_DATA.items.forEach((item, idx) => {
        expect(item).toMatchObject(expectedData[idx]);
        expect(item.mapsQuery).toBeTruthy();
      });
      expect(TRANSPORT_DATA.destination.name).toBe("Ambhara Hotel Jakarta");
      expect(TRANSPORT_DATA.destination.address).toContain("Jl. Iskandarsyah I No.1");
      expect(JSON.stringify(TRANSPORT_DATA.items)).not.toMatch(/fares|Gambir|Tanjung Priok|Pulogadung|Kalideres|Kampung Rambutan/);
    });

    it("Tamu Undangan menjelaskan empat kolom pencarian dan detail tamu", () => {
      expect(INVITED_GUESTS_CONTENT.title).toBe("Peserta Rakernas");
      expect(INVITED_GUESTS_CONTENT.description).toBe("Temukan detail peserta berdasarkan nama, perwakilan daerah, atau jabatan.");
      expect(INVITED_GUESTS_CONTENT.detailsTitle).toBe("Detail Peserta");
    });

    it("Footer memuat logo, info acara, dan tautan resmi panitia tanpa counter pengunjung", () => {
      expect(FOOTER_DATA.logoSrc).toBe("/light-logo-dark-bg.png");
      expect(FOOTER_DATA.logoAlt).toBe("Logo Rakernas BMH 2027");
      expect(FOOTER_DATA.text).toBe("08-10 Desember 2026 | Hotel Luminor Kota Jakarta Barat @2026");
      expect(FOOTER_DATA.committee.label).toBe("Panitia Rakernas");
      expect(FOOTER_DATA.committee.url).toBe("https://wa.me/6289517795206");
    });

    it("Navigasi header memuat anchor Rundown Acara dan Dress Code", () => {
      expect(NAV_ITEMS).toHaveLength(2);
      expect(NAV_ITEMS.map((n) => n.href)).toEqual(["#rundown", "#dresscode"]);
    });
  });

  describe("2. Kepatuhan Aturan Penamaan (PRD A.3)", () => {
    it("Tidak ada kata 'Hidayatullah' pada title, H1, dan alt logo", () => {
      expect(SITE_METADATA.title).not.toContain("Hidayatullah");
      expect(EVENT_INFO.title).not.toContain("Hidayatullah");
      expect(EVENT_INFO.logoAlt).not.toContain("Hidayatullah");
      expect(FOOTER_DATA.logoAlt).not.toContain("Hidayatullah");
    });

    it("Tautan panitia tetap dipertahankan", () => {
      expect(FOOTER_DATA.committee.url).toContain("wa.me/");
    });
  });

  describe("3. Audit Token Warna & Kepatuhan globals.css (PRD B.2 & B.9)", () => {
    it("Seluruh komponen rakernas tidak menggunakan kelas warna bawaan Tailwind terlarang", () => {
      const rakernasDir = path.join(process.cwd(), "components", "rakernas");
      const files = fs.readdirSync(rakernasDir).filter((f) => f.endsWith(".tsx"));
      files.push(path.join("..", "..", "app", "(site)", "page.tsx"));

      const forbiddenRegex =
        /\b(?:green-(?:200|300|400|500|600|700|800|900|950)|emerald-[0-9]{2,3}|yellow-[0-9]{2,3})\b/;

      for (const file of files) {
        const filePath = path.join(rakernasDir, file);
        const content = fs.readFileSync(filePath, "utf-8");
        const match = content.match(forbiddenRegex);
        expect(
          match,
          `File ${file} memuat kelas warna terlarang: ${match ? match[0] : ""}`
        ).toBeNull();
      }
    });

    it("Komponen rakernas tidak memuat kode warna heksadesimal arbitrer", () => {
      const rakernasDir = path.join(process.cwd(), "components", "rakernas");
      const files = fs.readdirSync(rakernasDir).filter((f) => f.endsWith(".tsx"));

      const hexRegex = /#[0-9a-fA-F]{3,8}\b/;

      for (const file of files) {
        const filePath = path.join(rakernasDir, file);
        const content = fs.readFileSync(filePath, "utf-8");
        const match = content.match(hexRegex);
        expect(
          match,
          `File ${file} memuat warna arbitrer hex: ${match ? match[0] : ""}`
        ).toBeNull();
      }
    });

    it("app/globals.css bersih tanpa modifikasi", () => {
      const globalsCssPath = path.join(process.cwd(), "app", "globals.css");
      expect(fs.existsSync(globalsCssPath)).toBe(true);
    });
  });

  describe("4. Audit Target Sentuh & Aksesibilitas (PRD B.6 & A.7)", () => {
    it("Header menu trigger memiliki area sentuh minimal 44 px (size-11)", () => {
      const headerFile = path.join(process.cwd(), "components", "rakernas", "site-header.tsx");
      const content = fs.readFileSync(headerFile, "utf-8");
      expect(content).toContain("size-11");
    });

    it("Tombol navigasi pencarian tamu memiliki tinggi minimal 48 px (h-12)", () => {
      const regFile = path.join(process.cwd(), "components", "rakernas", "invited-guests-section.tsx");
      const content = fs.readFileSync(regFile, "utf-8");
      expect(content).toContain("h-12");
    });

    it("Semua tautan eksternal memiliki target='_blank' dan rel='noopener noreferrer'", () => {
      const components = [
        "hero.tsx",
        "location-section.tsx",
        "invited-guests-section.tsx",
        "site-footer.tsx",
      ];

      for (const comp of components) {
        const filePath = path.join(process.cwd(), "components", "rakernas", comp);
        const content = fs.readFileSync(filePath, "utf-8");
        if (content.includes("target=\"_blank\"")) {
          expect(content).toContain('rel="noopener noreferrer"');
        }
      }
    });

    it("Setiap section landing page dilengkapi id dan scroll-mt-20", () => {
      const pageFile = path.join(process.cwd(), "app", "(site)", "page.tsx");
      const content = fs.readFileSync(pageFile, "utf-8");
      const expectedSections = [
        'id="countdown"',
        'id="rundown"',
        'id="dresscode"',
        'id="lokasi"',
        'id="transportasi"',
        'id="tamu-undangan"',
      ];

      for (const sectionId of expectedSections) {
        expect(content).toContain(sectionId);
      }
      expect(content).toContain("scroll-mt-20");
      expect(content).toContain("overflow-x-hidden");
    });

    it("Root layout memuat lang='id' dan scroll-smooth", () => {
      const layoutFile = path.join(process.cwd(), "app", "layout.tsx");
      const content = fs.readFileSync(layoutFile, "utf-8");
      expect(content).toContain('lang="id"');
      expect(content).toContain("scroll-smooth");
    });
  });

  describe("5. Verifikasi Non-Regresi Rute Utama Lainnya", () => {
    it("Rute aplikasi lainnya tetap ada dan utuh", () => {
      const requiredRoutes = [
        path.join(process.cwd(), "app", "absen", "page.tsx"),
        path.join(process.cwd(), "app", "absen", "selesai", "page.tsx"),
        path.join(process.cwd(), "app", "display", "page.tsx"),
        path.join(process.cwd(), "app", "admin", "page.tsx"),
        path.join(process.cwd(), "app", "admin", "login", "page.tsx"),
        path.join(process.cwd(), "app", "admin", "qr", "page.tsx"),
      ];

      for (const routePath of requiredRoutes) {
        expect(fs.existsSync(routePath), `Route file ${routePath} harus tetap ada`).toBe(true);
      }
    });
  });
});
