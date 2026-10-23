"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { toast } from "react-toastify";
import {
  FileText,
  Plus,
  Edit2,
  Trash2,
  ExternalLink,
  RotateCcw,
  CheckCircle2,
  Clock,
  Globe,
  Languages,
  Sliders,
  Sparkles,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Badge from "@/components/ui/Badge";
import Switch from "@/components/ui/Switch";
import Skeleton from "@/components/ui/Skeleton";
import EmptyState from "@/components/ui/EmptyState";
import Modal from "@/components/ui/Modal";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import RichTextEditor from "@/components/ui/RichTextEditor";
import {
  useFetchPagesQuery,
  useCreatePageMutation,
  useUpdatePageMutation,
  useDeletePageMutation,
  useFetchSinglePageQuery,
} from "@/store/slices/cmsApi";

const TEMPLATES = [
  { value: "default", label: "Default Content Page" },
  { value: "about", label: "About Us Layout" },
  { value: "legal", label: "Legal / Policy Document" },
  { value: "contact", label: "Contact & Location Layout" },
  { value: "landing", label: "Marketing Landing Page" },
];

export default function CmsPagesPage() {
  const { data, isLoading, isError, error, refetch, isFetching } = useFetchPagesQuery();
  const [deletePage, { isLoading: isDeleting }] = useDeletePageMutation();

  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [selectedSlug, setSelectedSlug] = useState(null);
  const [pageToDelete, setPageToDelete] = useState(null);

  const pages = data?.pages || [];
  const storefrontBase =
    process.env.NEXT_PUBLIC_WEB_URL || "http://localhost:3000";

  const handleDelete = async () => {
    if (!pageToDelete) return;
    try {
      await deletePage(pageToDelete.slug).unwrap();
      toast.success("Page deleted successfully");
      setPageToDelete(null);
      refetch();
    } catch (err) {
      toast.error(err?.data?.error || err?.message || "Failed to delete page");
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <FileText className="w-7 h-7 text-primary" />
            Static Pages & Footer Policies
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage your storefront content pages dynamically without hardcoding (About Us, Privacy Policy, Terms & Conditions, Refund Policy, etc.).
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
          <Button
            size="sm"
            onClick={() => {
              setSelectedSlug(null);
              setIsEditorOpen(true);
            }}
            className="gap-1.5"
          >
            <Plus className="w-4 h-4" /> Create New Page
          </Button>
        </div>
      </div>

      {/* Pages List */}
      <Card>
        <CardHeader className="border-b border-border py-4 flex flex-row items-center justify-between">
          <CardTitle className="text-base font-bold text-foreground">
            All Content Pages ({pages.length})
          </CardTitle>
          <span className="text-xs text-muted-foreground">
            Changes reflect live on the website storefront
          </span>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-3">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full rounded-lg" />
              ))}
            </div>
          ) : isError ? (
            <div className="p-8 text-center text-sm text-destructive">
              Failed to load pages: {error?.data?.error || error?.message || "Unknown error"}
            </div>
          ) : pages.length === 0 ? (
            <div className="p-12">
              <EmptyState
                icon={FileText}
                title="No pages created yet"
                description="Create your first content page to publish information on your storefront."
                action={
                  <Button
                    size="sm"
                    onClick={() => {
                      setSelectedSlug(null);
                      setIsEditorOpen(true);
                    }}
                  >
                    Create First Page
                  </Button>
                }
              />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-muted/40 text-muted-foreground uppercase tracking-wider font-semibold border-b border-border">
                  <tr>
                    <th className="py-3 px-4">Page Title & Slug</th>
                    <th className="py-3 px-4">Template</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Last Updated</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {pages.map((p) => {
                    const isPublished = p.status === "published";
                    return (
                      <tr key={p._id || p.slug} className="hover:bg-muted/30 transition-colors">
                        <td className="py-3.5 px-4">
                          <div>
                            <div className="font-semibold text-foreground text-sm flex items-center gap-2">
                              <span>{p.title}</span>
                              {p.titleBn && (
                                <span className="text-xs text-muted-foreground font-normal">
                                  ({p.titleBn})
                                </span>
                              )}
                            </div>
                            <span className="font-mono text-xs text-muted-foreground">
                              /{p.slug}
                            </span>
                          </div>
                        </td>

                        <td className="py-3.5 px-4">
                          <Badge variant="secondary" className="capitalize">
                            {p.template || "default"}
                          </Badge>
                        </td>

                        <td className="py-3.5 px-4">
                          {isPublished ? (
                            <Badge variant="success" className="gap-1">
                              <CheckCircle2 className="w-3 h-3" /> Published
                            </Badge>
                          ) : (
                            <Badge variant="warning" className="gap-1">
                              <Clock className="w-3 h-3" /> Draft
                            </Badge>
                          )}
                        </td>

                        <td className="py-3.5 px-4 text-muted-foreground">
                          {p.updatedAt ? new Date(p.updatedAt).toLocaleDateString() : "—"}
                        </td>

                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <a
                              href={`${storefrontBase}/${p.slug}`}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs rounded-lg border border-border bg-background text-foreground hover:bg-muted transition-colors"
                              title="View Live on Website"
                            >
                              <ExternalLink className="w-3.5 h-3.5 text-primary" />
                              <span>View Live</span>
                            </a>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSelectedSlug(p.slug);
                                setIsEditorOpen(true);
                              }}
                              className="h-8 w-8 p-0"
                              title="Edit Page"
                            >
                              <Edit2 className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setPageToDelete(p)}
                              className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                              title="Delete Page"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Page Editor Modal */}
      {isEditorOpen && (
        <PageEditorModal
          isOpen={isEditorOpen}
          onClose={() => setIsEditorOpen(false)}
          slug={selectedSlug}
          onSaved={() => {
            setIsEditorOpen(false);
            refetch();
          }}
        />
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={Boolean(pageToDelete)}
        onClose={() => setPageToDelete(null)}
        onConfirm={handleDelete}
        title="Delete Page"
        description={`Are you sure you want to delete page "${pageToDelete?.title}" (/${pageToDelete?.slug})? This cannot be undone.`}
        confirmText={isDeleting ? "Deleting..." : "Delete"}
        variant="danger"
      />
    </div>
  );
}

function PageEditorModal({ isOpen, onClose, slug, onSaved }) {
  const isEdit = Boolean(slug);
  const { data: pageData, isLoading } = useFetchSinglePageQuery(slug, {
    skip: !isEdit,
  });
  const [createPage, { isLoading: isCreating }] = useCreatePageMutation();
  const [updatePage, { isLoading: isUpdating }] = useUpdatePageMutation();

  const isSaving = isCreating || isUpdating;

  const [activeTab, setActiveTab] = useState("en"); // "en" | "bn" | "settings"
  const [title, setTitle] = useState("");
  const [titleBn, setTitleBn] = useState("");
  const [pageSlug, setPageSlug] = useState("");
  const [template, setTemplate] = useState("default");
  const [content, setContent] = useState("");
  const [contentBn, setContentBn] = useState("");
  const [status, setStatus] = useState("published");
  const [metaTitle, setMetaTitle] = useState("");
  const [metaDescription, setMetaDescription] = useState("");

  useEffect(() => {
    if (pageData?.page && isEdit) {
      const p = pageData.page;
      setTitle(p.title || "");
      setTitleBn(p.titleBn || "");
      setPageSlug(p.slug || "");
      setTemplate(p.template || "default");
      setContent(p.content || "");
      setContentBn(p.contentBn || "");
      setStatus(p.status || "published");
      setMetaTitle(p.seo?.title || "");
      setMetaDescription(p.seo?.description || "");
    } else if (!isEdit) {
      setTitle("");
      setTitleBn("");
      setPageSlug("");
      setTemplate("default");
      setContent("");
      setContentBn("");
      setStatus("published");
      setMetaTitle("");
      setMetaDescription("");
      setActiveTab("en");
    }
  }, [pageData, isEdit]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !pageSlug.trim()) {
      toast.error("Title and slug are required");
      setActiveTab("en");
      return;
    }

    const payload = {
      title: title.trim(),
      titleBn: titleBn.trim(),
      slug: pageSlug.trim().toLowerCase().replace(/[^a-z0-9_-]+/g, "-"),
      template,
      content,
      contentBn,
      status,
      seo: {
        title: metaTitle,
        description: metaDescription,
      },
    };

    try {
      if (isEdit) {
        await updatePage({ slug, ...payload }).unwrap();
        toast.success("Page updated and revalidated live on storefront!");
      } else {
        await createPage(payload).unwrap();
        toast.success("Page created successfully!");
      }
      onSaved();
    } catch (err) {
      toast.error(err?.data?.error || err?.message || "Failed to save page");
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? `Edit Page: ${title || slug}` : "Create New Content Page"}
      description="Manage page title, bilingual content with rich text formatting, and search engine metadata."
      maxWidth="max-w-4xl"
    >
      {isLoading && isEdit ? (
        <div className="p-8 space-y-4">
          <Skeleton className="h-8 w-1/2" />
          <Skeleton className="h-28 w-full" />
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5 max-h-[78vh] overflow-y-auto pr-1">
          {/* Navigation Tabs */}
          <div className="flex items-center gap-1 border-b border-border pb-2">
            <button
              type="button"
              onClick={() => setActiveTab("en")}
              className={`inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors ${
                activeTab === "en"
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              <span>English Content</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("bn")}
              className={`inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors ${
                activeTab === "bn"
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              <Languages className="w-3.5 h-3.5" />
              <span>Bangla Content (বাংলা)</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("settings")}
              className={`inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors ${
                activeTab === "settings"
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Page Layout & SEO</span>
            </button>
          </div>

          {/* TAB 1: English Content */}
          {activeTab === "en" && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input
                  label="Page Title (English)"
                  value={title}
                  onChange={(e) => {
                    const val = e.target.value;
                    setTitle(val);
                    if (!isEdit && !pageSlug) {
                      setPageSlug(val.toLowerCase().replace(/[^a-z0-9]+/g, "-"));
                    }
                  }}
                  placeholder="e.g. Terms and Conditions"
                  required
                />
                <Input
                  label="URL Slug (Permanent)"
                  value={pageSlug}
                  onChange={(e) => setPageSlug(e.target.value)}
                  placeholder="terms-and-conditions"
                  disabled={isEdit}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
                    Page Body Content (English)
                  </label>
                  <span className="text-[11px] text-muted-foreground">
                    Format headings, bullet lists, tables, and links
                  </span>
                </div>
                <RichTextEditor
                  value={content}
                  onChange={(val) => setContent(val)}
                  placeholder="Write detailed policy or company information in English..."
                  minHeight="min-h-[260px]"
                />
              </div>
            </div>
          )}

          {/* TAB 2: Bangla Content */}
          {activeTab === "bn" && (
            <div className="space-y-4">
              <Input
                label="Page Title (Bangla - বাংলা)"
                value={titleBn}
                onChange={(e) => setTitleBn(e.target.value)}
                placeholder="e.g. ব্যবহারের শর্তাবলী / আমাদের সম্পর্কে"
              />

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
                    Page Body Content (Bangla - বাংলা)
                  </label>
                  <span className="text-[11px] text-muted-foreground">
                    বাংলা ভাষায় পেজের বিস্তারিত তথ্য লিখুন
                  </span>
                </div>
                <RichTextEditor
                  value={contentBn}
                  onChange={(val) => setContentBn(val)}
                  placeholder="বাংলায় প্যারাগ্রাফ, পয়েন্ট এবং বিস্তারিত বিবরণ লিখুন..."
                  minHeight="min-h-[260px]"
                />
              </div>
            </div>
          )}

          {/* TAB 3: Settings & SEO */}
          {activeTab === "settings" && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Select
                  label="Page Template Layout"
                  value={template}
                  onChange={(e) => setTemplate(e.target.value)}
                >
                  {TEMPLATES.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </Select>

                <div className="p-3 rounded-lg border border-border bg-muted/20 flex flex-col justify-center">
                  <Switch
                    label="Published Status"
                    description={
                      status === "published"
                        ? "Visible to storefront visitors"
                        : "Hidden draft (only visible to admin staff)"
                    }
                    checked={status === "published"}
                    onChange={(checked) => setStatus(checked ? "published" : "draft")}
                  />
                </div>
              </div>

              {/* SEO fields */}
              <div className="p-4 rounded-xl border border-border bg-muted/20 space-y-3">
                <div className="flex items-center gap-1.5 text-xs font-bold text-foreground uppercase tracking-wider">
                  <Sparkles className="w-3.5 h-3.5 text-primary" />
                  <span>Search Engine Optimization (SEO)</span>
                </div>

                <Input
                  label="SEO Meta Title"
                  value={metaTitle}
                  onChange={(e) => setMetaTitle(e.target.value)}
                  placeholder="e.g. Privacy Policy & Patient Data Security - Mem Service"
                />

                <Input
                  label="SEO Meta Description"
                  value={metaDescription}
                  onChange={(e) => setMetaDescription(e.target.value)}
                  placeholder="Brief summary displayed on Google search results (120-160 characters)"
                />
              </div>
            </div>
          )}

          {/* Modal Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-border">
            <span className="text-xs text-muted-foreground">
              Slug: <code className="text-primary font-mono font-semibold">/{pageSlug || "slug"}</code>
            </span>
            <div className="flex items-center gap-2">
              <Button type="button" variant="outline" onClick={onClose} disabled={isSaving}>
                Cancel
              </Button>
              <Button type="submit" isLoading={isSaving} className="gap-1.5">
                {isEdit ? "Update Page" : "Create Page"}
              </Button>
            </div>
          </div>
        </form>
      )}
    </Modal>
  );
}
