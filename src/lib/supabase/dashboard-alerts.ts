import { getSupabaseBrowser } from "@/lib/supabase/client";

export const DEFAULT_UPSELL_THRESHOLD_DAYS = Number(
  process.env.NEXT_PUBLIC_UPSELL_THRESHOLD_DAYS ?? "30"
);

export type AlertBreakdownKey =
  | "contract"
  | "image_auth"
  | "upsell"
  | "follow_up"
  | "payment"
  | "project";

export type DashboardAlert = {
  id: string;
  source: "client" | "prospect";
  ownerId: string;
  type: string;
  group: AlertBreakdownKey;
  message: string;
  dueDate: string | null;
  href: "/customers" | "/vendas-ativas";
};

export type UpsellOpportunity = {
  clientId: string;
  clientName: string;
  lastPostAt: string | null;
  lastPostPlatform: string;
  daysSinceLastPost: number | null;
  reason: string;
  flagged: boolean;
};

export type DashboardAlertsSnapshot = {
  alerts: DashboardAlert[];
  upsellOpportunities: UpsellOpportunity[];
  totalUnresolved: number;
  urgentCount: number;
  breakdown: Record<AlertBreakdownKey, number>;
  thresholdDays: number;
};

type ClientAlertRow = {
  id: string;
  client_id: string | null;
  type: string;
  message: string;
  due_date: string | null;
};

type ProspectAlertRow = {
  id: string;
  prospect_id: string | null;
  type: string;
  message: string;
  due_date: string | null;
};

type DashboardClientRow = {
  id: string;
  name: string | null;
  last_post_at: string | null;
  last_post_platform: string | null;
  upsell_flag: boolean | null;
  upsell_flag_reason: string | null;
  status: string | null;
};

const EMPTY_BREAKDOWN: Record<AlertBreakdownKey, number> = {
  contract: 0,
  image_auth: 0,
  upsell: 0,
  follow_up: 0,
  payment: 0,
  project: 0,
};

export function daysSince(value: string | null, now = new Date()): number | null {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return Math.max(0, Math.floor((now.getTime() - date.getTime()) / 86_400_000));
}

function alertGroup(type: string): AlertBreakdownKey {
  if (type.startsWith("contract_")) return "contract";
  if (type.startsWith("image_auth_")) return "image_auth";
  if (type === "upsell_opportunity") return "upsell";
  if (type === "follow_up") return "follow_up";
  if (type === "payment" || type === "payment_overdue") return "payment";
  return "project";
}

function coerceThreshold(thresholdDays: number): number {
  return Number.isFinite(thresholdDays) && thresholdDays > 0
    ? Math.floor(thresholdDays)
    : 30;
}

export async function getDashboardAlertsSnapshot(
  thresholdDays = DEFAULT_UPSELL_THRESHOLD_DAYS
): Promise<DashboardAlertsSnapshot> {
  const supabase = getSupabaseBrowser();
  const threshold = coerceThreshold(thresholdDays);
  const now = new Date();

  const [clientAlertsResult, prospectAlertsResult, clientsResult] = await Promise.all([
    supabase
      .from("client_alerts")
      .select("id,client_id,type,message,due_date")
      .is("resolved_at", null)
      .order("due_date", { ascending: true, nullsFirst: false }),
    supabase
      .from("prospect_alerts")
      .select("id,prospect_id,type,message,due_date")
      .is("resolved_at", null)
      .order("due_date", { ascending: true, nullsFirst: false }),
    supabase
      .from("clients")
      .select("id,name,last_post_at,last_post_platform,upsell_flag,upsell_flag_reason,status")
      .order("name", { ascending: true }),
  ]);

  if (clientAlertsResult.error) throw new Error(clientAlertsResult.error.message);
  if (prospectAlertsResult.error) throw new Error(prospectAlertsResult.error.message);
  if (clientsResult.error) throw new Error(clientsResult.error.message);

  const clientAlerts = ((clientAlertsResult.data ?? []) as ClientAlertRow[]).map(
    (alert): DashboardAlert => ({
      id: alert.id,
      source: "client",
      ownerId: alert.client_id ?? "",
      type: alert.type,
      group: alertGroup(alert.type),
      message: alert.message,
      dueDate: alert.due_date,
      href: "/customers",
    })
  );

  const prospectAlerts = ((prospectAlertsResult.data ?? []) as ProspectAlertRow[]).map(
    (alert): DashboardAlert => ({
      id: alert.id,
      source: "prospect",
      ownerId: alert.prospect_id ?? "",
      type: alert.type,
      group: alertGroup(alert.type),
      message: alert.message,
      dueDate: alert.due_date,
      href: "/vendas-ativas",
    })
  );

  const alerts = [...clientAlerts, ...prospectAlerts].sort((a, b) => {
    if (!a.dueDate && !b.dueDate) return 0;
    if (!a.dueDate) return 1;
    if (!b.dueDate) return -1;
    return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
  });

  const breakdown = { ...EMPTY_BREAKDOWN };
  alerts.forEach((alert) => {
    breakdown[alert.group] += 1;
  });

  const upsellOpportunities = ((clientsResult.data ?? []) as DashboardClientRow[])
    .filter((client) => client.status !== "churned")
    .map((client) => {
      const age = daysSince(client.last_post_at, now);
      const stale = age !== null && age >= threshold;
      return {
        client,
        age,
        stale,
      };
    })
    .filter(({ client, stale }) => stale || client.upsell_flag === true)
    .map(({ client, age, stale }): UpsellOpportunity => ({
      clientId: client.id,
      clientName: client.name ?? "Cliente sem nome",
      lastPostAt: client.last_post_at,
      lastPostPlatform: client.last_post_platform ?? "—",
      daysSinceLastPost: age,
      reason:
        client.upsell_flag_reason ??
        (stale && age !== null
          ? `Sem postagens ha ${age} dias`
          : "Marcado para upsell"),
      flagged: client.upsell_flag === true,
    }));

  const urgentCount = alerts.filter((alert) => {
    if (!alert.dueDate) return false;
    const dueDate = new Date(alert.dueDate);
    return !Number.isNaN(dueDate.getTime()) && dueDate < now;
  }).length;

  return {
    alerts,
    upsellOpportunities,
    totalUnresolved: alerts.length,
    urgentCount,
    breakdown,
    thresholdDays: threshold,
  };
}
