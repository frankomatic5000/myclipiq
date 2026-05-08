"use client";

import type { ProjectStatus } from "@/lib/mock/data";

const statusStyles: Record<ProjectStatus, string> = {
  intake:   "bg-[#451a03] text-[#fbbf24] border-[#92400e]",
  editing:  "bg-[#172554] text-[#60a5fa] border-[#1e40af]",
  analysis: "bg-[#3b0764] text-[#c084fc] border-[#6b21a8]",
  review:   "bg-[#422006] text-[#facc15] border-[#a16207]",
  approved: "bg-[#052e16] text-[#4ade80] border-[#166534]",
  posted:   "bg-[#134e4a] text-[#2dd4bf] border-[#0f766e]",
  archived: "bg-[#1e293b] text-[#94a3b8] border-[#475569]",
};

const statusLabelMap: Record<ProjectStatus, string> = {
  intake:   "Intake",
  editing:  "Editing",
  analysis: "Analysis",
  review:   "Review",
  approved: "Approved",
  posted:   "Posted",
  archived: "Archived",
};

interface StatusBadgeProps {
  status: ProjectStatus;
  label?: string;
}

export default function StatusBadge({ status, label }: StatusBadgeProps) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border transition-all duration-200 scale-100 ${statusStyles[status]}`}
    >
      {label ?? statusLabelMap[status]}
    </span>
  );
}
