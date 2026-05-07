"use client";
interface TimelineEvent {
  id: string;
  date: string;
  type: "message" | "call" | "email" | "status_change" | "note";
  description: string;
  author: string;
}
interface TimelineProps {
  events: TimelineEvent[];
}
const typeIcon: Record<string, string> = {
  message: "💬",
  call: "📞",
  email: "✉️",
  status_change: "🔄",
  note: "📝",
};
export default function Timeline({ events }: TimelineProps) {
  
  const sorted = [...events].sort((a, b) => b.date.localeCompare(a.date));
  return (
    <div className="relative pl-4">
      <div className="absolute left-0 top-2 bottom-2 w-px bg-surface-800" />
      {sorted.map((ev) => (
        <div key={ev.id} className="relative mb-4 last:mb-0">
          <div className="absolute -left-4 top-1 w-2 h-2 rounded-full bg-brand-500 ring-4 ring-surface-950" />
          <div className="flex items-center gap-2 text-xs text-surface-400 mb-1">
            <span>{typeIcon[ev.type] || "•"}</span>
            <span>{ev.date}</span>
            <span>·</span>
            <span className="text-surface-300">{ev.author}</span>
          </div>
          <p className="text-sm text-surface-200">{ev.description}</p>
        </div>
      ))}
    </div>
  );
}
