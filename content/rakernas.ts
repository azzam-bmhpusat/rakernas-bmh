// content/rakernas.ts
// Single source of truth untuk seluruh teks, jadwal, tarif, dan tautan landing page Rakernas BMH (/)

export interface NavItem {
  label: string;
  href: string;
}

export interface EventInfo {
  name: string;
  title: string;
  theme: string;
  dateDays: string;
  dateMonthYear: string;
  hotel: string;
  address: string;
  mapsUrl: string;
  countdownTarget: string; // ISO 8601 string
  logoSrc: string;
  logoAlt: string;
}

export interface RundownItem {
  time: string;
  title: string;
  note?: string;
  /** Judul bagian; baris berurutan dengan section sama dikelompokkan di tampilan. */
  section?: string;
  /** Sub-poin bernomor di bawah judul. */
  details?: string[];
}

export interface DresscodeItem {
  src: string;
  alt: string;
  day: string;
  desc: string;
}

export interface GalleryItem {
  src: string;
  caption: string;
  /** Atribusi foto berlisensi (mis. Wikimedia Commons). */
  credit?: string;
}

export interface TransportItem {
  name: string;
  icon: "train" | "bus" | "plane";
  accessInfo: string;
  distanceInfo: string;
  transportMode: string;
  estimatedFare: string;
  travelMode: "walking" | "driving";
  description: string;
  /** Nama titik asal yang digunakan Google Maps untuk rute menuju hotel. */
  mapsQuery: string;
}

export interface FooterInfo {
  logoSrc: string;
  logoAlt: string;
  text: string;
  committee: {
    label: string;
    url: string;
    /** Nomor WhatsApp panitia dalam format lokal (sama dengan `url`). */
    phone: string;
  };
}

export interface SiteMetadata {
  title: string;
  description: string;
  lang: string;
}

// ---------------------------------------------------------------------------
// DATA IMPLEMENTASI
// ---------------------------------------------------------------------------

export const SITE_METADATA: SiteMetadata = {
  title: "Rakernas BMH",
  description: "Rapat Kerja Nasional BMH 2027. 01–03 Desember 2026 di Hotel Luminor Kota Jakarta Barat.",
  lang: "id",
};

// Tema acara: tampil di hero beranda dan dipakai untuk Open Graph.
export const EVENT_THEME =
  "Akselerasi Pertumbuhan dan Penguatan Resiliensi Menuju BMH Unggul 2030";

export const EVENT_INFO: EventInfo = {
  name: "Rakernas BMH",
  title: "Rapat Kerja Nasional BMH 2027",
  theme: EVENT_THEME,
  dateDays: "01 - 03",
  dateMonthYear: "Desember 2026",
  hotel: "Hotel Luminor",
  address: "Jl. Raya Mangga Besar No.73 1, RT.1/RW.2, Tangki, Kec. Taman Sari, Kota Jakarta Barat, Daerah Khusus Ibukota Jakarta 11170",
  mapsUrl: "https://maps.app.goo.gl/d4RQdTwK9jbx4qZD8",
  countdownTarget: "2026-12-01T10:00:00+07:00",
  logoSrc: "/logo-rakernas-nav.png",
  logoAlt: "Logo Rakernas BMH 2027",
};

/** Anchor section beranda yang muncul di navbar (href "#id"). */
export const NAV_ITEMS: NavItem[] = [
  { label: "Rundown Acara", href: "#rundown" },
  { label: "Dress Code", href: "#dresscode" },
];

/** Tautan navbar: href "/path" = halaman, "#id" = section di beranda. */
export interface NavMenuLink extends NavItem {
  children?: undefined;
}

/** Menu bertingkat (muncul saat hover di desktop, accordion di HP/tablet). */
export interface NavMenuGroup {
  label: string;
  href?: undefined;
  children: NavItem[];
}

export type NavMenuEntry = NavMenuLink | NavMenuGroup;

export const PUBLIKASI_MENU: NavItem[] = [
  { label: "Foto Galeri Kegiatan", href: "/publikasi/foto-galeri-kegiatan" },
  { label: "Materi Presentasi Rakernas", href: "/publikasi/materi-presentasi-rakernas" },
  { label: "Notula Rapat", href: "/publikasi/notula-rapat" },
];

/** Satu sumber kebenaran menu navbar halaman publik. */
export const NAV_MENU: NavMenuEntry[] = [
  { label: "Beranda", href: "/" },
  ...NAV_ITEMS,
  { label: "Informasi Kamar Hotel", href: "/informasi-kamar-hotel" },
  { label: "Publikasi", children: PUBLIKASI_MENU },
];

// Rundown resmi Rakernas BMH 2027. Tanggal tiap hari dihitung dari pengaturan acara (event_settings.starts_at).
// `section` = judul bagian (dikelompokkan di tampilan), `details` = sub-poin bernomor.
export const RUNDOWN_DATA: Record<"hari1" | "hari2" | "hari3", RundownItem[]> = {
  hari1: [
    { section: "A. Registrasi Peserta", time: "10.00 - 12.00", title: "Kedatangan peserta di lobi utama hotel, dilanjutkan menuju area registrasi" },
    { section: "A. Registrasi Peserta", time: "10.00 - 12.00", title: "A. Registrasi ulang dan pengambilan goodybag Rakernas Kit di meja registrasi" },
    { section: "A. Registrasi Peserta", time: "10.00 - 12.00", title: "Makan siang dan istirahat di ruang transit/restoran" },
    { section: "A. Registrasi Peserta", time: "12.00 - 12.30", title: "Shalat berjamaah di musholla" },
    { section: "A. Registrasi Peserta", time: "12.30 - 12.45", title: "Peserta memasuki ruang acara paling lambat pukul 12.45 WIB" },

    { section: "B. Pembukaan", time: "12.30 - 12.45", title: "Ruang Zoom untuk peserta online dibuka" },
    { section: "B. Pembukaan", time: "12.45 - 13.00", title: "Penampilan Tim Hadroh dari Santri Binaan BMH" },
    { section: "B. Pembukaan", time: "13.00 - 13.10", title: "B. Pembukaan oleh MC" },
    { section: "B. Pembukaan", time: "13.10 - 13.20", title: "Tilawah" },
    { section: "B. Pembukaan", time: "13.20 - 13.30", title: "Menyanyikan Indonesia Raya & Mars BMH" },
    { section: "B. Pembukaan", time: "13.30 - 13.40", title: "Penampilan Tim Hadroh" },
    { section: "B. Pembukaan", time: "13.40 - 13.50", title: "Sambutan Ketua Panitia Rakernas BMH" },
    { section: "B. Pembukaan", time: "13.50 - 14.00", title: "Sambutan Ketua Pengurus BMH" },
    { section: "B. Pembukaan", time: "14.00 - 14.10", title: "Sambutan Ketua Pembina BMH" },
    { section: "B. Pembukaan", time: "14.10 - 14.25", title: "Sambutan Dirzawa Kemenag RI dan pembukaan acara secara resmi" },
    { section: "B. Pembukaan", time: "14.25 - 14.55", title: "Pengumuman dan penyerahan Apresiasi BMH Award 2026 + foto bersama" },
    { section: "B. Pembukaan", time: "14.45 - 14.55", title: "Pembacaan doa" },
    { section: "B. Pembukaan", time: "14.55 - 15.50", title: "Penutup acara oleh MC" },

    { section: "C. Check-in Kamar Hotel", time: "15.00 - 16.00", title: "C. Check-in kamar hotel (kunci diambil di meja registrasi)" },

    { section: "D. Orientasi Kelembagaan", time: "16.00 - 16.40", title: "D. Orientasi Kelembagaan" },
    { section: "D. Orientasi Kelembagaan", time: "16.40 - 16.50", title: "Coffee Break" },

    { section: "E. Laporan Kinerja BMH 2026", time: "16.50 - 17.45", title: "E. Laporan Kinerja BMH 2026" },
    { section: "E. Laporan Kinerja BMH 2026", time: "17.45 - 19.30", title: "Ishoma" },

    { section: "F. Sosialisasi Kebijakan", time: "19.30 - 20.25", title: "F. Sosialisasi Kebijakan" },
    { section: "F. Sosialisasi Kebijakan", time: "20.25 - 20.30", title: "Coffee Break" },

    { section: "G. Paparan Strategi 2027", time: "20.30 - 21.30", title: "G. Paparan Strategi 2027" },
  ],
  hari2: [
    { time: "03.00 - 04.00", title: "Sholat Lail" },
    { time: "04.00 - 04.30", title: "Sholat Shubuh & Wirid" },
    { time: "04.30 - 06.00", title: "H. Tausiyah (1)" },
    { time: "06.00 - 08.00", title: "Olahraga, sarapan dan persiapan" },
    { time: "08.00 - 10.00", title: "I. Presentasi Direktorat Prodaya" },
    { time: "10.00 - 12.00", title: "J. Presentasi Direktorat Marketing" },
    { time: "12.00 - 13.00", title: "Ishoma" },
    { time: "13.00 - 15.00", title: "K. Presentasi Direktorat Seklem" },
    { time: "15.00 - 16.00", title: "Coffee Break" },
    { time: "16.00 - 17.30", title: "L. Presentasi Direktorat Operasional" },
    { time: "17.30 - 19.30", title: "Ishoma" },
    { time: "19.30 - 20.25", title: "M. Presentasi Direktorat Jaringan" },
    { time: "20.25 - 20.30", title: "Coffee Break" },
    { time: "20.30 - 21.30", title: "N. Presentasi Pengawasan" },
  ],
  hari3: [
    { time: "03.00 - 04.00", title: "Sholat Lail" },
    { time: "04.00 - 04.30", title: "Sholat Shubuh & Wirid" },
    { time: "04.30 - 06.00", title: "O. Tausiyah (2)" },
    { time: "06.00 - 07.00", title: "Olahraga, sarapan dan persiapan" },
    { time: "07.00 - 08.30", title: "P. Workshop Project Manajemen" },
    { time: "08.30 - 10.00", title: "W. Leadership Training" },
    { time: "10.00 - 10.30", title: "X. Pembacaan Rekomendasi" },
    { time: "10.30 - 12.00", title: "Y. Penutupan" },
  ],
};

export const DRESSCODE_DATA: DresscodeItem[] = [
  {
    src: "/dresscode/1.png",
    alt: "Dress code hari pertama: kemeja lengan panjang, jas, dan songkok nasional",
    day: "Hari Pertama",
    desc: "Kemeja lengan panjang + Jas + Songkok Nasional.",
  },
  {
    src: "/dresscode/2.png",
    alt: "Dress code hari kedua: baju koko dan songkok nasional",
    day: "Hari Kedua",
    desc: "Baju koko + Songkok Nasional.",
  },
  {
    src: "/dresscode/3.png",
    alt: "Dress code hari ketiga: batik lengan panjang dan songkok nasional",
    day: "Hari Ketiga",
    desc: "Batik lengan panjang + Songkok Nasional.",
  },
];

export const LOCATION_DATA = {
  title: "Lokasi Rakernas",
  map: {
    // [longitude, latitude], dari tautan Maps pada situs resmi Hotel Luminor Kota.
    coordinates: [106.823191, -6.148531] as [number, number],
    zoom: 6,
    styleUrl: "https://tiles.openfreemap.org/styles/positron",
  },
  banner: {
    src: "/rakernas/hotel-grasia-banner.png",
    alt: "Hotel Luminor Kota Jakarta Barat",
  },
  hotel: EVENT_INFO.hotel,
  address: EVENT_INFO.address,
  mapsUrl: EVENT_INFO.mapsUrl,
  mapsButtonLabel: "Google Map Hotel Luminor",
  // Foto potret 224x298 di public/galeri-fasilitas-hotel (kartu galeri berasio 3:4).
  gallery: [
    { src: "/galeri-fasilitas-hotel/gedung.jpg", caption: "Gedung" },
    { src: "/galeri-fasilitas-hotel/ruang-acara.jpg", caption: "Ruang Acara" },
    { src: "/galeri-fasilitas-hotel/ruang-makan.jpg", caption: "Ruang Makan" },
    { src: "/galeri-fasilitas-hotel/kamar.jpg", caption: "Kamar" },
    { src: "/galeri-fasilitas-hotel/belakang-gedung.jpg", caption: "Belakang Gedung" },
  ] as GalleryItem[],
};

/** Ikon sekitar Blok M, M Bloc Space ditampilkan pertama. Foto: Wikimedia Commons. */
export const JAKARTA_EXPLORE_GALLERY: GalleryItem[] = [
  { src: "/galeri-jakarta-explore/m-bloc-space.jpg", caption: "M Bloc Space", credit: "Foto: VulcanSphere / CC BY 4.0, Wikimedia Commons" },
  { src: "/galeri-jakarta-explore/masjid-agung-al-azhar.jpg", caption: "Masjid Agung Al-Azhar", credit: "Foto: Rhmtdns / CC BY-SA 4.0, Wikimedia Commons" },
  { src: "/galeri-jakarta-explore/taman-literasi.jpg", caption: "Taman Literasi Martha Christina Tiahahu", credit: "Foto: RasyaAbhirama13 / CC BY-SA 4.0, Wikimedia Commons" },
  { src: "/galeri-jakarta-explore/stasiun-mrt-senayan.jpg", caption: "Stasiun MRT Senayan", credit: "Foto: Vulphere / CC BY 4.0, Wikimedia Commons" },
  { src: "/galeri-jakarta-explore/stasiun-mrt-asean.jpg", caption: "MRT Jakarta di Stasiun ASEAN", credit: "Foto: VulcanSphere / CC BY 4.0, Wikimedia Commons" },
  { src: "/galeri-jakarta-explore/stasiun-mrt-blok-m.jpg", caption: "Stasiun MRT Blok M", credit: "Foto: VulcanSphere / CC BY 4.0, Wikimedia Commons" },
  { src: "/galeri-jakarta-explore/blok-m-plaza.jpg", caption: "Blok M Plaza", credit: "Foto: Vulphere / CC BY 4.0, Wikimedia Commons" },
  { src: "/galeri-jakarta-explore/terminal-blok-m.jpg", caption: "Terminal Blok M", credit: "Foto: Aqilla Rahmi / CC0, Wikimedia Commons" },
];

export const TRANSPORT_DATA = {
  title: "Info Transportasi",
  badge: "Panduan Transportasi",
  subtitle: "Akses menuju",
  description: "Pilih halte, terminal, stasiun kereta, atau bandara kedatangan, lalu buka rute menuju hotel pada peta.",
  travelNote: "Waktu perjalanan bersifat perkiraan. Akses jalan kaki mengikuti pintu keluar dan penyeberangan; waktu berkendara bergantung pada lalu lintas.",
  fareNote: "Harga merupakan perkiraan dan dapat berubah sesuai layanan, waktu pemesanan, serta biaya tambahan.",
  walkingLinkLabel: "Jalan kaki ke hotel",
  drivingLinkLabel: "Rute berkendara ke hotel",
  destination: {
    name: "Ambhara Hotel Jakarta",
    address: "Jl. Iskandarsyah I No.1, RT.5/RW.2, Melawai, Kec. Kby. Baru, Kota Jakarta Selatan, Daerah Khusus Ibukota Jakarta 12160",
  },
  // Informasi jarak, moda, dan kisaran harga mengikuti data yang diberikan panitia.
  items: [
    {
      name: "Halte Hotel Ambhara Blok M",
      icon: "bus",
      accessInfo: "Di dekat hotel",
      distanceInfo: "Sangat dekat, bisa jalan kaki",
      transportMode: "Ojek Online",
      estimatedFare: "Rp 5.000 – 10.000",
      travelMode: "walking",
      description: "Pilihan utama untuk turun di dekat Ambhara Hotel Jakarta. Periksa posisi halte dan penyeberangan pada peta sebelum berjalan ke pintu masuk hotel.",
      mapsQuery: "Halte Hotel Ambhara Blok M, Jalan Iskandarsyah, Jakarta Selatan",
    },
    {
      name: "Terminal Blok M / Halte Transjakarta Blok M",
      icon: "bus",
      accessInfo: "Jalan kaki ±7 menit",
      distanceInfo: "Terminal Blok M dan MRT Blok M BCA berjarak sekitar 7 menit jalan kaki dari hotel",
      transportMode: "Ojek Online",
      estimatedFare: "Rp 10.000 – 15.000",
      travelMode: "walking",
      description: "Turun di kawasan Terminal Blok M atau halte Transjakarta Blok M, lalu lanjutkan berjalan kaki menuju Ambhara Hotel di Jalan Iskandarsyah. Ikuti jalur pejalan kaki dan penyeberangan pada peta.",
      mapsQuery: "Terminal Blok M, Jakarta Selatan",
    },
    {
      name: "Stasiun MRT Blok M BCA",
      icon: "train",
      accessInfo: "Sekitar 660 m dari hotel",
      distanceInfo: "Sekitar 660 m dari hotel",
      transportMode: "Ojek Online",
      estimatedFare: "Rp 10.000 – 15.000",
      travelMode: "walking",
      description: "Setelah keluar dari Stasiun MRT Blok M BCA, lanjutkan berjalan kaki menuju Ambhara Hotel di Jalan Iskandarsyah. Pilih pintu keluar dan jalur penyeberangan sesuai petunjuk peta.",
      mapsQuery: "Stasiun MRT Blok M BCA, Jakarta Selatan",
    },
    {
      name: "Stasiun Pasar Senen",
      icon: "train",
      accessInfo: "Transportasi online ke hotel",
      distanceInfo: "Tujuan: Jl. Iskandarsyah I, Melawai, Kebayoran Baru",
      transportMode: "Transportasi online",
      estimatedFare: "Rp 33.000 – 45.000",
      travelMode: "driving",
      description: "Dari Stasiun Pasar Senen, lanjutkan menuju Ambhara Hotel Jakarta di Jl. Iskandarsyah I, Melawai, Kebayoran Baru. Estimasi biaya transportasi sekitar Rp 33.000–45.000.",
      mapsQuery: "Stasiun Pasar Senen, Jakarta Pusat",
    },
    // Halim terdekat dan CGK alternatif: turkishairlinesholidays.com/en-om/ambhara-hotel.
    {
      name: "Bandara Halim Perdanakusuma (HLP)",
      icon: "plane",
      accessInfo: "Bandara terdekat · Taksi/mobil ke hotel",
      distanceInfo: "Sekitar 11 km",
      transportMode: "Taksi Online",
      estimatedFare: "Rp 65.000 – 100.000",
      travelMode: "driving",
      description: "Bandara terdekat dari Ambhara Hotel Jakarta. Dari area kedatangan, lanjutkan dengan taksi atau mobil menuju hotel. Buka peta untuk rute berkendara dan estimasi waktu terkini.",
      mapsQuery: "Bandara Halim Perdanakusuma (HLP), Jakarta Timur",
    },
    {
      name: "Bandara Soekarno–Hatta (CGK)",
      icon: "plane",
      accessInfo: "Alternatif bandara · Taksi/mobil ke hotel",
      distanceInfo: "Sekitar 30 km",
      transportMode: "Taksi Bandara",
      estimatedFare: "Rp 90.000 – 140.000",
      travelMode: "driving",
      description: "Alternatif bandara kedatangan menuju Ambhara Hotel Jakarta. Lanjutkan dengan taksi atau mobil dan sesuaikan titik awal pada peta dengan terminal kedatangan Anda.",
      mapsQuery: "Bandara Internasional Soekarno-Hatta (CGK), Tangerang, Banten",
    },
  ] as TransportItem[],
  /** Pengumuman di bagian bawah section. Kata "panitia" ditautkan ke footer_url pada event settings. */
  announcement: {
    text: "H-1 Panitia menyediakan tempat transit di: Guest House YPPH Depok, konfirmasi ke ",
    linkLabel: "panitia",
    mapsLabel: "Lihat di Google Maps",
    mapsUrl: "https://maps.app.goo.gl/LrBzn1tPFqKaRFTTA",
  },
};

export const INVITED_GUESTS_CONTENT = {
  badge: "Informasi Tamu",
  title: "Peserta Rakernas",
  description: "Temukan detail peserta berdasarkan nama, perwakilan daerah, atau jabatan.",
  statusAccepted: "Sudah diterima",
  acceptedGroupTitle: "Sudah diterima",
  searchLabel: "Cari peserta",
  searchPlaceholder: "Cari Nama Anda…",
  searchHint: "Ketik minimal 2 karakter. Hasil diperbarui otomatis saat Anda mengetik.",
  clearLabel: "Hapus pencarian",
  detailsTitle: "Detail Peserta",
  fields: {
    nama: "Nama",
    perwakilan_daerah: "Perwakilan daerah",
    jabatan: "Jabatan",
  },
  missingValue: "Belum dicantumkan",
  initialTitle: "Temukan Nama, Perwakilan Daerah, atau Jabatan Anda",
  initialDescription: "Mulai dengan mengetik nama, perwakilan daerah, atau jabatan pada kolom pencarian.",
  loading: "Sedang mencari peserta…",
  emptyTitle: "Peserta belum ditemukan",
  emptyDescription: "Coba kata kunci lain atau periksa kembali ejaan Anda.",
  errorTitle: "Pencarian belum tersedia",
  errorDescription: "Data tamu belum dapat dimuat. Silakan coba lagi.",
  invalidRequest: "Gunakan kata kunci 2–100 karakter dan nomor halaman yang valid.",
  retryLabel: "Coba lagi",
  previousLabel: "Sebelumnya",
  nextLabel: "Berikutnya",
  paginationLabel: "Halaman hasil pencarian peserta",
  resultsCount: (total: number) => `${total.toLocaleString("id-ID")} peserta ditemukan`,
  pageLabel: (page: number, totalPages: number) => `Halaman ${page} dari ${totalPages}`,
};

export const FOOTER_DATA: FooterInfo = {
  logoSrc: "/light-logo-dark-bg.png",
  logoAlt: "Logo Rakernas BMH 2027",
  text: "08-10 Desember 2026 | Hotel Luminor Kota Jakarta Barat @2026",
  committee: {
    label: "Panitia Rakernas",
    url: "https://wa.me/6289517795206",
    phone: "089517795206",
  },
};

export const HADROH_TEAM = {
  title: "Tim Hadroh",
  name: "Shoutul Hidayah",
  description: "Acara ini akan diiringi lantunan selawat dan tabuhan rebana dari Tim Hadroh Shoutul Hidayah, santri SMP–MA Hidayatullah Depok, yang turut menghadirkan suasana hangat dan penuh kebersamaan sepanjang acara.",
};
