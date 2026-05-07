"use client";

import { useTranslations } from "next-intl";
import { Prospect, SalesStatus } from "@/app/[locale]/vendas-ativas/data";

interface ProspectCardProps {
  prospect: Prospect;
  onClick: () => void;
}

const statusDotClass: Record<SalesStatus, string> = {
  lead_cadastrado: "bg-purple-500",
  primeiro_contato_enviado: "bg-blue-500",
  aguardando_resposta: "bg-blue-400",
  respondeu: "bg-blue-300",
  follow_up_enviado: "bg-blue-200",
  call_agendada: "bg-amber-500",
  call_realizada: "bg-amber-400",
  proposta_enviada: "bg-amber-300",
  negociacao: "bg-amber-600",
  venda_fechada: "bg-green-600",
  venda_perdida: "bg-red-500",
  pediu_contato_futuro: "bg-surface-500",
};


export default function ProspectCard({ prospect, onClick }: ProspectCardProps) {
  const t = useTranslations("vendasAtivas");

  return (
    <button
      onClick={onClick}
      className="w-full text-left bg-surface-900 border border-surface-800/50 rounded-xl p-3 hover:border-brand-500/40 transition-colors group"
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${statusDotClass[prospect.status]}`} />
          <span className="text-xs font-medium text-surface-300">{t(`status.${prospect.status}`)}</span>
        </div>
        <span className="text-xs text-surface-500">{prospect.lastContact}</span>
      </div>

      <h4 className="text-sm font-semibold text-surface-100 mb-0.5">{prospect.name}</h4>
      <p className="text-xs text-surface-400 mb-2">{prospect.company}</p>

      <div className="flex flex-wrap gap-1 mb-2">
        {prospect.productsInterested.slice(0, 2).map((p) => (
          <span
            key={p}
            className="text-[10px] px-1.5 py-0.5 rounded bg-surface-800 text-surface-300 border border-surface-700/50"
          >
            {t(`product.${p}`)}
          </span>
        ))}
        {prospect.productsInterested.length > 2 && (
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-surface-800 text-surface-400 border border-surface-700/50">
            +{prospect.productsInterested.length - 2}
          </span>
        )}
      </div>

      <div className="flex items-center justify-between">
        <span className="text-xs text-surface-400">{prospect.assignedTo}</span>
        <span className="text-xs font-medium text-brand-400">{prospect.revenue}</span>
      </div>

      {prospect.alerts.length > 0 && (
        <div className="mt-2 pt-2 border-t border-surface-800/50">
          {prospect.alerts.map((a) => (
            <div key={a.id} className="flex items-center gap-1.5 text-[10px] text-amber-400">
              <span>⚠️</span>
              <span>{a.message}</span>
            </div>
          ))}
        </div>
      )}
    </button>
  );
}
