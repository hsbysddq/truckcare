// Semua teks dan angka untuk landing page Circle T didefinisikan di sini.
// Komponen tidak boleh berisi teks/angka statis — impor semuanya dari file ini.

export const siteConfig = {
  name: "Circle T",
  tagline: "Fleet Monitoring",
  title: "Circle T — Platform Monitoring Armada Truk Berbasis AI Agent",
  description:
    "Circle T membantu perusahaan logistik memantau armada truk secara real-time, memvalidasi pengaduan warga secara otomatis, dan menyajikan analitik dampak kerja agent dalam satu dashboard.",
};

export const navbar = {
  centerLinks: [
    { label: "Fitur", href: "#fitur" },
    { label: "Cara Kerja", href: "#cara-kerja" },
    { label: "Dashboard", href: "#dashboard-preview" },
    { label: "Arsitektur", href: "#arsitektur" },
  ],
  secondaryCta: { label: "Login", href: "/login" },
  primaryCta: { label: "Pengaduan", href: "/pengaduan" },
};

export const hero = {
  eyebrow: "Platform Monitoring Armada Berbasis AI",
  headline: "Optimalkan Operasional Logistik dengan AI Agent",
  subheadline:
    "Circle T memantau kondisi armada secara real-time, memvalidasi pengaduan warga secara otomatis, dan menyajikan analitik dampak kerja agent dalam satu dashboard.",
  primaryCta: { label: "Tracking Truck", href: "/login" },
  secondaryCta: { label: "Lihat Cara Kerja", href: "#cara-kerja" },
  image: {
    src: "https://images.unsplash.com/photo-1587293852726-70cdb56c2866?auto=format&fit=crop&w=2400&q=80",
    alt: "Interior gudang logistik dengan rak penyimpanan barang bertingkat",
  },
};

export const caraKerjaSection = {
  eyebrow: "Cara Kerja",
  headline: "Tiga Langkah dari Data ke Verdict",
  description:
    "Circle T menghubungkan data kendaraan dan laporan warga menjadi satu proses validasi yang jelas dan bisa dipertanggungjawabkan.",
  steps: [
    {
      number: "01",
      title: "Data Telematika Masuk dari Armada",
      description:
        "Setiap truk mengirim data lokasi, kecepatan, dan kondisi mesin secara berkala ke sistem pusat.",
    },
    {
      number: "02",
      title: "Warga Melaporkan Insiden Lewat Form Publik",
      description:
        "Warga yang melihat perilaku berkendara mencurigakan dapat melapor lengkap dengan plat nomor, lokasi, dan waktu kejadian.",
    },
    {
      number: "03",
      title: "Agent Mencocokkan Laporan dengan Data dan Memberi Verdict",
      description:
        "Agent membandingkan laporan dengan data telematika pada waktu dan lokasi yang sama, lalu memberi verdict tervalidasi, ditolak, atau perlu ditinjau — lengkap dengan bukti pendukung.",
    },
  ],
};

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
    "Circle T menggabungkan pemantauan lapangan dan kecerdasan buatan agar tim operasional bisa mengambil keputusan lebih cepat.",
  items: [
    {
      icon: "radar",
      title: "Live Tracking",
      description:
        "Pantau posisi dan kecepatan setiap truk secara real-time langsung di peta. Lihat riwayat perjalanan lengkap untuk setiap unit kapan saja dibutuhkan.",
    },
    {
      icon: "truck",
      title: "Truck Management",
      description:
        "Kelola daftar armada lengkap dengan status operasional dan progres perjalanan setiap unit. Ketahui pengemudi yang sedang bertugas tanpa perlu bertanya.",
    },
    {
      icon: "chart-column",
      title: "Analitik & Dampak",
      description:
        "Pantau tren pengaduan, insiden kecepatan per armada, dan anomali konsumsi solar dalam satu dashboard. Data ini membantu menemukan pola yang sulit terlihat secara manual.",
    },
    {
      icon: "clipboard-check",
      title: "Driver Checker",
      description:
        "Setiap pengaduan publik divalidasi otomatis oleh agent terhadap data telematika armada. Hasil validasi disertai bukti kecepatan dan lokasi, bukan sekadar asumsi.",
    },
  ],
};

export const dashboardPreviewSection = {
  eyebrow: "Pratinjau Produk",
  headline: "Lihat Isi Dashboard",
  description:
    "Intip tampilan dashboard yang dipakai tim operasional sehari-hari untuk memantau armada dan menindaklanjuti pengaduan.",
  tabs: [
    {
      key: "overview",
      label: "Overview",
      image: "/preview/overview.png",
      title: "Overview",
      description:
        "Ringkasan armada sekilas — total truk, status operasional, dan peta lokasi real-time dalam satu layar.",
    },
    {
      key: "armada",
      label: "Armada",
      image: "/preview/armada.png",
      title: "Armada",
      description:
        "Daftar lengkap seluruh truk beserta status perjalanan, rute, dan progres pengiriman masing-masing unit.",
    },
    {
      key: "pengaduan",
      label: "Pengaduan",
      image: "/preview/pengaduan.png",
      title: "Pengaduan",
      description:
        "Laporan warga yang sudah divalidasi otomatis oleh agent, lengkap dengan grafik bukti kecepatan dan lokasi kejadian.",
    },
    {
      key: "analitik",
      label: "Analitik",
      image: "/preview/analitik.png",
      title: "Analitik",
      description:
        "Tren pengaduan, insiden kecepatan per armada, dan pola konsumsi solar untuk mengukur dampak kerja agent.",
    },
    {
      key: "chat",
      label: "Chat AI",
      image: "/preview/chat.png",
      title: "Chat AI",
      description:
        "Tanyakan kondisi armada kapan saja lewat chat, lengkap dengan jejak pemanggilan data yang bisa ditelusuri.",
    },
  ],
};

export const architectureSection = {
  eyebrow: "Arsitektur Sistem",
  headline: "Satu Sistem, Empat Lapisan Kecerdasan",
  description:
    "Circle T menghubungkan perangkat di lapangan, mesin AI, dan tim operasional dalam satu alur data yang aman dan real-time.",
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
    "Jadwalkan demo bersama tim kami dan lihat bagaimana AI agent Circle T dapat mengurangi downtime dan biaya operasional armada Anda.",
  button: { label: "Tracking Truck", href: "/login" },
};

export const footer = {
  brand: {
    name: "Circle T",
    tagline: "Fleet Monitoring",
    description:
      "Platform monitoring armada truk berbasis AI untuk operasional logistik yang lebih efisien dan andal.",
  },
  columns: [
    {
      title: "Produk",
      links: [
        { label: "Dashboard", href: "#dashboard-preview" },
        { label: "Cara Kerja", href: "#cara-kerja" },
        { label: "Login", href: "/login" },
        { label: "Pengaduan", href: "/pengaduan" },
      ],
    },
    {
      title: "Fitur",
      links: [
        { label: "Live Tracking", href: "#fitur" },
        { label: "Truck Management", href: "#fitur" },
        { label: "Analitik & Dampak", href: "#fitur" },
        { label: "Driver Checker", href: "#fitur" },
      ],
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
