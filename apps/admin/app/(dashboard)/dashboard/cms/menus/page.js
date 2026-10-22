"use client";

import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import {
  Menu as MenuIcon,
  Plus,
  Trash2,
  Edit2,
  ArrowUp,
  ArrowDown,
  Save,
  RotateCcw,
  ExternalLink,
  ChevronRight,
  FolderTree,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Switch from "@/components/ui/Switch";
import Badge from "@/components/ui/Badge";
import Skeleton from "@/components/ui/Skeleton";
import Modal from "@/components/ui/Modal";
import {
  useFetchMenusQuery,
  useUpdateMenuMutation,
} from "@/store/slices/cmsApi";

const MENU_LOCATIONS = [
  { id: "header", label: "Header Main Navigation" },
  { id: "mobile", label: "Mobile Drawer Menu" },
  { id: "footer-1", label: "Footer Col 1 (Quick Links)" },
  { id: "footer-2", label: "Footer Col 2 (Categories)" },
  { id: "footer-3", label: "Footer Col 3 (Customer Care)" },
  { id: "footer-4", label: "Footer Col 4 (Company & Legal)" },
];

export default function CmsMenusPage() {
  const [selectedLocation, setSelectedLocation] = useState("header");
  const { data, isLoading, refetch, isFetching } = useFetchMenusQuery();
  const [updateMenu, { isLoading: isSaving }] = useUpdateMenuMutation();

  const [currentMenuTitle, setCurrentMenuTitle] = useState("");
  const [menuItems, setMenuItems] = useState([]);
  const [editingItem, setEditingItem] = useState(null); // { item, parentIndex, childIndex }
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (data?.menus) {
      const found = data.menus.find((m) => m.location === selectedLocation);
      if (found) {
        setCurrentMenuTitle(found.title || "");
        setMenuItems(found.items || []);
      } else {
        setCurrentMenuTitle("");
        setMenuItems([]);
      }
    }
  }, [data, selectedLocation]);

  const handleSaveMenu = async () => {
    try {
      await updateMenu({
        location: selectedLocation,
        title: currentMenuTitle,
        items: menuItems,
      }).unwrap();
      toast.success("Navigation menu saved and cache invalidated!");
    } catch (err) {
      toast.error(err?.data?.error || err?.message || "Failed to save menu");
    }
  };

  const moveItem = (index, direction) => {
    const newItems = [...menuItems];
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= newItems.length) return;
    const temp = newItems[index];
    newItems[index] = newItems[targetIndex];
    newItems[targetIndex] = temp;
    setMenuItems(newItems);
  };

  const removeItem = (parentIdx, childIdx = null) => {
    if (childIdx !== null) {
      const newItems = [...menuItems];
      newItems[parentIdx].children = newItems[parentIdx].children.filter((_, i) => i !== childIdx);
      setMenuItems(newItems);
    } else {
      setMenuItems(menuItems.filter((_, i) => i !== parentIdx));
    }
  };

  const handleOpenAdd = (parentIndex = null) => {
    setEditingItem({
      item: {
        label: "",
        labelBn: "",
        url: "/",
        openInNewTab: false,
        badge: "",
        children: [],
      },
      parentIndex,
      isNew: true,
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item, parentIndex = null, childIndex = null) => {
    setEditingItem({
      item: { ...item },
      parentIndex,
      childIndex,
      isNew: false,
    });
    setIsModalOpen(true);
  };

  const handleSaveModalItem = (itemData) => {
    const { parentIndex, childIndex, isNew } = editingItem;

    if (parentIndex !== null && parentIndex >= 0) {
      // Modifying child item
      const newItems = [...menuItems];
      const parent = { ...newItems[parentIndex] };
      const children = [...(parent.children || [])];

      if (isNew) {
        children.push(itemData);
      } else {
        children[childIdx] = itemData;
      }
      parent.children = children;
      newItems[parentIndex] = parent;
      setMenuItems(newItems);
    } else {
      // Root item
      if (isNew) {
        setMenuItems([...menuItems, itemData]);
      } else {
        const newItems = [...menuItems];
        newItems[editingItem.childIndex ?? parentIndex] = {
          ...itemData,
          children: itemData.children || [],
        };
        setMenuItems(newItems);
      }
    }

    setIsModalOpen(false);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <MenuIcon className="w-7 h-7 text-primary" />
            Navigation & Menus Builder
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Build and reorder header nav, footer columns, and mobile drawer navigation trees.
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
          <Button size="sm" onClick={handleSaveMenu} isLoading={isSaving} className="gap-1.5">
            <Save className="w-4 h-4" /> Save Navigation
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Sidebar: Menu Locations */}
        <div className="space-y-2">
          <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider px-2">
            Menu Locations
          </h3>
          <div className="space-y-1">
            {MENU_LOCATIONS.map((loc) => {
              const isSelected = selectedLocation === loc.id;
              return (
                <button
                  type="button"
                  key={loc.id}
                  onClick={() => setSelectedLocation(loc.id)}
                  className={`w-full text-left px-3 py-2.5 rounded-lg text-xs font-semibold transition-colors flex items-center justify-between ${
                    isSelected
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "bg-card text-muted-foreground hover:bg-muted hover:text-foreground border border-border"
                  }`}
                >
                  <span>{loc.label}</span>
                  <ChevronRight className="w-3.5 h-3.5 opacity-60" />
                </button>
              );
            })}
          </div>
        </div>

        {/* Main: Items Tree Editor */}
        <div className="md:col-span-3 space-y-4">
          <Card>
            <CardHeader className="pb-3 border-b border-border">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base font-bold text-foreground">
                    {MENU_LOCATIONS.find((l) => l.id === selectedLocation)?.label}
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Location key: <span className="font-mono text-primary">{selectedLocation}</span>
                  </CardDescription>
                </div>
                <Button
                  size="sm"
                  onClick={() => handleOpenAdd(null)}
                  className="gap-1.5 text-xs"
                >
                  <Plus className="w-4 h-4" /> Add Menu Item
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              {isLoading ? (
                <div className="space-y-2">
                  {[...Array(4)].map((_, i) => (
                    <Skeleton key={i} className="h-12 w-full rounded-lg" />
                  ))}
                </div>
              ) : menuItems.length === 0 ? (
                <div className="text-center py-10 text-muted-foreground text-xs space-y-2">
                  <FolderTree className="w-8 h-8 mx-auto opacity-40" />
                  <p>No menu items configured for this location yet.</p>
                  <Button size="sm" variant="outline" onClick={() => handleOpenAdd(null)}>
                    Add First Item
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  {menuItems.map((item, pIdx) => (
                    <div
                      key={pIdx}
                      className="rounded-lg border border-border bg-card p-3 space-y-2 transition-all hover:border-primary/30"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-foreground text-sm">
                            {item.label}
                          </span>
                          {item.labelBn && (
                            <span className="text-xs text-muted-foreground">
                              ({item.labelBn})
                            </span>
                          )}
                          <span className="font-mono text-xs bg-muted px-2 py-0.5 rounded text-muted-foreground">
                            {item.url}
                          </span>
                          {item.badge && (
                            <Badge variant="purple" className="text-[10px]">
                              {item.badge}
                            </Badge>
                          )}
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => moveItem(pIdx, -1)}
                            disabled={pIdx === 0}
                            className="p-1 text-muted-foreground hover:text-foreground disabled:opacity-30"
                            title="Move Up"
                          >
                            <ArrowUp className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => moveItem(pIdx, 1)}
                            disabled={pIdx === menuItems.length - 1}
                            className="p-1 text-muted-foreground hover:text-foreground disabled:opacity-30"
                            title="Move Down"
                          >
                            <ArrowDown className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleOpenAdd(pIdx)}
                            className="p-1 text-primary hover:bg-primary/10 rounded"
                            title="Add Submenu Child"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(item, null, pIdx)}
                            className="p-1 text-muted-foreground hover:text-foreground"
                            title="Edit Item"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => removeItem(pIdx)}
                            className="p-1 text-destructive hover:bg-destructive/10 rounded"
                            title="Delete Item"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Submenu Children */}
                      {item.children?.length > 0 && (
                        <div className="pl-6 pt-1 space-y-1.5 border-l-2 border-primary/20 ml-2">
                          {item.children.map((child, cIdx) => (
                            <div
                              key={cIdx}
                              className="flex items-center justify-between p-2 rounded-md bg-muted/40 text-xs"
                            >
                              <div className="flex items-center gap-2">
                                <span className="font-semibold text-foreground">
                                  {child.label}
                                </span>
                                {child.labelBn && (
                                  <span className="text-muted-foreground">
                                    ({child.labelBn})
                                  </span>
                                )}
                                <span className="font-mono text-[11px] text-muted-foreground">
                                  {child.url}
                                </span>
                              </div>
                              <div className="flex items-center gap-1">
                                <button
                                  type="button"
                                  onClick={() => handleOpenEdit(child, pIdx, cIdx)}
                                  className="p-1 text-muted-foreground hover:text-foreground"
                                >
                                  <Edit2 className="w-3 h-3" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => removeItem(pIdx, cIdx)}
                                  className="p-1 text-destructive hover:text-destructive/80"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Edit Item Modal */}
      {editingItem && (
        <MenuItemModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          initialData={editingItem.item}
          onSave={handleSaveModalItem}
        />
      )}
    </div>
  );
}

function MenuItemModal({ isOpen, onClose, initialData, onSave }) {
  const [label, setLabel] = useState(initialData?.label || "");
  const [labelBn, setLabelBn] = useState(initialData?.labelBn || "");
  const [url, setUrl] = useState(initialData?.url || "/");
  const [badge, setBadge] = useState(initialData?.badge || "");
  const [openInNewTab, setOpenInNewTab] = useState(Boolean(initialData?.openInNewTab));

  useEffect(() => {
    if (initialData) {
      setLabel(initialData.label || "");
      setLabelBn(initialData.labelBn || "");
      setUrl(initialData.url || "/");
      setBadge(initialData.badge || "");
      setOpenInNewTab(Boolean(initialData.openInNewTab));
    }
  }, [initialData]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!label.trim() || !url.trim()) {
      toast.error("Label and URL are required");
      return;
    }
    onSave({
      label: label.trim(),
      labelBn: labelBn.trim(),
      url: url.trim(),
      badge: badge.trim(),
      openInNewTab,
      children: initialData?.children || [],
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Configure Menu Item"
      description="Enter display labels and target destination link."
      maxWidth="max-w-md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Label (English)"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          placeholder="e.g. Products, Doctors"
          required
        />
        <Input
          label="Label (Bangla)"
          value={labelBn}
          onChange={(e) => setLabelBn(e.target.value)}
          placeholder="e.g. ওষুধসমূহ, ডাক্তার"
        />
        <Input
          label="Destination URL"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="/shop or https://..."
          required
        />
        <Input
          label="Highlight Badge (Optional)"
          value={badge}
          onChange={(e) => setBadge(e.target.value)}
          placeholder="e.g. Hot, New, 20% Off"
        />
        <Switch
          label="Open in New Tab"
          checked={openInNewTab}
          onChange={(checked) => setOpenInNewTab(checked)}
        />
        <div className="flex justify-end gap-2 pt-3 border-t border-border">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit">Save Item</Button>
        </div>
      </form>
    </Modal>
  );
}
