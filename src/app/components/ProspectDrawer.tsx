"use client";

import { FormEvent, useState } from "react";
import { useTranslations } from "next-intl";
import { Prospect } from "@/app/[locale]/vendas-ativas/data";
import Timeline from "./Timeline";
import Checklist from "./Checklist";
import { convertProspectToClient } from "@/lib/supabase/vendas-ativas";

interface ProspectDrawerProps {
  prospect: Prospect | null;
  onClose: () => void;
  onConverted?: () => Promise<void> | void;
}

const SERVICE_OPTIONS = [
  "podcast_entrevista",
  "gravacao_curso",
  "gravacao_mentoria",
  "conteudo_pronto_postar",
  "gestao_redes_sociais",
  "glowup_instagram",
  "cobertura_evento",
  "publicacao_pessoas_globais",
  "participacao_pernas_cruzadas",
  "pacote_personalizado",
];

const serviceLabels: Record<string, string> = {
  podcast_entrevista: "Podcast / entrevista",
  gravacao_curso: "Gravação de curso",
  gravacao_mentoria: "Gravação de mentoria",
  conteudo_pronto_postar: "Conteúdo pronto para postar",
  gestao_redes_sociais: "Gestão de redes sociais",
  glowup_instagram: "Glow up Instagram",
  cobertura_evento: "Cobertura de evento",
  publicacao_pessoas_globais: "Publicação Pessoas Globais",
  participacao_pernas_cruzadas: "Participação Pernas Cruzadas",
  pacote_personalizado: "Pacote personalizado",
};

const statusBadgeClass: Record<string, string> = {
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

export default function ProspectDrawer({ prospect, onClose, onConverted }: ProspectDrawerProps) {
  const t = useTranslations("vendasAtivas");
  const [showConvertModal, setShowConvertModal] = useState(false);
  const [serviceType, setServiceType] = useState("");
  const [projectName, setProjectName] = useState("");
  const [isConverting, setIsConverting] = useState(false);
  const [conversionError, setConversionError] = useState<string | null>(null);
  const [conversionSuccess, setConversionSuccess] = useState<string | null>(null);

  if (!prospect) return null;

  const canShowConvertAction = prospect.status === "venda_fechada";
  const isAlreadyConverted = Boolean(prospect.convertedToClientId);

  async function handleConvert(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!prospect || isConverting || isAlreadyConverted) return;

    setIsConverting(true);
    setConversionError(null);
    setConversionSuccess(null);

    try {
      await convertProspectToClient({
        prospectId: prospect.id,
        project:
          serviceType && projectName.trim()
            ? { serviceType, name: projectName.trim() }
            : null,
      });
      setConversionSuccess("Prospect convertido em cliente.");
      await onConverted?.();
      window.setTimeout(() => {
        onClose();
      }, 600);
    } catch (err) {
      setConversionError(
        err instanceof Error
          ? err.message
          : "Não foi possível converter o prospect."
      );
    } finally {
      setIsConverting(false);
    }
  }

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
          {canShowConvertAction && (
            <section className="rounded-xl border border-green-500/20 bg-green-500/5 p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-green-300">Conversão para cliente</h3>
                  <p className="mt-1 text-xs text-surface-400">
                    {isAlreadyConverted
                      ? "Este prospect já foi convertido."
                      : "Crie o cliente e, opcionalmente, o primeiro projeto."}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setConversionError(null);
                    setConversionSuccess(null);
                    setProjectName(`${prospect.company || prospect.name} — Projeto inicial`);
                    setShowConvertModal(true);
                  }}
                  disabled={isAlreadyConverted || isConverting}
                  className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-green-500 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isAlreadyConverted ? "Cliente convertido" : "Converter em Cliente"}
                </button>
              </div>
              {conversionSuccess && (
                <p className="mt-3 text-sm text-green-300" role="status">{conversionSuccess}</p>
              )}
              {conversionError && (
                <p className="mt-3 text-sm text-red-300" role="alert">{conversionError}</p>
              )}
            </section>
          )}

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

      {showConvertModal && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/60 px-4">
          <form
            onSubmit={handleConvert}
            className="w-full max-w-md rounded-2xl border border-surface-700 bg-surface-950 p-5 shadow-2xl"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-base font-semibold text-surface-100">Converter em Cliente</h3>
                <p className="mt-1 text-sm text-surface-400">
                  Projeto inicial é opcional. Selecione um serviço e informe um título para criá-lo agora.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowConvertModal(false)}
                disabled={isConverting}
                className="rounded-lg p-1 text-surface-400 hover:bg-surface-800 hover:text-surface-100 disabled:opacity-50"
              >
                ✕
              </button>
            </div>

            <div className="mt-5 space-y-4">
              <label className="block text-sm">
                <span className="text-surface-300">Tipo de serviço</span>
                <select
                  value={serviceType}
                  onChange={(event) => setServiceType(event.target.value)}
                  disabled={isConverting}
                  className="mt-1 w-full rounded-lg border border-surface-700 bg-surface-900 px-3 py-2 text-sm text-surface-100 focus:outline-none focus:ring-2 focus:ring-brand-500/50"
                >
                  <option value="">Não criar projeto agora</option>
                  {SERVICE_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {serviceLabels[option]}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block text-sm">
                <span className="text-surface-300">Título do projeto</span>
                <input
                  type="text"
                  value={projectName}
                  onChange={(event) => setProjectName(event.target.value)}
                  disabled={isConverting || !serviceType}
                  className="mt-1 w-full rounded-lg border border-surface-700 bg-surface-900 px-3 py-2 text-sm text-surface-100 placeholder-surface-500 focus:outline-none focus:ring-2 focus:ring-brand-500/50 disabled:opacity-50"
                  placeholder="Ex: Conteúdo inicial"
                />
              </label>
            </div>

            {conversionError && (
              <p className="mt-4 rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm text-red-300" role="alert">
                {conversionError}
              </p>
            )}

            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowConvertModal(false)}
                disabled={isConverting}
                className="rounded-lg border border-surface-700 px-4 py-2 text-sm font-medium text-surface-300 hover:bg-surface-800 disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isConverting || Boolean(serviceType && !projectName.trim())}
                className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-500 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isConverting && (
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" aria-hidden="true" />
                )}
                {isConverting ? "Convertendo..." : "Confirmar conversão"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
