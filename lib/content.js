// Semua teks dan angka untuk landing page TruckCare didefinisikan di sini.
// Komponen tidak boleh berisi teks/angka statis — impor semuanya dari file ini.

export const siteConfig = {
  name: "TruckCare",
  title: "TruckCare — Platform Monitoring Armada Truk Berbasis AI",
  description:
    "TruckCare membantu perusahaan logistik memantau armada truk secara real-time, memvalidasi pengaduan sopir secara otomatis, dan mengirim notifikasi instan melalui AI agent.",
};

export const navbar = {
  links: [{ label: "Login", href: "/login" }],
  cta: { label: "Pengaduan", href: "/pengaduan" },
};

export const hero = {
  eyebrow: "Platform Monitoring Armada Berbasis AI",
  headline: "Optimalkan Operasional Logistik dengan AI Agent",
  subheadline:
    "TruckCare memantau kondisi armada, memvalidasi pengaduan sopir secara otomatis, dan mengirim notifikasi real-time — semua dalam satu dashboard cerdas.",
  primaryCta: { label: "Tracking Truck", href: "/login" },
  secondaryCta: { label: "Lihat Cara Kerja", href: "#arsitektur" },
  image: {
    src: "https://images.unsplash.com/photo-1587293852726-70cdb56c2866?auto=format&fit=crop&w=2400&q=80",
    alt: "Interior gudang logistik dengan rak penyimpanan barang bertingkat",
  },
};

export const stats = [
  { value: "1.240+", label: "Unit Truk Terpantau Setiap Hari" },
  { value: "99,8%", label: "Tingkat Keandalan Sistem (Uptime)" },
  { value: "35%", label: "Efisiensi Biaya Operasional Armada" },
];

export const industriesSection = {
  eyebrow: "Solusi Lintas Sektor",
  headline: "Dirancang untuk berbagai sektor logistik",
  description:
    "Satu sistem monitoring armada yang bisa disesuaikan dengan pola operasional tiap industri.",
  items: [
    {
      icon: "package",
      name: "FMCG",
      description:
        "Pantau distribusi barang konsumsi bergerak cepat dengan visibilitas rantai pasok end-to-end.",
    },
    {
      icon: "truck",
      name: "Logistik & Kargo",
      description:
        "Kelola ribuan pengiriman lintas kota dengan pelacakan real-time dan estimasi tiba yang akurat.",
    },
    {
      icon: "pickaxe",
      name: "Pertambangan",
      description:
        "Awasi armada angkut di medan berat dengan data kondisi kendaraan dan rute yang presisi.",
    },
    {
      icon: "hard-hat",
      name: "Konstruksi",
      description:
        "Koordinasikan alat berat dan truk material antar proyek dari satu dashboard terpusat.",
    },
  ],
};

export const featuresSection = {
  eyebrow: "Kemampuan Utama",
  headline: "Satu Platform untuk Seluruh Operasional Armada",
  description:
    "TruckCare menggabungkan pemantauan lapangan dan kecerdasan buatan agar tim operasional bisa mengambil keputusan lebih cepat.",
  items: [
    {
      icon: "radar",
      title: "Real-Time Tracking",
      description:
        "Lacak posisi, kecepatan, dan status setiap unit armada secara langsung di peta interaktif, kapan saja dan di mana saja.",
    },
    {
      icon: "clipboard-check",
      title: "Validasi Pengaduan Otomatis",
      description:
        "AI agent membaca, memverifikasi, dan mengklasifikasikan laporan kerusakan atau kendala dari sopir tanpa perlu tim khusus.",
    },
    {
      icon: "send",
      title: "Notifikasi Telegram",
      description:
        "Terima peringatan dini soal keterlambatan, kerusakan, atau penyimpangan rute langsung ke grup Telegram tim operasional.",
    },
  ],
};

export const architectureSection = {
  eyebrow: "Arsitektur Sistem",
  headline: "Satu Sistem, Empat Lapisan Kecerdasan",
  description:
    "TruckCare menghubungkan perangkat di lapangan, mesin AI, dan tim operasional dalam satu alur data yang aman dan real-time.",
  points: [
    {
      icon: "radar",
      title: "Sensor & GPS Kendaraan",
      description:
        "Setiap truk dilengkapi perangkat IoT yang mengirim data lokasi dan kondisi mesin secara berkala.",
    },
    {
      icon: "cpu",
      title: "AI Processing Engine",
      description:
        "Data mentah diproses AI agent untuk mendeteksi anomali dan memvalidasi laporan secara otomatis.",
    },
    {
      icon: "gauge",
      title: "Dashboard Command Center",
      description:
        "Tim operasional memantau seluruh armada melalui satu dashboard terpusat yang mudah dibaca.",
    },
    {
      icon: "send",
      title: "Notifikasi Telegram",
      description:
        "Peringatan penting dikirim otomatis ke channel Telegram agar respons tim menjadi lebih cepat.",
    },
  ],
};

export const ctaSection = {
  headline: "Siap Membuat Armada Anda Lebih Cerdas?",
  description:
    "Jadwalkan demo bersama tim kami dan lihat bagaimana AI agent TruckCare dapat mengurangi downtime dan biaya operasional armada Anda.",
  button: { label: "Tracking Truck", href: "/login" },
};

export const footer = {
  brand: {
    name: "TruckCare",
    description:
      "Platform monitoring armada truk berbasis AI untuk operasional logistik yang lebih efisien dan andal.",
  },
  columns: [
    {
      title: "Produk",
      links: [
        { label: "Real-Time Tracking", href: "#fitur" },
        { label: "Validasi Pengaduan Otomatis", href: "#fitur" },
        { label: "Notifikasi Telegram", href: "#fitur" },
        { label: "Arsitektur Sistem", href: "#arsitektur" },
      ],
    },
    {
      title: "Industri",
      links: [
        { label: "FMCG", href: "#industri" },
        { label: "Logistik & Kargo", href: "#industri" },
        { label: "Pertambangan", href: "#industri" },
        { label: "Konstruksi", href: "#industri" },
      ],
    },
    {
      title: "Kontak",
      links: [
        { label: "halo@truckcare.id", href: "mailto:halo@truckcare.id" },
        { label: "+62 21 5000 1234", href: "tel:+622150001234" },
        { label: "Jakarta, Indonesia", href: "#kontak" },
      ],
    },
  ],
  bottom: {
    copyright: "© 2026 TruckCare. Seluruh hak cipta dilindungi.",
    links: [
      { label: "Kebijakan Privasi", href: "#" },
      { label: "Syarat & Ketentuan", href: "#" },
    ],
  },
};

export const placeholderPages = {
  pengaduan: {
    title: "Pengaduan",
    message: "Halaman ini sedang dalam pengembangan.",
  },
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
  agentName: "TruckCare Agent",
  agentStatusLabel: "Aktif",
  greeting:
    "Halo, saya TruckCare Agent. Ada yang bisa saya bantu terkait armada Anda hari ini?",
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
