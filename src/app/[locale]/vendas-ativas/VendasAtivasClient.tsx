"use client";

import { useState, useMemo } from "react";
import { useTranslations } from "next-intl";
import Header from "@/app/components/Header";
import KanbanBoard from "@/app/components/KanbanBoard";
import ProspectTable from "@/app/components/ProspectTable";
import ProspectDrawer from "@/app/components/ProspectDrawer";
import { mockProspects, Prospect, SalesStatus } from "./data";

type ViewMode = "kanban" | "table";

export default function VendasAtivasClient() {
  const t = useTranslations("vendasAtivas");
  const [view, setView] = useState<ViewMode>("kanban");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<SalesStatus | "all">("all");
  const [selected, setSelected] = useState<Prospect | null>(null);

  const filtered = useMemo(() => {
    let result = [...mockProspects];
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.company.toLowerCase().includes(q) ||
          p.email.toLowerCase().includes(q) ||
          p.instagram.toLowerCase().includes(q)
      );
    }
    if (statusFilter !== "all") {
      result = result.filter((p) => p.status === statusFilter);
    }
    return result;
  }, [search, statusFilter]);

  return (
    <div className="min-h-screen bg-surface-950 text-surface-100">
      <Header
        title={t("title")}
        subtitle={t("subtitle")}
        actions={
          <div className="flex items-center gap-2">
            <div className="flex bg-surface-800 rounded-lg p-0.5">
              <button
                onClick={() => setView("kanban")}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  view === "kanban"
                    ? "bg-brand-600 text-white"
                    : "text-surface-300 hover:text-surface-100"
                }`}
              >
                {t("view.kanban")}
              </button>
              <button
                onClick={() => setView("table")}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  view === "table"
                    ? "bg-brand-600 text-white"
                    : "text-surface-300 hover:text-surface-100"
                }`}
              >
                {t("view.table")}
              </button>
            </div>
          </div>
        }
      />

      <div className="px-4 md:px-6 py-4 space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          <input
            type="text"
            placeholder={t("searchPlaceholder")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-surface-900 border border-surface-800 rounded-lg px-4 py-2 text-sm text-surface-100 placeholder-surface-500 focus:outline-none focus:ring-2 focus:ring-brand-500/50 w-full md:w-72"
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as SalesStatus | "all")}
            className="bg-surface-900 border border-surface-800 rounded-lg px-4 py-2 text-sm text-surface-100 focus:outline-none focus:ring-2 focus:ring-brand-500/50"
          >
            <option value="all">{t("filter.allStatuses")}</option>
            <option value="lead_cadastrado">{t("status.lead_cadastrado")}</option>
            <option value="primeiro_contato_enviado">{t("status.primeiro_contato_enviado")}</option>
            <option value="aguardando_resposta">{t("status.aguardando_resposta")}</option>
            <option value="respondeu">{t("status.respondeu")}</option>
            <option value="follow_up_enviado">{t("status.follow_up_enviado")}</option>
            <option value="call_agendada">{t("status.call_agendada")}</option>
            <option value="call_realizada">{t("status.call_realizada")}</option>
            <option value="proposta_enviada">{t("status.proposta_enviada")}</option>
            <option value="negociacao">{t("status.negociacao")}</option>
            <option value="venda_fechada">{t("status.venda_fechada")}</option>
            <option value="venda_perdida">{t("status.venda_perdida")}</option>
            <option value="pediu_contato_futuro">{t("status.pediu_contato_futuro")}</option>
          </select>
          <span className="text-sm text-surface-400 ml-auto">
            {t("showing", { count: filtered.length, total: mockProspects.length })}
          </span>
        </div>

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
