"use client";

import { useTranslations } from "next-intl";
import { Prospect, SalesStatus } from "@/app/[locale]/vendas-ativas/data";

interface ProspectTableProps {
  prospects: Prospect[];
  onSelect: (p: Prospect) => void;
}

const statusBadgeClass: Record<SalesStatus, string> = {
  lead_cadastrado: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  primeiro_contato_enviado: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  aguardando_resposta: "bg-blue-400/10 text-blue-300 border-blue-400/20",
  respondeu: "bg-blue-300/10 text-blue-200 border-blue-300/20",
  follow_up_enviado: "bg-blue-200/10 text-blue-100 border-blue-200/20",
  call_agendada: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  call_realizada: "bg-amber-400/10 text-amber-300 border-amber-400/20",
  proposta_enviada: "bg-amber-300/10 text-amber-200 border-amber-300/20",
  negociacao: "bg-amber-600/10 text-amber-500 border-amber-600/20",
  venda_fechada: "bg-green-600/10 text-green-400 border-green-600/20",
  venda_perdida: "bg-red-500/10 text-red-400 border-red-500/20",
  pediu_contato_futuro: "bg-surface-500/10 text-surface-300 border-surface-500/20",
};

export default function ProspectTable({ prospects, onSelect }: ProspectTableProps) {
  const t = useTranslations("vendasAtivas");

  return (
    <div className="bg-surface-900 border border-surface-800/50 rounded-xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-surface-800/50">
              {["name", "company", "status", "lastContact", "products", "assignedTo", "revenue"].map((key) => (
                <th key={key} className="px-4 py-3 text-xs font-medium text-surface-400 uppercase tracking-wider">
                  {t(`table.${key}`)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-800/30">
            {prospects.map((p) => (
              <tr
                key={p.id}
                onClick={() => onSelect(p)}
                className="hover:bg-surface-800/30 cursor-pointer transition-colors"
              >
                <td className="px-4 py-3">
                  <div className="text-sm font-medium text-surface-100">{p.name}</div>
                  <div className="text-xs text-surface-500">{p.email}</div>
                </td>
                <td className="px-4 py-3 text-sm text-surface-300">{p.company}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-1 rounded-full border ${statusBadgeClass[p.status]}`}>
                    {t(`status.${p.status}`)}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-surface-400">{p.lastContact}</td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1">
                    {p.productsInterested.slice(0, 2).map((prod) => (
                      <span key={prod} className="text-[10px] px-1.5 py-0.5 rounded bg-surface-800 text-surface-300 border border-surface-700/50">
                        {t(`product.${prod}`)}
                      </span>
                    ))}
                    {p.productsInterested.length > 2 && (
                      <span className="text-[10px] text-surface-500">+{p.productsInterested.length - 2}</span>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-surface-300">{p.assignedTo}</td>
                <td className="px-4 py-3 text-sm font-medium text-brand-400">{p.revenue}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
