"use client";

import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import {
  Layout,
  ArrowUp,
  ArrowDown,
  Save,
  RotateCcw,
  CheckCircle2,
  XCircle,
  Eye,
  Sliders,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Switch from "@/components/ui/Switch";
import Skeleton from "@/components/ui/Skeleton";
import {
  useFetchHomeLayoutQuery,
  useUpdateHomeLayoutMutation,
} from "@/store/slices/cmsApi";

const DEFAULT_SECTIONS = [
  { id: "hero_slider", label: "Hero Banner Slider", description: "Top full-width promotional carousel with auto-play", enabled: true },
  { id: "trust_badges", label: "Trust Badges & Promises", description: "100% Genuine, Temperature Controlled, Fast Delivery badges", enabled: true },
  { id: "prescription_banner", label: "Prescription Upload Banner", description: "Quick 1-click prescription photo upload CTA", enabled: true },
  { id: "departments", label: "Medical Departments & Specialty", description: "Grid of medical categories with doctor consultation links", enabled: true },
  { id: "featured_products", label: "Featured Products Grid", description: "Curated trending and essential healthcare items", enabled: true },
  { id: "promo_banners", label: "Promotional Banner Grid", description: "Discount & seasonal brand banners", enabled: true },
  { id: "best_sellers", label: "Best Selling Medicines", description: "Top ordered OTC medicines and wellness products", enabled: true },
  { id: "doctor_callout", label: "Doctor Video Consultation Card", description: "Book appointment with verified specialists", enabled: true },
  { id: "brand_slider", label: "Pharmaceutical Brands Slider", description: "Square Pharmaceuticals, Incepta, Beximco, etc.", enabled: true },
  { id: "testimonials", label: "Patient Testimonials & Reviews", description: "Verified customer reviews and feedback quotes", enabled: true },
];

export default function HomeLayoutPage() {
  const { data, isLoading, refetch, isFetching } = useFetchHomeLayoutQuery();
  const [updateHomeLayout, { isLoading: isSaving }] = useUpdateHomeLayoutMutation();

  const [sections, setSections] = useState(DEFAULT_SECTIONS);

  useEffect(() => {
    if (data?.home?.layout && Array.isArray(data.home.layout) && data.home.layout.length > 0) {
      // Merge with default definitions to keep descriptions
      const existingIds = new Set(data.home.layout.map((s) => s.id));
      const merged = data.home.layout.map((s) => {
        const def = DEFAULT_SECTIONS.find((d) => d.id === s.id);
        return {
          id: s.id,
          label: s.label || def?.label || s.id,
          description: def?.description || "",
          enabled: s.enabled !== false,
        };
      });

      // Add any missing default sections to the end
      DEFAULT_SECTIONS.forEach((d) => {
        if (!existingIds.has(d.id)) {
          merged.push(d);
        }
      });

      setSections(merged);
    }
  }, [data]);

  const moveSection = (index, direction) => {
    const target = index + direction;
    if (target < 0 || target >= sections.length) return;
    const copy = [...sections];
    const temp = copy[index];
    copy[index] = copy[target];
    copy[target] = temp;
    setSections(copy);
  };

  const toggleSection = (index) => {
    const copy = [...sections];
    copy[index].enabled = !copy[index].enabled;
    setSections(copy);
  };

  const handleSave = async () => {
    try {
      await updateHomeLayout({ sections }).unwrap();
      toast.success("Homepage section layout saved and cached storefront revalidated!");
    } catch (err) {
      toast.error(err?.data?.error || err?.message || "Failed to save layout");
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Layout className="w-7 h-7 text-primary" />
            Homepage Layout Builder
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Enable, disable, and drag/order sections on the public homepage.
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
          <Button size="sm" onClick={handleSave} isLoading={isSaving} className="gap-1.5">
            <Save className="w-4 h-4" /> Save Layout
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3 border-b border-border">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base font-bold text-foreground">
                Homepage Flow Structure
              </CardTitle>
              <CardDescription className="text-xs">
                Sections will appear on the storefront from top to bottom in this exact order.
              </CardDescription>
            </div>
            <a
              href="http://localhost:3000"
              target="_blank"
              rel="noreferrer"
              className="text-xs text-primary hover:underline flex items-center gap-1"
            >
              <Eye className="w-3.5 h-3.5" /> View Live Storefront
            </a>
          </div>
        </CardHeader>
        <CardContent className="p-4">
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(6)].map((_, i) => (
                <Skeleton key={i} className="h-14 w-full rounded-lg" />
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {sections.map((section, idx) => (
                <div
                  key={section.id}
                  className={`flex items-center justify-between p-3.5 rounded-xl border transition-all ${
                    section.enabled
                      ? "border-border bg-card shadow-sm"
                      : "border-border/60 bg-muted/30 opacity-60"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-xs font-bold text-muted-foreground shrink-0">
                      {idx + 1}
                    </span>
                    <div>
                      <div className="font-semibold text-foreground text-sm flex items-center gap-2">
                        <span>{section.label}</span>
                        <span className="text-[11px] font-mono text-muted-foreground">
                          ({section.id})
                        </span>
                      </div>
                      {section.description && (
                        <p className="text-xs text-muted-foreground">
                          {section.description}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Switch
                      checked={section.enabled}
                      onChange={() => toggleSection(idx)}
                    />

                    <div className="flex items-center gap-1 ml-2 pl-2 border-l border-border">
                      <button
                        type="button"
                        onClick={() => moveSection(idx, -1)}
                        disabled={idx === 0}
                        className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-muted disabled:opacity-30 transition-colors"
                        title="Move Up"
                      >
                        <ArrowUp className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => moveSection(idx, 1)}
                        disabled={idx === sections.length - 1}
                        className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-muted disabled:opacity-30 transition-colors"
                        title="Move Down"
                      >
                        <ArrowDown className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
