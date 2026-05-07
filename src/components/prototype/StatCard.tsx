"use client";

import { Folder, Edit3, Eye, Calendar, TrendingUp, Minus } from "lucide-react";

const iconMap = {
  folder: Folder,
  edit: Edit3,
  eye: Eye,
  calendar: Calendar,
};

const colorMap: Record<string, string> = {
  blue:   "bg-blue-500/10 text-blue-400 border-blue-500/20",
  amber:  "bg-amber-500/10 text-amber-400 border-amber-500/20",
  purple: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  green:  "bg-green-500/10 text-green-400 border-green-500/20",
};

export interface StatCardProps {
  label: string;
  value: number;
  change: string;
  icon: "folder" | "edit" | "eye" | "calendar";
  color: "blue" | "amber" | "purple" | "green";
}

export default function StatCard({ label, value, change, icon, color }: StatCardProps) {
  const Icon = iconMap[icon];
  const isPositive = change.startsWith("+");
  const isNeutral = change === "0";

  return (
    <div className="bg-surface-900 rounded-xl p-5 border border-surface-700/50 transition-all duration-200 ease-out hover:-translate-y-0.5 hover:shadow-lg hover:shadow-surface-900/50 hover:border-surface-600/50 cursor-default">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-medium text-surface-300 uppercase tracking-wider">
          {label}
        </span>
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center border ${colorMap[color]}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      <div className="flex items-end gap-3">
        <p className="text-3xl font-bold text-surface-100">{value}</p>
        <div className="flex items-center gap-1 pb-1">
          {isNeutral ? (
            <Minus className="w-3.5 h-3.5 text-surface-500" />
          ) : (
            <TrendingUp
              className={`w-3.5 h-3.5 ${isPositive ? "text-green-400" : "text-red-400"}`}
            />
          )}
          <span
            className={`text-sm font-medium ${
              isPositive ? "text-green-400" : isNeutral ? "text-surface-500" : "text-red-400"
            }`}
          >
            {change}
          </span>
        </div>
      </div>
    </div>
  );
}
