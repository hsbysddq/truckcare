// Semua teks dan angka untuk landing page Circle T didefinisikan di sini.
// Komponen tidak boleh berisi teks/angka statis — impor semuanya dari file ini.

export const siteConfig = {
  name: "Circle T",
  // Judul tab: "Circle T" saja di landing; halaman lain memakai template
  // "%s · Circle T" (lihat app/layout.js). Deskripsi tetap untuk mesin pencari.
  titleTemplate: "%s · Circle T",
  description:
    "Circle T membantu perusahaan logistik memantau armada truk saat ini juga, memeriksa pengaduan warga secara otomatis, dan menyajikan ringkasan hasil kerja AI Agent dalam satu dashboard.",
};

// Sumber tunggal nama & tujuan dashboard untuk kelima fitur utama.
// Dipakai ulang oleh navbar, section "Fitur Kami", dan footer.
export const mainFeatures = [
  {
    key: "live-tracking",
    label: "Live Tracking",
    dashboardHref: "/dashboard",
  },
  {
    key: "truck-management",
    label: "Truck Management",
    dashboardHref: "/dashboard/armada",
  },
  {
    key: "analytic",
    label: "Analytic",
    dashboardHref: "/dashboard/analitik",
  },
  {
    // Dulu "Driver Checker"; diganti supaya tidak tertukar dengan
    // Manajemen Pengemudi.
    key: "validasi-laporan",
    label: "Validasi Laporan",
    dashboardHref: "/dashboard/pengaduan",
  },
  {
    key: "manajemen-pengemudi",
    label: "Manajemen Pengemudi",
    dashboardHref: "/dashboard/pengemudi",
  },
];

export const navbar = {
  centerLinks: mainFeatures.map((feature) => ({
    label: feature.label,
    href: feature.dashboardHref,
  })),
  secondaryCta: { label: "Login", href: "/login" },
  primaryCta: { label: "Pengaduan", href: "/pengaduan" },
};

export const hero = {
  primaryCta: { label: "Lihat Dashboard", href: "/login" },
  secondaryCta: { label: "Ajukan Pengaduan", href: "/pengaduan" },
};

export const heroSlides = [
  {
    key: "analytic",
    label: "Analytic",
    headline: "Temukan pola yang tidak terdeteksi lewat pengecekan manual",
    subheadline:
      "Didukung AI Agent yang bekerja 24/7 menganalisis data armada Anda",
    image: "/hero/slide-3.jpg",
    alt: "Interior gudang logistik dengan rak penyimpanan barang bertingkat",
    benefits: [
      { icon: "trending-up", text: "Tren kejadian per armada" },
      { icon: "fuel", text: "Solar berkurang tidak wajar" },
      { icon: "file-text", text: "Rekap otomatis harian" },
      { icon: "download", text: "Data siap diekspor" },
    ],
  },
  {
    key: "live-tracking",
    label: "Live Tracking",
    headline: "Tahu posisi setiap truk, setiap saat",
    subheadline: "Dipantau AI Agent, 24 jam nonstop",
    image: "/hero/slide-1.jpg",
    alt: "Truk trailer melaju di jalan tol saat senja",
    benefits: [
      { icon: "map-pin", text: "Posisi truk langsung di peta" },
      { icon: "gauge", text: "Kecepatan terpantau terus" },
      { icon: "rotate-ccw-clock", text: "Riwayat perjalanan tersimpan" },
      { icon: "smartphone", text: "Akses dari mana saja" },
    ],
  },
  {
    key: "truck-management",
    label: "Truck Management",
    headline: "Seluruh armada dalam satu layar",
    subheadline:
      "AI Agent merangkum ratusan data jadi satu tampilan monitoring siap pakai",
    image: "/hero/slide-2.jpg",
    alt: "Pemandangan udara barisan truk armada yang terparkir rapi di area depo",
    benefits: [
      { icon: "truck", text: "Status tiap kendaraan" },
      { icon: "route", text: "Progres perjalanan" },
      { icon: "user", text: "Pengemudi yang bertugas" },
      { icon: "clock", text: "Riwayat operasional" },
    ],
  },
  {
    key: "validasi-laporan",
    label: "Validasi Laporan",
    headline: "Laporan warga, diverifikasi dengan data",
    subheadline:
      "AI Agent memeriksa setiap laporan sebelum sampai ke meja Anda",
    image: "/hero/slide-4.jpg",
    alt: "Truk trailer terlihat dari kaca depan kendaraan yang mengikuti di jalan raya saat senja",
    benefits: [
      { icon: "megaphone", text: "Pengaduan publik tanpa login" },
      { icon: "link", text: "Dicocokkan dengan rekaman perjalanan truk" },
      { icon: "shield-check", text: "Bukti kecepatan dan lokasi" },
      { icon: "funnel", text: "Laporan palsu tersaring" },
    ],
  },
  {
    key: "ai-agent",
    label: "AI Agent",
    headline: "Satu AI, mengurus semua operasional truk Anda",
    subheadline:
      "Tenang, tidak perlu pusing lagi. AI Agent yang bekerja untuk Anda",
    image: "/hero/slide-ai-agent.jpg",
    alt: "Jalan tol pada malam hari dengan jejak cahaya kendaraan yang melintas",
    benefits: [
      { icon: "send", text: "Rangkuman otomatis ke Telegram" },
      { icon: "shield-check", text: "Pemeriksaan laporan dan pengaduan" },
      { icon: "bell", text: "Kabar kondisi truk saat ini juga" },
      { icon: "file-text", text: "Rekap performa harian tanpa diminta" },
    ],
  },
];

export const productPreviewSection = {
  eyebrow: "Fitur Kami",
  headline: "Semua yang Anda butuhkan untuk mengawasi armada, dalam satu tempat.",
  description:
    "Satu dashboard untuk memantau posisi truk, mengelola armada dan pengemudi, membaca analitik, dan menindaklanjuti pengaduan warga.",
  autoplayIntervalMs: 6000,
  items: [
    {
      ...mainFeatures[0],
      icon: "map-pin",
      description:
        "Posisi, kecepatan, dan riwayat perjalanan tiap truk dalam satu peta.",
      image: "/preview/overview.png",
      alt: "Tampilan dashboard Overview dengan peta lokasi armada saat ini",
    },
    {
      ...mainFeatures[1],
      icon: "truck",
      description:
        "Status operasional dan progres perjalanan seluruh armada.",
      image: "/preview/armada.png",
      alt: "Tampilan dashboard Armada dengan daftar status dan progres tiap truk",
    },
    {
      ...mainFeatures[2],
      icon: "trending-up",
      description:
        "Tren kejadian, solar yang berkurang tidak wajar, dan rekap otomatis harian.",
      image: "/preview/analitik.png",
      alt: "Tampilan dashboard Analitik dengan grafik tren kejadian dan konsumsi solar",
    },
    {
      ...mainFeatures[3],
      icon: "shield-check",
      description:
        "Pengaduan warga yang diperiksa otomatis dengan data perjalanan truk.",
      image: "/preview/pengaduan.png",
      alt: "Tampilan dashboard Pengaduan dengan daftar laporan yang diperiksa otomatis",
    },
    {
      ...mainFeatures[4],
      icon: "users",
      description:
        "Pantau siapa yang sedang bertugas, siapa yang istirahat, dan lihat riwayat kerja setiap pengemudi.",
      // Placeholder sampai tangkapan layar halaman Pengemudi tersedia.
      image: "/preview/pengemudi.png",
      alt: "Tampilan dashboard Pengemudi dengan status bertugas, istirahat, dan riwayat kerja",
    },
  ],
};

export const howItWorksSection = {
  eyebrow: "Cara Kerja",
  headline: "Dari laporan warga, jadi bukti",
  description:
    "Setiap pengaduan dicocokkan dengan data perjalanan truk sebelum sampai ke meja pemilik.",
  diagramImage: "/cara-kerja.svg",
  diagramAlt:
    "Diagram alur: laporan warga dan data perjalanan truk masuk ke AI Agent Circle T yang mencocokkan dan memeriksa, menghasilkan hasil pemeriksaan terbukti, tidak terbukti, atau sedang diperiksa, lalu diteruskan ke dashboard dan Telegram.",
  steps: [
    {
      number: "01",
      title: "Laporan masuk",
      description:
        "Warga mengisi form pengaduan tanpa perlu login. Cukup nomor plat, waktu kejadian, dan deskripsi singkat.",
    },
    {
      number: "02",
      title: "Agent membaca laporan",
      description:
        "Agent Circle T mengubah keluhan berbahasa bebas menjadi data terstruktur: plat nomor, rentang waktu, dan jenis pelanggaran.",
    },
    {
      number: "03",
      title: "Dicocokkan dengan rekaman perjalanan",
      description:
        "Agent menarik rekaman posisi dan kecepatan truk tersebut pada waktu yang dilaporkan, langsung dari data armada.",
    },
    {
      number: "04",
      title: "Hasil pemeriksaan dengan bukti",
      description:
        "Laporan ditandai terbukti, tidak terbukti, atau sedang diperiksa manusia. Semuanya dilengkapi grafik kecepatan dan titik lokasi sebagai bukti.",
    },
    {
      number: "05",
      title: "Pemilik menerima ringkasan",
      description:
        "Hasil masuk ke dashboard dan dikirim otomatis ke Telegram, termasuk rekap seluruh pengaduan setiap malam.",
    },
  ],
};

export const whySection = {
  headline: "Mengapa Circle T?",
  description:
    "Bukan sekadar melihat di mana truk berada. AI Agent yang mengurus semuanya untuk Anda.",
  cards: [
    {
      icon: "shield-check",
      title: "Laporan yang bisa dipertanggungjawabkan",
      description:
        "GPS biasa cuma menunjukkan posisi. AI Agent Circle T otomatis menghubungkan keluhan dari luar dengan data perjalanan truk, setiap tuduhan langsung diperiksa dengan bukti dan otomatis memberi tahu Anda.",
    },
    {
      icon: "funnel",
      title: "Laporan palsu tersaring otomatis",
      description:
        "Sebelum sampai ke Anda, AI Agent sudah menguji setiap laporan terhadap rekaman perjalanan. Pengaduan anonim jadi tidak bisa dipakai untuk saling menjatuhkan sesama pengemudi.",
    },
    {
      icon: "smartphone",
      title: "Tidak Perlu Memantau Dashboard 24 Jam",
      description:
        "AI Agent bekerja tanpa diminta: memeriksa laporan masuk, lalu mengirim rekap harian ke Telegram. Anda cukup buka ponsel untuk tahu hasilnya.",
    },
    {
      icon: "fuel",
      title: "Temukan pola yang tidak terdeteksi lewat pengecekan manual",
      description:
        "Kejanggalan seperti solar berkurang saat truk berhenti sulit ketahuan secara manual. AI Agent memeriksa polanya setiap hari dan langsung memberi tahu Anda saat ada yang janggal.",
    },
  ],
};

export const ctaSection = {
  headline: "Berhenti menebak siapa yang benar.",
  description: "Setiap laporan diperiksa terhadap data armada Anda sendiri.",
  primaryCta: { label: "Mulai Pantau Armada", href: "/login" },
  secondaryCta: { label: "Laporkan Kejadian", href: "/pengaduan" },
};

export const footer = {
  brand: {
    name: "Circle T",
    description:
      "Platform monitoring armada truk berbasis AI untuk operasional logistik yang lebih efisien dan andal.",
  },
  columns: [
    {
      // Sama persis dengan menu navbar (sumber: mainFeatures), sehingga
      // rute dan perilaku redirect login-nya konsisten.
      title: "Fitur",
      links: navbar.centerLinks,
    },
    {
      title: "Tim",
      links: [{ label: "Circle T" }],
    },
    {
      title: "Kontak",
      links: [{ label: "halo@circlet.id", href: "mailto:halo@circlet.id" }],
    },
  ],
  bottom: {
    // Tahun disisipkan otomatis oleh components/FooterYear.js.
    copyrightPrefix: "© ",
    copyrightSuffix: " Circle T. Seluruh hak cipta dilindungi.",
  },
};

export const pengaduanPublikPage = {
  eyebrow: "Laporkan Kejadian",
  title: "Ajukan Pengaduan Kendaraan",
  description:
    "Laporkan perilaku berkendara, kecepatan berlebih, atau kejadian lalu lintas yang melibatkan truk armada. Laporan Anda akan diperiksa dengan data perjalanan truk tersebut. Tidak perlu login.",
  // Pengantar tanpa istilah teknis: apa yang terjadi setelah laporan dikirim.
  introNote:
    "Laporan Anda akan diperiksa otomatis dengan data perjalanan truk tersebut, lalu diteruskan ke pemilik armada.",
  formTitle: "Formulir Pengaduan",
  plateLabel: "Plat Nomor",
  platePlaceholder: "Contoh: W 9042 CD",
  // Umpan balik cepat dari /api/check-plate (hanya ada/tidak, tanpa detail truk).
  plateCheck: {
    checking: "Memeriksa nomor...",
    found: "Nomor terdaftar",
    notFound:
      "Nomor ini tidak terdaftar di armada kami. Anda tetap bisa mengirim laporan, tetapi kami tidak memiliki data perjalanan kendaraan tersebut.",
  },
  dateLabel: "Tanggal Kejadian",
  timeLabel: "Jam Kejadian",
  descriptionLabel: "Deskripsi Kejadian",
  descriptionPlaceholder: "Jelaskan apa yang Anda lihat, lokasi, dan urutan kejadian...",
  photoLabel: "Foto Bukti (opsional)",
  photoHint: "Maksimal 2 MB",
  submitLabel: "Kirim Pengaduan",
  submittingLabel: "Mengirim...",
  privacyNote:
    "Laporan diperiksa berdasarkan data perjalanan truk, bukan identitas pelapor. Pengaduan Anda tetap anonim.",
  errors: {
    plate:
      "Format plat tidak valid. Gunakan pola huruf, angka, huruf dengan spasi, contoh: W 9042 CD.",
    date: "Pilih tanggal kejadian.",
    description: "Deskripsi minimal 20 karakter.",
    photo: "Foto maksimal 2 MB.",
    network: "Pengaduan gagal dikirim. Periksa koneksi lalu coba lagi.",
    captcha: "Selesaikan captcha dulu sebelum mengirim.",
    upload:
      "Foto gagal diunggah, tetapi laporan tetap terkirim tanpa foto.",
  },
  successTitle: "Laporan Terkirim",
  successDescription: "Laporan Anda sudah tercatat dengan nomor",
  successStatus: "Status: Menunggu Diperiksa",
  successStatusOutside: "Status: Nomor tidak terdaftar, laporan tetap tercatat",
  successNote:
    "Laporan akan diperiksa dengan data perjalanan truk pada waktu dan lokasi yang Anda berikan, lalu diteruskan ke pemilik armada.",
  submitAnother: "Kirim Laporan Lain",
};

export const loginPage = {
  heading: "Selamat Datang Kembali",
  subheading: "Masuk untuk mengakses dashboard armada Anda.",
  emailLabel: "Email",
  emailPlaceholder: "nama@perusahaan.com",
  passwordLabel: "Kata Sandi",
  passwordPlaceholder: "••••••••",
  submitLabel: "Masuk",
  submittingLabel: "Memproses...",
  envMissingError:
    "Login belum bisa dipakai: NEXT_PUBLIC_SUPABASE_URL dan NEXT_PUBLIC_SUPABASE_ANON_KEY belum diisi di .env.local.",
  accountHint:
    "Akun dibuat oleh admin di Supabase Dashboard (Authentication › Users). Belum ada akun demo bawaan.",
  captchaError: "Selesaikan captcha dulu sebelum masuk.",
  captchaIconMissing: "Captcha belum dikonfigurasi. Hubungi admin.",
};

// Penjelasan singkat istilah teknis di dashboard. Dipakai komponen
// GlossaryText: istilah yang cocok mendapat ikon tanda tanya dengan tooltip.
export const glossary = {
  telematika:
    "Data posisi, kecepatan, dan kondisi truk yang dikirim otomatis dari alat di kendaraan.",
  telemetri:
    "Rekaman posisi dan kecepatan truk yang dikirim otomatis dari alat di kendaraan.",
  anomali:
    "Pola yang menyimpang dari kebiasaan normal, misalnya solar berkurang saat truk berhenti.",
  "tingkat keyakinan":
    "Seberapa yakin AI Agent terhadap kesimpulannya, berdasarkan kecocokan laporan dengan data truk.",
};

// Judul tab tiap halaman dashboard mengikuti label menunya.
export function dashboardTitle(href) {
  return dashboardNav.find((item) => item.href === href)?.label ?? siteConfig.name;
}

export const dashboardNav = [
  { label: "Overview", href: "/dashboard", icon: "layout-dashboard" },
  { label: "Armada", href: "/dashboard/armada", icon: "truck" },
  { label: "Pengemudi", href: "/dashboard/pengemudi", icon: "users" },
  { label: "Jadwal", href: "/dashboard/jadwal", icon: "calendar-days" },
  { label: "Chat AI", href: "/dashboard/chat", icon: "bot" },
  { label: "Peta", href: "/dashboard/peta", icon: "map" },
  { label: "Pengaduan", href: "/dashboard/pengaduan", icon: "clipboard-check" },
  { label: "Analitik", href: "/dashboard/analitik", icon: "chart-column" },
  { label: "Pengaturan", href: "/dashboard/pengaturan", icon: "settings" },
];

export const dashboardSidebar = {
  logoutLabel: "Keluar",
};

export const overviewPage = {
  statCards: [
    { key: "total", label: "Total Armada", icon: "truck" },
    { key: "bergerak", label: "Aktif Bergerak", icon: "navigation" },
    { key: "istirahat", label: "Sedang Istirahat", icon: "circle-pause" },
    { key: "insiden", label: "Insiden", icon: "triangle-alert" },
  ],
  mapCardTitle: "Peta Operasional",
  // Panel Status Pengemudi (data: /api/drivers -> lib/driver-status.js).
  driverPanel: {
    title: "Status Pengemudi",
    subtitle: "Siapa yang sedang bertugas hari ini.",
    viewAllLabel: "Lihat semua",
    maxRows: 6,
    noScheduleMessage:
      "Belum ada data jadwal, sehingga status pengemudi belum bisa dihitung. Tambahkan jadwal di menu Jadwal.",
    noDriverMessage: "Belum ada pengemudi terdaftar.",
    errorMessage: "Status pengemudi tidak bisa dimuat.",
  },
  truckSelect: {
    label: "Pilih truk",
    placeholder: "Pilih Truk",
    searchPlaceholder: "Cari plat, nama truk, atau pengemudi...",
    noResults: "Truk tidak ditemukan",
  },
  detailPanel: {
    emptyStateMessage:
      "Pilih truk lewat daftar di atas peta atau klik marker untuk melihat detail.",
    driverLabel: "Pengemudi",
    speedLabel: "Kecepatan",
    speedUnit: "km/jam",
    fuelLabel: "Level Bahan Bakar",
    speedChartTitle: "Kecepatan 1 Jam Terakhir",
    historyTitle: "Riwayat Perjalanan",
    // Plat + nama truk di panel menjadi tautan ke /dashboard/armada/[id].
    detailLinkLabel: "Buka halaman detail truk",
    aiButtonLabel: "Tanya AI",
  },
};

export const truckStatusMeta = {
  bergerak: {
    label: "Bergerak",
    badgeClass: "bg-emerald-50 text-emerald-700",
    markerColor: "#059669",
  },
  istirahat: {
    label: "Istirahat",
    badgeClass: "bg-amber-50 text-amber-700",
    markerColor: "#d97706",
  },
  insiden: {
    label: "Insiden",
    badgeClass: "bg-red-50 text-red-700",
    markerColor: "#dc2626",
  },
};

export const petaPage = {
  title: "Peta Operasional",
  subtitle: "Posisi armada real-time dari telematika kendaraan, diperbarui setiap beberapa detik.",
  panelTitle: "Armada Terpantau",
  speedUnit: "km/jam",
  emptyMessage:
    "Belum ada posisi truk terpantau. Pastikan simulasi berjalan di server pengisi data.",
};

// Status pengemudi dihitung lib/driver-status.js (bukan kolom di tabel drivers).
export const driverStatusMeta = {
  bertugas: {
    label: "Bertugas",
    badgeClass: "bg-emerald-50 text-emerald-700",
    dotClass: "bg-emerald-500",
  },
  berhenti: {
    label: "Berhenti",
    badgeClass: "bg-amber-50 text-amber-700",
    dotClass: "bg-amber-500",
  },
  istirahat: {
    label: "Istirahat",
    badgeClass: "bg-slate-100 text-slate-600",
    dotClass: "bg-slate-500",
  },
  tidak_aktif: {
    label: "Tidak Aktif",
    badgeClass: "bg-slate-50 text-slate-400",
    dotClass: "bg-slate-300",
  },
};

// Halaman daftar pengemudi (grid kartu, konsisten dengan halaman Armada).
// Status dan angka dihitung lib/driver-status.js, bukan kolom di tabel drivers.
export const pengemudiPage = {
  title: "Daftar Pengemudi",
  countBadgeSuffix: "Pengemudi",
  searchLabel: "Cari pengemudi",
  searchPlaceholder: "Cari nama pengemudi...",
  filterLabel: "Filter status",
  filterAllLabel: "Semua",
  currentTruckLabel: "Truk yang dibawa",
  todayRouteLabel: "Rute hari ini",
  routeConnector: "ke",
  noTruckLabel: "–",
  noRouteLabel: "Tidak ada jadwal hari ini",
  stats: {
    tripsMonthLabel: "Perjalanan bulan ini",
    onTimeLabel: "Tepat waktu",
    hoursTodayLabel: "{hours} jam hari ini",
  },
  detailButtonLabel: "Lihat Detail",
  emptyFilter: {
    title: "Tidak ada pengemudi yang cocok.",
    hint: "Coba kata kunci lain atau pilih status yang berbeda.",
    resetLabel: "Tampilkan semua",
  },
  // Banner tipis di atas daftar bila tabel jadwal kosong; daftar tetap tampil.
  noSchedule: {
    message:
      "Tabel jadwal masih kosong, sehingga semua pengemudi terhitung tidak aktif dan kolom truk serta rute belum terisi.",
    linkLabel: "Tambah jadwal",
    href: "/dashboard/jadwal",
  },
  noDrivers: "Belum ada pengemudi terdaftar.",
};

export const driverDetailPage = {
  backLabel: "Kembali ke Pengemudi",
  phoneLabel: "Telepon",
  currentTruckLabel: "Sedang membawa",
  noCurrentTruck: "Tidak sedang membawa truk",
  summary: [
    { key: "totalTrips", label: "Total Perjalanan" },
    { key: "onTimePct", label: "Tepat Waktu", suffix: "%", hint: "Berangkat maksimal 30 menit dari rencana" },
    { key: "complaints", label: "Pengaduan Terkait" },
    { key: "hoursThisMonth", label: "Jam Kerja Bulan Ini", suffix: " jam" },
  ],
  history: {
    title: "Riwayat Kerja",
    subtitle: "Dari tabel jadwal: rencana dan realisasi tiap perjalanan.",
    fromLabel: "Dari",
    toLabel: "Sampai",
    resetLabel: "Semua tanggal",
    columns: {
      date: "Tanggal",
      truck: "Truk",
      route: "Rute",
      planned: "Berangkat (rencana)",
      actual: "Berangkat (realisasi)",
      status: "Ketepatan",
    },
    onTime: "Tepat waktu",
    late: "Terlambat {minutes} menit",
    notDeparted: "Belum berangkat",
    cancelled: "Batal",
    empty: "Tidak ada perjalanan pada rentang ini.",
    pageLabel: "Halaman {page} dari {total}",
    prev: "Halaman sebelumnya",
    next: "Halaman berikutnya",
    perPage: 10,
  },
  chart: {
    title: "Perjalanan per Hari",
    subtitle: "Jumlah perjalanan dalam 30 hari terakhir.",
    unit: "perjalanan",
  },
  complaints: {
    title: "Pengaduan Terkait",
    subtitle:
      "Laporan warga untuk truk yang dibawa pengemudi ini pada tanggal kejadian, beserta hasil pemeriksaannya.",
    empty: "Tidak ada pengaduan terkait.",
    resultLabel: "Hasil pemeriksaan",
  },
};

export const armadaPage = {
  title: "Daftar Armada",
  countBadgeSuffix: "Kendaraan",
  progressLabel: "Progres perjalanan",
  driverLabel: "Pengemudi",
  speedUnit: "km/jam",
  noRouteLabel: "Rute belum tersedia",
  detailButtonLabel: "Lihat Detail",
};

export const truckDetailPage = {
  backLabel: "Kembali ke Armada",
  aiButtonLabel: "Tanya AI",
  speedLimitKph: 80,
  map: {
    title: "Rute Perjalanan Hari Ini",
    startLabel: "Titik awal",
    endLabel: "Tujuan",
    currentLabel: "Posisi terkini",
    emptyMessage: "Posisi dan rute truk ini belum tersedia.",
  },
  speedChart: {
    title: "Kecepatan Sepanjang Hari",
    subtitle: "Rekaman per jam dari telematika kendaraan.",
    seriesLabel: "Kecepatan",
    timeLabel: "Pukul",
    unit: "km/jam",
    limitLabel: "Batas",
    emptyMessage: "Data kecepatan harian belum tersedia untuk truk ini.",
  },
  fuelChart: {
    title: "Level Solar Sepanjang Hari",
    subtitle: "Titik merah menandai penurunan yang tidak wajar.",
    seriesLabel: "Level solar",
    timeLabel: "Pukul",
    unit: "%",
    anomalyLabel: "Anomali",
    emptyMessage: "Data solar harian belum tersedia untuk truk ini.",
  },
  infoPanel: {
    title: "Informasi Kendaraan",
    driverLabel: "Pengemudi",
    typeLabel: "Tipe Armada",
    routeLabel: "Rute",
    progressLabel: "Progres Perjalanan",
    odometerLabel: "Odometer",
    speedLabel: "Kecepatan Saat Ini",
    fuelLabel: "Level Solar",
  },
  timelineTitle: "Riwayat Perjalanan",
  timelineEmpty: "Belum ada riwayat perjalanan hari ini.",
};

export const tripStatusMeta = {
  jalan: {
    label: "Jalan",
    badgeClass: "bg-sky-50 text-sky-700",
    dotClass: "bg-sky-500",
  },
  berhenti: {
    label: "Berhenti",
    badgeClass: "bg-slate-100 text-slate-600",
    dotClass: "bg-slate-400",
  },
  terlambat: {
    label: "Terlambat",
    badgeClass: "bg-pink-50 text-pink-600",
    dotClass: "bg-pink-500",
  },
};

export const pengaduanManagementPage = {
  title: "Pengaduan & Laporan",
  subtitle:
    "Tinjau dan validasi laporan masyarakat menggunakan analisis AI berbasis data telematika armada.",
  searchPlaceholder: "Cari ID, plat nomor, atau lokasi...",
  filters: [
    { key: "semua", label: "Semua" },
    { key: "pending", label: "Pending" },
    { key: "tervalidasi", label: "Tervalidasi" },
    { key: "perlu-ditinjau", label: "Perlu Ditinjau" },
    { key: "ditolak", label: "Ditolak" },
    { key: "luar-armada", label: "Bukan Armada Kami" },
    // Laporan soft-delete (deleted_at terisi); bisa dipulihkan dari panel.
    { key: "terhapus", label: "Terhapus" },
  ],
  deletedBadgeLabel: "Terhapus",
  noResultsMessage: "Tidak ada laporan yang cocok.",
  emptyStateMessage: "Pilih laporan di daftar untuk melihat detail.",
  reporterRowLabel: "Pelapor",
  defaultReporterLabel: "Warga Sekitar",
  ticketLabel: "Detail Laporan",
  copyIdLabel: "Salin UUID lengkap",
  copiedLabel: "Tersalin",
  aiBadgePrefix: "AI",
  agentBox: {
    title: "Analisis Agent",
    confidenceLabel: "Tingkat Keyakinan",
    pendingReasoning: "Agent belum menganalisis laporan ini.",
  },
  // Kotak keputusan non-agent: jangan tampilkan tingkat keyakinan apa pun.
  decisionBoxes: {
    operator: {
      title: "Ditinjau Operator",
      description:
        "Keputusan diambil secara manual oleh operator. Agent tidak melakukan analisis pada laporan ini.",
    },
    sistem: {
      title: "Diterima Otomatis",
      description:
        "Agent tidak terjangkau saat validasi, sehingga laporan diterima otomatis tanpa analisis.",
    },
  },
  chart: {
    title: "Grafik Bukti Kecepatan",
    subtitle: "Kecepatan truk 30 menit sebelum dan sesudah kejadian.",
    incidentLabel: "Titik Kejadian",
    empty: {
      title: "Data telematika tidak tersedia",
      plateMissing:
        "Plat {plate} tidak terdaftar di armada, sehingga tidak ada rekaman posisi dan kecepatan yang bisa dicocokkan.",
      outsideRange:
        "Waktu kejadian berada di luar rentang rekaman telematika yang tersimpan untuk truk ini.",
    },
  },
  vehicleInfo: {
    title: "Informasi Kendaraan",
    plateLabel: "Plat Nomor",
    typeLabel: "Tipe Armada",
    driverLabel: "Pengemudi",
  },
  telemetryInfo: {
    title: "Data Telematika",
    recordedSpeedLabel: "Kecepatan Tercatat",
    speedLimitLabel: "Batas Kecepatan",
    coordinatesLabel: "Koordinat",
  },
  attachmentsTitle: "Bukti Lampiran",
  reporterNoteTitle: "Catatan Pelapor",
  originalReportLabel: "Laporan asli dari pelapor, tidak dapat diubah",
  rejectButtonLabel: "Tolak Laporan",
  validateButtonLabel: "Validasi Laporan",
  actions: {
    processingLabel: "Memproses...",
    cancelLabel: "Batal",
    errorMessage: "Aksi gagal. Periksa koneksi lalu coba lagi.",
    changeModeHint: "Pilih keputusan baru. Keputusan lama akan ditimpa dan tercatat di riwayat.",
  },
  decisionSummary: {
    byLabel: "Diputuskan oleh",
    unknownTime: "waktu tidak tercatat",
    changeLabel: "Ubah keputusan",
    confirmTitle: "Ubah keputusan?",
    confirmDescription:
      "Keputusan pada laporan {ticket} akan diganti. Perubahan ini tercatat di riwayat dan tidak mengubah isi laporan warga.",
    confirmLabel: "Ya, ubah keputusan",
    actors: { agent: "AI Agent", sistem: "Sistem (otomatis)", operator: "Operator" },
  },
  operatorNote: {
    title: "Catatan Internal Operator",
    hint: "Hanya untuk tim internal. Isi laporan warga tidak bisa diubah.",
    placeholder: "Misal: sudah dikonfirmasi ke pengemudi, tindak lanjut minggu depan...",
    saveLabel: "Simpan Catatan",
    updatedPrefix: "Diperbarui",
  },
  deletion: {
    deleteLabel: "Hapus laporan",
    confirmTitle: "Hapus laporan?",
    confirmDescription:
      "Laporan {ticket} akan disembunyikan dari daftar utama, tetapi tetap tersimpan dan bisa dipulihkan lewat filter Terhapus.",
    reasonLabel: "Alasan penghapusan",
    reasonPlaceholder: "Misal: laporan uji coba, duplikat dari #RPT-XXXXXX...",
    reasonRequired: "Alasan wajib diisi.",
    confirmLabel: "Hapus",
    deletedBanner: "Laporan ini terhapus",
    restoreLabel: "Pulihkan",
  },
  history: {
    title: "Riwayat Perubahan",
    loading: "Memuat riwayat...",
    empty: "Belum ada riwayat tercatat untuk laporan ini.",
    actors: { pelapor: "Pelapor", agent: "AI Agent", sistem: "Sistem", operator: "Operator" },
    events: {
      created: "mengirim laporan",
      agentRun: "memproses laporan (hasil: {outcome})",
      decided: "menetapkan keputusan: {status}",
      note: "memperbarui catatan internal",
      deleted: "menghapus laporan",
    },
  },
};

export const jadwalPage = {
  title: "Jadwal Armada",
  subtitle:
    "Bandingkan rencana perjalanan dengan realisasi telematika, lalu tangkap penyimpangannya.",
  addButtonLabel: "Tambah Jadwal",
  editButtonLabel: "Ubah Jadwal",
  loadingLabel: "Memuat jadwal...",
  errorLabel: "Gagal memuat jadwal. Periksa koneksi lalu coba lagi.",
  retryLabel: "Coba lagi",
  views: [
    { key: "day", label: "Hari Ini" },
    { key: "week", label: "Minggu Ini" },
    { key: "month", label: "Bulan Ini" },
  ],
  summary: [
    { key: "total", label: "Perjalanan Hari Ini", icon: "calendar-days" },
    { key: "onTime", label: "Tepat Waktu", icon: "clock", tone: "success" },
    { key: "late", label: "Terlambat", icon: "triangle-alert", tone: "danger" },
    { key: "notDeparted", label: "Belum Berangkat", icon: "circle-pause", tone: "neutral" },
  ],
  timeline: {
    truckColumnLabel: "Truk",
    plannedLabel: "Rencana",
    actualLabel: "Realisasi",
    nowLabel: "Sekarang",
    emptyRow: "Tidak ada jadwal",
    legendTitle: "Keterangan",
    noSchedules: "Belum ada jadwal pada rentang ini.",
  },
  dayList: {
    title: "Jadwal per hari",
    empty: "Tidak ada perjalanan.",
  },
  panel: {
    emptyMessage: "Klik batang jadwal untuk melihat detail perjalanan.",
    routeLabel: "Rute",
    truckLabel: "Truk",
    driverLabel: "Pengemudi",
    cargoLabel: "Muatan",
    notesLabel: "Catatan",
    plannedDepartureLabel: "Berangkat (rencana)",
    actualDepartureLabel: "Berangkat (realisasi)",
    plannedArrivalLabel: "Tiba (rencana)",
    actualArrivalLabel: "Tiba (realisasi)",
    notYetLabel: "belum",
    delayLabel: "terlambat {minutes} menit",
    earlyLabel: "lebih awal {minutes} menit",
    onTimeLabel: "tepat waktu",
    findingsLabel: "Penyimpangan pada jadwal ini",
    noFindingsLabel: "Tidak ada penyimpangan terdeteksi.",
  },
  findings: {
    title: "Penyimpangan Terdeteksi",
    subtitle:
      "Hasil pembandingan jadwal dengan telemetri armada. Daftar yang sama tersedia untuk agent lewat Chat AI.",
    empty: "Tidak ada penyimpangan pada rentang waktu ini.",
    types: {
      lateDeparture: {
        label: "Keberangkatan terlambat",
        description:
          "{plate} berangkat {minutes} menit setelah jadwal ({planned}) untuk rute {route}.",
        pendingDescription:
          "{plate} belum berangkat {minutes} menit setelah jadwal ({planned}) untuk rute {route}.",
      },
      movingWithoutSchedule: {
        label: "Bergerak tanpa jadwal",
        description:
          "{plate} terpantau bergerak {speed} km/jam padahal tidak ada jadwal aktif saat ini.",
      },
      idleWhileScheduled: {
        label: "Diam saat dijadwalkan berjalan",
        description:
          "{plate} terpantau diam padahal jadwal {route} seharusnya sedang berjalan.",
      },
      fuelDropWhileParked: {
        label: "Solar berkurang saat parkir",
        description:
          "Level solar {plate} turun {liters} liter pada {date} padahal tidak ada jadwal perjalanan hari itu.",
      },
    },
  },
  form: {
    addTitle: "Tambah Jadwal",
    editTitle: "Ubah Jadwal",
    truckLabel: "Truk",
    truckPlaceholder: "Pilih truk",
    driverLabel: "Pengemudi",
    driverPlaceholder: "Pilih pengemudi",
    originLabel: "Asal",
    destinationLabel: "Tujuan",
    plannedDepartureLabel: "Waktu berangkat (rencana)",
    plannedArrivalLabel: "Waktu tiba (rencana)",
    cargoLabel: "Jenis muatan",
    notesLabel: "Catatan",
    cargoOptions: [
      "FMCG",
      "Material konstruksi",
      "Kontainer",
      "Solar industri",
      "Hasil pertanian",
      "Elektronik",
      "Bahan bangunan",
      "Retail",
    ],
    cancelLabel: "Batal",
    saveLabel: "Simpan Jadwal",
    savingLabel: "Menyimpan...",
    errors: {
      required: "Wajib diisi.",
      order: "Waktu tiba harus setelah waktu berangkat.",
      conflict:
        "Bentrok: {plate} sudah punya jadwal {route} pada {start}–{end}.",
      network: "Gagal menyimpan jadwal. Coba lagi.",
    },
  },
};

export const scheduleStatusMeta = {
  dijadwalkan: {
    label: "Dijadwalkan",
    badgeClass: "bg-slate-100 text-slate-600",
    barClass: "bg-slate-400",
  },
  berjalan: {
    label: "Berjalan",
    badgeClass: "bg-sky-50 text-sky-700",
    barClass: "bg-sky-500",
  },
  selesai: {
    label: "Selesai",
    badgeClass: "bg-emerald-50 text-emerald-700",
    barClass: "bg-emerald-500",
  },
  terlambat: {
    label: "Terlambat",
    badgeClass: "bg-amber-50 text-amber-700",
    barClass: "bg-amber-500",
  },
  batal: {
    label: "Batal",
    badgeClass: "bg-red-50 text-red-700",
    barClass: "bg-red-300",
  },
};

export const complaintStatusMeta = {
  pending: {
    label: "Pending",
    badgeClass: "bg-slate-100 text-slate-600",
  },
  tervalidasi: {
    label: "Tervalidasi",
    badgeClass: "bg-emerald-50 text-emerald-700",
  },
  "perlu-ditinjau": {
    label: "Perlu Ditinjau",
    badgeClass: "bg-amber-50 text-amber-700",
  },
  ditolak: {
    label: "Ditolak",
    badgeClass: "bg-red-50 text-red-700",
  },
  // Plat tidak terdaftar di armada saat laporan dikirim (status DB: luar_armada).
  "luar-armada": {
    label: "Bukan Armada Kami",
    badgeClass: "bg-slate-100 text-slate-500",
  },
};

export const agentConfidenceMeta = {
  tinggi: {
    label: "Tinggi",
    badgeClass: "bg-emerald-50 text-emerald-700",
  },
  sedang: {
    label: "Sedang",
    badgeClass: "bg-amber-50 text-amber-700",
  },
  rendah: {
    label: "Rendah",
    badgeClass: "bg-slate-100 text-slate-600",
  },
};

export const toneMeta = {
  success: { badgeClass: "bg-emerald-50 text-emerald-700" },
  warning: { badgeClass: "bg-amber-50 text-amber-700" },
  danger: { badgeClass: "bg-red-50 text-red-700" },
  info: { badgeClass: "bg-sky-50 text-sky-700" },
};

export const chatPage = {
  agentName: "Circle T Agent",
  agentStatusLabel: "Aktif",
  greeting: "Ada yang bisa saya bantu soal armada Anda?",
  emptyHint:
    "Tanyakan posisi truk, status pengaduan, atau minta rekap operasional.",
  quickSuggestions: [
    "Rekap hari ini",
    "Cek anomali solar",
    "Pengaduan belum divalidasi",
  ],
  inputPlaceholder: "Tulis pertanyaan Anda...",
  // Saat dibuka dari panel truk (?truk=PLAT): konteks aktif, tanpa pesan otomatis.
  inputPlaceholderWithTruck: "Tanyakan sesuatu tentang {plate}...",
  truckContextLabel: "Konteks truk",
  clearTruckContextLabel: "Hapus konteks truk",
  truckQuickSuggestion: "Rangkum kondisi {plate} hari ini",
  fallbackReply:
    "Fitur ini masih menggunakan respons contoh. Setelah terhubung ke AI asli, jawaban akan disesuaikan dengan pertanyaan Anda secara langsung.",
  truckContextQuestion:
    "Bagaimana kondisi truk {plate} hari ini? Rangkum posisi, kecepatan, konsumsi solar, dan insiden terbarunya.",
  loadingLabel: "Memuat riwayat percakapan...",
  errors: {
    load: "Gagal memuat riwayat percakapan. Periksa koneksi Anda lalu coba lagi.",
    save: "Pesan terkirim, tetapi gagal disimpan ke server. Riwayat ini mungkin tidak muncul di perangkat lain.",
    retryLabel: "Coba lagi",
    dismissLabel: "Tutup",
  },
  activityPanelTitle: "Aktivitas Agent",
  activityLoading: "Memuat aktivitas...",
  activityEmpty: "Belum ada aktivitas agent hari ini",
  activityError: "Aktivitas agent tidak bisa dimuat.",
  triggerLabels: {
    otomatis: "Otomatis",
    pengguna: "Permintaan Pengguna",
  },
  // Pemetaan kolom agent_runs.outcome -> label badge + warna.
  activityOutcomeMeta: {
    valid: { label: "Tervalidasi", tone: "success" },
    ditolak: { label: "Ditolak", tone: "danger" },
    "perlu-ditinjau": { label: "Perlu Ditinjau", tone: "warning" },
    terkirim: { label: "Terkirim", tone: "success" },
    selesai: { label: "Selesai", tone: "info" },
    gagal: { label: "Gagal", tone: "danger" },
    berjalan: { label: "Berjalan", tone: "info" },
  },
  activityFallbackDescription: "Pengaduan #{complaintId}",
};

export const analitikPage = {
  title: "Analitik & Dampak",
  subtitle: "Ringkasan kerja agent dan temuan operasional armada.",
  exportButtonLabel: "Ekspor CSV",
  exportFilename: "tren-pengaduan.csv",
  loadingLabel: "Memuat analitik...",
  errorLabel: "Gagal memuat analitik. Periksa koneksi Anda lalu coba lagi.",
  retryLabel: "Coba lagi",
  filters: {
    rangeLabel: "Rentang waktu",
    ranges: [
      { days: 7, label: "7 Hari" },
      { days: 30, label: "30 Hari" },
      { days: 90, label: "90 Hari" },
    ],
    fleetLabel: "Armada",
    allFleetLabel: "Semua Armada",
    selectedFleetLabel: "{count} armada dipilih",
    selectAllLabel: "Pilih semua",
    clearLabel: "Kosongkan",
    resetLabel: "Atur Ulang Filter",
    summary: "Menampilkan {trucks} armada, {days} hari terakhir",
  },
  empty: {
    title: "Tidak ada data untuk filter ini",
    hint: "Coba perluas rentang waktu atau pilih armada lain.",
  },
  // goodWhen: arah perubahan yang berarti baik — menentukan warna panah.
  metricCards: [
    {
      key: "complaintsProcessed",
      label: "Pengaduan Diproses",
      icon: "clipboard-check",
      goodWhen: "neutral",
    },
    {
      key: "autoResolvedPct",
      label: "Diselesaikan Otomatis",
      icon: "bot",
      suffix: "%",
      goodWhen: "up",
      subtext: "tanpa campur tangan manusia",
    },
    {
      key: "avgValidationSeconds",
      label: "Rata-rata Waktu Validasi",
      icon: "gauge",
      suffix: " detik",
      goodWhen: "down",
      subtext: "estimasi manual: {manualEstimateMinutes} menit",
    },
    {
      key: "speedingIncidents",
      label: "Insiden Ngebut Terdeteksi",
      icon: "triangle-alert",
      goodWhen: "down",
      subtext: "{vehiclesInvolved} truk terlibat",
    },
  ],
  compareLabel: "vs {days} hari sebelumnya",
  noCompareLabel: "belum ada pembanding",
  charts: {
    dailyTrend: {
      title: "Tren Pengaduan Harian",
      subtitle: "Jumlah laporan per hari, dipecah berdasarkan hasil validasi agent.",
      seriesLabels: {
        tervalidasi: "Tervalidasi",
        perluDitinjau: "Perlu Ditinjau",
        ditolak: "Ditolak",
      },
      seriesColors: {
        tervalidasi: "#059669",
        perluDitinjau: "#d97706",
        ditolak: "#be123c",
      },
      insight:
        "{pct}% pengaduan selesai otomatis; hari tersibuk {date} dengan {count} laporan",
    },
    speedingByPlate: {
      title: "Insiden Kecepatan per Armada",
      subtitle:
        "Pelanggaran di atas 80 km/jam per plat, diurutkan dari terbanyak. Batang oranye adalah penyumbang terbanyak.",
      unit: "insiden",
      topLabel: "Penyumbang terbanyak",
      insight: "{k} dari {n} armada menyumbang {pct}% total pelanggaran",
    },
    fuel: {
      title: "Konsumsi Solar per Truk",
      subtitle: "Level solar harian; pilih truk di daftar untuk melihat detailnya.",
      unit: "L",
      detailTitle: "Solar {plate}",
      capacityLabel: "tangki {capacity} L",
      anomalyBadge: "{n} anomali",
      normalBadge: "Normal",
      views: {
        level: "Level Tangki",
        usage: "Konsumsi Harian",
      },
      yAxisLevel: "Level solar (liter)",
      yAxisUsage: "Konsumsi (liter)",
      summary: {
        avgDailyLabel: "Rata-rata konsumsi",
        avgDailyUnit: "L/hari",
        refillLabel: "Pengisian",
        anomalyLabel: "Anomali",
        lossLabel: "Estimasi kerugian",
      },
      legend: {
        truck: "Level {plate}",
        usageTruck: "Konsumsi {plate}",
        fleet: "Rata-rata armada",
        normalLine: "Rata-rata normal {avg} L/hari",
      },
      tooltip: {
        levelLabel: "Level solar",
        usedLabel: "Terpakai",
        fleetLabel: "Rata-rata armada",
        statusLabel: "Status",
        normal: "Pemakaian normal",
        refill: "Pengisian ulang",
        anomaly: "Anomali: turun {drop} liter tanpa pengisian (≈ {loss})",
      },
      pill: "{value} L",
      insight:
        "{plate}: penurunan {drop} liter pada {date} tanpa pengisian, setara {loss}{more}",
      insightMoreSuffix: ". Total {n} anomali, estimasi kerugian {totalLoss}",
      insightNone: "Tidak ada anomali solar terdeteksi pada periode ini",
    },
    hourDistribution: {
      title: "Distribusi Waktu Insiden",
      subtitle: "Jumlah insiden kecepatan per jam dalam sehari (00–23).",
      unit: "insiden",
      peakLabel: "Jam puncak",
      insight: "Insiden paling banyak terjadi antara pukul {from}.00–{to}.00",
    },
    violationMap: {
      title: "Sebaran Lokasi Pelanggaran",
      subtitle: "Ukuran marker menunjukkan jumlah insiden kecepatan di lokasi tersebut.",
      legendLabel: "Jumlah Insiden",
      insight: "{label} menjadi lokasi dengan insiden terbanyak ({count} insiden)",
    },
  },
};

export const pengaturanPage = {
  title: "Pengaturan",
  subtitle: "Kelola akses bot Telegram dan pantau koneksi ke AI agent.",
  telegramCard: {
    title: "Akses Bot Telegram",
    description:
      "Hanya chat ID terdaftar yang bisa memakai bot. Minta calon pengguna mengirim /start ke bot, lalu salin chat ID mereka dari log service VPS.",
    chatIdLabel: "Chat ID",
    chatIdPlaceholder: "Contoh: 123456789",
    namaLabel: "Nama (opsional)",
    namaPlaceholder: "Contoh: Budi Operator",
    tambahLabel: "Tambah Akses",
    menambahLabel: "Menambah...",
    hapusLabel: "Cabut",
    emptyMessage: "Belum ada chat terdaftar.",
    errors: {
      chatId: "Chat ID wajib angka (boleh negatif untuk grup).",
      network: "Gagal memuat daftar akses. Coba lagi.",
      tambah: "Gagal menambah akses. Coba lagi.",
      dobel: "Chat ID ini sudah terdaftar.",
      hapus: "Gagal mencabut akses. Coba lagi.",
    },
  },
  telegramStatusCard: {
    title: "Status Bot Telegram",
    description:
      "Koneksi bot untuk rekap harian dan notifikasi. Token disimpan di server, tidak pernah dikirim ke browser.",
    statusLabel: "Status",
    botLabel: "Bot",
    memeriksaLabel: "Memeriksa...",
    terhubungLabel: "Terhubung",
    belumTerhubungLabel: "Belum terhubung",
    belumDikonfigurasiLabel: "Belum dikonfigurasi",
    belumDikonfigurasiHelp:
      "TELEGRAM_BOT_TOKEN belum diisi di environment server (bukan variabel NEXT_PUBLIC_). Hubungi admin VPS, lalu Redeploy.",
    chatIdLabel: "Chat ID tujuan pesan uji (opsional)",
    chatIdPlaceholder: "Kosongkan untuk mengirim ke chat pemilik",
    ujiLabel: "Kirim Pesan Uji",
    mengujiLabel: "Mengirim...",
    testMessage:
      "Pesan uji dari dashboard Circle T. Koneksi bot Telegram berhasil.",
    ujiBerhasil: "Pesan uji terkirim ke chat {chatId}.",
    ujiGagal: "Gagal mengirim pesan uji: {reason}",
  },
  openclawCard: {
    title: "Koneksi AI Agent (OpenClaw)",
    description:
      "Skill server OpenClaw di VPS melayani chat AI dan validasi pengaduan.",
    hostLabel: "Endpoint",
    terhubungLabel: "Terhubung",
    terputusLabel: "Terputus",
    latencyLabel: "Latensi",
    memeriksaLabel: "Memeriksa...",
    belumDikonfigurasi:
      "Endpoint belum dikonfigurasi di server. Hubungi admin VPS.",
    periksaUlangLabel: "Periksa Ulang Koneksi",
    memeriksaUlangLabel: "Memeriksa...",
    modelTitle: "Model AI",
    modelNote:
      "Angka, plat, dan fakta armada selalu dibaca dari Supabase lewat skrip; LLM hanya merangkai ulang jawaban menjadi bahasa Indonesia natural, maksimal 3 kalimat. Model saat ini: MiMo V2.5 (alias oc/mimo-v2.5-free via proxy 9router di VPS).",
    panduanTitle: "Panduan bila terputus",
    panduanLangkah: [
      "Pastikan VPS menyala dan tersambung ke internet (minta admin memeriksanya).",
      "Tunggu sekitar satu menit, server butuh waktu untuk siap.",
      "Tekan tombol Periksa Ulang Koneksi.",
      "Bila masih terputus setelah tiga percobaan, hubungi admin VPS.",
    ],
  },
  agentPromptCard: {
    title: "System Prompt AI Agent",
    description:
      "Teks petunjuk dan safeguard yang dikirim ke AI sebagai aturan jawab. Edit di sini dan Simpan; langsung berlaku untuk percakapan Chat AI.",
    fieldLabel: "System prompt",
    saveLabel: "Simpan",
    savingLabel: "Menyimpan...",
    savedMessage: "System prompt disimpan. Berlaku untuk chat AI berikutnya.",
    emptyError: "Prompt tidak boleh kosong.",
    loadError: "Gagal memuat system prompt. Coba lagi.",
    saveError: "Gagal menyimpan system prompt. Coba lagi.",
    hint: "Perubahan berlaku tanpa perlu redeploy (disimpan di Supabase).",
  },
};
