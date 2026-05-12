import { getSupabaseBrowser } from "@/lib/supabase/client";
import type {
  CallRecord,
  Prospect,
  SalesStatus,
  TimelineEvent,
} from "@/app/[locale]/vendas-ativas/data";
import { generateChecklist } from "@/app/[locale]/vendas-ativas/data";

type ProspectRow = {
  id: string;
  name: string | null;
  company: string | null;
  instagram: string | null;
  phone: string | null;
  email: string | null;
  status: string | null;
  lead_source: string | null;
  products_interested: string[] | null;
  assigned_to: string | null;
  revenue_estimate: number | string | null;
  notes: string | null;
  last_contact_at: string | null;
  created_at: string;
  updated_at: string | null;
  converted_to_client_id: string | null;
  converted_at: string | null;
};

type TimelineEventRow = {
  id: string;
  prospect_id: string;
  type: string | null;
  description: string | null;
  author_id: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
};

type CallRecordRow = {
  id: string;
  prospect_id: string;
  date: string | null;
  duration_minutes: number | null;
  outcome: string | null;
  notes: string | null;
  follow_up_suggested_at: string | null;
  author_id: string | null;
  created_at: string;
};

type CreateCallRecordInput = {
  prospectId: string;
  date: string;
  durationMinutes: number;
  outcome: string;
  notes: string;
  followUpSuggestedAt?: string | null;
};

type CreateProjectInput = {
  serviceType: string;
  name: string;
};

type ConvertProspectToClientInput = {
  prospectId: string;
  project?: CreateProjectInput | null;
};

type ConvertProspectToClientResult = {
  clientId: string;
  projectId: string | null;
};

const SALES_STATUSES = new Set<SalesStatus>([
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
]);

const TIMELINE_TYPES = new Set<TimelineEvent["type"]>([
  "message",
  "call",
  "email",
  "status_change",
  "note",
  "conversion",
]);

function isSalesStatus(value: string | null): value is SalesStatus {
  return value !== null && SALES_STATUSES.has(value as SalesStatus);
}

function assertSalesStatus(value: SalesStatus): void {
  if (!SALES_STATUSES.has(value)) {
    throw new Error("Invalid prospect status.");
  }
}

function formatDate(value: string | null): string {
  if (!value) return "";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

function formatCurrency(value: number | string | null): string {
  if (value === null || value === "") return "—";

  const amount = typeof value === "number" ? value : Number(value);
  if (Number.isNaN(amount)) return String(value);

  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  }).format(amount);
}

function mapTimelineType(type: string | null): TimelineEvent["type"] {
  return type !== null && TIMELINE_TYPES.has(type as TimelineEvent["type"])
    ? (type as TimelineEvent["type"])
    : "note";
}

function mapTimelineEvent(row: TimelineEventRow): TimelineEvent {
  return {
    id: row.id,
    date: formatDate(row.created_at),
    type: mapTimelineType(row.type),
    description: row.description ?? "",
    author: row.author_id ?? "",
  };
}

function mapCallRecord(row: CallRecordRow): CallRecord {
  return {
    id: row.id,
    date: formatDate(row.date ?? row.created_at),
    duration: row.duration_minutes === null ? "" : `${row.duration_minutes} min`,
    outcome: row.outcome ?? "",
    notes: row.notes ?? "",
  };
}

function mapProspect(
  row: ProspectRow,
  timeline: TimelineEvent[],
  calls: CallRecord[]
): Prospect {
  const productsInterested = row.products_interested ?? [];

  return {
    id: row.id,
    name: row.name ?? "",
    company: row.company ?? "",
    instagram: row.instagram ?? "",
    phone: row.phone ?? "",
    email: row.email ?? "",
    status: isSalesStatus(row.status) ? row.status : "lead_cadastrado",
    lastContact: formatDate(row.last_contact_at ?? row.created_at),
    productsInterested,
    assignedTo: row.assigned_to ?? "",
    notes: row.notes ?? "",
    revenue: formatCurrency(row.revenue_estimate),
    timeline,
    calls,
    checklist: generateChecklist(productsInterested),
    alerts: [],
    convertedToClientId: row.converted_to_client_id,
    convertedAt: row.converted_at,
  };
}

async function getAuthenticatedUserId(): Promise<string | null> {
  const supabase = getSupabaseBrowser();
  const { data, error } = await supabase.auth.getUser();

  if (error) {
    throw new Error(error.message);
  }

  return data.user?.id ?? null;
}

async function requireAuthenticatedUserId(): Promise<string> {
  const userId = await getAuthenticatedUserId();

  if (!userId) {
    throw new Error("Authentication is required for Vendas Ativas updates.");
  }

  return userId;
}

export async function getProspectTimeline(
  prospectId: string
): Promise<TimelineEvent[]> {
  const supabase = getSupabaseBrowser();
  const { data, error } = await supabase
    .from("prospect_timeline_events")
    .select("*")
    .eq("prospect_id", prospectId)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return ((data ?? []) as TimelineEventRow[]).map(mapTimelineEvent);
}

export async function getProspectCalls(
  prospectId: string
): Promise<CallRecord[]> {
  const supabase = getSupabaseBrowser();
  const { data, error } = await supabase
    .from("prospect_call_records")
    .select("*")
    .eq("prospect_id", prospectId)
    .order("date", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return ((data ?? []) as CallRecordRow[]).map(mapCallRecord);
}

export async function getProspects(): Promise<Prospect[]> {
  const userId = await getAuthenticatedUserId();

  if (!userId) {
    return [];
  }

  const supabase = getSupabaseBrowser();
  const { data, error } = await supabase
    .from("prospects")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  const rows = (data ?? []) as ProspectRow[];

  return Promise.all(
    rows.map(async (row) => {
      const [timeline, calls] = await Promise.all([
        getProspectTimeline(row.id),
        getProspectCalls(row.id),
      ]);

      return mapProspect(row, timeline, calls);
    })
  );
}


async function createConversionProject(
  clientId: string,
  ownerId: string,
  project: CreateProjectInput
): Promise<string> {
  const supabase = getSupabaseBrowser();
  const fallbackProject = {
    name: project.name.trim(),
    service_type: project.serviceType,
    status: "intake",
  };
  const baseProject = {
    ...fallbackProject,
    client_id: clientId,
    owner_id: ownerId,
  };

  const { data, error } = await supabase
    .from("projects")
    .insert(baseProject)
    .select("id")
    .single();

  if (!error) {
    return (data as { id: string }).id;
  }

  const shouldRetryWithLegacyProjectShape =
    error.code === "PGRST204" ||
    error.message.toLowerCase().includes("client_id") ||
    error.message.toLowerCase().includes("owner_id");

  if (!shouldRetryWithLegacyProjectShape) {
    throw new Error(error.message);
  }

  const { data: retryData, error: retryError } = await supabase
    .from("projects")
    .insert(fallbackProject)
    .select("id")
    .single();

  if (retryError) {
    throw new Error(retryError.message);
  }

  return (retryData as { id: string }).id;
}

export async function convertProspectToClient(
  input: ConvertProspectToClientInput
): Promise<ConvertProspectToClientResult> {
  const authorId = await requireAuthenticatedUserId();
  const supabase = getSupabaseBrowser();

  const { data: prospectData, error: prospectError } = await supabase
    .from("prospects")
    .select("*")
    .eq("id", input.prospectId)
    .single();

  if (prospectError) {
    throw new Error(prospectError.message);
  }

  const prospect = prospectData as ProspectRow;

  if (prospect.status !== "venda_fechada") {
    throw new Error("Somente prospects com venda fechada podem ser convertidos.");
  }

  if (prospect.converted_to_client_id) {
    return { clientId: prospect.converted_to_client_id, projectId: null };
  }

  const now = new Date().toISOString();
  const { data: clientData, error: clientError } = await supabase
    .from("clients")
    .insert({
      name: prospect.name ?? "Cliente sem nome",
      company: prospect.company,
      instagram: prospect.instagram,
      phone: prospect.phone,
      email: prospect.email,
      content_type: null,
      status: "active",
      contract_status: "none",
      image_auth_status: "not_requested",
      owner_id: authorId,
      created_at: now,
    })
    .select("id")
    .single();

  if (clientError) {
    throw new Error(clientError.message);
  }

  const clientId = (clientData as { id: string }).id;

  const { error: updateError } = await supabase
    .from("prospects")
    .update({
      converted_to_client_id: clientId,
      converted_at: now,
      updated_at: now,
    })
    .eq("id", input.prospectId)
    .is("converted_to_client_id", null);

  if (updateError) {
    throw new Error(updateError.message);
  }

  const { error: timelineError } = await supabase
    .from("prospect_timeline_events")
    .insert({
      prospect_id: input.prospectId,
      type: "conversion",
      description: "Convertido em cliente",
      author_id: authorId,
      metadata: { client_id: clientId },
    });

  if (timelineError) {
    throw new Error(timelineError.message);
  }

  let projectId: string | null = null;

  if (input.project?.serviceType && input.project.name.trim()) {
    projectId = await createConversionProject(clientId, authorId, input.project);
  }

  return { clientId, projectId };
}

export async function updateProspectStatus(
  prospectId: string,
  status: SalesStatus
): Promise<void> {
  assertSalesStatus(status);

  const authorId = await requireAuthenticatedUserId();
  const supabase = getSupabaseBrowser();
  const { error: updateError } = await supabase
    .from("prospects")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", prospectId);

  if (updateError) {
    throw new Error(updateError.message);
  }

  const { error: timelineError } = await supabase
    .from("prospect_timeline_events")
    .insert({
      prospect_id: prospectId,
      type: "status_change",
      description: `Status alterado para ${status}`,
      author_id: authorId,
      metadata: { status },
    });

  if (timelineError) {
    throw new Error(timelineError.message);
  }
}

export async function createProspectCall(
  input: CreateCallRecordInput
): Promise<CallRecord> {
  const authorId = await requireAuthenticatedUserId();
  const supabase = getSupabaseBrowser();
  const { data, error } = await supabase
    .from("prospect_call_records")
    .insert({
      prospect_id: input.prospectId,
      date: input.date,
      duration_minutes: input.durationMinutes,
      outcome: input.outcome,
      notes: input.notes,
      follow_up_suggested_at: input.followUpSuggestedAt ?? null,
      author_id: authorId,
    })
    .select("*")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return mapCallRecord(data as CallRecordRow);
}
