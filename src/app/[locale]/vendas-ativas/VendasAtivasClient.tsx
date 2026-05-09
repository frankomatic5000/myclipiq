"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import Header from "@/app/components/Header";
import KanbanBoard from "@/app/components/KanbanBoard";
import ProspectTable from "@/app/components/ProspectTable";
import ProspectDrawer from "@/app/components/ProspectDrawer";
import { getProspects } from "@/lib/supabase/vendas-ativas";
import { Prospect, SalesStatus } from "./data";

type ViewMode = "kanban" | "table";

export default function VendasAtivasClient() {
  const t = useTranslations("vendasAtivas");
  const [view, setView] = useState<ViewMode>("kanban");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<SalesStatus | "all">("all");
  const [selected, setSelected] = useState<Prospect | null>(null);
  const [prospects, setProspects] = useState<Prospect[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadProspects = useCallback(async () => {
    await Promise.resolve();
    setLoading(true);
    setError(null);

    try {
      const data = await getProspects();
      setProspects(data);
      setSelected((current) => {
        if (!current) return null;
        return data.find((prospect) => prospect.id === current.id) ?? null;
      });
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Nao foi possivel carregar os prospects."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadProspects();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [loadProspects]);

  const filtered = useMemo(() => {
    let result = [...prospects];
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
  }, [prospects, search, statusFilter]);

  const content = (() => {
    if (loading) {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4" aria-label="Carregando prospects">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="bg-surface-900/50 border border-surface-800/50 rounded-xl overflow-hidden border-l-4 border-l-surface-700"
            >
              <div className="px-4 py-3 border-b border-surface-800/50 flex items-center justify-between">
                <div className="h-4 w-28 rounded bg-surface-800 animate-pulse" />
                <div className="h-5 w-8 rounded-full bg-surface-800 animate-pulse" />
              </div>
              <div className="p-3 space-y-3">
                {Array.from({ length: 3 }).map((__, itemIndex) => (
                  <div
                    key={itemIndex}
                    className="bg-surface-900 border border-surface-800/50 rounded-xl p-3 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="h-3 w-24 rounded bg-surface-800 animate-pulse" />
                      <div className="h-3 w-16 rounded bg-surface-800 animate-pulse" />
                    </div>
                    <div className="h-4 w-2/3 rounded bg-surface-800 animate-pulse" />
                    <div className="h-3 w-1/2 rounded bg-surface-800 animate-pulse" />
                    <div className="flex gap-2">
                      <div className="h-5 w-20 rounded bg-surface-800 animate-pulse" />
                      <div className="h-5 w-24 rounded bg-surface-800 animate-pulse" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      );
    }

    if (error) {
      return (
        <div
          className="bg-surface-900 border border-red-500/20 rounded-xl px-4 py-6 text-center"
          role="alert"
          aria-live="polite"
        >
          <p className="text-sm font-medium text-surface-100">Nao foi possivel carregar os prospects.</p>
          <p className="mt-1 text-sm text-surface-400">{error}</p>
          <button
            type="button"
            onClick={loadProspects}
            className="mt-4 rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/50"
          >
            Tentar novamente
          </button>
        </div>
      );
    }

    if (prospects.length === 0) {
      return (
        <div className="bg-surface-900 border border-surface-800/50 rounded-xl px-4 py-8 text-center">
          <p className="text-sm font-medium text-surface-100">Nenhum prospect encontrado.</p>
          <p className="mt-1 text-sm text-surface-400">Cadastre prospects no Supabase para iniciar o funil.</p>
        </div>
      );
    }

    if (filtered.length === 0) {
      return (
        <div className="bg-surface-900 border border-surface-800/50 rounded-xl px-4 py-8 text-center">
          <p className="text-sm font-medium text-surface-100">Nenhum prospect corresponde aos filtros.</p>
          <p className="mt-1 text-sm text-surface-400">Ajuste a busca ou o status selecionado.</p>
        </div>
      );
    }

    return view === "kanban" ? (
      <KanbanBoard prospects={filtered} onSelect={setSelected} />
    ) : (
      <ProspectTable prospects={filtered} onSelect={setSelected} />
    );
  })();

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
            {t("showing", { count: filtered.length, total: prospects.length })}
          </span>
        </div>

        {content}
      </div>

      {selected && <ProspectDrawer prospect={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}
