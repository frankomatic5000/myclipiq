export type SalesStatus =
  | "lead_cadastrado"
  | "primeiro_contato_enviado"
  | "aguardando_resposta"
  | "respondeu"
  | "follow_up_enviado"
  | "call_agendada"
  | "call_realizada"
  | "proposta_enviada"
  | "negociacao"
  | "venda_fechada"
  | "venda_perdida"
  | "pediu_contato_futuro";

export interface TimelineEvent {
  id: string;
  date: string;
  type: "message" | "call" | "email" | "status_change" | "note" | "conversion";
  description: string;
  author: string;
}

export interface CallRecord {
  id: string;
  date: string;
  duration: string;
  outcome: string;
  notes: string;
}

export interface ChecklistItem {
  id: string;
  label: string;
  done: boolean;
  category: string;
}

export interface AlertItem {
  id: string;
  type: "follow_up" | "deadline" | "payment";
  message: string;
  dueDate: string;
}

export interface Prospect {
  id: string;
  name: string;
  company: string;
  instagram: string;
  phone: string;
  email: string;
  status: SalesStatus;
  lastContact: string;
  productsInterested: string[];
  assignedTo: string;
  notes: string;
  revenue: string;
  timeline: TimelineEvent[];
  calls: CallRecord[];
  checklist: ChecklistItem[];
  alerts: AlertItem[];
  convertedToClientId: string | null;
  convertedAt: string | null;
}

export const STATUS_ORDER: SalesStatus[] = [
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
];

export const PRODUCT_OPTIONS = [
  "podcast_entrevista_imigrou",
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


export function getChecklistItems(key: "gravacao" | "social" | "evento" | "sales", nextId: () => string): ChecklistItem[] {
  const CHECKLIST_ITEMS = {
    gravacao: [
      { label: "Confirmar data e local da gravação", done: false, category: "gravacao" },
      { label: "Enviar briefing ao cliente", done: false, category: "gravacao" },
      { label: "Preparar equipamento", done: false, category: "gravacao" },
      { label: "Realizar gravação", done: false, category: "gravacao" },
      { label: "Edição de áudio/vídeo", done: false, category: "gravacao" },
      { label: "Revisão com cliente", done: false, category: "gravacao" },
      { label: "Entrega final", done: false, category: "gravacao" },
    ],
    social: [
      { label: "Coletar materiais da marca", done: false, category: "social" },
      { label: "Criar calendário editorial", done: false, category: "social" },
      { label: "Aprovar conteúdo com cliente", done: false, category: "social" },
      { label: "Agendar posts", done: false, category: "social" },
      { label: "Responder comentários/DMs", done: false, category: "social" },
      { label: "Relatório semanal", done: false, category: "social" },
      { label: "Ajustes de estratégia", done: false, category: "social" },
    ],
    evento: [
      { label: "Confirmar data/horário/local", done: false, category: "evento" },
      { label: "Visita técnica prévia", done: false, category: "evento" },
      { label: "Equipamento carregado/testado", done: false, category: "evento" },
      { label: "Cobertura foto + vídeo", done: false, category: "evento" },
      { label: "Edição rápida (24h)", done: false, category: "evento" },
      { label: "Entrega de conteúdo", done: false, category: "evento" },
      { label: "Post no feed/stories", done: false, category: "evento" },
    ],
    sales: [
      { label: "Enviar proposta", done: false, category: "sales" },
      { label: "Follow-up com cliente", done: false, category: "sales" },
      { label: "Agendar call", done: false, category: "sales" },
      { label: "Preparar contrato", done: false, category: "sales" },
    ],
  };
  return CHECKLIST_ITEMS[key].map(item => ({ ...item, id: nextId() }));
}

export function generateChecklist(products: string[]): ChecklistItem[] {
  const hasGravacao = products.some(p =>
    ["podcast_entrevista_imigrou", "gravacao_curso", "gravacao_mentoria"].includes(p)
  );
  const hasSocial = products.some(p =>
    ["gestao_redes_sociais", "glowup_instagram", "conteudo_pronto_postar"].includes(p)
  );
  const hasEvento = products.some(p =>
    ["cobertura_evento", "publicacao_pessoas_globais", "participacao_pernas_cruzadas"].includes(p)
  );

  let idCounter = 0;
  const nextId = () => `ch${++idCounter}`;

  const items: ChecklistItem[] = [];

  if (hasGravacao) {
    items.push(...getChecklistItems("gravacao", nextId));
  }
  if (hasSocial) {
    items.push(...getChecklistItems("social", nextId));
  }
  if (hasEvento) {
    items.push(...getChecklistItems("evento", nextId));
  }
  // Always include sales items
  items.push(...getChecklistItems("sales", nextId));

  return items;
}

export const columnGroups = [
  {
    key: "cadastro",
    statuses: ["lead_cadastrado"],
    labelKey: "colCadastro",
  },
  {
    key: "contato",
    statuses: ["primeiro_contato_enviado", "aguardando_resposta", "respondeu", "follow_up_enviado"],
    labelKey: "colContato",
  },
  {
    key: "call_proposta",
    statuses: ["call_agendada", "call_realizada", "proposta_enviada"],
    labelKey: "colCallProposta",
  },
  {
    key: "negociacao",
    statuses: ["negociacao"],
    labelKey: "colNegociacao",
  },
  {
    key: "fechamento",
    statuses: ["venda_fechada", "venda_perdida", "pediu_contato_futuro"],
    labelKey: "colFechamento",
  },
];
