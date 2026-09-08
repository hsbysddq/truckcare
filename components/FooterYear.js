"use client";

import { useEffect, useState } from "react";

// Tahun hak cipta dihitung dari tanggal saat ini di browser, supaya tidak
// terkunci pada tahun saat build. Render awal memakai tahun server, lalu
// disamakan di klien.
export default function FooterYear() {
  const [year, setYear] = useState(() => new Date().getFullYear());
  useEffect(() => {
    setYear(new Date().getFullYear());
  }, []);
  return <>{year}</>;
}
