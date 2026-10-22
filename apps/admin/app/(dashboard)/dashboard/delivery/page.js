"use client";

import React, { useState } from "react";
import {
  Truck,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Star,
  MapPin,
  Clock,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import Switch from "@/components/ui/Switch";
import Skeleton from "@/components/ui/Skeleton";
import EmptyState from "@/components/ui/EmptyState";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { toast } from "react-toastify";
import {
  useFetchDeliveryZonesQuery,
  useUpdateDeliveryZoneMutation,
  useDeleteDeliveryZoneMutation,
} from "@/store/slices/deliveryApi";
import ZoneFormModal from "./_components/ZoneFormModal";
import DeliveryQuoteTester from "./_components/DeliveryQuoteTester";

export default function DeliveryZonesPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedZone, setSelectedZone] = useState(null);
  const [zoneToDelete, setZoneToDelete] = useState(null);

  const { data, isLoading, isError, error, refetch, isFetching } = useFetchDeliveryZonesQuery(true);
  const [updateZone] = useUpdateDeliveryZoneMutation();
  const [deleteZone, { isLoading: isDeleting }] = useDeleteDeliveryZoneMutation();

  const zones = data?.zones || [];

  const handleToggleStatus = async (zone, active) => {
    try {
      await updateZone({
        id: zone._id,
        status: active ? "active" : "inactive",
      }).unwrap();
      toast.success(`Zone "${zone.label}" marked as ${active ? "active" : "inactive"}`);
    } catch (err) {
      toast.error(err?.data?.error || err?.message || "Failed to update status");
    }
  };

  const handleSetDefault = async (zone) => {
    try {
      await updateZone({
        id: zone._id,
        isDefault: true,
      }).unwrap();
      toast.success(`"${zone.label}" is now the default delivery zone`);
    } catch (err) {
      toast.error(err?.data?.error || err?.message || "Failed to set default zone");
    }
  };

  const handleDelete = async () => {
    if (!zoneToDelete) return;
    try {
      await deleteZone(zoneToDelete._id).unwrap();
      toast.success("Delivery zone removed successfully");
      setZoneToDelete(null);
    } catch (err) {
      toast.error(err?.data?.error || err?.message || "Failed to delete delivery zone");
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Truck className="w-7 h-7 text-primary" />
            Delivery Zones & Rates
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Configure dynamic delivery zones, shipping rates, free shipping thresholds, and test live checkout quotes.
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
              setSelectedZone(null);
              setIsModalOpen(true);
            }}
            className="gap-1.5"
          >
            <Plus className="w-4 h-4" /> Add Delivery Zone
          </Button>
        </div>
      </div>

      {/* Delivery Quote Tester Widget */}
      {zones.length > 0 && <DeliveryQuoteTester zones={zones} />}

      {/* Delivery Zones Table */}
      <Card>
        <CardHeader className="border-b border-border py-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-bold text-foreground">
              Configured Delivery Zones ({zones.length})
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex items-center justify-between gap-4">
                  <Skeleton className="h-6 w-1/4" />
                  <Skeleton className="h-6 w-20" />
                  <Skeleton className="h-6 w-28" />
                  <Skeleton className="h-8 w-20" />
                </div>
              ))}
            </div>
          ) : isError ? (
            <div className="p-8 text-center space-y-3">
              <p className="text-sm text-destructive font-medium">
                Failed to load delivery zones: {error?.data?.error || error?.message || "Unknown error"}
              </p>
              <Button variant="outline" size="sm" onClick={() => refetch()}>
                Retry
              </Button>
            </div>
          ) : zones.length === 0 ? (
            <div className="p-12">
              <EmptyState
                icon={Truck}
                title="No delivery zones configured"
                description="Create your first delivery zone to start offering shipping at checkout."
                action={
                  <Button
                    size="sm"
                    onClick={() => {
                      setSelectedZone(null);
                      setIsModalOpen(true);
                    }}
                  >
                    Add First Zone
                  </Button>
                }
              />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-muted/40 text-muted-foreground uppercase tracking-wider font-semibold border-b border-border">
                  <tr>
                    <th className="py-3 px-4">Zone & Key</th>
                    <th className="py-3 px-4">Charge (BDT)</th>
                    <th className="py-3 px-4">Free Shipping</th>
                    <th className="py-3 px-4">ETA & Coverage</th>
                    <th className="py-3 px-4 text-center">COD</th>
                    <th className="py-3 px-4 text-center">Default</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {zones.map((zone) => {
                    const isActive = zone.status === "active";
                    return (
                      <tr key={zone._id} className="hover:bg-muted/30 transition-colors">
                        {/* Zone & Key */}
                        <td className="py-3 px-4">
                          <div>
                            <div className="font-semibold text-foreground text-sm flex items-center gap-1.5">
                              {zone.label}
                              {zone.isDefault && (
                                <Badge variant="primary" className="text-[10px] py-0 px-1.5 h-4">
                                  Default
                                </Badge>
                              )}
                            </div>
                            <span className="font-mono text-xs text-muted-foreground">
                              key: {zone.key}
                            </span>
                          </div>
                        </td>

                        {/* Charge */}
                        <td className="py-3 px-4">
                          <span className="text-sm font-bold text-foreground">
                            ৳{zone.charge}
                          </span>
                        </td>

                        {/* Free Shipping */}
                        <td className="py-3 px-4">
                          {zone.freeAbove != null ? (
                            <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                              Free above ৳{zone.freeAbove}
                            </span>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </td>

                        {/* ETA & Coverage */}
                        <td className="py-3 px-4">
                          <div className="space-y-1">
                            <div className="flex items-center gap-1 text-muted-foreground">
                              <Clock className="w-3.5 h-3.5 text-primary" />
                              <span>{zone.eta || "Standard"}</span>
                            </div>
                            {zone.districts?.length > 0 ? (
                              <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                                <MapPin className="w-3 h-3" />
                                <span>{zone.districts.slice(0, 3).join(", ")}</span>
                                {zone.districts.length > 3 && (
                                  <span>+{zone.districts.length - 3} more</span>
                                )}
                              </div>
                            ) : (
                              <span className="text-[11px] text-muted-foreground">All areas</span>
                            )}
                          </div>
                        </td>

                        {/* COD */}
                        <td className="py-3 px-4 text-center">
                          {zone.codAvailable ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-500 inline" />
                          ) : (
                            <XCircle className="w-4 h-4 text-muted-foreground inline" />
                          )}
                        </td>

                        {/* Default */}
                        <td className="py-3 px-4 text-center">
                          <button
                            type="button"
                            onClick={() => !zone.isDefault && handleSetDefault(zone)}
                            className={`p-1 rounded-md transition-colors ${
                              zone.isDefault
                                ? "text-amber-500 cursor-default"
                                : "text-muted-foreground/40 hover:text-amber-500 hover:bg-muted"
                            }`}
                            title={zone.isDefault ? "Default Zone" : "Click to make default"}
                          >
                            <Star className={`w-4 h-4 ${zone.isDefault ? "fill-amber-500" : ""}`} />
                          </button>
                        </td>

                        {/* Status Toggle */}
                        <td className="py-3 px-4 text-center">
                          <div className="flex justify-center">
                            <Switch
                              checked={isActive}
                              onChange={(checked) => handleToggleStatus(zone, checked)}
                            />
                          </div>
                        </td>

                        {/* Actions */}
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSelectedZone(zone);
                                setIsModalOpen(true);
                              }}
                              className="h-8 w-8 p-0"
                              title="Edit Zone"
                            >
                              <Edit2 className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setZoneToDelete(zone)}
                              className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                              title="Delete Zone"
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

      {/* Add / Edit Zone Modal */}
      <ZoneFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        zone={selectedZone}
      />

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={Boolean(zoneToDelete)}
        onClose={() => setZoneToDelete(null)}
        onConfirm={handleDelete}
        title="Delete Delivery Zone"
        description={`Are you sure you want to delete delivery zone "${zoneToDelete?.label}"? Customers will no longer be able to select this zone.`}
        confirmText={isDeleting ? "Deleting..." : "Delete"}
        variant="danger"
      />
    </div>
  );
}
