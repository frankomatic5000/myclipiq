"use client";

import { Clock, User } from "lucide-react";
import StatusBadge from "./StatusBadge";
import type { MockProject } from "@/lib/mock/data";

interface ProjectCardProps {
  project: MockProject;
}

export default function ProjectCard({ project }: ProjectCardProps) {
  return (
    <div className="bg-surface-900 rounded-xl border border-surface-700/50 overflow-hidden transition-all duration-200 ease-out hover:-translate-y-0.5 hover:border-brand-400/30 hover:shadow-lg hover:shadow-brand-400/5 cursor-pointer active:scale-[0.98]">
      {/* Thumbnail placeholder */}
      <div className={`aspect-video w-full ${project.thumbnail} relative`}>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
            <svg className="w-5 h-5 text-white/90" fill="currentColor" viewBox="0 0 24 24">
              <polygon points="8,5 19,12 8,19" />
            </svg>
          </div>
        </div>
        {/* Progress bar */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-surface-900/60">
          <div
            className="h-full bg-brand-400 transition-all duration-300"
            style={{ width: `${project.progress}%` }}
          />
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-surface-200 truncate">
              {project.title}
            </h3>
            <p className="text-xs text-surface-400 mt-0.5">{project.customer}</p>
          </div>
          <StatusBadge status={project.status} />
        </div>

        <div className="flex items-center justify-between text-xs text-surface-400">
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" />
            <span>{project.lastUpdated}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <User className="w-3.5 h-3.5" />
            <span
              className={`w-5 h-5 rounded-full ${project.assignee.color} flex items-center justify-center text-[10px] font-bold text-white`}
            >
              {project.assignee.initials}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
