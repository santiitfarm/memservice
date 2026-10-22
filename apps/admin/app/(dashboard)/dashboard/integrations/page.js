"use client";

import React, { useState, useMemo } from "react";
import { useSession } from "next-auth/react";
import {
  Layers,
  CreditCard,
  Truck,
  Mail,
  Activity,
  Image as ImageIcon,
  KeyRound,
  RotateCcw,
  Settings2,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import Switch from "@/components/ui/Switch";
import Skeleton from "@/components/ui/Skeleton";
import EmptyState from "@/components/ui/EmptyState";
import { toast } from "react-toastify";
import {
  useFetchIntegrationsQuery,
  useUpdateIntegrationMutation,
  useTestIntegrationMutation,
} from "@/store/slices/integrationApi";
import { INTEGRATION_SCHEMAS } from "./_lib/integrationSchemas";
import IntegrationConfigModal from "./_components/IntegrationConfigModal";

const CATEGORY_TABS = [
  { id: "all", label: "All Integrations", icon: Layers },
  { id: "payment", label: "Payments", icon: CreditCard },
  { id: "courier", label: "Couriers", icon: Truck },
  { id: "email", label: "Email", icon: Mail },
  { id: "tracking", label: "Tracking & CAPI", icon: Activity },
  { id: "media", label: "Media & Auth", icon: ImageIcon },
];

export default function IntegrationHubPage() {
  const { data: session } = useSession();
  const userRole = session?.user?.role || "admin";
  const isSuperAdmin = userRole === "super-admin";

  const [activeTab, setActiveTab] = useState("all");
  const [selectedKey, setSelectedKey] = useState(null);

  const { data, isLoading, isError, error, refetch, isFetching } = useFetchIntegrationsQuery();
  const [updateIntegration] = useUpdateIntegrationMutation();
  const [testIntegration, { isLoading: isTesting }] = useTestIntegrationMutation();

  const dbIntegrations = useMemo(() => {
    const map = {};
    if (data?.integrations) {
      data.integrations.forEach((item) => {
        map[item.key] = item;
      });
    }
    return map;
  }, [data]);

  // Merge schemas with DB records
  const allProviders = useMemo(() => {
    return Object.entries(INTEGRATION_SCHEMAS).map(([key, schema]) => {
      const dbRecord = dbIntegrations[key] || {};
      return {
        key,
        schema,
        dbRecord,
        enabled: Boolean(dbRecord.enabled),
        mode: dbRecord.mode || "sandbox",
        status: dbRecord.status || (dbRecord.secrets && Object.keys(dbRecord.secrets).length > 0 ? "configured" : "unconfigured"),
      };
    });
  }, [dbIntegrations]);

  const filteredProviders = useMemo(() => {
    if (activeTab === "all") return allProviders;
    if (activeTab === "media") {
      return allProviders.filter((p) => p.schema.category === "media" || p.schema.category === "auth");
    }
    return allProviders.filter((p) => p.schema.category === activeTab);
  }, [allProviders, activeTab]);

  const handleToggleEnabled = async (e, provider) => {
    e.stopPropagation();
    if (!isSuperAdmin) {
      toast.error("Only super-administrators can toggle integration status");
      return;
    }

    try {
      await updateIntegration({
        key: provider.key,
        enabled: !provider.enabled,
      }).unwrap();
      toast.success(`${provider.schema.name} ${!provider.enabled ? "enabled" : "disabled"}`);
    } catch (err) {
      toast.error(err?.data?.error || err?.message || "Failed to toggle integration");
    }
  };

  const getStatusBadge = (provider) => {
    if (!provider.enabled) {
      return <Badge variant="secondary">Disabled</Badge>;
    }
    if (provider.status === "configured" || provider.status === "connected") {
      return <Badge variant="success">Connected</Badge>;
    }
    if (provider.status === "error") {
      return <Badge variant="destructive">Error</Badge>;
    }
    return <Badge variant="warning">Not Configured</Badge>;
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Layers className="w-7 h-7 text-primary" />
            Integration Hub
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage Bangladesh payment gateways, automated couriers, transactional emails, and Meta tracking credentials.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isFetching}
            className="gap-1.5"
          >
            <RotateCcw className={`w-4 h-4 ${isFetching ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-border">
        {CATEGORY_TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              type="button"
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                isActive
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-transparent text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Grid of Providers */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="p-5 space-y-3">
              <Skeleton className="h-6 w-1/2" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-8 w-full mt-4" />
            </Card>
          ))}
        </div>
      ) : isError ? (
        <div className="p-8 text-center space-y-3 border border-border rounded-xl bg-card">
          <AlertCircle className="w-8 h-8 text-destructive mx-auto" />
          <p className="text-sm text-destructive font-medium">
            Failed to load integrations: {error?.data?.error || error?.message || "Unknown error"}
          </p>
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            Retry
          </Button>
        </div>
      ) : filteredProviders.length === 0 ? (
        <EmptyState
          icon={Layers}
          title="No integrations in this category"
          description="Check another category tab above."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProviders.map((provider) => {
            const { key, schema, enabled, mode } = provider;
            return (
              <Card
                key={key}
                onClick={() => setSelectedKey(key)}
                className={`cursor-pointer transition-all hover:shadow-md hover:border-primary/40 flex flex-col justify-between ${
                  enabled ? "border-primary/20" : "opacity-90"
                }`}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <CardTitle className="text-base font-bold text-foreground">
                        {schema.name}
                      </CardTitle>
                      <span className="text-[11px] font-mono text-muted-foreground uppercase">
                        {schema.category} • {key}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0" onClick={(e) => e.stopPropagation()}>
                      <Switch
                        checked={enabled}
                        onChange={(checked) => handleToggleEnabled(e, provider)}
                        disabled={!isSuperAdmin}
                      />
                    </div>
                  </div>
                  <CardDescription className="text-xs line-clamp-2 mt-1">
                    {schema.description}
                  </CardDescription>
                </CardHeader>

                <CardContent className="pt-0">
                  <div className="flex items-center justify-between text-xs pt-3 border-t border-border">
                    <div className="flex items-center gap-2">
                      {getStatusBadge(provider)}
                      {enabled && (
                        <span
                          className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded ${
                            mode === "live"
                              ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                              : "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                          }`}
                        >
                          {mode}
                        </span>
                      )}
                    </div>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedKey(key)}
                      className="text-xs h-7 gap-1"
                    >
                      <Settings2 className="w-3.5 h-3.5" /> Configure
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Configuration Modal Drawer */}
      {selectedKey && (
        <IntegrationConfigModal
          isOpen={Boolean(selectedKey)}
          onClose={() => setSelectedKey(null)}
          integrationKey={selectedKey}
          schema={INTEGRATION_SCHEMAS[selectedKey]}
          existingData={dbIntegrations[selectedKey]}
          userRole={userRole}
        />
      )}
    </div>
  );
}
