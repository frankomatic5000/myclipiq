"use client";

import { useTranslations } from "next-intl";
import { Prospect, columnGroups } from "@/app/[locale]/vendas-ativas/data";
import ProspectCard from "./ProspectCard";

interface KanbanBoardProps {
  prospects: Prospect[];
  onSelect: (p: Prospect) => void;
}

const columnColor: Record<string, string> = {
  cadastro: "border-l-purple-500",
  contato: "border-l-blue-500",
  call_proposta: "border-l-amber-500",
  negociacao: "border-l-orange-500",
  fechamento: "border-l-green-500",
};

export default function KanbanBoard({ prospects, onSelect }: KanbanBoardProps) {
  const t = useTranslations("vendasAtivas");

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
      {columnGroups.map((col) => {
        const items = prospects.filter((p) => col.statuses.includes(p.status));
        return (
          <div
            key={col.key}
            className={`bg-surface-900/50 border border-surface-800/50 rounded-xl overflow-hidden border-l-4 ${columnColor[col.key]}`}
          >
            <div className="px-4 py-3 border-b border-surface-800/50 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-surface-200">{t(`column.${col.key}`)}</h3>
              <span className="text-xs text-surface-400 bg-surface-800 px-2 py-0.5 rounded-full">{items.length}</span>
            </div>
            <div className="p-3 space-y-3 max-h-[calc(100vh-280px)] overflow-y-auto">
              {items.length === 0 ? (
                <p className="text-xs text-surface-500 text-center py-6">{t("emptyColumn")}</p>
              ) : (
                items.map((p) => <ProspectCard key={p.id} prospect={p} onClick={() => onSelect(p)} />)
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
