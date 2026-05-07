"use client";

import { useState, useMemo } from "react";
import { useTranslations } from "next-intl";
import Header from "@/app/components/Header";
import KanbanBoard from "@/app/components/KanbanBoard";
import ProspectTable from "@/app/components/ProspectTable";
import ProspectDrawer from "@/app/components/ProspectDrawer";
import { mockProspects, Prospect, SalesStatus } from "./data";

type ViewMode = "kanban" | "table";

export default function VendasAtivasPage() {
  const t = useTranslations("vendasAtivas");
  const [view, setView] = useState<ViewMode>("kanban");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<SalesStatus | "all">("all");
  const [selected, setSelected] = useState<Prospect | null>(null);

  const filtered = useMemo(() => {
    let list = [...mockProspects];
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.company.toLowerCase().includes(q) ||
          p.email.toLowerCase().includes(q)
      );
    }
    if (statusFilter !== "all") {
      list = list.filter((p) => p.status === statusFilter);
    }
    return list;
  }, [search, statusFilter]);

  return (
    <div className="min-h-screen bg-surface-950">
      <Header title={t("title")} subtitle={t("subtitle")} />

      <div className="px-4 md:px-6 pb-6">
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <div className="flex-1 flex items-center gap-2 bg-surface-900 border border-surface-800/50 rounded-xl px-3 py-2">
            <svg className="w-4 h-4 text-surface-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t("searchPlaceholder")}
              className="bg-transparent text-sm text-surface-100 placeholder-surface-500 outline-none w-full"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as SalesStatus | "all")}
              className="bg-surface-900 border border-surface-800/50 rounded-xl text-sm text-surface-200 px-3 py-2 outline-none focus:border-brand-500/50"
            >
              <option value="all">{t("filter.allStatuses")}</option>
              {(
                [
                  "lead_cadastrado",
                  "primeiro_contato_enviado",
                  "aguardando_resposta",
                  "respondeu",
                  "follow_up_enviado",
                  "call_agendada",
                  "call_realizada",
                  "proposta_enviada",
                  "negociacao",
                  "venda_fechada",
                  "venda_perdida",
                  "pediu_contato_futuro",
                ] as SalesStatus[]
              ).map((s) => (
                <option key={s} value={s}>
                  {t(`status.${s}`)}
                </option>
              ))}
            </select>

            <div className="flex bg-surface-900 border border-surface-800/50 rounded-xl overflow-hidden">
              <button
                onClick={() => setView("kanban")}
                className={`px-3 py-2 text-sm transition-colors ${
                  view === "kanban"
                    ? "bg-brand-500/10 text-brand-400"
                    : "text-surface-400 hover:text-surface-200"
                }`}
              >
                {t("view.kanban")}
              </button>
              <button
                onClick={() => setView("table")}
                className={`px-3 py-2 text-sm transition-colors ${
                  view === "table"
                    ? "bg-brand-500/10 text-brand-400"
                    : "text-surface-400 hover:text-surface-200"
                }`}
              >
                {t("view.table")}
              </button>
            </div>
          </div>
        </div>

        {/* Count */}
        <div className="text-xs text-surface-500 mb-4">
          {t("showing", { count: filtered.length, total: mockProspects.length })}
        </div>

        {/* Content */}
        {view === "kanban" ? (
          <KanbanBoard prospects={filtered} onSelect={setSelected} />
        ) : (
          <ProspectTable prospects={filtered} onSelect={setSelected} />
        )}
      </div>

      {selected && <ProspectDrawer prospect={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}
