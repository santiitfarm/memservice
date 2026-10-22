"use client";

import React from "react";
import Modal from "@/components/ui/Modal";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Skeleton from "@/components/ui/Skeleton";
import EmptyState from "@/components/ui/EmptyState";
import { useFetchStockMovementsQuery } from "@/store/slices/stockApi";
import { History, ArrowUpRight, ArrowDownRight, RefreshCw } from "lucide-react";

export default function StockMovementHistoryModal({
  isOpen,
  onClose,
  item, // { productId, productName, variantSku, variantLabel }
}) {
  const { data, isLoading, isError, error, refetch, isFetching } =
    useFetchStockMovementsQuery(
      item
        ? {
            productId: item.productId,
            variantSku: item.variantSku || undefined,
            limit: 50,
          }
        : undefined,
      { skip: !isOpen || !item }
    );

  if (!item) return null;

  const movements = data?.movements || [];

  const getReasonBadge = (reason) => {
    switch (reason) {
      case "restock":
        return <Badge variant="success">Restock</Badge>;
      case "order":
        return <Badge variant="info">Order Sale</Badge>;
      case "return":
        return <Badge variant="purple">Return</Badge>;
      case "damaged":
        return <Badge variant="destructive">Damaged</Badge>;
      case "adjustment":
      default:
        return <Badge variant="warning">Adjustment</Badge>;
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Stock Movement Audit Trail"
      description={`Audit history for ${item.productName}${
        item.variantSku ? ` (${item.variantSku})` : ""
      }`}
      maxWidth="max-w-2xl"
    >
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="text-xs text-muted-foreground">
            Total records: <span className="font-semibold text-foreground">{movements.length}</span>
          </div>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => refetch()}
            disabled={isFetching}
            className="h-8 gap-1.5 text-xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isFetching ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>

        {/* Content State */}
        {isLoading ? (
          <div className="space-y-2">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-16 w-full rounded-lg" />
            ))}
          </div>
        ) : isError ? (
          <div className="p-4 rounded-lg bg-destructive/10 text-destructive text-sm text-center">
            Failed to load audit history: {error?.data?.message || error?.message || "Unknown error"}
            <div className="mt-2">
              <Button size="sm" variant="outline" onClick={() => refetch()}>
                Retry
              </Button>
            </div>
          </div>
        ) : movements.length === 0 ? (
          <EmptyState
            icon={History}
            title="No Movements Recorded"
            description="There are no recorded stock adjustments or order sales for this item yet."
          />
        ) : (
          <div className="max-h-[60vh] overflow-y-auto space-y-2.5 pr-1">
            {movements.map((m) => {
              const isPositive = Number(m.delta) > 0;
              return (
                <div
                  key={m._id}
                  className="p-3 rounded-lg border border-border bg-card hover:bg-muted/30 transition-colors flex items-center justify-between gap-3 text-xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      {getReasonBadge(m.reason)}
                      <span className="font-semibold text-foreground">
                        {m.reference || "Manual adjustment"}
                      </span>
                    </div>
                    <div className="text-muted-foreground flex items-center gap-2">
                      <span>{new Date(m.at || m.createdAt).toLocaleString()}</span>
                      {m.by?.name && (
                        <span>• By {m.by.name}</span>
                      )}
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div
                      className={`inline-flex items-center font-bold text-sm ${
                        isPositive ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"
                      }`}
                    >
                      {isPositive ? (
                        <ArrowUpRight className="w-4 h-4 mr-0.5 inline" />
                      ) : (
                        <ArrowDownRight className="w-4 h-4 mr-0.5 inline" />
                      )}
                      {isPositive ? `+${m.delta}` : m.delta}
                    </div>
                    <div className="text-muted-foreground text-[11px]">
                      Balance: <span className="font-semibold text-foreground">{m.balanceAfter}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="flex justify-end pt-3 border-t border-border">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
}
