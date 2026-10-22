"use client";

import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Switch from "@/components/ui/Switch";
import Badge from "@/components/ui/Badge";
import {
  useUpdateIntegrationMutation,
  useTestIntegrationMutation,
} from "@/store/slices/integrationApi";
import {
  ShieldAlert,
  Copy,
  Check,
  ExternalLink,
  Zap,
  Lock,
  Eye,
  EyeOff,
  AlertTriangle,
  RotateCcw,
} from "lucide-react";

export default function IntegrationConfigModal({
  isOpen,
  onClose,
  integrationKey,
  schema,
  existingData,
  userRole = "admin",
}) {
  const isSuperAdmin = userRole === "super-admin";

  const [enabled, setEnabled] = useState(false);
  const [mode, setMode] = useState("sandbox"); // 'sandbox' | 'live'
  const [config, setConfig] = useState({});
  const [secrets, setSecrets] = useState({});
  const [revealedSecrets, setRevealedSecrets] = useState({});
  const [copiedKey, setCopiedKey] = useState(null);
  const [testResult, setTestResult] = useState(null);

  const [updateIntegration, { isLoading: isSaving }] = useUpdateIntegrationMutation();
  const [testIntegration, { isLoading: isTesting }] = useTestIntegrationMutation();

  useEffect(() => {
    if (existingData) {
      setEnabled(Boolean(existingData.enabled));
      setMode(existingData.mode || "sandbox");
      setConfig(existingData.config || {});
      setSecrets(existingData.secrets || {});
    } else {
      setEnabled(false);
      setMode("sandbox");
      const defaultCfg = {};
      schema?.config?.forEach((c) => {
        if (c.default) defaultCfg[c.key] = c.default;
      });
      setConfig(defaultCfg);
      setSecrets({});
    }
    setRevealedSecrets({});
    setTestResult(null);
  }, [existingData, schema, isOpen]);

  if (!schema) return null;

  const handleCopy = (text, key) => {
    const fullUrl = text.startsWith("http") ? text : `${window.location.origin}${text}`;
    navigator.clipboard.writeText(fullUrl);
    setCopiedKey(key);
    toast.success("Copied to clipboard!");
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleTestConnection = async () => {
    setTestResult(null);
    try {
      const res = await testIntegration(integrationKey).unwrap();
      setTestResult(res?.result || { ok: res?.success, message: "Connection test completed" });
      if (res?.success) {
        toast.success("Integration test connection succeeded!");
      } else {
        toast.error("Test connection reported issues. Check details below.");
      }
    } catch (err) {
      const errObj = {
        ok: false,
        error: err?.data?.error || err?.message || "Connection test failed",
      };
      setTestResult(errObj);
      toast.error(errObj.error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isSuperAdmin) {
      toast.error("Only super-administrators can update integration credentials.");
      return;
    }

    try {
      await updateIntegration({
        key: integrationKey,
        enabled,
        mode,
        config,
        secrets,
      }).unwrap();

      toast.success(`${schema.name} settings updated successfully`);
      onClose();
    } catch (err) {
      toast.error(err?.data?.error || err?.message || "Failed to save integration settings");
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`${schema.name} Configuration`}
      description={schema.description}
      maxWidth="max-w-2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-5 max-h-[75vh] overflow-y-auto pr-1">
        {/* Super admin warning */}
        {!isSuperAdmin && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 text-xs font-medium">
            <ShieldAlert className="w-4 h-4 shrink-0" />
            <span>
              Read-only mode: Only users with the <strong>Super-Admin</strong> role can modify encrypted credentials.
            </span>
          </div>
        )}

        {/* Master Enabled & Mode switches */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 rounded-xl border border-border bg-card">
          <Switch
            label="Enable Integration"
            description="Activate this service across the store"
            checked={enabled}
            onChange={(checked) => setEnabled(checked)}
            disabled={!isSuperAdmin}
          />

          <div className="space-y-1">
            <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Environment Mode
            </div>
            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => setMode("sandbox")}
                disabled={!isSuperAdmin}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
                  mode === "sandbox"
                    ? "bg-amber-500 text-white border-amber-600 shadow-sm"
                    : "bg-muted text-muted-foreground border-border hover:bg-muted/80"
                }`}
              >
                Sandbox / Test
              </button>
              <button
                type="button"
                onClick={() => setMode("live")}
                disabled={!isSuperAdmin}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
                  mode === "live"
                    ? "bg-emerald-600 text-white border-emerald-700 shadow-sm"
                    : "bg-muted text-muted-foreground border-border hover:bg-muted/80"
                }`}
              >
                Live Production
              </button>
            </div>
          </div>
        </div>

        {/* Live Mode Warning */}
        {mode === "live" && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>
              <strong>Production Live Mode Active:</strong> Live payments and real courier parcels will be generated.
            </span>
          </div>
        )}

        {/* Webhook & Callback URL if applicable */}
        {schema.webhookUrl && (
          <div className="p-3 rounded-lg border border-border bg-muted/40 space-y-1.5">
            <div className="flex items-center justify-between text-xs font-semibold text-foreground">
              <span>Webhook / Callback URL</span>
              <span className="text-[11px] text-muted-foreground">Copy into provider dashboard</span>
            </div>
            <div className="flex items-center gap-2 bg-card p-2 rounded-md border border-border font-mono text-xs">
              <span className="truncate flex-1 text-muted-foreground">
                {schema.webhookUrl}
              </span>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={() => handleCopy(schema.webhookUrl, "webhook")}
                className="h-7 px-2 text-xs gap-1"
              >
                {copiedKey === "webhook" ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                Copy
              </Button>
            </div>
          </div>
        )}

        {/* Secret Fields */}
        {schema.secrets?.length > 0 && (
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-primary" /> Encrypted Secrets
              </h4>
              {schema.docsUrl && (
                <a
                  href={schema.docsUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-primary hover:underline flex items-center gap-1"
                >
                  Provider Docs <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>

            <div className="space-y-3">
              {schema.secrets.map((sec) => {
                const val = secrets[sec.key] || "";
                const isMasked = typeof val === "string" && val.startsWith("****");
                const isRevealed = Boolean(revealedSecrets[sec.key]);

                return (
                  <div key={sec.key} className="space-y-1">
                    <label className="text-xs font-medium text-foreground block">
                      {sec.label} {sec.required && <span className="text-destructive">*</span>}
                    </label>

                    <div className="flex items-center gap-2">
                      <Input
                        type={isRevealed ? "text" : "password"}
                        value={val}
                        onChange={(e) =>
                          setSecrets((prev) => ({ ...prev, [sec.key]: e.target.value }))
                        }
                        placeholder={isMasked ? "Encrypted (****)" : "Enter secret"}
                        disabled={!isSuperAdmin}
                        className="font-mono text-xs"
                      />

                      {isMasked ? (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setSecrets((prev) => ({ ...prev, [sec.key]: "" }))}
                          disabled={!isSuperAdmin}
                          className="shrink-0 text-xs"
                        >
                          Replace
                        </Button>
                      ) : (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            setRevealedSecrets((prev) => ({
                              ...prev,
                              [sec.key]: !prev[sec.key],
                            }))
                          }
                          className="shrink-0 p-2"
                        >
                          {isRevealed ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Config Fields */}
        {schema.config?.length > 0 && (
          <div className="space-y-3 pt-2">
            <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">
              Service Parameters & Configuration
            </h4>

            <div className="space-y-3">
              {schema.config.map((cfg) => {
                const val = config[cfg.key] ?? cfg.default ?? "";

                if (cfg.multiline) {
                  return (
                    <div key={cfg.key} className="space-y-1">
                      <label className="text-xs font-medium text-foreground block">
                        {cfg.label} {cfg.required && <span className="text-destructive">*</span>}
                      </label>
                      <textarea
                        value={val}
                        onChange={(e) =>
                          setConfig((prev) => ({ ...prev, [cfg.key]: e.target.value }))
                        }
                        disabled={!isSuperAdmin}
                        rows={3}
                        className="w-full text-xs p-2 rounded-md border border-input bg-card text-foreground"
                      />
                    </div>
                  );
                }

                return (
                  <Input
                    key={cfg.key}
                    label={cfg.label}
                    value={val}
                    onChange={(e) =>
                      setConfig((prev) => ({ ...prev, [cfg.key]: e.target.value }))
                    }
                    disabled={!isSuperAdmin}
                    required={cfg.required}
                  />
                );
              })}
            </div>
          </div>
        )}

        {/* Live Connection Test Box */}
        <div className="pt-2">
          <div className="flex items-center justify-between p-3 rounded-xl border border-border bg-card">
            <div>
              <div className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-primary" /> Live Connection Test
              </div>
              <div className="text-[11px] text-muted-foreground mt-0.5">
                Ping the provider API to verify credentials and connectivity.
              </div>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleTestConnection}
              isLoading={isTesting}
              className="gap-1.5 text-xs shrink-0"
            >
              <RotateCcw className={`w-3.5 h-3.5 ${isTesting ? "animate-spin" : ""}`} />
              Test Connection
            </Button>
          </div>

          {testResult && (
            <div
              className={`mt-2 p-3 rounded-lg text-xs border ${
                testResult.ok
                  ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800"
                  : "bg-red-50 dark:bg-red-950/40 text-red-800 dark:text-red-300 border-red-200 dark:border-red-800"
              }`}
            >
              <div className="font-bold flex items-center gap-1.5">
                {testResult.ok ? (
                  <Badge variant="success">Connected</Badge>
                ) : (
                  <Badge variant="destructive">Error</Badge>
                )}
                <span>{testResult.message || (testResult.ok ? "Test Succeeded" : "Test Failed")}</span>
              </div>
              {testResult.error && (
                <div className="mt-1 font-mono text-[11px] break-all opacity-90">
                  {testResult.error}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
          <Button type="button" variant="outline" onClick={onClose} disabled={isSaving}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isSaving} disabled={!isSuperAdmin}>
            Save Configuration
          </Button>
        </div>
      </form>
    </Modal>
  );
}
