"use client";

import { useMemo, useState, useRef } from "react";
import {
  Receipt,
  Printer,
  Search,
  Eye,
  X,
  UtensilsCrossed,
} from "lucide-react";
import { useOrders, useSettings } from "@/lib/app-providers";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { Order } from "@/lib/types";

// Simple browser print helper (avoids extra dependency).
function usePrint() {
  return () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };
}

export default function BillsPage() {
  const { orders } = useOrders();
  const { settings } = useSettings();
  const [search, setSearch] = useState("");
  const [viewingOrder, setViewingOrder] = useState<Order | null>(null);
  const [discount, setDiscount] = useState(0);
  const billRef = useRef<HTMLDivElement>(null);
  const handlePrint = usePrint();

  const currency = settings?.currency ?? "$";
  const taxRate = settings?.taxRate ?? 0;

  // Bills = served orders (or all non-cancelled)
  const billableOrders = useMemo(() => {
    return orders.filter((o) => o.status === "served" || o.status === "ready");
  }, [orders]);

  const filtered = useMemo(() => {
    return billableOrders
      .filter((o) => {
        if (!search) return true;
        const q = search.toLowerCase();
        return (
          o.id.toLowerCase().includes(q) ||
          o.tableNumber.toString().includes(q) ||
          o.items.some((i) => i.name.toLowerCase().includes(q))
        );
      })
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
  }, [billableOrders, search]);

  const totals = useMemo(() => {
    return {
      count: billableOrders.length,
      revenue: billableOrders.reduce((s, o) => s + o.finalTotal, 0),
    };
  }, [billableOrders]);

  const openBill = (order: Order) => {
    setViewingOrder(order);
    setDiscount(order.discount);
  };

  const calculatedTotals = useMemo(() => {
    if (!viewingOrder) return null;
    const sub = viewingOrder.total;
    const tax = +(sub * (taxRate / 100)).toFixed(2);
    const finalTotal = +(sub + tax - discount).toFixed(2);
    return { sub, tax, discount, finalTotal };
  }, [viewingOrder, taxRate, discount]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Bills"
        description="View and print customer bills"
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardContent className="p-4">
            <div className="text-xs text-muted-foreground">Total Bills</div>
            <div className="text-2xl font-bold">{totals.count}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-xs text-muted-foreground">Total Revenue</div>
            <div className="text-2xl font-bold text-emerald-600">
              {currency}
              {totals.revenue.toFixed(2)}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
        <Input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search bills..."
          className="pl-8"
        />
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={<Receipt className="h-6 w-6" />}
          title="No bills available"
          description={
            search
              ? "No bills match your search."
              : "Bills are generated from served or ready orders."
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((order) => (
            <Card
              key={order.id}
              className="cursor-pointer transition-shadow hover:shadow-md"
              onClick={() => openBill(order)}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-base">
                      Bill #{order.id.slice(-4)}
                    </CardTitle>
                    <div className="mt-1 text-xs text-muted-foreground">
                      Table {order.tableNumber} •{" "}
                      {new Date(order.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  <StatusBadge status={order.status} />
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-sm text-muted-foreground line-clamp-2">
                  {order.items.length} item
                  {order.items.length === 1 ? "" : "s"} •{" "}
                  {order.items.reduce((s, i) => s + i.quantity, 0)} units
                </div>
                <div className="flex items-center justify-between border-t pt-3">
                  <span className="text-sm text-muted-foreground">Total</span>
                  <span className="text-xl font-bold text-orange-600">
                    {currency}
                    {order.finalTotal.toFixed(2)}
                  </span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={(e) => {
                    e.stopPropagation();
                    openBill(order);
                  }}
                >
                  <Eye className="mr-1 h-3.5 w-3.5" />
                  View Bill
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog
        open={!!viewingOrder}
        onOpenChange={(open) => !open && setViewingOrder(null)}
      >
        <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Bill Details</DialogTitle>
          </DialogHeader>
          {viewingOrder && calculatedTotals && (
            <div
              ref={billRef}
              className={cn(
                "space-y-4 rounded-lg border bg-background p-5",
                "print:border-0 print:shadow-none"
              )}
            >
              {/* Print header */}
              <div className="text-center print:block">
                <div className="flex items-center justify-center gap-2 mb-1 print:hidden">
                  <UtensilsCrossed className="h-5 w-5 text-orange-500" />
                  <h2 className="text-lg font-bold">
                    {settings?.name ?? "Restaurant"}
                  </h2>
                </div>
                <div className="hidden print:block">
                  <h2 className="text-xl font-bold">
                    {settings?.name ?? "Restaurant"}
                  </h2>
                  {settings?.address && (
                    <p className="text-xs text-muted-foreground">
                      {settings.address}
                    </p>
                  )}
                  {settings?.phone && (
                    <p className="text-xs text-muted-foreground">
                      {settings.phone}
                    </p>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  {settings?.address}
                </p>
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <div className="text-muted-foreground text-xs">Bill #</div>
                  <div className="font-medium">
                    {viewingOrder.id.slice(-6).toUpperCase()}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-muted-foreground text-xs">Date</div>
                  <div className="font-medium">
                    {new Date(viewingOrder.createdAt).toLocaleDateString()}
                  </div>
                </div>
                <div>
                  <div className="text-muted-foreground text-xs">Table</div>
                  <div className="font-medium">
                    Table {viewingOrder.tableNumber}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-muted-foreground text-xs">Status</div>
                  <Badge variant="outline" className="mt-0.5">
                    {viewingOrder.status}
                  </Badge>
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <div className="text-sm font-semibold">Items</div>
                {viewingOrder.items.map((item, idx) => (
                  <div key={idx} className="text-sm">
                    <div className="flex justify-between">
                      <span>
                        {item.name}{" "}
                        <span className="text-muted-foreground">
                          × {item.quantity}
                        </span>
                      </span>
                      <span className="font-medium">
                        {currency}
                        {(item.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <Separator />

              <div className="space-y-1.5 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>
                    {currency}
                    {calculatedTotals.sub.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    Tax ({taxRate}%)
                  </span>
                  <span>
                    {currency}
                    {calculatedTotals.tax.toFixed(2)}
                  </span>
                </div>
                {calculatedTotals.discount > 0 && (
                  <div className="flex justify-between text-emerald-600">
                    <span>Discount</span>
                    <span>
                      -{currency}
                      {calculatedTotals.discount.toFixed(2)}
                    </span>
                  </div>
                )}
                <Separator />
                <div className="flex justify-between text-base font-bold">
                  <span>Total</span>
                  <span className="text-orange-600">
                    {currency}
                    {calculatedTotals.finalTotal.toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="space-y-1.5 print:hidden">
                <Label htmlFor="bill-discount">Apply Discount</Label>
                <Input
                  id="bill-discount"
                  type="number"
                  min={0}
                  step="0.01"
                  value={discount}
                  onChange={(e) => setDiscount(+e.target.value || 0)}
                />
              </div>

              <div className="text-center text-xs text-muted-foreground pt-2">
                Thank you for dining with us!
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2 print:hidden">
            <Button
              variant="outline"
              onClick={() => setViewingOrder(null)}
            >
              <X className="mr-1 h-4 w-4" />
              Close
            </Button>
            <Button onClick={handlePrint}>
              <Printer className="mr-1 h-4 w-4" />
              Print
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
