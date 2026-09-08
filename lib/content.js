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
    headline: "Temukan pola yang tidak terdeteksi lewat pengecekan manual",
    subheadline:
      "Didukung AI Agent yang bekerja 24/7 menganalisis data armada Anda",
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
    subheadline: "Dipantau AI Agent, 24 jam nonstop",
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
    key: "driver-checker",
    label: "Driver Checker Management",
    headline: "Laporan warga, diverifikasi dengan data",
    subheadline:
      "AI Agent memvalidasi setiap laporan sebelum sampai ke meja Anda",
    image: "/hero/slide-4.jpg",
    alt: "Truk trailer terlihat dari kaca depan kendaraan yang mengikuti di jalan raya saat senja",
    benefits: [
      { icon: "megaphone", text: "Pengaduan publik tanpa login" },
      { icon: "link", text: "Dicocokkan ke telematika" },
      { icon: "shield-check", text: "Bukti kecepatan dan lokasi" },
      { icon: "funnel", text: "Laporan palsu tersaring" },
    ],
  },
  {
    key: "ai-agent",
    label: "AI Agent",
    headline: "Satu AI, mengurus semua operasional truk Anda",
    subheadline:
      "Tenang, tidak perlu pusing lagi, AI Agentic yang bekerja untuk Anda",
    image: "/hero/slide-ai-agent.jpg",
    alt: "Jalan tol pada malam hari dengan jejak cahaya kendaraan yang melintas",
    benefits: [
      { icon: "send", text: "Rangkuman otomatis ke Telegram" },
      { icon: "shield-check", text: "Validasi laporan dan pengaduan" },
      { icon: "bell", text: "Notifikasi kondisi truk real-time" },
      { icon: "file-text", text: "Rekap performa harian tanpa diminta" },
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
  description:
    "Bukan sekadar melihat di mana truk berada — AI Agent yang mengurus semuanya untuk Anda.",
  cards: [
    {
      icon: "shield-check",
      title: "Laporan yang bisa dipertanggungjawabkan",
      description:
        "GPS biasa cuma menunjukkan posisi. AI Agent Circle T otomatis menghubungkan keluhan dari luar dengan data armada, setiap tuduhan langsung terverifikasi dengan bukti dan otomatis memberi tahu Anda.",
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
        "AI Agent bekerja tanpa diminta: memvalidasi laporan masuk, lalu mengirim rekap harian ke Telegram. Anda cukup buka ponsel untuk tahu hasilnya.",
    },
    {
      icon: "fuel",
      title: "Temukan pola yang tidak terdeteksi lewat pengecekan manual",
      description:
        "Anomali seperti solar berkurang saat truk berhenti sulit ketahuan secara manual. AI Agent memeriksa polanya setiap hari dan langsung memberi tahu Anda saat ada yang janggal.",
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
  platePlaceholder: "Contoh: W 9042 CD",
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
    plate: "Masukkan format plat yang benar (contoh: W 9042 CD).",
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
  submittingLabel: "Memproses...",
  envMissingError:
    "Login belum bisa dipakai: NEXT_PUBLIC_SUPABASE_URL dan NEXT_PUBLIC_SUPABASE_ANON_KEY belum diisi di .env.local.",
  accountHint:
    "Akun dibuat oleh admin di Supabase Dashboard (Authentication › Users). Belum ada akun demo bawaan.",
};

export const dashboardNav = [
  { label: "Overview", href: "/dashboard", icon: "layout-dashboard" },
  { label: "Armada", href: "/dashboard/armada", icon: "truck" },
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

export const petaPage = {
  title: "Peta Operasional",
  subtitle: "Posisi armada real-time dari telematika kendaraan, diperbarui setiap beberapa detik.",
  panelTitle: "Armada Terpantau",
  speedUnit: "km/jam",
  emptyMessage:
    "Belum ada posisi truk terpantau. Pastikan simulasi berjalan di server pengisi data.",
};

export const armadaPage = {
  title: "Daftar Armada",
  countBadgeSuffix: "Kendaraan",
  progressLabel: "Progres perjalanan",
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
  greeting: "Ada yang bisa saya bantu soal armada Anda?",
  emptyHint:
    "Tanyakan posisi truk, status pengaduan, atau minta rekap operasional.",
  quickSuggestions: [
    "Rekap hari ini",
    "Cek anomali solar",
    "Pengaduan belum divalidasi",
  ],
  inputPlaceholder: "Tulis pertanyaan Anda...",
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
      unit: "%",
      detailTitle: "Level solar {plate}",
      anomalyBadge: "{n} anomali",
      normalBadge: "Normal",
      summary: {
        avgDailyLabel: "Pemakaian harian",
        avgDailyUnit: "poin/hari",
        refillLabel: "Pengisian",
        anomalyLabel: "Anomali",
      },
      legend: {
        truck: "Level {plate}",
        fleet: "Rata-rata armada",
      },
      tooltip: {
        levelLabel: "Level solar",
        fleetLabel: "Rata-rata armada",
        statusLabel: "Status",
        normal: "Pemakaian normal",
        refill: "Pengisian ulang",
        anomaly: "Anomali: turun {drop} poin tanpa pengisian",
      },
      insight:
        "{plate} turun {drop} poin dalam sehari pada {date} tanpa pengisian ulang{more}",
      insightMoreSuffix: " — total {n} anomali pada periode ini",
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
      "Pesan uji dari dashboard Circle T — koneksi bot Telegram berhasil.",
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
    panduanTitle: "Panduan bila terputus",
    panduanLangkah: [
      "Pastikan VPS menyala dan tersambung ke internet (minta admin memeriksanya).",
      "Tunggu sekitar satu menit, server butuh waktu untuk siap.",
      "Tekan tombol Periksa Ulang Koneksi.",
      "Bila masih terputus setelah tiga percobaan, hubungi admin VPS.",
    ],
  },
};
