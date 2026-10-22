"use client";

import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import {
  Sliders,
  Phone,
  Share2,
  Search,
  BellRing,
  AlertTriangle,
  Save,
  RotateCcw,
  Upload,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Switch from "@/components/ui/Switch";
import Skeleton from "@/components/ui/Skeleton";
import { useFetchSiteSettingsQuery, useUpdateSiteSettingsMutation } from "@/store/slices/cmsApi";

const SETTINGS_TABS = [
  { id: "general", label: "General & Branding", icon: Sliders },
  { id: "contact", label: "Contact Info", icon: Phone },
  { id: "social", label: "Social Links", icon: Share2 },
  { id: "seo", label: "SEO & Meta", icon: Search },
  { id: "announcement", label: "Announcement Bar", icon: BellRing },
  { id: "maintenance", label: "Maintenance Mode", icon: AlertTriangle },
];

export default function CmsSettingsPage() {
  const [activeTab, setActiveTab] = useState("general");
  const { data, isLoading, isError, error, refetch, isFetching } = useFetchSiteSettingsQuery();
  const [updateSettings, { isLoading: isSaving }] = useUpdateSiteSettingsMutation();

  const [formData, setFormData] = useState({
    siteName: "Memservice Pharmacy",
    tagline: "",
    taglineBn: "",
    logoUrl: "",
    faviconUrl: "",
    contact: {
      phone: "01711000000",
      supportPhone: "01811000000",
      email: "info@memservice.com",
      supportEmail: "support@memservice.com",
      address: "Dhaka, Bangladesh",
      addressBn: "ঢাকা, বাংলাদেশ",
      workingHours: "24/7 Everyday",
      workingHoursBn: "২৪/৭ প্রতিদিন",
    },
    social: {
      facebook: "",
      instagram: "",
      youtube: "",
      linkedin: "",
      whatsapp: "",
    },
    seo: {
      defaultTitle: "Memservice - Authentic Online Medicine & Healthcare",
      defaultTitleBn: "মেমসার্ভিস - খাঁটি ওষুধ ও স্বাস্থ্যসেবা",
      defaultDescription: "Fast home delivery of authentic prescription medicines and healthcare items in Bangladesh.",
      defaultDescriptionBn: "বাংলাদেশে প্রেসক্রিপশন ওষুধ এবং স্বাস্থ্যসেবা পণ্যের দ্রুততম হোম ডেলিভারি।",
      defaultKeywords: ["medicine", "pharmacy", "healthcare", "bangladesh"],
      ogImageUrl: "",
    },
    header: {
      topBarEnabled: true,
      topBarText: "Free delivery on orders over ৳2000! 🚚",
      topBarTextBn: "২০০০ টাকার বেশি অর্ডারে ফ্রি ডেলিভারি! 🚚",
      topBarLink: "/offer",
    },
    maintenance: {
      enabled: false,
      message: "We are currently undergoing scheduled maintenance. Please check back shortly.",
      allowedIps: [],
    },
  });

  useEffect(() => {
    if (data?.site) {
      const s = data.site;
      setFormData((prev) => ({
        ...prev,
        siteName: s.siteName || prev.siteName,
        tagline: s.tagline || "",
        taglineBn: s.taglineBn || "",
        logoUrl: s.logoUrl || "",
        faviconUrl: s.faviconUrl || "",
        contact: { ...prev.contact, ...(s.contact || {}) },
        social: { ...prev.social, ...(s.social || {}) },
        seo: { ...prev.seo, ...(s.seo || {}) },
        header: { ...prev.header, ...(s.header || {}) },
        maintenance: { ...prev.maintenance, ...(s.maintenance || {}) },
      }));
    }
  }, [data]);

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      await updateSettings(formData).unwrap();
      toast.success("Site settings updated and storefront cache revalidated!");
    } catch (err) {
      toast.error(err?.data?.error || err?.message || "Failed to save settings");
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Sliders className="w-7 h-7 text-primary" />
            Site Settings & CMS Configuration
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Global branding, contact information, social links, SEO metadata, and maintenance switch.
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
            <Save className="w-4 h-4" /> Save Changes
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-border">
        {SETTINGS_TABS.map((tab) => {
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

      {isLoading ? (
        <Card className="p-6 space-y-4">
          <Skeleton className="h-6 w-1/3" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </Card>
      ) : (
        <form onSubmit={handleSave} className="space-y-6">
          {/* 1. General & Branding */}
          {activeTab === "general" && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-bold">General & Branding</CardTitle>
                <CardDescription className="text-xs">
                  Storefront identity, logo URLs, and multi-language taglines.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Site Name"
                    value={formData.siteName}
                    onChange={(e) => setFormData({ ...formData, siteName: e.target.value })}
                    required
                  />
                  <Input
                    label="Logo URL"
                    value={formData.logoUrl}
                    onChange={(e) => setFormData({ ...formData, logoUrl: e.target.value })}
                    placeholder="/logo.png or Cloudinary URL"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Tagline (English)"
                    value={formData.tagline}
                    onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                    placeholder="Your Trusted Healthcare Partner"
                  />
                  <Input
                    label="Tagline (Bangla)"
                    value={formData.taglineBn}
                    onChange={(e) => setFormData({ ...formData, taglineBn: e.target.value })}
                    placeholder="আপনার বিশ্বস্ত স্বাস্থ্যসেবা সহযোগী"
                  />
                </div>

                <Input
                  label="Favicon URL"
                  value={formData.faviconUrl}
                  onChange={(e) => setFormData({ ...formData, faviconUrl: e.target.value })}
                  placeholder="/favicon.ico"
                />
              </CardContent>
            </Card>
          )}

          {/* 2. Contact Info */}
          {activeTab === "contact" && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-bold">Contact & Support Details</CardTitle>
                <CardDescription className="text-xs">
                  Displayed in customer footer, checkout help, and invoice vouchers.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Primary Phone"
                    value={formData.contact.phone}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        contact: { ...formData.contact, phone: e.target.value },
                      })
                    }
                  />
                  <Input
                    label="Support Hotline"
                    value={formData.contact.supportPhone}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        contact: { ...formData.contact, supportPhone: e.target.value },
                      })
                    }
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="General Email"
                    value={formData.contact.email}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        contact: { ...formData.contact, email: e.target.value },
                      })
                    }
                  />
                  <Input
                    label="Customer Support Email"
                    value={formData.contact.supportEmail}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        contact: { ...formData.contact, supportEmail: e.target.value },
                      })
                    }
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Physical Address (English)"
                    value={formData.contact.address}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        contact: { ...formData.contact, address: e.target.value },
                      })
                    }
                  />
                  <Input
                    label="Physical Address (Bangla)"
                    value={formData.contact.addressBn}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        contact: { ...formData.contact, addressBn: e.target.value },
                      })
                    }
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Working Hours (English)"
                    value={formData.contact.workingHours}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        contact: { ...formData.contact, workingHours: e.target.value },
                      })
                    }
                  />
                  <Input
                    label="Working Hours (Bangla)"
                    value={formData.contact.workingHoursBn}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        contact: { ...formData.contact, workingHoursBn: e.target.value },
                      })
                    }
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* 3. Social Links */}
          {activeTab === "social" && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-bold">Social Media Links</CardTitle>
                <CardDescription className="text-xs">
                  Links displayed on header top bar, footer, and mobile navigation.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Facebook Page URL"
                  value={formData.social.facebook}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      social: { ...formData.social, facebook: e.target.value },
                    })
                  }
                  placeholder="https://facebook.com/..."
                />
                <Input
                  label="Instagram Profile URL"
                  value={formData.social.instagram}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      social: { ...formData.social, instagram: e.target.value },
                    })
                  }
                  placeholder="https://instagram.com/..."
                />
                <Input
                  label="WhatsApp Number / Chat Link"
                  value={formData.social.whatsapp}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      social: { ...formData.social, whatsapp: e.target.value },
                    })
                  }
                  placeholder="https://wa.me/88017..."
                />
                <Input
                  label="YouTube Channel URL"
                  value={formData.social.youtube}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      social: { ...formData.social, youtube: e.target.value },
                    })
                  }
                  placeholder="https://youtube.com/..."
                />
              </CardContent>
            </Card>
          )}

          {/* 4. SEO & Meta */}
          {activeTab === "seo" && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-bold">Global SEO & OpenGraph</CardTitle>
                <CardDescription className="text-xs">
                  Default title, descriptions, and social preview cards for search engines.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Default Meta Title (English)"
                    value={formData.seo.defaultTitle}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        seo: { ...formData.seo, defaultTitle: e.target.value },
                      })
                    }
                  />
                  <Input
                    label="Default Meta Title (Bangla)"
                    value={formData.seo.defaultTitleBn}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        seo: { ...formData.seo, defaultTitleBn: e.target.value },
                      })
                    }
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
                    Default Meta Description (English)
                  </label>
                  <textarea
                    rows={2}
                    value={formData.seo.defaultDescription}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        seo: { ...formData.seo, defaultDescription: e.target.value },
                      })
                    }
                    className="w-full text-xs p-2 rounded-md border border-input bg-card text-foreground"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
                    Default Meta Description (Bangla)
                  </label>
                  <textarea
                    rows={2}
                    value={formData.seo.defaultDescriptionBn}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        seo: { ...formData.seo, defaultDescriptionBn: e.target.value },
                      })
                    }
                    className="w-full text-xs p-2 rounded-md border border-input bg-card text-foreground"
                  />
                </div>

                <Input
                  label="OpenGraph Social Banner URL"
                  value={formData.seo.ogImageUrl}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      seo: { ...formData.seo, ogImageUrl: e.target.value },
                    })
                  }
                  placeholder="https://.../og-preview.png"
                />
              </CardContent>
            </Card>
          )}

          {/* 5. Announcement Bar */}
          {activeTab === "announcement" && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-bold">Top Announcement Bar</CardTitle>
                <CardDescription className="text-xs">
                  Ribbon banner displayed at the very top of all storefront pages.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-3 rounded-lg border border-border bg-muted/30">
                  <Switch
                    label="Show Announcement Bar"
                    description="Display promo banner on top of the storefront header"
                    checked={formData.header.topBarEnabled}
                    onChange={(checked) =>
                      setFormData({
                        ...formData,
                        header: { ...formData.header, topBarEnabled: checked },
                      })
                    }
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Announcement Text (English)"
                    value={formData.header.topBarText}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        header: { ...formData.header, topBarText: e.target.value },
                      })
                    }
                  />
                  <Input
                    label="Announcement Text (Bangla)"
                    value={formData.header.topBarTextBn}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        header: { ...formData.header, topBarTextBn: e.target.value },
                      })
                    }
                  />
                </div>

                <Input
                  label="Target Link (Optional)"
                  value={formData.header.topBarLink}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      header: { ...formData.header, topBarLink: e.target.value },
                    })
                  }
                  placeholder="/offer or https://..."
                />
              </CardContent>
            </Card>
          )}

          {/* 6. Maintenance Mode */}
          {activeTab === "maintenance" && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-bold text-destructive flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-destructive" /> Maintenance Mode Controls
                </CardTitle>
                <CardDescription className="text-xs">
                  Temporarily lock storefront access during major deployments or server audits.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-3 rounded-lg border border-destructive/30 bg-destructive/5">
                  <Switch
                    label="Enable Maintenance Mode"
                    description="Redirect public storefront visitors to maintenance page"
                    checked={formData.maintenance.enabled}
                    onChange={(checked) =>
                      setFormData({
                        ...formData,
                        maintenance: { ...formData.maintenance, enabled: checked },
                      })
                    }
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
                    Maintenance Announcement Notice
                  </label>
                  <textarea
                    rows={3}
                    value={formData.maintenance.message}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        maintenance: { ...formData.maintenance, message: e.target.value },
                      })
                    }
                    className="w-full text-xs p-2 rounded-md border border-input bg-card text-foreground"
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Floating Save Button at bottom */}
          <div className="flex justify-end pt-4 border-t border-border">
            <Button type="submit" isLoading={isSaving} className="gap-2">
              <Save className="w-4 h-4" /> Save Settings
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
