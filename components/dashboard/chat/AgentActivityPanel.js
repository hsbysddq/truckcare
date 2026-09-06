import { chatPage, toneMeta } from "@/lib/content";
import { getAgentActivity } from "@/lib/data";

export default function AgentActivityPanel() {
  const activities = getAgentActivity();

  return (
    <aside className="hidden w-80 flex-none flex-col overflow-y-auto border-l border-slate-200 bg-white p-5 lg:flex">
      <h2 className="text-sm font-semibold text-slate-900">
        {chatPage.activityPanelTitle}
      </h2>
      <div className="mt-4 space-y-4">
        {activities.map((activity, index) => (
          <div
            key={index}
            className="border-b border-slate-100 pb-4 last:border-0 last:pb-0"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-semibold text-slate-900">
                {activity.time}
              </span>
              <span
                className={`inline-flex flex-none items-center rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                  toneMeta[activity.tone].badgeClass
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
    </aside>
  );
}
