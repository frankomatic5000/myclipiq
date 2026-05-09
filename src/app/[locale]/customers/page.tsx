"use client";

import { Fragment, useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import Header from "../../components/Header";
import {
  getClientPosts,
  getClientProjects,
  getClients,
  updateClient,
  type Client,
  type ClientPost,
  type ClientProject,
  type ClientStatus,
  type ContractStatus,
  type ImageAuthStatus,
} from "@/lib/supabase/clients";

const clientStatuses: ClientStatus[] = ["active", "paused", "completed", "churned"];
const contractStatuses: ContractStatus[] = ["none", "pending", "sent", "signed", "expired"];
const imageAuthStatuses: ImageAuthStatus[] = ["not_requested", "pending", "signed", "expired", "not_needed"];

const statusBadgeClass: Record<ClientStatus, string> = {
  active: "bg-green-500/10 text-green-400 border-green-500/20",
  paused: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  completed: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  churned: "bg-red-500/10 text-red-400 border-red-500/20",
};

const statusBgClass: Record<ClientStatus, string> = {
  active: "bg-green-500",
  paused: "bg-amber-500",
  completed: "bg-blue-500",
  churned: "bg-red-500",
};

const contractBadgeClass: Record<ContractStatus, string> = {
  none: "bg-surface-700 text-surface-300 border-surface-600",
  pending: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  sent: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  signed: "bg-green-500/10 text-green-400 border-green-500/20",
  expired: "bg-red-500/10 text-red-400 border-red-500/20",
};

const imageAuthBadgeClass: Record<ImageAuthStatus, string> = {
  not_requested: "bg-surface-700 text-surface-300 border-surface-600",
  pending: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  signed: "bg-green-500/10 text-green-400 border-green-500/20",
  expired: "bg-red-500/10 text-red-400 border-red-500/20",
  not_needed: "bg-blue-500/10 text-blue-400 border-blue-500/20",
};

type RelatedState = {
  loading: boolean;
  error: string | null;
  projects: ClientProject[];
  posts: ClientPost[];
};

function initialsFor(client: Client): string {
  const source = client.name || client.company || client.email || "Client";
  return source
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "CL";
}

function formatLabel(value: string): string {
  return value.replaceAll("_", " ").replace(/\b\w/g, (char) => char.toUpperCase());
}

function formatDate(value: string | null): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

function detailValue(value: string | number | boolean | null): string {
  if (value === null || value === "") return "—";
  if (typeof value === "boolean") return value ? "Yes" : "No";
  return String(value);
}

function Badge({ label, className }: { label: string; className: string }) {
  return (
    <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium border ${className}`}>
      {label}
    </span>
  );
}

function InlineSelect<T extends string>({
  value,
  options,
  disabled,
  onChange,
}: {
  value: T;
  options: T[];
  disabled: boolean;
  onChange: (value: T) => void;
}) {
  return (
    <select
      value={value}
      disabled={disabled}
      onChange={(event) => onChange(event.target.value as T)}
      className="rounded-lg bg-surface-950 border border-surface-700/70 px-2.5 py-2 text-xs text-surface-100 focus:outline-none focus:border-brand-500 disabled:opacity-60"
    >
      {options.map((option) => (
        <option key={option} value={option}>
          {formatLabel(option)}
        </option>
      ))}
    </select>
  );
}

function DetailItem({ label, value }: { label: string; value: string | number | boolean | null }) {
  return (
    <div className="rounded-lg bg-surface-950/70 border border-surface-700/40 p-3">
      <p className="text-[11px] uppercase tracking-wider text-surface-400 mb-1">{label}</p>
      <p className="text-sm text-surface-100 break-words">{detailValue(value)}</p>
    </div>
  );
}

export default function CustomersPage() {
  const t = useTranslations("customers");
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<ClientStatus | "all">("all");
  const [contractFilter, setContractFilter] = useState<ContractStatus | "all">("all");
  const [upsellFilter, setUpsellFilter] = useState<"all" | "flagged" | "clear">("all");
  const [expandedClientId, setExpandedClientId] = useState<string | null>(null);
  const [savingClientId, setSavingClientId] = useState<string | null>(null);
  const [relatedByClient, setRelatedByClient] = useState<Record<string, RelatedState>>({});

  useEffect(() => {
    let active = true;

    async function loadClients() {
      try {
        const data = await getClients();
        if (active) setClients(data);
      } catch (loadError) {
        console.error("Failed to load clients", loadError);
        if (active) setError(true);
      } finally {
        if (active) setLoading(false);
      }
    }

    loadClients();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!expandedClientId || relatedByClient[expandedClientId]) return;

    let active = true;

    async function loadRelated() {
      if (!expandedClientId) return;
      try {
        const [projects, posts] = await Promise.all([
          getClientProjects(expandedClientId),
          getClientPosts(expandedClientId),
        ]);
        if (!active) return;
        setRelatedByClient((current) => ({
          ...current,
          [expandedClientId]: { loading: false, error: null, projects, posts },
        }));
      } catch (loadError) {
        console.error("Failed to load client detail", loadError);
        if (!active) return;
        setRelatedByClient((current) => ({
          ...current,
          [expandedClientId]: { loading: false, error: "Unable to load related records.", projects: [], posts: [] },
        }));
      }
    }

    loadRelated();
    return () => {
      active = false;
    };
  }, [expandedClientId, relatedByClient]);

  const filtered = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return clients.filter((client) => {
      const matchesSearch = !normalizedSearch ||
        client.name.toLowerCase().includes(normalizedSearch) ||
        client.email.toLowerCase().includes(normalizedSearch) ||
        client.company.toLowerCase().includes(normalizedSearch);
      const matchesStatus = statusFilter === "all" || client.status === statusFilter;
      const matchesContract = contractFilter === "all" || client.contractStatus === contractFilter;
      const matchesUpsell = upsellFilter === "all" ||
        (upsellFilter === "flagged" && client.upsellFlag) ||
        (upsellFilter === "clear" && !client.upsellFlag);

      return matchesSearch && matchesStatus && matchesContract && matchesUpsell;
    });
  }, [clients, contractFilter, search, statusFilter, upsellFilter]);

  async function handleClientFieldChange<T extends ClientStatus | ContractStatus | ImageAuthStatus>(
    clientId: string,
    uiField: "status" | "contractStatus" | "imageAuthStatus",
    dbField: "status" | "contract_status" | "image_auth_status",
    value: T
  ) {
    const previousClients = clients;
    setSavingClientId(clientId);
    setClients((current) =>
      current.map((client) =>
        client.id === clientId ? { ...client, [uiField]: value } : client
      )
    );

    try {
      await updateClient(clientId, { [dbField]: value });
    } catch (saveError) {
      console.error("Failed to update client", saveError);
      setClients(previousClients);
      setError(true);
    } finally {
      setSavingClientId(null);
    }
  }

  function toggleClientDetail(clientId: string) {
    const nextClientId = expandedClientId === clientId ? null : clientId;
    setExpandedClientId(nextClientId);

    if (nextClientId && !relatedByClient[nextClientId]) {
      setRelatedByClient((related) => ({
        ...related,
        [nextClientId]: { loading: true, error: null, projects: [], posts: [] },
      }));
    }
  }

  function renderEmptyState() {
    const isTableEmpty = clients.length === 0;
    return (
      <div className="bg-surface-900 rounded-xl border border-surface-700/50 p-8 max-w-lg mx-auto text-center">
        <div className="w-12 h-12 rounded-full bg-surface-800 flex items-center justify-center mx-auto mb-4">
          <svg className="w-6 h-6 text-surface-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold mb-2">{isTableEmpty ? "No clients yet" : t("empty.title")}</h3>
        <p className="text-sm text-surface-300">
          {isTableEmpty ? "Clients added to Supabase will appear here." : t("empty.description")}
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <>
        <Header title={t("title")} subtitle={t("subtitle")} />
        <div className="p-4 md:p-6">
          <div className="bg-surface-900 rounded-xl border border-red-500/20 p-8 max-w-lg mx-auto text-center">
            <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.054 0 1.502-1.034.816-1.79l-6.928-7.93a1 1 0 00-1.504 0l-6.928 7.93c-.686.756-.238 1.79.816 1.79z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold mb-2">{t("error.title")}</h3>
            <p className="text-sm text-surface-300">{t("error.description")}</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header
        title={t("title")}
        subtitle={t("subtitle")}
        actions={
          <>
            <div className="hidden sm:flex items-center bg-surface-900 rounded-lg border border-surface-700/50 p-0.5">
              <button className="px-3 py-1.5 rounded-md text-xs font-medium bg-brand-500/20 text-brand-400">{t("roles.admin")}</button>
              <button className="px-3 py-1.5 rounded-md text-xs font-medium text-surface-300 hover:text-surface-100">{t("roles.editor")}</button>
              <button className="px-3 py-1.5 rounded-md text-xs font-medium text-surface-300 hover:text-surface-100">{t("roles.viewer")}</button>
            </div>
            <div className="relative w-full sm:w-auto">
              <input
                type="text"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder={t("searchPlaceholder")}
                autoComplete="off"
                className="pl-10 pr-4 py-2.5 rounded-lg bg-surface-900 border border-surface-700/50 text-sm text-surface-100 placeholder-surface-300/50 focus:outline-none focus:border-brand-500 w-full sm:w-64 min-h-[44px]"
              />
              <svg className="w-4 h-4 text-surface-300 absolute left-3 top-1/2 -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <button
              onClick={() => alert(t("comingSoon"))}
              className="px-4 py-2 text-sm rounded-lg bg-brand-600 text-white font-medium hover:opacity-90 transition flex items-center gap-2 whitespace-nowrap"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              {t("addCustomer")}
            </button>
          </>
        }
      />

      <div className="p-4 md:p-6">
        <div className="flex flex-wrap items-center gap-3 mb-6">
          <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as ClientStatus | "all")} className="rounded-lg bg-surface-900 border border-surface-700/50 px-3 py-2.5 text-sm text-surface-100 focus:outline-none focus:border-brand-500 min-h-[44px]">
            <option value="all">All statuses</option>
            {clientStatuses.map((status) => <option key={status} value={status}>{formatLabel(status)}</option>)}
          </select>
          <select value={contractFilter} onChange={(event) => setContractFilter(event.target.value as ContractStatus | "all")} className="rounded-lg bg-surface-900 border border-surface-700/50 px-3 py-2.5 text-sm text-surface-100 focus:outline-none focus:border-brand-500 min-h-[44px]">
            <option value="all">All contracts</option>
            {contractStatuses.map((status) => <option key={status} value={status}>{formatLabel(status)}</option>)}
          </select>
          <select value={upsellFilter} onChange={(event) => setUpsellFilter(event.target.value as "all" | "flagged" | "clear")} className="rounded-lg bg-surface-900 border border-surface-700/50 px-3 py-2.5 text-sm text-surface-100 focus:outline-none focus:border-brand-500 min-h-[44px]">
            <option value="all">All upsell states</option>
            <option value="flagged">Upsell flagged</option>
            <option value="clear">No upsell flag</option>
          </select>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-sm text-surface-300">{t("loading")}</p>
          </div>
        ) : filtered.length === 0 ? (
          renderEmptyState()
        ) : (
          <div className="bg-surface-900 rounded-xl border border-surface-700/50 overflow-x-auto">
            <table className="w-full min-w-[980px]">
              <thead>
                <tr className="border-b border-surface-700/50">
                  <th className="text-left px-5 py-3 text-xs font-medium text-surface-300 uppercase tracking-wider">Client</th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-surface-300 uppercase tracking-wider">Contact</th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-surface-300 uppercase tracking-wider">Status</th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-surface-300 uppercase tracking-wider">Contract</th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-surface-300 uppercase tracking-wider">Image Auth</th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-surface-300 uppercase tracking-wider">Last Post</th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-surface-300 uppercase tracking-wider">Upsell</th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-surface-300 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((client) => {
                  const isExpanded = expandedClientId === client.id;
                  const related = relatedByClient[client.id];
                  const saving = savingClientId === client.id;

                  return (
                    <Fragment key={client.id}>
                      <tr className="border-b border-surface-700/30 hover:bg-surface-800/50 transition">
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-full ${statusBgClass[client.status]} flex items-center justify-center text-white font-bold text-sm`}>
                              {initialsFor(client)}
                            </div>
                            <div>
                              <p className="font-medium text-sm">{client.name || "Unnamed client"}</p>
                              <p className="text-xs text-surface-300">{client.company || "—"}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4 text-sm text-surface-300">
                          <div>{client.email || "—"}</div>
                          <div>{client.phone || "—"}</div>
                          <div>{client.instagram || "—"}</div>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex flex-col gap-2 items-start">
                            <Badge label={formatLabel(client.status)} className={statusBadgeClass[client.status]} />
                            <InlineSelect value={client.status} options={clientStatuses} disabled={saving} onChange={(value) => handleClientFieldChange(client.id, "status", "status", value)} />
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex flex-col gap-2 items-start">
                            <Badge label={formatLabel(client.contractStatus)} className={contractBadgeClass[client.contractStatus]} />
                            <InlineSelect value={client.contractStatus} options={contractStatuses} disabled={saving} onChange={(value) => handleClientFieldChange(client.id, "contractStatus", "contract_status", value)} />
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex flex-col gap-2 items-start">
                            <Badge label={formatLabel(client.imageAuthStatus)} className={imageAuthBadgeClass[client.imageAuthStatus]} />
                            <InlineSelect value={client.imageAuthStatus} options={imageAuthStatuses} disabled={saving} onChange={(value) => handleClientFieldChange(client.id, "imageAuthStatus", "image_auth_status", value)} />
                          </div>
                        </td>
                        <td className="px-5 py-4 text-sm text-surface-300">
                          <div>{formatDate(client.lastPostAt)}</div>
                          <div>{client.lastPostPlatform || "—"}</div>
                        </td>
                        <td className="px-5 py-4">
                          <Badge label={client.upsellFlag ? "Flagged" : "Clear"} className={client.upsellFlag ? "bg-amber-500/10 text-amber-400 border-amber-500/20" : "bg-surface-700 text-surface-300 border-surface-600"} />
                        </td>
                        <td className="px-5 py-4">
                          <button
                            onClick={() => toggleClientDetail(client.id)}
                            className="px-3 py-2 rounded-lg bg-surface-800 text-surface-100 text-xs hover:bg-surface-700 transition"
                          >
                            {isExpanded ? "Hide" : "Details"}
                          </button>
                        </td>
                      </tr>
                      {isExpanded ? (
                        <tr className="border-b border-surface-700/30 bg-surface-950/40">
                          <td colSpan={8} className="px-5 py-5">
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                              <div className="lg:col-span-2 space-y-4">
                                <div>
                                  <h3 className="text-sm font-semibold mb-3">Client details</h3>
                                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
                                    <DetailItem label="ID" value={client.id} />
                                    <DetailItem label="Name" value={client.name} />
                                    <DetailItem label="Company" value={client.company} />
                                    <DetailItem label="Email" value={client.email} />
                                    <DetailItem label="Instagram" value={client.instagram} />
                                    <DetailItem label="Phone" value={client.phone} />
                                    <DetailItem label="Content type" value={client.contentType} />
                                    <DetailItem label="Managed by us" value={client.isManagedByUs} />
                                    <DetailItem label="Package" value={client.packageType} />
                                    <DetailItem label="Monthly posts" value={client.monthlyPosts} />
                                    <DetailItem label="Status" value={formatLabel(client.status)} />
                                    <DetailItem label="Created" value={formatDate(client.createdAt)} />
                                    <DetailItem label="Updated" value={formatDate(client.updatedAt)} />
                                  </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <div className="rounded-xl border border-surface-700/50 bg-surface-900/70 p-4">
                                    <h4 className="text-sm font-semibold mb-3">Contract</h4>
                                    <div className="space-y-2 text-sm text-surface-300">
                                      <p>Status: <span className="text-surface-100">{formatLabel(client.contractStatus)}</span></p>
                                      <p>Sent: <span className="text-surface-100">{formatDate(client.contractSentAt)}</span></p>
                                      <p>Signed: <span className="text-surface-100">{formatDate(client.contractSignedAt)}</span></p>
                                      <p>Expires: <span className="text-surface-100">{formatDate(client.contractExpiresAt)}</span></p>
                                      <p>URL: <span className="text-surface-100 break-all">{client.contractUrl || "—"}</span></p>
                                    </div>
                                  </div>
                                  <div className="rounded-xl border border-surface-700/50 bg-surface-900/70 p-4">
                                    <h4 className="text-sm font-semibold mb-3">Image authorization</h4>
                                    <div className="space-y-2 text-sm text-surface-300">
                                      <p>Status: <span className="text-surface-100">{formatLabel(client.imageAuthStatus)}</span></p>
                                      <p>Signed: <span className="text-surface-100">{formatDate(client.imageAuthSignedAt)}</span></p>
                                      <p>Expires: <span className="text-surface-100">{formatDate(client.imageAuthExpiresAt)}</span></p>
                                      <p>URL: <span className="text-surface-100 break-all">{client.imageAuthUrl || "—"}</span></p>
                                    </div>
                                  </div>
                                </div>
                                <div className="rounded-xl border border-surface-700/50 bg-surface-900/70 p-4">
                                  <h4 className="text-sm font-semibold mb-3">Operations</h4>
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-surface-300">
                                    <p>Last post: <span className="text-surface-100">{formatDate(client.lastPostAt)}</span></p>
                                    <p>Last platform: <span className="text-surface-100">{client.lastPostPlatform || "—"}</span></p>
                                    <p>Upsell flag: <span className="text-surface-100">{client.upsellFlag ? "Yes" : "No"}</span></p>
                                    <p>Upsell reason: <span className="text-surface-100">{client.upsellFlagReason || "—"}</span></p>
                                  </div>
                                </div>
                              </div>
                              <div className="space-y-4">
                                <div className="rounded-xl border border-surface-700/50 bg-surface-900/70 p-4">
                                  <h4 className="text-sm font-semibold mb-3">Related projects</h4>
                                  {related?.loading ? <p className="text-sm text-surface-300">Loading…</p> : null}
                                  {related?.error ? <p className="text-sm text-red-400">{related.error}</p> : null}
                                  {!related?.loading && !related?.error && related?.projects.length === 0 ? <p className="text-sm text-surface-300">No related projects.</p> : null}
                                  <div className="space-y-2">
                                    {related?.projects.map((project) => (
                                      <div key={project.id} className="rounded-lg bg-surface-950/70 border border-surface-700/40 p-3">
                                        <p className="text-sm font-medium">{project.name}</p>
                                        <p className="text-xs text-surface-300">{project.status} · {formatDate(project.createdAt)}</p>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                                <div className="rounded-xl border border-surface-700/50 bg-surface-900/70 p-4">
                                  <h4 className="text-sm font-semibold mb-3">Related posts</h4>
                                  {related?.loading ? <p className="text-sm text-surface-300">Loading…</p> : null}
                                  {related?.error ? <p className="text-sm text-red-400">{related.error}</p> : null}
                                  {!related?.loading && !related?.error && related?.posts.length === 0 ? <p className="text-sm text-surface-300">No related posts.</p> : null}
                                  <div className="space-y-2">
                                    {related?.posts.map((post) => (
                                      <div key={post.id} className="rounded-lg bg-surface-950/70 border border-surface-700/40 p-3">
                                        <p className="text-sm font-medium">{formatLabel(post.platform)} · {formatLabel(post.contentType)}</p>
                                        <p className="text-xs text-surface-300">{post.status} · Scheduled {formatDate(post.scheduledAt)} · Posted {formatDate(post.postedAt)}</p>
                                        {post.caption ? <p className="text-xs text-surface-300 mt-2 line-clamp-2">{post.caption}</p> : null}
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      ) : null}
                    </Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
