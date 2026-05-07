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
  type: "message" | "call" | "email" | "status_change" | "note";
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

export const mockProspects: Prospect[] = [
  {
    id: "p1",
    name: "Mariana Souza",
    company: "Bella Moda Boutique",
    instagram: "@bellamoda_oficial",
    phone: "(11) 98765-4321",
    email: "mariana@bellamoda.com.br",
    status: "negociacao",
    lastContact: "2026-05-06",
    productsInterested: ["podcast_entrevista_imigrou", "gravacao_curso", "conteudo_pronto_postar"],
    assignedTo: "Karine",
    notes: "Cliente interessada em rebranding completo. Orçamento de R$ 5.000/mês.",
    revenue: "R$ 5.000/mês",
    timeline: [
      { id: "t1", date: "2026-04-15", type: "message", description: "Primeiro contato via Instagram DM", author: "Karine" },
      { id: "t2", date: "2026-04-20", type: "call", description: "Ligação de 25 min — apresentação de serviços", author: "Karine" },
      { id: "t3", date: "2026-04-28", type: "status_change", description: "Status alterado para Proposta Enviada", author: "Karine" },
      { id: "t4", date: "2026-05-06", type: "email", description: "Cliente pediu ajustes na proposta", author: "Mariana" },
    ],
    calls: [
      { id: "c1", date: "2026-04-20", duration: "25 min", outcome: "Interessada — quer proposta", notes: "Muito receptiva, pediu preços para redes sociais + identidade visual" },
    ],
    checklist: generateChecklist(["podcast_entrevista_imigrou", "gravacao_curso", "conteudo_pronto_postar"]),
    alerts: [
      { id: "a1", type: "follow_up", message: "Enviar proposta revisada até sexta", dueDate: "2026-05-09" },
    ],
  },
  {
    id: "p2",
    name: "Roberto Lima",
    company: "Lima Fitness Studio",
    instagram: "@limafitness_studio",
    phone: "(21) 99876-5432",
    email: "roberto@limafitness.com.br",
    status: "primeiro_contato_enviado",
    lastContact: "2026-05-05",
    productsInterested: ["gravacao_mentoria", "podcast_entrevista_imigrou"],
    assignedTo: "Rod",
    notes: "Academia pequena quer crescer no Instagram. Budget limitado (~R$ 2.000).",
    revenue: "R$ 2.000/mês",
    timeline: [
      { id: "t1", date: "2026-05-05", type: "call", description: "Ligação de 12 min — apresentação rápida", author: "Rod" },
    ],
    calls: [
      { id: "c1", date: "2026-05-05", duration: "12 min", outcome: "Interessado — quer mais info", notes: "Disse que vai conversar com a sócia e retorna essa semana" },
    ],
    checklist: generateChecklist(["gravacao_mentoria", "podcast_entrevista_imigrou"]),
    alerts: [
      { id: "a1", type: "follow_up", message: "Ligar para Roberto na terça-feira", dueDate: "2026-05-12" },
    ],
  },
  {
    id: "p3",
    name: "Fernanda Costa",
    company: "Doce Arte Confeitaria",
    instagram: "@docearte_confeitaria",
    phone: "(31) 91234-5678",
    email: "fernanda@docearte.com.br",
    status: "venda_fechada",
    lastContact: "2026-05-01",
    productsInterested: ["podcast_entrevista_imigrou", "gravacao_curso", "publicacao_pessoas_globais"],
    assignedTo: "Karine",
    notes: "Venda fechada! Pacote de R$ 3.500/mês. Contrato assinado em 1º de maio.",
    revenue: "R$ 3.500/mês",
    timeline: [
      { id: "t1", date: "2026-03-10", type: "message", description: "Contato via WhatsApp", author: "Karine" },
      { id: "t2", date: "2026-03-15", type: "call", description: "Ligação de 30 min — apresentação", author: "Karine" },
      { id: "t3", date: "2026-03-22", type: "status_change", description: "Proposta enviada", author: "Karine" },
      { id: "t4", date: "2026-04-05", type: "call", description: "Ligação de 15 min — negociação de preço", author: "Karine" },
      { id: "t5", date: "2026-04-20", type: "status_change", description: "Contrato assinado", author: "Karine" },
      { id: "t6", date: "2026-05-01", type: "status_change", description: "Venda fechada — início onboarding", author: "Karine" },
    ],
    calls: [
      { id: "c1", date: "2026-03-15", duration: "30 min", outcome: "Muito interessada", notes: "Quer fotos dos doces + posts diários" },
      { id: "c2", date: "2026-04-05", duration: "15 min", outcome: "Negociação", notes: "Pediu desconto de 10% — aceitamos com contrato de 6 meses" },
    ],
    checklist: generateChecklist(["podcast_entrevista_imigrou", "gravacao_curso", "publicacao_pessoas_globais"]),
    alerts: [
      { id: "a1", type: "deadline", message: "Sessão de fotos agendada para 15/05", dueDate: "2026-05-15" },
    ],
  },
  {
    id: "p4",
    name: "Carlos Mendes",
    company: "Mendes Advocacia",
    instagram: "@mendesadvogados",
    phone: "(11) 95555-9999",
    email: "carlos@mendesadv.com.br",
    status: "proposta_enviada",
    lastContact: "2026-05-04",
    productsInterested: ["glowup_instagram", "cobertura_evento", "gravacao_curso"],
    assignedTo: "Rod",
    notes: "Escritório de advocacia quer landing page + campanha Google Ads. Orçamento R$ 6.000 inicial.",
    revenue: "R$ 6.000",
    timeline: [
      { id: "t1", date: "2026-04-10", type: "call", description: "Ligação de 20 min", author: "Rod" },
      { id: "t2", date: "2026-04-25", type: "status_change", description: "Reunião presencial realizada", author: "Rod" },
      { id: "t3", date: "2026-05-04", type: "status_change", description: "Proposta enviada por email", author: "Rod" },
    ],
    calls: [
      { id: "c1", date: "2026-04-10", duration: "20 min", outcome: "Quer reunião presencial", notes: "Disponibilidade só nas quintas de manhã" },
    ],
    checklist: generateChecklist(["glowup_instagram", "cobertura_evento", "gravacao_curso"]),
    alerts: [
      { id: "a1", type: "follow_up", message: "Ligar para Carlos sobre proposta", dueDate: "2026-05-11" },
    ],
  },
  {
    id: "p5",
    name: "Juliana Pereira",
    company: "Juju Kids Moda Infantil",
    instagram: "@jujukids_moda",
    phone: "(41) 93333-7777",
    email: "juliana@jujukids.com.br",
    status: "venda_perdida",
    lastContact: "2026-04-18",
    productsInterested: ["podcast_entrevista_imigrou", "participacao_pernas_cruzadas"],
    assignedTo: "Karine",
    notes: "Cliente decidiu fazer in-house. Manter contato para reaproximação em 3 meses.",
    revenue: "—",
    timeline: [
      { id: "t1", date: "2026-03-05", type: "message", description: "Contato via Instagram", author: "Karine" },
      { id: "t2", date: "2026-03-12", type: "call", description: "Ligação de 18 min", author: "Karine" },
      { id: "t3", date: "2026-03-20", type: "status_change", description: "Proposta enviada", author: "Karine" },
      { id: "t4", date: "2026-04-18", type: "call", description: "Cliente disse que vai fazer in-house", author: "Karine" },
      { id: "t5", date: "2026-04-18", type: "status_change", description: "Marcado como Perdido", author: "Karine" },
    ],
    calls: [
      { id: "c1", date: "2026-03-12", duration: "18 min", outcome: "Interessada", notes: "Quer posts diários com looks infantis" },
      { id: "c2", date: "2026-04-18", duration: "8 min", outcome: "Perdido", notes: "Decidiu contratar alguém interno" },
    ],
    checklist: generateChecklist(["podcast_entrevista_imigrou", "participacao_pernas_cruzadas"]),
    alerts: [
      { id: "a1", type: "follow_up", message: "Reaproximar Juliana em agosto", dueDate: "2026-08-18" },
    ],
  },
  {
    id: "p6",
    name: "André Oliveira",
    company: "Oliveira Tech Solutions",
    instagram: "@oliveiratech",
    phone: "(11) 97777-2222",
    email: "andre@oliveiratech.com.br",
    status: "negociacao",
    lastContact: "2026-05-03",
    productsInterested: ["gravacao_curso", "gravacao_mentoria", "pacote_personalizado"],
    assignedTo: "Rod",
    notes: "Startup B2B SaaS. Pacote completo de branding + conteúdo. Em produção desde 20/04.",
    revenue: "R$ 8.000/mês",
    timeline: [
      { id: "t1", date: "2026-02-15", type: "call", description: "Primeira ligação — 40 min", author: "Rod" },
      { id: "t2", date: "2026-02-28", type: "status_change", description: "Contrato assinado", author: "Rod" },
      { id: "t3", date: "2026-03-10", type: "status_change", description: "Onboarding completo", author: "Rod" },
      { id: "t4", date: "2026-04-20", type: "status_change", description: "Início da produção de conteúdo", author: "Rod" },
      { id: "t5", date: "2026-05-03", type: "note", description: "Reunião semanal de acompanhamento", author: "Rod" },
    ],
    calls: [
      { id: "c1", date: "2026-02-15", duration: "40 min", outcome: "Fechado", notes: "Quer posicionamento de marca + conteúdo técnico" },
      { id: "c2", date: "2026-05-03", duration: "20 min", outcome: "Acompanhamento", notes: "Reunião semanal — ajustes no tom de voz" },
    ],
    checklist: generateChecklist(["gravacao_curso", "gravacao_mentoria", "pacote_personalizado"]),
    alerts: [
      { id: "a1", type: "deadline", message: "Entrega do relatório mensal", dueDate: "2026-05-10" },
    ],
  },
  {
    id: "p7",
    name: "Patrícia Almeida",
    company: "Almeida Dermatologia",
    instagram: "@almeidaderma",
    phone: "(19) 98888-3333",
    email: "patricia@almeidaderma.com.br",
    status: "call_agendada",
    lastContact: "2026-05-02",
    productsInterested: ["podcast_entrevista_imigrou", "glowup_instagram", "cobertura_evento"],
    assignedTo: "Karine",
    notes: "Clínica de dermatologia. Aceitou proposta verbalmente. Aguardando assinatura do contrato.",
    revenue: "R$ 4.500/mês",
    timeline: [
      { id: "t1", date: "2026-04-01", type: "call", description: "Ligação de 22 min", author: "Karine" },
      { id: "t2", date: "2026-04-10", type: "status_change", description: "Proposta enviada", author: "Karine" },
      { id: "t3", date: "2026-04-25", type: "call", description: "Cliente aceitou proposta verbalmente", author: "Karine" },
      { id: "t4", date: "2026-05-02", type: "status_change", description: "Contrato enviado para assinatura", author: "Karine" },
    ],
    calls: [
      { id: "c1", date: "2026-04-01", duration: "22 min", outcome: "Interessada", notes: "Quer crescer no Instagram + landing page para agendamentos" },
      { id: "c2", date: "2026-04-25", duration: "10 min", outcome: "Aceitou proposta", notes: "Vai revisar contrato e retornar em 1 semana" },
    ],
    checklist: generateChecklist(["podcast_entrevista_imigrou", "glowup_instagram", "cobertura_evento"]),
    alerts: [
      { id: "a1", type: "follow_up", message: "Lembrar Patricia para assinar contrato", dueDate: "2026-05-09" },
    ],
  },
  {
    id: "p8",
    name: "Thiago Ribeiro",
    company: "Ribeiro Imóveis",
    instagram: "@ribeiroimoveis",
    phone: "(11) 96666-4444",
    email: "thiago@ribeiroimoveis.com.br",
    status: "lead_cadastrado",
    lastContact: "2026-04-30",
    productsInterested: ["podcast_entrevista_imigrou", "cobertura_evento", "gravacao_mentoria"],
    assignedTo: "Rod",
    notes: "Corretor independente quer expandir presença digital. Orçamento estimado R$ 3.000/mês.",
    revenue: "R$ 3.000/mês",
    timeline: [
      { id: "t1", date: "2026-04-30", type: "message", description: "Contato via Instagram DM", author: "Rod" },
    ],
    calls: [],
    checklist: generateChecklist(["podcast_entrevista_imigrou", "cobertura_evento", "gravacao_mentoria"]),
    alerts: [
      { id: "a1", type: "follow_up", message: "Ligar para Thiago esta semana", dueDate: "2026-05-08" },
    ],
  },
  {
    id: "p9",
    name: "Camila Duarte",
    company: "Duarte Arquitetura",
    instagram: "@duartearquitetura",
    phone: "(21) 95555-8888",
    email: "camila@duartearq.com.br",
    status: "venda_fechada",
    lastContact: "2026-05-01",
    productsInterested: ["conteudo_pronto_postar", "gravacao_curso", "publicacao_pessoas_globais"],
    assignedTo: "Karine",
    notes: "Projeto de identidade visual + fotos de obras finalizado. Aguardando pagamento final de R$ 4.000.",
    revenue: "R$ 4.000",
    timeline: [
      { id: "t1", date: "2026-02-20", type: "status_change", description: "Contrato assinado", author: "Karine" },
      { id: "t2", date: "2026-03-15", type: "status_change", description: "Início do projeto", author: "Karine" },
      { id: "t3", date: "2026-04-20", type: "status_change", description: "Entrega do projeto", author: "Karine" },
      { id: "t4", date: "2026-05-01", type: "note", description: "Nota fiscal enviada — aguardando pagamento", author: "Karine" },
    ],
    calls: [
      { id: "c1", date: "2026-04-20", duration: "15 min", outcome: "Entrega aceita", notes: "Cliente gostou do resultado. Pagamento em 30 dias." },
    ],
    checklist: generateChecklist(["conteudo_pronto_postar", "gravacao_curso", "publicacao_pessoas_globais"]),
    alerts: [
      { id: "a1", type: "payment", message: "Pagamento final vence em 30 dias", dueDate: "2026-05-30" },
    ],
  },
  {
    id: "p10",
    name: "Lucas Ferreira",
    company: "Ferreira E-commerce",
    instagram: "@ferreira.ecommerce",
    phone: "(11) 94444-6666",
    email: "lucas@ferreirashop.com.br",
    status: "follow_up_enviado",
    lastContact: "2026-05-04",
    productsInterested: ["cobertura_evento", "participacao_pernas_cruzadas", "gravacao_curso"],
    assignedTo: "Rod",
    notes: "Loja online de eletrônicos. Pediu orçamento detalhado. Quer começar com ads + email.",
    revenue: "R$ 6.500/mês",
    timeline: [
      { id: "t1", date: "2026-04-20", type: "call", description: "Ligação de 30 min", author: "Rod" },
      { id: "t2", date: "2026-04-22", type: "email", description: "Cliente pediu orçamento detalhado", author: "Lucas" },
      { id: "t3", date: "2026-05-04", type: "status_change", description: "Orçamento enviado — aguardando retorno", author: "Rod" },
    ],
    calls: [
      { id: "c1", date: "2026-04-20", duration: "30 min", outcome: "Muito interessado", notes: "Meta: R$ 50k/mês em vendas. Quer ROAS de 4x." },
    ],
    checklist: generateChecklist(["cobertura_evento", "participacao_pernas_cruzadas", "gravacao_curso"]),
    alerts: [
      { id: "a1", type: "follow_up", message: "Ligar para Lucas na sexta", dueDate: "2026-05-09" },
    ],
  },
  {
    id: "p11",
    name: "Renata Gomes",
    company: "Gomes Estética",
    instagram: "@gomesestetica",
    phone: "(31) 92222-5555",
    email: "renata@gomesestetica.com.br",
    status: "proposta_enviada",
    lastContact: "2026-05-05",
    productsInterested: ["podcast_entrevista_imigrou", "glowup_instagram", "gravacao_curso"],
    assignedTo: "Karine",
    notes: "Clínica de estética. Contrato assinado ontem. Iniciando onboarding hoje.",
    revenue: "R$ 3.800/mês",
    timeline: [
      { id: "t1", date: "2026-04-10", type: "call", description: "Ligação de 20 min", author: "Karine" },
      { id: "t2", date: "2026-04-22", type: "status_change", description: "Proposta aceita", author: "Karine" },
      { id: "t3", date: "2026-05-04", type: "status_change", description: "Contrato assinado", author: "Karine" },
      { id: "t4", date: "2026-05-05", type: "note", description: "Início do onboarding — coleta de materiais", author: "Karine" },
    ],
    calls: [
      { id: "c1", date: "2026-04-10", duration: "20 min", outcome: "Interessada", notes: "Quer posts sobre procedimentos + landing para agendamentos" },
    ],
    checklist: generateChecklist(["podcast_entrevista_imigrou", "glowup_instagram", "gravacao_curso"]),
    alerts: [
      { id: "a1", type: "deadline", message: "Finalizar onboarding até 15/05", dueDate: "2026-05-15" },
    ],
  },
  {
    id: "p12",
    name: "Bruno Carvalho",
    company: "Carvalho Pizzaria",
    instagram: "@carvalhopizzaria",
    phone: "(21) 91111-3333",
    email: "bruno@carvalhopizzaria.com.br",
    status: "call_realizada",
    lastContact: "2026-05-03",
    productsInterested: ["podcast_entrevista_imigrou", "gravacao_mentoria", "cobertura_evento"],
    assignedTo: "Rod",
    notes: "Pizzaria tradicional quer modernizar. Contrato assinado. Aguardando início do onboarding.",
    revenue: "R$ 2.800/mês",
    timeline: [
      { id: "t1", date: "2026-03-20", type: "call", description: "Ligação de 15 min", author: "Rod" },
      { id: "t2", date: "2026-04-05", type: "call", description: "Ligação de 10 min — apresentação de portfolio", author: "Rod" },
      { id: "t3", date: "2026-04-18", type: "status_change", description: "Proposta enviada", author: "Rod" },
      { id: "t4", date: "2026-05-03", type: "status_change", description: "Contrato assinado", author: "Rod" },
    ],
    calls: [
      { id: "c1", date: "2026-04-05", duration: "10 min", outcome: "Interessado", notes: "Quer vídeos de pizzas sendo preparadas + posts diários" },
    ],
    checklist: generateChecklist(["podcast_entrevista_imigrou", "gravacao_mentoria", "cobertura_evento"]),
    alerts: [
      { id: "a1", type: "deadline", message: "Agendar kickoff até 10/05", dueDate: "2026-05-10" },
    ],
  },
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
