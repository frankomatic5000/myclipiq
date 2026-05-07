/**
 * MyClipIQ v2 Prototype — Mock Data
 * NO backend calls. Pure static data.
 */

export type ProjectStatus =
  | "intake"
  | "editing"
  | "analysis"
  | "review"
  | "approved"
  | "posted"
  | "archived";

export interface MockProject {
  id: string;
  title: string;
  customer: string;
  status: ProjectStatus;
  thumbnail: string; // Tailwind bg class
  lastUpdated: string;
  assignee: {
    initials: string;
    color: string; // Tailwind bg class
  };
  progress: number; // 0-100
}

export const mockProjects: MockProject[] = [
  {
    id: "1",
    title: "Pernas Cruzadas S2E5",
    customer: "Karine",
    status: "editing",
    thumbnail: "bg-blue-500",
    lastUpdated: "2h ago",
    assignee: { initials: "K", color: "bg-purple-500" },
    progress: 65,
  },
  {
    id: "2",
    title: "TechStartup Demo",
    customer: "Rod",
    status: "review",
    thumbnail: "bg-green-500",
    lastUpdated: "1d ago",
    assignee: { initials: "R", color: "bg-blue-500" },
    progress: 90,
  },
  {
    id: "3",
    title: "Vaptlux SaaS Walkthrough",
    customer: "Client A",
    status: "approved",
    thumbnail: "bg-amber-500",
    lastUpdated: "2d ago",
    assignee: { initials: "R", color: "bg-blue-500" },
    progress: 100,
  },
  {
    id: "4",
    title: "GrowBiz SEO Batch",
    customer: "Client B",
    status: "intake",
    thumbnail: "bg-rose-500",
    lastUpdated: "3d ago",
    assignee: { initials: "A", color: "bg-green-500" },
    progress: 10,
  },
  {
    id: "5",
    title: "Summer Campaign 2026",
    customer: "Client C",
    status: "analysis",
    thumbnail: "bg-cyan-500",
    lastUpdated: "5h ago",
    assignee: { initials: "K", color: "bg-purple-500" },
    progress: 45,
  },
];

export interface DashboardStat {
  label: string;
  value: number;
  change: string;
  icon: "folder" | "edit" | "eye" | "calendar";
  color: "blue" | "amber" | "purple" | "green";
}

export const dashboardStats: DashboardStat[] = [
  { label: "Total Projects", value: 12, change: "+3", icon: "folder", color: "blue" },
  { label: "In Editing", value: 3, change: "+1", icon: "edit", color: "amber" },
  { label: "In Review", value: 2, change: "0", icon: "eye", color: "purple" },
  { label: "This Month", value: 8, change: "+5", icon: "calendar", color: "green" },
];

export interface PipelineStage {
  id: string;
  label: string;
  status: ProjectStatus;
  count: number;
}

export const pipelineStages: PipelineStage[] = [
  { id: "stage-1", label: "Intake", status: "intake", count: 4 },
  { id: "stage-2", label: "Editing", status: "editing", count: 3 },
  { id: "stage-3", label: "Analysis", status: "analysis", count: 2 },
  { id: "stage-4", label: "Review", status: "review", count: 3 },
  { id: "stage-5", label: "Approved", status: "approved", count: 8 },
  { id: "stage-6", label: "Posted", status: "posted", count: 4 },
];

export interface NavItem {
  id: string;
  label: string;
  icon: string; // Lucide icon name
  href: string;
  badge?: number;
}

export const sidebarNav: NavItem[] = [
  { id: "home", label: "Home", icon: "Home", href: "/prototype" },
  { id: "projects", label: "Projects", icon: "FolderOpen", href: "/prototype", badge: 5 },
  { id: "upload", label: "Upload", icon: "Upload", href: "/prototype" },
  { id: "team", label: "Team", icon: "Users", href: "/prototype" },
  { id: "settings", label: "Settings", icon: "Settings", href: "/prototype" },
];
