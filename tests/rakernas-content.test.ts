import { describe, it, expect } from "vitest";
import {
  SITE_METADATA,
  EVENT_INFO,
  NAV_ITEMS,
  RUNDOWN_DATA,
  DRESSCODE_DATA,
  LOCATION_DATA,
  TRANSPORT_DATA,
  INVITED_GUESTS_CONTENT,
  FOOTER_DATA,
} from "../content/rakernas";

describe("Fase 1 — Konten Bertipe (PRD Rakernas BMH)", () => {
  describe("Kuantitas Item (PRD A.5 & Fase 1 DoD)", () => {
    it("rundown resmi: 26 agenda Hari 1, 14 agenda Hari 2, 8 agenda Hari 3", () => {
      expect(RUNDOWN_DATA.hari1).toHaveLength(26);
      expect(RUNDOWN_DATA.hari2).toHaveLength(14);
      expect(RUNDOWN_DATA.hari3).toHaveLength(8);
    });

    it("memiliki tepat 3 item dress code (hari pertama sampai ketiga)", () => {
      expect(DRESSCODE_DATA).toHaveLength(3);
      expect(DRESSCODE_DATA.map((i) => i.src)).toEqual([
        "/dresscode/hari-pertama.png",
        "/dresscode/hari-kedua.png",
        "/dresscode/hari-ketiga.png",
      ]);
      expect(DRESSCODE_DATA.map((i) => i.day)).toEqual([
        "Hari Pertama",
        "Hari Kedua",
        "Hari Ketiga",
      ]);
      expect(DRESSCODE_DATA.map((i) => i.desc)).toEqual([
        "Kemeja lengan panjang + Jas + Songkok Nasional.",
        "Baju koko + Songkok Nasional.",
        "Batik lengan panjang + Songkok Nasional.",
      ]);
    });

    it("memiliki tepat 5 foto galeri fasilitas hotel dengan urutan keterangan", () => {
      expect(LOCATION_DATA.gallery).toHaveLength(5);
      const expectedCaptions = ["Gedung", "Ruang Acara", "Ruang Makan", "Kamar", "Belakang Gedung"];
      LOCATION_DATA.gallery.forEach((item, idx) => {
        expect(item.caption).toBe(expectedCaptions[idx]);
        expect(item.src).toMatch(/^\/galeri-fasilitas-hotel\/[a-z-]+\.jpg$/);
      });
    });

    it("memiliki tiga pemberhentian lokal, Stasiun Pasar Senen, dan dua bandara dengan moda yang sesuai", () => {
      expect(TRANSPORT_DATA.items).toHaveLength(6);
      expect(TRANSPORT_DATA.destination.name).toBe("Ambhara Hotel Jakarta");
      TRANSPORT_DATA.items.forEach((item) => {
        expect(item.name).toBeTruthy();
        expect(["bus", "train", "plane"]).toContain(item.icon);
        expect(item.accessInfo).toBeTruthy();
        expect(item.distanceInfo).toBeTruthy();
        expect(item.transportMode).toBeTruthy();
        expect(item.estimatedFare).toMatch(/^Rp [\d.]+ – [\d.]+$/);
        expect(item.travelMode).toBe(item.icon === "plane" || item.name === "Stasiun Pasar Senen" ? "driving" : "walking");
        expect(item.description).toBeTruthy();
        expect(item.mapsQuery).toBeTruthy();
      });
      expect(TRANSPORT_DATA.items.filter((item) => item.travelMode === "walking")).toHaveLength(3);
      expect(TRANSPORT_DATA.items.filter((item) => item.icon === "plane")).toHaveLength(2);
      expect(new Set(TRANSPORT_DATA.items.map((item) => item.mapsQuery)).size).toBe(6);
      expect(TRANSPORT_DATA.items.map((item) => item.estimatedFare)).toEqual([
        "Rp 5.000 – 10.000",
        "Rp 10.000 – 15.000",
        "Rp 10.000 – 15.000",
        "Rp 33.000 – 45.000",
        "Rp 65.000 – 100.000",
        "Rp 90.000 – 140.000",
      ]);
    });

    it("memiliki pengumuman tempat transit H-1 dengan tautan Google Maps Guest House YPPH Depok", () => {
      const { announcement } = TRANSPORT_DATA;
      expect(announcement.text).toBe("H-1 Panitia menyediakan tempat transit di: Guest House YPPH Depok, konfirmasi ke ");
      expect(announcement.linkLabel).toBe("panitia");
      expect(announcement.mapsUrl).toBe("https://maps.app.goo.gl/LrBzn1tPFqKaRFTTA");
    });

    it("menyediakan copywriting pencarian dan empat label detail tamu", () => {
      expect(INVITED_GUESTS_CONTENT.title).toBe("Peserta Rakernas");
      expect(INVITED_GUESTS_CONTENT.detailsTitle).toBe("Detail Peserta");
      expect(Object.keys(INVITED_GUESTS_CONTENT.fields)).toEqual(["nama", "perwakilan_daerah", "jabatan"]);
    });

    it("memiliki 2 anchor section di navbar (Rundown Acara dan Dress Code)", () => {
      expect(NAV_ITEMS).toHaveLength(2);
      expect(NAV_ITEMS.map((n) => n.href)).toEqual(["#rundown", "#dresscode"]);
    });
  });

  describe("Aturan Penggantian Nama (PRD A.3)", () => {
    it("judul dan metadata memakai 'Rakernas BMH' tanpa kata 'Hidayatullah'", () => {
      expect(SITE_METADATA.title).toBe("Rakernas BMH");
      expect(EVENT_INFO.name).toBe("Rakernas BMH");
      expect(EVENT_INFO.title).toBe("Rapat Kerja Nasional BMH 2027");
      expect(EVENT_INFO.title).not.toContain("Hidayatullah");
      expect(EVENT_INFO.logoAlt).toBe("Logo Rakernas BMH 2027");
      expect(EVENT_INFO.logoAlt).not.toContain("Hidayatullah");
      expect(FOOTER_DATA.logoAlt).toBe("Logo Rakernas BMH 2027");
      expect(FOOTER_DATA.logoAlt).not.toContain("Hidayatullah");
    });

    it("tema mengikuti konten acara terkini", () => {
      expect(EVENT_INFO.theme).toBe(
        "Akselerasi Pertumbuhan dan Penguatan Resiliensi Menuju BMH Unggul 2030"
      );
    });

    it("tautan awal panitia mengikuti konten proyek terbaru", () => {
      expect(FOOTER_DATA.committee.label).toBe("Panitia Rakernas");
      expect(FOOTER_DATA.committee.url).toBe("https://wa.me/6289517795206");
    });

  });

  describe("Kevalidan Tautan Eksternal & Target Waktu", () => {
    it("semua tautan eksternal diawali dengan https://", () => {
      const urls = [
        EVENT_INFO.mapsUrl,
        LOCATION_DATA.mapsUrl,
        FOOTER_DATA.committee.url,
      ];

      urls.forEach((url) => {
        expect(url.startsWith("https://")).toBe(true);
      });
    });

    it("countdownTarget merupakan tanggal ISO 8601 yang valid pada 1 Desember 2026 jam 10:00 WIB", () => {
      expect(EVENT_INFO.countdownTarget).toBe("2026-12-01T10:00:00+07:00");
      const parsedTime = Date.parse(EVENT_INFO.countdownTarget);
      expect(Number.isNaN(parsedTime)).toBe(false);
    });
  });
});
