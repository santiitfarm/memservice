"use client";

import React, { useState, useRef } from "react";
import Image from "next/image";
import { toast } from "react-toastify";
import {
  ImageIcon,
  Upload,
  Search,
  Copy,
  Check,
  Trash2,
  ExternalLink,
  RotateCcw,
  FileImage,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Skeleton from "@/components/ui/Skeleton";
import EmptyState from "@/components/ui/EmptyState";
import Modal from "@/components/ui/Modal";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import {
  useFetchMediaQuery,
  useUploadMediaMutation,
  useDeleteMediaMutation,
} from "@/store/slices/cmsApi";

export default function CmsMediaPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [copiedId, setCopiedId] = useState(null);
  const [assetToDelete, setAssetToDelete] = useState(null);
  const [previewAsset, setPreviewAsset] = useState(null);

  const fileInputRef = useRef(null);

  const { data, isLoading, isError, error, refetch, isFetching } = useFetchMediaQuery({
    search: searchTerm,
    limit: 30,
  });
  const [uploadMedia, { isLoading: isUploading }] = useUploadMediaMutation();
  const [deleteMedia, { isLoading: isDeleting }] = useDeleteMediaMutation();

  const assets = data?.assets || [];

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size cannot exceed 5MB.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", "memservice/cms");

    try {
      await uploadMedia(formData).unwrap();
      toast.success("Image uploaded to Cloudinary successfully!");
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (err) {
      toast.error(err?.data?.error || err?.message || "Failed to upload image");
    }
  };

  const handleCopyUrl = (url, id) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    toast.success("Image URL copied to clipboard!");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDelete = async () => {
    if (!assetToDelete) return;
    try {
      await deleteMedia(assetToDelete._id).unwrap();
      toast.success("Media asset deleted");
      setAssetToDelete(null);
    } catch (err) {
      toast.error(err?.data?.error || err?.message || "Failed to delete media asset");
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <ImageIcon className="w-7 h-7 text-primary" />
            Media Library & Assets
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Upload and organize CDN-hosted images, product banners, logos, and doctor avatars.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept="image/jpeg,image/png,image/webp,image/avif,image/svg+xml"
            className="hidden"
          />
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
            onClick={() => fileInputRef.current?.click()}
            isLoading={isUploading}
            className="gap-1.5"
          >
            <Upload className="w-4 h-4" /> Upload New Image
          </Button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="max-w-md">
        <Input
          placeholder="Search media by file name or public ID..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          leftIcon={<Search className="w-4 h-4 text-muted-foreground" />}
        />
      </div>

      {/* Media Grid */}
      <Card>
        <CardHeader className="border-b border-border py-4">
          <CardTitle className="text-base font-bold text-foreground">
            All Assets ({data?.total ?? assets.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          {isLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {[...Array(12)].map((_, i) => (
                <Skeleton key={i} className="aspect-square w-full rounded-xl" />
              ))}
            </div>
          ) : isError ? (
            <div className="p-8 text-center text-sm text-destructive">
              Failed to load media assets: {error?.data?.error || error?.message || "Unknown error"}
            </div>
          ) : assets.length === 0 ? (
            <EmptyState
              icon={FileImage}
              title="No media assets found"
              description={
                searchTerm
                  ? `No images matched "${searchTerm}".`
                  : "Upload your first image to populate the Cloudinary media library."
              }
              action={
                <Button size="sm" onClick={() => fileInputRef.current?.click()}>
                  Upload First Image
                </Button>
              }
            />
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {assets.map((asset) => (
                <div
                  key={asset._id}
                  className="group relative rounded-xl border border-border bg-card overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col"
                >
                  <div
                    className="relative aspect-square w-full bg-muted cursor-pointer"
                    onClick={() => setPreviewAsset(asset)}
                  >
                    <Image
                      src={asset.secureUrl || asset.url}
                      alt={asset.fileName || "Media"}
                      fill
                      className="object-cover transition-transform group-hover:scale-105"
                      sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 16vw"
                    />
                  </div>

                  <div className="p-2 space-y-1 bg-card border-t border-border">
                    <p className="text-[11px] font-medium text-foreground truncate" title={asset.fileName}>
                      {asset.fileName}
                    </p>
                    <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                      <span>{asset.format?.toUpperCase()}</span>
                      <span>{asset.sizeBytes ? `${Math.round(asset.sizeBytes / 1024)} KB` : ""}</span>
                    </div>

                    <div className="flex items-center justify-between pt-1 border-t border-border/60">
                      <button
                        type="button"
                        onClick={() => handleCopyUrl(asset.secureUrl || asset.url, asset._id)}
                        className="text-xs p-1 text-muted-foreground hover:text-foreground flex items-center gap-1"
                        title="Copy Image URL"
                      >
                        {copiedId === asset._id ? (
                          <Check className="w-3.5 h-3.5 text-emerald-500" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                        <span className="text-[10px]">{copiedId === asset._id ? "Copied" : "Copy"}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setAssetToDelete(asset)}
                        className="p-1 text-destructive hover:text-destructive/80"
                        title="Delete Image"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Image Preview Modal */}
      {previewAsset && (
        <Modal
          isOpen={Boolean(previewAsset)}
          onClose={() => setPreviewAsset(null)}
          title={previewAsset.fileName}
          maxWidth="max-w-2xl"
        >
          <div className="space-y-4">
            <div className="relative aspect-video w-full rounded-lg overflow-hidden bg-muted">
              <Image
                src={previewAsset.secureUrl || previewAsset.url}
                alt={previewAsset.fileName}
                fill
                className="object-contain"
              />
            </div>
            <div className="flex items-center justify-between text-xs font-mono bg-muted/40 p-2.5 rounded-lg border border-border">
              <span className="truncate flex-1 mr-2">{previewAsset.secureUrl || previewAsset.url}</span>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleCopyUrl(previewAsset.secureUrl || previewAsset.url, previewAsset._id)}
                className="text-xs shrink-0"
              >
                Copy Link
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={Boolean(assetToDelete)}
        onClose={() => setAssetToDelete(null)}
        onConfirm={handleDelete}
        title="Delete Media Asset"
        description={`Are you sure you want to delete "${assetToDelete?.fileName}"? References across products and CMS may break.`}
        confirmText={isDeleting ? "Deleting..." : "Delete"}
        variant="danger"
      />
    </div>
  );
}
