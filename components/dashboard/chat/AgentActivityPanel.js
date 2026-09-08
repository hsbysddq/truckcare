"use client";

import { useEffect, useState } from "react";
import { Activity } from "lucide-react";
import { chatPage, toneMeta } from "@/lib/content";

// Panel kanan Chat AI. Data dari GET /api/agent-activity, yang membaca tabel
// agent_runs (trigger_type, complaint_id, started_at, finished_at, outcome,
// notes). Belum ada baris hari ini = keadaan kosong, bukan aktivitas contoh.
export default function AgentActivityPanel() {
  const [activities, setActivities] = useState([]);
  const [state, setState] = useState("loading");

  useEffect(() => {
    let batal = false;
    fetch("/api/agent-activity", { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error(String(res.status)))))
      .then((data) => {
        if (batal) return;
        setActivities(Array.isArray(data?.activities) ? data.activities : []);
        setState("ready");
      })
      .catch(() => {
        if (!batal) setState("error");
      });
    return () => {
      batal = true;
    };
  }, []);

  return (
    <aside className="hidden w-80 flex-none flex-col overflow-y-auto border-l border-slate-200 bg-white p-5 lg:flex">
      <h2 className="text-sm font-semibold text-slate-900">
        {chatPage.activityPanelTitle}
      </h2>

      {state === "loading" && (
        <p className="mt-4 text-sm text-slate-400">{chatPage.activityLoading}</p>
      )}

      {state === "error" && (
        <p className="mt-4 text-sm text-red-600" role="alert">
          {chatPage.activityError}
        </p>
      )}

      {state === "ready" && activities.length === 0 && (
        <div className="mt-6 flex flex-col items-center rounded-xl bg-slate-50 px-4 py-8 text-center">
          <Activity className="h-6 w-6 text-slate-400" strokeWidth={1.75} />
          <p className="mt-3 text-sm text-slate-500">{chatPage.activityEmpty}</p>
        </div>
      )}

      {state === "ready" && activities.length > 0 && (
        <div className="mt-4 space-y-4">
          {activities.map((activity) => (
            <div
              key={activity.id}
              className="border-b border-slate-100 pb-4 last:border-0 last:pb-0"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-semibold text-slate-900">
                  {activity.time}
                </span>
                <span
                  className={`inline-flex flex-none items-center rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                    (toneMeta[activity.tone] ?? toneMeta.info).badgeClass
                  }`}
                >
                  {activity.resultLabel}
                </span>
              </div>
              <p className="mt-1 text-[11px] font-medium uppercase tracking-wider text-slate-400">
                {chatPage.triggerLabels[activity.trigger]}
              </p>
              <p className="mt-1 text-sm leading-relaxed text-slate-600">
                {activity.description}
              </p>
            </div>
          ))}
        </div>
      )}
    </aside>
  );
}
