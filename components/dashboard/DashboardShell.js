"use client";

import { createContext, useContext, useEffect, useState } from "react";
import Sidebar from "@/components/dashboard/Sidebar";
import DashboardHeader from "@/components/dashboard/DashboardHeader";

// Halaman yang ingin mengisi tinggi viewport tanpa scroll halaman (mis. papan
// pengemudi) memanggil useFillViewport(true): pembungkus konten berhenti
// menggulir dan <main> menjadi kolom flex dengan min-h-0, sehingga satu-satunya
// sumber scroll ada di dalam halaman itu sendiri. Halaman lain tidak berubah.
const ViewportContext = createContext(() => {});

export function useFillViewport(aktif) {
  const setFill = useContext(ViewportContext);
  useEffect(() => {
    setFill(Boolean(aktif));
    return () => setFill(false);
  }, [aktif, setFill]);
}

export default function DashboardShell({ children, user }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [fill, setFill] = useState(false);

  return (
    <ViewportContext.Provider value={setFill}>
      {/* fixed inset-0: kerangka dashboard mengisi viewport dan tidak pernah
          menambah tinggi dokumen, sehingga html/body tidak punya scrollbar
          sendiri. Satu-satunya scroll ada di pembungkus konten (atau di dalam
          halaman yang memakai useFillViewport). */}
      <div className="fixed inset-0 flex overflow-hidden bg-slate-50">
        <Sidebar
          open={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          collapsed={collapsed}
          onToggleCollapse={() => setCollapsed((c) => !c)}
          user={user}
        />
        <div className={`flex min-h-0 flex-1 flex-col ${fill ? "overflow-hidden" : "overflow-y-auto"}`}>
          <div className="flex-none">
            <DashboardHeader onOpenSidebar={() => setSidebarOpen(true)} />
          </div>
          <main
            className={`min-h-0 flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8 ${
              fill ? "flex flex-col overflow-hidden" : ""
            }`}
          >
            {children}
          </main>
        </div>
      </div>
    </ViewportContext.Provider>
  );
}
