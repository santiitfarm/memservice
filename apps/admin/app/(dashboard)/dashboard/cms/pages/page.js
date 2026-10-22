"use client";

import React, { useState } from "react";
import Link from "next/link";
import { toast } from "react-toastify";
import {
  FileText,
  Plus,
  Edit2,
  Trash2,
  ExternalLink,
  RotateCcw,
  Eye,
  CheckCircle2,
  Clock,
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
  const [createPage, { isLoading: isCreating }] = useCreatePageMutation();
  const [updatePage, { isLoading: isUpdating }] = useUpdatePageMutation();
  const [deletePage, { isLoading: isDeleting }] = useDeletePageMutation();

  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [selectedSlug, setSelectedSlug] = useState(null);
  const [pageToDelete, setPageToDelete] = useState(null);

  const pages = data?.pages || [];

  const handleDelete = async () => {
    if (!pageToDelete) return;
    try {
      await deletePage(pageToDelete.slug).unwrap();
      toast.success("Page deleted successfully");
      setPageToDelete(null);
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
            Static Pages & Legal Policies
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Create and edit content pages like About Us, Privacy Policy, Terms & Conditions, and Return Policy.
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
        <CardHeader className="border-b border-border py-4">
          <CardTitle className="text-base font-bold text-foreground">
            All Pages ({pages.length})
          </CardTitle>
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
                        <td className="py-3 px-4">
                          <div>
                            <div className="font-semibold text-foreground text-sm">
                              {p.title}
                            </div>
                            <span className="font-mono text-xs text-muted-foreground">
                              /{p.slug}
                            </span>
                          </div>
                        </td>

                        <td className="py-3 px-4">
                          <Badge variant="secondary" className="capitalize">
                            {p.template || "default"}
                          </Badge>
                        </td>

                        <td className="py-3 px-4">
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

                        <td className="py-3 px-4 text-muted-foreground">
                          {p.updatedAt ? new Date(p.updatedAt).toLocaleDateString() : "—"}
                        </td>

                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <a
                              href={`http://localhost:3000/${p.slug}`}
                              target="_blank"
                              rel="noreferrer"
                              className="p-1.5 text-muted-foreground hover:text-foreground rounded"
                              title="Preview on Storefront"
                            >
                              <ExternalLink className="w-4 h-4" />
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

      {/* Page Editor Modal / Drawer */}
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
  const { data: pageData, isLoading } = useFetchSinglePageQuery(slug, { skip: !isEdit });
  const [createPage, { isLoading: isCreating }] = useCreatePageMutation();
  const [updatePage, { isLoading: isUpdating }] = useUpdatePageMutation();

  const isSaving = isCreating || isUpdating;

  const [title, setTitle] = useState("");
  const [titleBn, setTitleBn] = useState("");
  const [pageSlug, setPageSlug] = useState("");
  const [template, setTemplate] = useState("default");
  const [content, setContent] = useState("");
  const [contentBn, setContentBn] = useState("");
  const [status, setStatus] = useState("published");
  const [metaTitle, setMetaTitle] = useState("");
  const [metaDescription, setMetaDescription] = useState("");

  React.useEffect(() => {
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
    }
  }, [pageData, isEdit]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !pageSlug.trim()) {
      toast.error("Title and slug are required");
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
        toast.success("Page updated and revalidated!");
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
      title={isEdit ? "Edit Content Page" : "Create New Page"}
      description="Manage page layout, rich text copy, and search engine metadata."
      maxWidth="max-w-3xl"
    >
      {isLoading && isEdit ? (
        <div className="p-8 space-y-4">
          <Skeleton className="h-8 w-1/2" />
          <Skeleton className="h-28 w-full" />
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4 max-h-[75vh] overflow-y-auto pr-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Page Title (English)"
              value={title}
              onChange={(e) => {
                const val = e.target.value;
                setTitle(val);
                if (!isEdit) {
                  setPageSlug(val.toLowerCase().replace(/[^a-z0-9]+/g, "-"));
                }
              }}
              placeholder="e.g. Terms and Conditions"
              required
            />
            <Input
              label="Page Title (Bangla)"
              value={titleBn}
              onChange={(e) => setTitleBn(e.target.value)}
              placeholder="e.g. ব্যবহারের শর্তাবলী"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="URL Slug"
              value={pageSlug}
              onChange={(e) => setPageSlug(e.target.value)}
              placeholder="terms-and-conditions"
              disabled={isEdit}
              required
            />
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
          </div>

          {/* Content (English) */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
              Page Content (HTML / Rich Text - English)
            </label>
            <textarea
              rows={6}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="<p>Enter page content here. HTML tags like <h2>, <p>, <ul>, <li> are allowed.</p>"
              className="w-full text-xs font-mono p-3 rounded-md border border-input bg-card text-foreground"
            />
          </div>

          {/* Content (Bangla) */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
              Page Content (HTML / Rich Text - Bangla)
            </label>
            <textarea
              rows={4}
              value={contentBn}
              onChange={(e) => setContentBn(e.target.value)}
              placeholder="বাংলা অনুচ্ছেদ লিখুন..."
              className="w-full text-xs font-mono p-3 rounded-md border border-input bg-card text-foreground"
            />
          </div>

          {/* SEO fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 rounded-lg border border-border bg-muted/20">
            <Input
              label="SEO Title Tag"
              value={metaTitle}
              onChange={(e) => setMetaTitle(e.target.value)}
              placeholder="Leave blank to use page title"
            />
            <Input
              label="SEO Meta Description"
              value={metaDescription}
              onChange={(e) => setMetaDescription(e.target.value)}
              placeholder="Brief summary for Google"
            />
          </div>

          {/* Status switch */}
          <div className="p-3 rounded-lg border border-border bg-muted/30">
            <Switch
              label="Published Live"
              description="Make this page publicly accessible to storefront visitors"
              checked={status === "published"}
              onChange={(checked) => setStatus(checked ? "published" : "draft")}
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-3 border-t border-border">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSaving}>
              Cancel
            </Button>
            <Button type="submit" isLoading={isSaving}>
              {isEdit ? "Update Page" : "Create Page"}
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
}
