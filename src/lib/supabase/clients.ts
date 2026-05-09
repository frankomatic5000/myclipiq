import { getSupabaseBrowser } from "@/lib/supabase/client";
import { DEFAULT_UPSELL_THRESHOLD_DAYS, daysSince } from "@/lib/supabase/dashboard-alerts";

export type ClientStatus = "active" | "paused" | "completed" | "churned";
export type ContractStatus = "none" | "pending" | "sent" | "signed" | "expired";
export type ImageAuthStatus = "not_requested" | "pending" | "signed" | "expired" | "not_needed";

export type Client = {
  id: string;
  name: string;
  email: string;
  instagram: string;
  phone: string;
  company: string;
  contentType: string;
  isManagedByUs: boolean;
  packageType: string;
  monthlyPosts: number | null;
  status: ClientStatus;
  contractStatus: ContractStatus;
  contractSentAt: string | null;
  contractSignedAt: string | null;
  contractExpiresAt: string | null;
  contractUrl: string;
  imageAuthStatus: ImageAuthStatus;
  imageAuthSignedAt: string | null;
  imageAuthExpiresAt: string | null;
  imageAuthUrl: string;
  lastPostAt: string | null;
  lastPostPlatform: string;
  upsellFlag: boolean;
  upsellFlagReason: string;
  createdAt: string;
  updatedAt: string | null;
};

export type ClientUpdateFields = Partial<{
  name: string | null;
  email: string | null;
  instagram: string | null;
  phone: string | null;
  company: string | null;
  content_type: string | null;
  is_managed_by_us: boolean | null;
  package_type: string | null;
  monthly_posts: number | null;
  status: ClientStatus;
  contract_status: ContractStatus;
  contract_sent_at: string | null;
  contract_signed_at: string | null;
  contract_expires_at: string | null;
  contract_url: string | null;
  image_auth_status: ImageAuthStatus;
  image_auth_signed_at: string | null;
  image_auth_expires_at: string | null;
  image_auth_url: string | null;
  last_post_at: string | null;
  last_post_platform: string | null;
  upsell_flag: boolean | null;
  upsell_flag_reason: string | null;
}>;

type ClientRow = {
  id: string;
  name: string | null;
  email: string | null;
  instagram: string | null;
  phone: string | null;
  company: string | null;
  content_type: string | null;
  is_managed_by_us: boolean | null;
  package_type: string | null;
  monthly_posts: number | null;
  status: string | null;
  contract_status: string | null;
  contract_sent_at: string | null;
  contract_signed_at: string | null;
  contract_expires_at: string | null;
  contract_url: string | null;
  image_auth_status: string | null;
  image_auth_signed_at: string | null;
  image_auth_expires_at: string | null;
  image_auth_url: string | null;
  last_post_at: string | null;
  last_post_platform: string | null;
  upsell_flag: boolean | null;
  upsell_flag_reason: string | null;
  created_at: string;
  updated_at: string | null;
};

export type ClientProject = {
  id: string;
  name: string;
  status: string;
  createdAt: string | null;
};

export type ClientPost = {
  id: string;
  platform: string;
  contentType: string;
  status: string;
  scheduledAt: string | null;
  postedAt: string | null;
  caption: string;
};

type ProjectRow = {
  id: string;
  name: string | null;
  status: string | null;
  created_at: string | null;
};

type PostRow = {
  id: string;
  platform: string | null;
  content_type: string | null;
  status: string | null;
  scheduled_at: string | null;
  posted_at: string | null;
  caption: string | null;
};

const CLIENT_STATUSES = new Set<ClientStatus>(["active", "paused", "completed", "churned"]);
const CONTRACT_STATUSES = new Set<ContractStatus>(["none", "pending", "sent", "signed", "expired"]);
const IMAGE_AUTH_STATUSES = new Set<ImageAuthStatus>(["not_requested", "pending", "signed", "expired", "not_needed"]);

function mapClientStatus(value: string | null): ClientStatus {
  return value !== null && CLIENT_STATUSES.has(value as ClientStatus) ? (value as ClientStatus) : "active";
}

function mapContractStatus(value: string | null): ContractStatus {
  return value !== null && CONTRACT_STATUSES.has(value as ContractStatus) ? (value as ContractStatus) : "none";
}

function mapImageAuthStatus(value: string | null): ImageAuthStatus {
  return value !== null && IMAGE_AUTH_STATUSES.has(value as ImageAuthStatus) ? (value as ImageAuthStatus) : "not_requested";
}

function mapClient(row: ClientRow): Client {
  return {
    id: row.id,
    name: row.name ?? "",
    email: row.email ?? "",
    instagram: row.instagram ?? "",
    phone: row.phone ?? "",
    company: row.company ?? "",
    contentType: row.content_type ?? "",
    isManagedByUs: row.is_managed_by_us ?? false,
    packageType: row.package_type ?? "",
    monthlyPosts: row.monthly_posts,
    status: mapClientStatus(row.status),
    contractStatus: mapContractStatus(row.contract_status),
    contractSentAt: row.contract_sent_at,
    contractSignedAt: row.contract_signed_at,
    contractExpiresAt: row.contract_expires_at,
    contractUrl: row.contract_url ?? "",
    imageAuthStatus: mapImageAuthStatus(row.image_auth_status),
    imageAuthSignedAt: row.image_auth_signed_at,
    imageAuthExpiresAt: row.image_auth_expires_at,
    imageAuthUrl: row.image_auth_url ?? "",
    lastPostAt: row.last_post_at,
    lastPostPlatform: row.last_post_platform ?? "",
    upsellFlag: row.upsell_flag ?? false,
    upsellFlagReason: row.upsell_flag_reason ?? "",
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function getClients(): Promise<Client[]> {
  const supabase = getSupabaseBrowser();
  const { data, error } = await supabase
    .from("clients")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return ((data ?? []) as ClientRow[]).map(mapClient);
}

export async function getClientById(id: string): Promise<Client | null> {
  const supabase = getSupabaseBrowser();
  const { data, error } = await supabase
    .from("clients")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data ? mapClient(data as ClientRow) : null;
}

type ClientAlertType =
  | "contract_expiring"
  | "contract_expired"
  | "image_auth_expiring"
  | "image_auth_expired"
  | "upsell_opportunity";

type AlertCandidate = {
  type: ClientAlertType;
  message: string;
  dueDate: string | null;
};

function isWithinWarningWindow(value: string | null, now: Date, days: number): boolean {
  if (!value) return false;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return false;
  const diffMs = date.getTime() - now.getTime();
  return diffMs >= 0 && diffMs <= days * 86_400_000;
}

function isExpired(value: string | null, now: Date): boolean {
  if (!value) return false;
  const date = new Date(value);
  return !Number.isNaN(date.getTime()) && date < now;
}

async function createClientAlertIfMissing(
  clientId: string,
  candidate: AlertCandidate
): Promise<void> {
  const supabase = getSupabaseBrowser();
  const { data, error } = await supabase
    .from("client_alerts")
    .select("id")
    .eq("client_id", clientId)
    .eq("type", candidate.type)
    .is("resolved_at", null)
    .limit(1);

  if (error) {
    throw new Error(error.message);
  }

  if ((data ?? []).length > 0) return;

  const { error: insertError } = await supabase.from("client_alerts").insert({
    client_id: clientId,
    type: candidate.type,
    message: candidate.message,
    due_date: candidate.dueDate,
  });

  if (insertError) {
    throw new Error(insertError.message);
  }
}

async function createAlertsForUpdatedClient(clientId: string): Promise<void> {
  const client = await getClientById(clientId);
  if (!client) return;

  const now = new Date();
  const candidates: AlertCandidate[] = [];
  const postAge = daysSince(client.lastPostAt, now);

  if (postAge !== null && postAge >= DEFAULT_UPSELL_THRESHOLD_DAYS) {
    const platform = client.lastPostPlatform ? ` on ${client.lastPostPlatform}` : "";
    const reason = `Last post ${postAge} days ago${platform}`;
    candidates.push({
      type: "upsell_opportunity",
      message: `${client.name || "Client"}: ${reason}`,
      dueDate: client.lastPostAt,
    });

    const supabase = getSupabaseBrowser();
    const { error } = await supabase
      .from("clients")
      .update({ upsell_flag: true, upsell_flag_reason: reason })
      .eq("id", clientId);

    if (error) {
      throw new Error(error.message);
    }
  }

  if (isExpired(client.contractExpiresAt, now)) {
    candidates.push({
      type: "contract_expired",
      message: `${client.name || "Client"}: contract expired`,
      dueDate: client.contractExpiresAt,
    });
  } else if (isWithinWarningWindow(client.contractExpiresAt, now, 7)) {
    candidates.push({
      type: "contract_expiring",
      message: `${client.name || "Client"}: contract expires within 7 days`,
      dueDate: client.contractExpiresAt,
    });
  }

  if (isExpired(client.imageAuthExpiresAt, now)) {
    candidates.push({
      type: "image_auth_expired",
      message: `${client.name || "Client"}: image authorization expired`,
      dueDate: client.imageAuthExpiresAt,
    });
  } else if (isWithinWarningWindow(client.imageAuthExpiresAt, now, 7)) {
    candidates.push({
      type: "image_auth_expiring",
      message: `${client.name || "Client"}: image authorization expires within 7 days`,
      dueDate: client.imageAuthExpiresAt,
    });
  }

  await Promise.all(candidates.map((candidate) => createClientAlertIfMissing(clientId, candidate)));
}

export async function updateClient(id: string, fields: ClientUpdateFields): Promise<void> {
  const supabase = getSupabaseBrowser();
  const { error } = await supabase.from("clients").update(fields).eq("id", id);

  if (error) {
    throw new Error(error.message);
  }

  const alertTriggerFields: Array<keyof ClientUpdateFields> = [
    "last_post_at",
    "contract_expires_at",
    "image_auth_expires_at",
  ];

  if (alertTriggerFields.some((field) => Object.prototype.hasOwnProperty.call(fields, field))) {
    await createAlertsForUpdatedClient(id);
  }
}

export async function getClientProjects(clientId: string): Promise<ClientProject[]> {
  const supabase = getSupabaseBrowser();
  const { data, error } = await supabase
    .from("projects")
    .select("id,name,status,created_at")
    .eq("customer_id", clientId)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return ((data ?? []) as ProjectRow[]).map((row) => ({
    id: row.id,
    name: row.name ?? "Untitled project",
    status: row.status ?? "—",
    createdAt: row.created_at,
  }));
}

export async function getClientPosts(clientId: string): Promise<ClientPost[]> {
  const supabase = getSupabaseBrowser();
  const { data, error } = await supabase
    .from("posts")
    .select("id,platform,content_type,status,scheduled_at,posted_at,caption")
    .eq("client_id", clientId)
    .order("scheduled_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return ((data ?? []) as PostRow[]).map((row) => ({
    id: row.id,
    platform: row.platform ?? "—",
    contentType: row.content_type ?? "—",
    status: row.status ?? "—",
    scheduledAt: row.scheduled_at,
    postedAt: row.posted_at,
    caption: row.caption ?? "",
  }));
}
