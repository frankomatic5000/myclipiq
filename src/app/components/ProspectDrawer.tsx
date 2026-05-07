"use client";

import { useTranslations } from "next-intl";
import { Prospect } from "@/app/[locale]/vendas-ativas/data";
import Timeline from "./Timeline";
import Checklist from "./Checklist";

interface ProspectDrawerProps {
  prospect: Prospect | null;
  onClose: () => void;
}

const statusBadgeClass: Record<string, string> = {
  prospecting: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  first_contact: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  follow_up: "bg-blue-400/10 text-blue-300 border-blue-400/20",
  proposal_sent: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  negotiation: "bg-amber-400/10 text-amber-300 border-amber-400/20",
  pending_contract: "bg-amber-600/10 text-amber-500 border-amber-600/20",
  contract_signed: "bg-green-500/10 text-green-400 border-green-500/20",
  onboarding: "bg-green-400/10 text-green-300 border-green-400/20",
  in_production: "bg-green-300/10 text-green-200 border-green-300/20",
  pending_payment: "bg-amber-300/10 text-amber-200 border-amber-300/20",
  closed_won: "bg-green-600/10 text-green-400 border-green-600/20",
  closed_lost: "bg-red-500/10 text-red-400 border-red-500/20",
};

export default function ProspectDrawer({ prospect, onClose }: ProspectDrawerProps) {
  const t = useTranslations("vendasAtivas");
  if (!prospect) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative w-full max-w-xl bg-surface-950 border-l border-surface-800/50 h-full overflow-y-auto">
        <div className="sticky top-0 bg-surface-950/95 backdrop-blur border-b border-surface-800/50 px-6 py-4 flex items-center justify-between z-10">
          <div>
            <h2 className="text-lg font-semibold text-surface-100">{prospect.name}</h2>
            <div className="flex items-center gap-2 mt-1">
              <span className={`text-xs px-2 py-0.5 rounded-full border ${statusBadgeClass[prospect.status] || "bg-surface-800 text-surface-300"}`}>
                {t(`status.${prospect.status}`)}
              </span>
              <span className="text-xs text-surface-400">{prospect.company}</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-surface-800/50 text-surface-400 hover:text-surface-200 transition-colors"
          >
            ✕
          </button>
        </div>

        <div className="px-6 py-6 space-y-8">
          {/* Contact Info */}
          <section>
            <h3 className="text-sm font-semibold text-surface-200 mb-3">{t("drawer.contactInfo")}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              <div className="bg-surface-900 rounded-lg p-3 border border-surface-800/50">
                <div className="text-xs text-surface-500 mb-0.5">{t("drawer.email")}</div>
                <div className="text-surface-200">{prospect.email}</div>
              </div>
              <div className="bg-surface-900 rounded-lg p-3 border border-surface-800/50">
                <div className="text-xs text-surface-500 mb-0.5">{t("drawer.phone")}</div>
                <div className="text-surface-200">{prospect.phone}</div>
              </div>
              <div className="bg-surface-900 rounded-lg p-3 border border-surface-800/50">
                <div className="text-xs text-surface-500 mb-0.5">{t("drawer.instagram")}</div>
                <div className="text-surface-200">{prospect.instagram}</div>
              </div>
              <div className="bg-surface-900 rounded-lg p-3 border border-surface-800/50">
                <div className="text-xs text-surface-500 mb-0.5">{t("drawer.assignedTo")}</div>
                <div className="text-surface-200">{prospect.assignedTo}</div>
              </div>
            </div>
          </section>

          {/* Products of Interest */}
          <section>
            <h3 className="text-sm font-semibold text-surface-200 mb-3">{t("drawer.products")}</h3>
            <div className="flex flex-wrap gap-2">
              {prospect.productsInterested.map((prod) => (
                <span key={prod} className="text-xs px-2.5 py-1 rounded-full bg-brand-500/10 text-brand-300 border border-brand-500/20">
                  {t(`product.${prod}`)}
                </span>
              ))}
            </div>
          </section>

          {/* Revenue */}
          {prospect.revenue && prospect.revenue !== "—" && (
            <section>
              <h3 className="text-sm font-semibold text-surface-200 mb-3">{t("drawer.revenue")}</h3>
              <div className="bg-surface-900 rounded-lg p-4 border border-surface-800/50">
                <div className="text-2xl font-bold text-brand-400">{prospect.revenue}</div>
              </div>
            </section>
          )}

          {/* Notes */}
          <section>
            <h3 className="text-sm font-semibold text-surface-200 mb-3">{t("drawer.notes")}</h3>
            <div className="bg-surface-900 rounded-lg p-4 border border-surface-800/50 text-sm text-surface-300">
              {prospect.notes}
            </div>
          </section>

          {/* Alerts */}
          {prospect.alerts.length > 0 && (
            <section>
              <h3 className="text-sm font-semibold text-surface-200 mb-3">{t("drawer.alerts")}</h3>
              <div className="space-y-2">
                {prospect.alerts.map((a) => (
                  <div key={a.id} className="flex items-start gap-2 bg-amber-500/5 border border-amber-500/10 rounded-lg p-3">
                    <span className="text-amber-400 text-sm">⚠️</span>
                    <div>
                      <div className="text-sm text-surface-200">{a.message}</div>
                      <div className="text-xs text-surface-500 mt-0.5">{a.dueDate}</div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Commercial Calls */}
          {prospect.calls.length > 0 && (
            <section>
              <h3 className="text-sm font-semibold text-surface-200 mb-3">{t("drawer.calls")}</h3>
              <div className="space-y-3">
                {prospect.calls.map((call) => (
                  <div key={call.id} className="bg-surface-900 rounded-lg p-3 border border-surface-800/50">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-surface-400">{call.date}</span>
                      <span className="text-xs text-surface-500">{call.duration}</span>
                    </div>
                    <div className="text-sm font-medium text-surface-200 mb-1">{call.outcome}</div>
                    <p className="text-xs text-surface-400">{call.notes}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Timeline */}
          <section>
            <h3 className="text-sm font-semibold text-surface-200 mb-3">{t("drawer.timeline")}</h3>
            <Timeline events={prospect.timeline} />
          </section>

          {/* Checklist */}
          <section>
            <h3 className="text-sm font-semibold text-surface-200 mb-3">{t("drawer.checklist")}</h3>
            <Checklist items={prospect.checklist} />
          </section>
        </div>
      </div>
    </div>
  );
}
