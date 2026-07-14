"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import {
  ChefHat,
  Clock,
  ChevronRight,
  Flame,
  CheckCircle2,
  Bell,
  Check,
  CookingPot,
} from "lucide-react";
import { useOrders, useSettings } from "@/lib/app-providers";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import type { Order, OrderStatus } from "@/lib/types";

const STATUS_ORDER: OrderStatus[] = ["pending", "cooking", "ready", "served"];

function getNextStatus(current: OrderStatus): OrderStatus | null {
  const idx = STATUS_ORDER.indexOf(current);
  if (idx === -1 || idx === STATUS_ORDER.length - 1) return null;
  return STATUS_ORDER[idx + 1];
}

function getTimeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  return `${h}h ${m % 60}m ago`;
}

function OrderCard({
  order,
  currency,
  onAdvance,
}: {
  order: Order;
  currency: string;
  onAdvance: (order: Order) => void;
}) {
  const next = getNextStatus(order.status);
  const isUrgent =
    order.status === "pending" &&
    Date.now() - new Date(order.createdAt).getTime() > 10 * 60 * 1000;

  return (
    <Card
      className={cn(
        "transition-shadow hover:shadow-md",
        isUrgent && "border-red-300 dark:border-red-800"
      )}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div>
            <CardTitle className="text-base">
              Order #{order.id.slice(-4)}
            </CardTitle>
            <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
              <span>Table {order.tableNumber}</span>
              <span>•</span>
              <span
                className={cn(
                  "flex items-center gap-1",
                  isUrgent && "text-red-600 font-medium"
                )}
              >
                <Clock className="h-3 w-3" />
                {getTimeAgo(order.createdAt)}
              </span>
            </div>
          </div>
          <StatusBadge status={order.status} />
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-1.5">
          {order.items.map((item, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between gap-2 text-sm"
            >
              <div className="flex items-center gap-2 min-w-0">
                <span className="font-semibold text-orange-600 w-5 text-right shrink-0">
                  {item.quantity}×
                </span>
                <span className="truncate">{item.name}</span>
              </div>
              <span className="text-xs text-muted-foreground shrink-0">
                {currency}
                {(item.price * item.quantity).toFixed(2)}
              </span>
            </div>
          ))}
        </div>
        {next && (
          <Button
            className="w-full"
            onClick={() => onAdvance(order)}
            size="sm"
          >
            {next === "cooking" && (
              <>
                <CookingPot className="mr-1 h-4 w-4" />
                Start Cooking
              </>
            )}
            {next === "ready" && (
              <>
                <Bell className="mr-1 h-4 w-4" />
                Mark as Ready
              </>
            )}
            {next === "served" && (
              <>
                <Check className="mr-1 h-4 w-4" />
                Mark as Served
              </>
            )}
            <ChevronRight className="ml-auto h-4 w-4" />
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

export default function KitchenPage() {
  const { orders, updateOrder } = useOrders();
  const { settings } = useSettings();
  const [filter, setFilter] = useState<"active" | "all">("active");

  const currency = settings?.currency ?? "$";

  const sorted = useMemo(() => {
    const orderStatuses: OrderStatus[] =
      filter === "active"
        ? ["pending", "cooking", "ready"]
        : ["pending", "cooking", "ready", "served"];
    return [...orders]
      .filter((o) => orderStatuses.includes(o.status))
      .sort(
        (a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );
  }, [orders, filter]);

  const grouped = useMemo(() => {
    return {
      pending: sorted.filter((o) => o.status === "pending"),
      cooking: sorted.filter((o) => o.status === "cooking"),
      ready: sorted.filter((o) => o.status === "ready"),
      served: sorted.filter((o) => o.status === "served"),
    };
  }, [sorted]);

  const handleAdvance = (order: Order) => {
    const next = getNextStatus(order.status);
    if (!next) return;
    updateOrder(order.id, { status: next });
    const labels: Record<OrderStatus, string> = {
      pending: "pending",
      cooking: "cooking",
      ready: "ready",
      served: "served",
    };
    toast.success(`Order #${order.id.slice(-4)} is now ${labels[next]}`);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Kitchen"
        description="Track orders in the kitchen"
        actions={
          <Tabs value={filter} onValueChange={(v) => setFilter(v as "active" | "all")}>
            <TabsList>
              <TabsTrigger value="active">Active</TabsTrigger>
              <TabsTrigger value="all">All</TabsTrigger>
            </TabsList>
          </Tabs>
        }
      />

      {sorted.length === 0 ? (
        <EmptyState
          icon={<ChefHat className="h-6 w-6" />}
          title="No orders in the kitchen"
          description={
            filter === "active"
              ? "All caught up! No active orders right now."
              : "No orders to display."
          }
        />
      ) : (
        <div className="space-y-6">
          {(["pending", "cooking", "ready"] as OrderStatus[]).map((status) => {
            const list = grouped[status];
            if (list.length === 0) return null;
            return (
              <div key={status}>
                <div className="mb-3 flex items-center gap-2">
                  <h2 className="text-lg font-semibold capitalize">{status}</h2>
                  <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium">
                    {list.length}
                  </span>
                </div>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {list.map((order) => (
                    <OrderCard
                      key={order.id}
                      order={order}
                      currency={currency}
                      onAdvance={handleAdvance}
                    />
                  ))}
                </div>
              </div>
            );
          })}

          {filter === "all" && grouped.served.length > 0 && (
            <div>
              <div className="mb-3 flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                <h2 className="text-lg font-semibold">Served</h2>
                <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium">
                  {grouped.served.length}
                </span>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {grouped.served.map((order) => (
                  <OrderCard
                    key={order.id}
                    order={order}
                    currency={currency}
                    onAdvance={handleAdvance}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
