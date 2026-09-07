// Semua teks dan angka untuk landing page Circle T didefinisikan di sini.
// Komponen tidak boleh berisi teks/angka statis — impor semuanya dari file ini.

export const siteConfig = {
  name: "Circle T",
  title: "Circle T — Platform Monitoring Armada Truk Berbasis AI Agent",
  description:
    "Circle T membantu perusahaan logistik memantau armada truk secara real-time, memvalidasi pengaduan warga secara otomatis, dan menyajikan analitik dampak kerja agent dalam satu dashboard.",
};

// Sumber tunggal nama & tujuan dashboard untuk keempat fitur utama —
// dipakai ulang oleh navbar, section "Fitur Kami", dan footer.
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
    key: "driver-checker",
    label: "Driver Checker",
    dashboardHref: "/dashboard/pengaduan",
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
    headline: "Temukan pola yang luput dari pengawasan manual",
    image: "/hero/slide-3.jpg",
    alt: "Interior gudang logistik dengan rak penyimpanan barang bertingkat",
    benefits: [
      { icon: "trending-up", text: "Tren insiden per armada" },
      { icon: "fuel", text: "Anomali konsumsi solar" },
      { icon: "file-text", text: "Rekap otomatis harian" },
      { icon: "download", text: "Data siap diekspor" },
    ],
  },
  {
    key: "live-tracking",
    label: "Live Tracking",
    headline: "Tahu posisi setiap truk, setiap saat",
    image: "/hero/slide-1.jpg",
    alt: "Truk trailer melaju di jalan tol saat senja",
    benefits: [
      { icon: "map-pin", text: "Posisi real-time di peta" },
      { icon: "gauge", text: "Kecepatan terpantau terus" },
      { icon: "rotate-ccw-clock", text: "Riwayat perjalanan tersimpan" },
      { icon: "smartphone", text: "Akses dari mana saja" },
    ],
  },
  {
    key: "truck-management",
    label: "Truck Management",
    headline: "Seluruh armada dalam satu layar",
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
    key: "driver-checker",
    label: "Driver Checker Management",
    headline: "Laporan warga, diverifikasi dengan data",
    image: "/hero/slide-4.jpg",
    alt: "Truk trailer terlihat dari kaca depan kendaraan yang mengikuti di jalan raya saat senja",
    benefits: [
      { icon: "megaphone", text: "Pengaduan publik tanpa login" },
      { icon: "link", text: "Dicocokkan ke telematika" },
      { icon: "shield-check", text: "Bukti kecepatan dan lokasi" },
      { icon: "funnel", text: "Laporan palsu tersaring" },
    ],
  },
];

export const productPreviewSection = {
  eyebrow: "Fitur Kami",
  headline: "Semua yang Anda butuhkan untuk mengawasi armada, dalam satu tempat.",
  description:
    "Satu dashboard untuk memantau posisi truk, mengelola armada, membaca analitik, dan menindaklanjuti pengaduan warga.",
  autoplayIntervalMs: 6000,
  items: [
    {
      ...mainFeatures[0],
      icon: "map-pin",
      description:
        "Posisi, kecepatan, dan riwayat perjalanan tiap truk dalam satu peta.",
      image: "/preview/overview.png",
      alt: "Tampilan dashboard Overview dengan peta lokasi armada secara real-time",
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
        "Tren insiden, anomali konsumsi solar, dan rekap otomatis harian.",
      image: "/preview/analitik.png",
      alt: "Tampilan dashboard Analitik dengan grafik tren insiden dan konsumsi solar",
    },
    {
      ...mainFeatures[3],
      icon: "shield-check",
      description:
        "Pengaduan publik yang divalidasi otomatis terhadap data telematika.",
      image: "/preview/pengaduan.png",
      alt: "Tampilan dashboard Pengaduan dengan daftar laporan yang divalidasi otomatis",
    },
  ],
};

export const howItWorksSection = {
  eyebrow: "Cara Kerja",
  headline: "Dari laporan warga, jadi bukti",
  description:
    "Setiap pengaduan dicocokkan dengan data telematika armada sebelum sampai ke meja pemilik.",
  diagramImage: "/arsitektur.png",
  diagramAlt: "Diagram alur pelaporan dan validasi pengaduan Circle T",
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
      title: "Dicocokkan dengan telematika",
      description:
        "Agent menarik rekaman posisi dan kecepatan truk tersebut pada waktu yang dilaporkan, langsung dari data armada.",
    },
    {
      number: "04",
      title: "Verdict dengan bukti",
      description:
        "Laporan ditandai tervalidasi, tidak cocok, atau perlu ditinjau manusia — lengkap dengan grafik kecepatan dan titik lokasi sebagai bukti.",
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
  headline: "Mengapa Circle T",
  description: "Bukan sekadar melihat di mana truk berada.",
  cards: [
    {
      icon: "shield-check",
      title: "Laporan yang bisa dipertanggungjawabkan",
      description:
        "GPS biasa hanya menunjukkan posisi. Circle T menghubungkan keluhan dari luar dengan data armada, sehingga setiap tuduhan punya bukti atau gugur dengan sendirinya.",
    },
    {
      icon: "funnel",
      title: "Laporan palsu tersaring otomatis",
      description:
        "Pengaduan anonim rawan disalahgunakan untuk menjatuhkan sesama pengemudi. Setiap laporan diuji terhadap rekaman perjalanan sebelum ditindaklanjuti.",
    },
    {
      icon: "smartphone",
      title: "Tidak perlu memelototi dashboard",
      description:
        "Agent bekerja tanpa diminta: memvalidasi laporan begitu masuk dan mengirim rekap harian ke Telegram, sehingga pemilik cukup membuka ponsel.",
    },
    {
      icon: "fuel",
      title: "Temuan yang mudah terlewat",
      description:
        "Anomali seperti penurunan solar saat kendaraan berhenti sulit ditemukan secara manual. Agent memeriksa polanya setiap hari.",
    },
  ],
};

export const ctaSection = {
  headline: "Berhenti menebak siapa yang benar.",
  description: "Setiap laporan diperiksa terhadap data armada Anda sendiri.",
  primaryCta: { label: "Mulai Pantau Armada", href: "/login" },
  secondaryCta: { label: "Laporkan Insiden", href: "/pengaduan" },
};

export const footer = {
  brand: {
    name: "Circle T",
    description:
      "Platform monitoring armada truk berbasis AI untuk operasional logistik yang lebih efisien dan andal.",
  },
  columns: [
    {
      title: "Produk",
      links: [
        { label: "Fitur", href: "#fitur" },
        { label: "Cara Kerja", href: "#cara-kerja" },
        { label: "Login", href: "/login" },
        { label: "Pengaduan", href: "/pengaduan" },
      ],
    },
    {
      title: "Fitur",
      links: mainFeatures.map((feature) => ({
        label: feature.label,
        href: "#fitur",
      })),
    },
    {
      title: "Tim",
      links: [
        { label: "Tentang Kami", href: "#" },
        { label: "Karier", href: "#" },
        { label: "Blog", href: "#" },
      ],
    },
    {
      title: "Kontak",
      links: [
        { label: "halo@circlet.id", href: "mailto:halo@circlet.id" },
        { label: "+62 21 5000 1234", href: "tel:+622150001234" },
        { label: "Jakarta, Indonesia", href: "#kontak" },
      ],
    },
  ],
  bottom: {
    copyright: "© 2026 Circle T. Seluruh hak cipta dilindungi.",
    links: [
      { label: "Kebijakan Privasi", href: "#" },
      { label: "Syarat & Ketentuan", href: "#" },
    ],
  },
};

export const pengaduanPublikPage = {
  eyebrow: "Laporkan Insiden",
  title: "Ajukan Pengaduan Kendaraan",
  description:
    "Laporkan perilaku berkendara, kecepatan berlebih, atau insiden lalu lintas yang melibatkan armada. Tim operasional akan memverifikasi laporan Anda terhadap data telematika kendaraan. Tidak perlu login.",
  formTitle: "Formulir Pengaduan",
  plateLabel: "Plat Nomor",
  platePlaceholder: "Contoh: L 9042 CD",
  dateLabel: "Tanggal Kejadian",
  timeLabel: "Jam Kejadian",
  descriptionLabel: "Deskripsi Kejadian",
  descriptionPlaceholder: "Jelaskan apa yang Anda lihat, lokasi, dan urutan kejadian...",
  photoLabel: "Foto Bukti (opsional)",
  photoHint: "Maksimal 2 MB",
  submitLabel: "Kirim Pengaduan",
  submittingLabel: "Mengirim...",
  privacyNote:
    "Laporan diverifikasi berdasarkan data telematika kendaraan, bukan identitas pelapor. Pengaduan Anda tetap anonim.",
  errors: {
    plate: "Masukkan format plat yang benar (contoh: L 9042 CD).",
    date: "Pilih tanggal kejadian.",
    description: "Deskripsi minimal 20 karakter.",
    photo: "Foto maksimal 2 MB.",
    network: "Pengaduan gagal dikirim. Periksa koneksi lalu coba lagi.",
    upload:
      "Foto gagal diunggah, tetapi laporan tetap terkirim tanpa foto.",
  },
  successTitle: "Laporan Terkirim",
  successDescription: "Laporan Anda sudah tercatat dengan nomor",
  successStatus: "Status: Menunggu Diverifikasi",
  successNote:
    "Tim operasional akan memverifikasi laporan terhadap data armada pada waktu dan lokasi yang Anda berikan.",
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
};

export const dashboardNav = [
  { label: "Overview", href: "/dashboard", icon: "layout-dashboard" },
  { label: "Armada", href: "/dashboard/armada", icon: "truck" },
  { label: "Chat AI", href: "/dashboard/chat", icon: "bot" },
  { label: "Peta", href: "/dashboard/peta", icon: "map" },
  { label: "Pengaduan", href: "/dashboard/pengaduan", icon: "clipboard-check" },
  { label: "Analitik", href: "/dashboard/analitik", icon: "chart-column" },
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
  detailPanel: {
    emptyStateMessage: "Pilih truk di peta untuk melihat detail.",
    driverLabel: "Pengemudi",
    speedLabel: "Kecepatan",
    speedUnit: "km/jam",
    fuelLabel: "Level Bahan Bakar",
    speedChartTitle: "Kecepatan 1 Jam Terakhir",
    historyTitle: "Riwayat Perjalanan",
    detailButtonLabel: "Lihat Detail",
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

export const dashboardPlaceholders = {
  peta: { title: "Peta", message: "Sedang dalam pengembangan." },
};

export const armadaPage = {
  title: "Daftar Armada",
  countBadgeSuffix: "Kendaraan",
  progressLabel: "Progres perjalanan",
  speedUnit: "km/jam",
  detailButtonLabel: "Lihat Detail",
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
  ],
  noResultsMessage: "Tidak ada laporan yang cocok.",
  emptyStateMessage: "Pilih laporan di daftar untuk melihat detail.",
  reporterRowLabel: "Pelapor",
  defaultReporterLabel: "Warga Sekitar",
  agentBox: {
    title: "Analisis Agent",
    confidenceLabel: "Tingkat Keyakinan",
  },
  chart: {
    title: "Grafik Bukti Kecepatan",
    subtitle: "Kecepatan truk 30 menit sebelum dan sesudah kejadian.",
    incidentLabel: "Titik Kejadian",
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
  rejectButtonLabel: "Tolak Laporan",
  validateButtonLabel: "Validasi Laporan",
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
  greeting:
    "Halo, saya Circle T Agent. Ada yang bisa saya bantu terkait armada Anda hari ini?",
  exampleQuestionsLabel: "Contoh pertanyaan",
  quickSuggestions: [
    "Rekap hari ini",
    "Cek anomali solar",
    "Pengaduan belum divalidasi",
  ],
  inputPlaceholder: "Tulis pertanyaan Anda...",
  fallbackReply:
    "Fitur ini masih menggunakan respons contoh. Setelah terhubung ke AI asli, jawaban akan disesuaikan dengan pertanyaan Anda secara langsung.",
  activityPanelTitle: "Aktivitas Agent",
  triggerLabels: {
    otomatis: "Otomatis",
    pengguna: "Permintaan Pengguna",
  },
};

export const analitikPage = {
  title: "Analitik & Dampak",
  subtitle:
    "Ringkasan kerja agent dan temuan operasional selama 30 hari terakhir.",
  exportButtonLabel: "Ekspor CSV",
  dateRangeLabel: "30 Hari Terakhir",
  metricCards: [
    {
      key: "complaintsProcessed",
      label: "Pengaduan Diproses",
      icon: "clipboard-check",
    },
    {
      key: "autoResolvedPct",
      label: "Diselesaikan Otomatis",
      icon: "bot",
      suffix: "tanpa campur tangan manusia",
    },
    {
      key: "avgValidationSeconds",
      label: "Rata-rata Waktu Validasi",
      icon: "gauge",
    },
    {
      key: "speedingIncidents",
      label: "Insiden Ngebut Terdeteksi",
      icon: "triangle-alert",
    },
  ],
  charts: {
    dailyTrend: {
      title: "Tren Pengaduan Harian",
      subtitle: "30 hari terakhir, dipecah berdasarkan hasil validasi agent.",
      seriesLabels: {
        tervalidasi: "Tervalidasi",
        ditolak: "Ditolak",
        perluDitinjau: "Perlu Ditinjau",
      },
      seriesColors: {
        tervalidasi: "#10b981",
        ditolak: "#ef4444",
        perluDitinjau: "#eab308",
      },
    },
    fuelConsumption: {
      title: "Konsumsi Solar per Truk",
      subtitle:
        "Liter per minggu, 4 minggu terakhir. Titik merah menandai anomali konsumsi.",
      yAxisLabel: "Liter",
    },
    speedingByPlate: {
      title: "Insiden Kecepatan per Armada",
      subtitle:
        "Jumlah pelanggaran per plat nomor, diurutkan dari terbanyak. Batas kecepatan acuan: 80 km/jam.",
    },
    violationMap: {
      title: "Sebaran Lokasi Pelanggaran",
      subtitle:
        "Ukuran marker menunjukkan jumlah insiden kecepatan di lokasi tersebut.",
      legendLabel: "Jumlah Insiden",
    },
  },
};
