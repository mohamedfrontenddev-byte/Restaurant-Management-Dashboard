"use client";

import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import {
  Plus,
  Trash2,
  ShoppingCart,
  X,
  Search,
  ChevronRight,
  Eye,
  Minus,
} from "lucide-react";
import { useOrders, useMenu, useTables, useSettings } from "@/lib/app-providers";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { StatusBadge } from "@/components/shared/status-badge";
import { FormSelect } from "@/components/shared/form-select";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Order, OrderItem, OrderStatus } from "@/lib/types";

const STATUS_FLOW: OrderStatus[] = ["pending", "cooking", "ready", "served"];

const orderSchema = z.object({
  tableId: z.string().min(1, "Please select a table"),
  discount: z.coerce.number().min(0, "Discount cannot be negative").default(0),
});

type OrderFormValues = z.infer<typeof orderSchema>;

interface DraftItem {
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
}

export default function OrdersPage() {
  const { orders, addOrder, updateOrder, removeOrder } = useOrders();
  const { items: menuItems } = useMenu();
  const { tables } = useTables();
  const { settings } = useSettings();

  const [search, setSearch] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [viewingOrder, setViewingOrder] = useState<Order | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [draftItems, setDraftItems] = useState<DraftItem[]>([]);

  const form = useForm<OrderFormValues>({
    resolver: zodResolver(orderSchema),
    defaultValues: {
      tableId: "",
      discount: 0,
    },
  });

  const taxRate = settings?.taxRate ?? 0;
  const currency = settings?.currency ?? "$";

  const availableTables = useMemo(
    () => tables.filter((t) => t.status === "available" || t.status === "occupied"),
    [tables]
  );

  const filteredOrders = useMemo(() => {
    return orders
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
  }, [orders, search]);

  const subtotal = useMemo(
    () => draftItems.reduce((sum, i) => sum + i.price * i.quantity, 0),
    [draftItems]
  );

  const addMenuItem = (menuItemId: string) => {
    const item = menuItems.find((m) => m.id === menuItemId);
    if (!item || !item.isAvailable) return;
    setDraftItems((prev) => {
      const existing = prev.find((i) => i.menuItemId === menuItemId);
      if (existing) {
        return prev.map((i) =>
          i.menuItemId === menuItemId ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [
        ...prev,
        { menuItemId: item.id, name: item.name, price: item.price, quantity: 1 },
      ];
    });
  };

  const updateQty = (menuItemId: string, delta: number) => {
    setDraftItems((prev) =>
      prev
        .map((i) =>
          i.menuItemId === menuItemId
            ? { ...i, quantity: Math.max(0, i.quantity + delta) }
            : i
        )
        .filter((i) => i.quantity > 0)
    );
  };

  const removeDraftItem = (menuItemId: string) => {
    setDraftItems((prev) => prev.filter((i) => i.menuItemId !== menuItemId));
  };

  const resetDialog = () => {
    setDraftItems([]);
    form.reset({ tableId: "", discount: 0 });
  };

  const onCreateOrder = (values: OrderFormValues) => {
    if (draftItems.length === 0) {
      toast.error("Please add at least one item");
      return;
    }
    const table = tables.find((t) => t.id === values.tableId);
    if (!table) {
      toast.error("Invalid table");
      return;
    }
    const total = subtotal;
    const tax = +(total * (taxRate / 100)).toFixed(2);
    const discount = +values.discount;
    const finalTotal = +(total + tax - discount).toFixed(2);
    const order: Order = {
      id: `o-${Date.now()}`,
      tableId: table.id,
      tableNumber: table.number,
      items: draftItems,
      status: "pending",
      createdAt: new Date().toISOString(),
      total,
      tax,
      discount,
      finalTotal,
    };
    addOrder(order);
    toast.success(`Order created for table ${table.number}`);
    setCreateOpen(false);
    resetDialog();
  };

  const advanceStatus = (order: Order) => {
    const idx = STATUS_FLOW.indexOf(order.status);
    if (idx === -1 || idx === STATUS_FLOW.length - 1) {
      toast.info("Order is already served");
      return;
    }
    const next = STATUS_FLOW[idx + 1];
    updateOrder(order.id, { status: next });
    toast.success(`Order #${order.id.slice(-4)} → ${next}`);
  };

  const handleDelete = () => {
    if (deleteId) {
      removeOrder(deleteId);
      toast.success("Order deleted");
      setDeleteId(null);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Orders"
        description="Create and track customer orders"
        actions={
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="mr-1 h-4 w-4" />
            New Order
          </Button>
        }
      />

      <div className="relative max-w-sm">
        <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
        <Input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search orders by ID, table, or item..."
          className="pl-8"
        />
      </div>

      {filteredOrders.length === 0 ? (
        <EmptyState
          icon={<ShoppingCart className="h-6 w-6" />}
          title="No orders yet"
          description={
            search
              ? "No orders match your search."
              : "Create your first order to get started."
          }
          action={
            !search && (
              <Button onClick={() => setCreateOpen(true)}>
                <Plus className="mr-1 h-4 w-4" />
                New Order
              </Button>
            )
          }
        />
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order</TableHead>
                  <TableHead>Table</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">
                      #{order.id.slice(-4)}
                    </TableCell>
                    <TableCell>Table {order.tableNumber}</TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground">
                        {order.items.reduce((s, i) => s + i.quantity, 0)} items
                      </span>
                    </TableCell>
                    <TableCell className="font-semibold">
                      {currency}
                      {order.finalTotal.toFixed(2)}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={order.status} />
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(order.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => setViewingOrder(order)}
                        >
                          <Eye className="h-4 w-4" />
                          <span className="sr-only">View</span>
                        </Button>
                        {order.status !== "served" && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => advanceStatus(order)}
                          >
                            <ChevronRight className="h-3.5 w-3.5" />
                            Next
                          </Button>
                        )}
                        <Button
                          variant="destructive"
                          size="icon-sm"
                          onClick={() => setDeleteId(order.id)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          <span className="sr-only">Delete</span>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Create Order Dialog */}
      <Dialog
        open={createOpen}
        onOpenChange={(open) => {
          if (!open) resetDialog();
          setCreateOpen(open);
        }}
      >
        <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Order</DialogTitle>
            <DialogDescription>
              Select a table, add items, and confirm the order.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 md:grid-cols-2">
            <form
              id="order-form"
              onSubmit={form.handleSubmit(onCreateOrder)}
              className="space-y-3"
            >
              <FormSelect
                control={form.control}
                name="tableId"
                label="Table"
                placeholder="Select a table"
                options={availableTables.map((t) => ({
                  value: t.id,
                  label: `Table ${t.number} (${t.capacity} seats, ${t.status})`,
                }))}
                required
              />
              <FormFieldLite
                label="Discount"
                name="discount"
                type="number"
                value={form.watch("discount")}
                onChange={(v) => form.setValue("discount", v)}
              />
              <div className="rounded-lg border bg-muted/40 p-3 text-sm space-y-1">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>
                    {currency}
                    {subtotal.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    Tax ({taxRate}%)
                  </span>
                  <span>
                    {currency}
                    {(subtotal * (taxRate / 100)).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Discount</span>
                  <span>
                    -{currency}
                    {(form.watch("discount") || 0).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between border-t pt-1 font-semibold">
                  <span>Total</span>
                  <span>
                    {currency}
                    {(
                      subtotal +
                      subtotal * (taxRate / 100) -
                      (form.watch("discount") || 0)
                    ).toFixed(2)}
                  </span>
                </div>
              </div>
            </form>

            <div className="space-y-3">
              <div>
                <Label className="mb-1.5 block">Menu Items</Label>
                <div className="max-h-44 overflow-y-auto space-y-1 rounded-lg border p-2">
                  {menuItems.filter((m) => m.isAvailable).length === 0 ? (
                    <p className="text-sm text-muted-foreground p-2">
                      No available items.
                    </p>
                  ) : (
                    menuItems
                      .filter((m) => m.isAvailable)
                      .map((m) => (
                        <button
                          key={m.id}
                          type="button"
                          onClick={() => addMenuItem(m.id)}
                          className="flex w-full items-center justify-between rounded-md px-2 py-1.5 text-left text-sm hover:bg-accent"
                        >
                          <div>
                            <div className="font-medium">{m.name}</div>
                            <div className="text-xs text-muted-foreground">
                              {m.category}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-orange-600">
                              {currency}
                              {m.price.toFixed(2)}
                            </span>
                            <Plus className="h-3.5 w-3.5" />
                          </div>
                        </button>
                      ))
                  )}
                </div>
              </div>

              <div>
                <Label className="mb-1.5 block">
                  Order Items ({draftItems.length})
                </Label>
                {draftItems.length === 0 ? (
                  <p className="text-sm text-muted-foreground rounded-lg border border-dashed p-4 text-center">
                    Click menu items to add them.
                  </p>
                ) : (
                  <div className="space-y-1 max-h-44 overflow-y-auto rounded-lg border p-2">
                    {draftItems.map((item) => (
                      <div
                        key={item.menuItemId}
                        className="flex items-center justify-between gap-2 rounded-md bg-muted/40 px-2 py-1.5"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium truncate">
                            {item.name}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {currency}
                            {item.price.toFixed(2)} each
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button
                            type="button"
                            variant="outline"
                            size="icon-xs"
                            onClick={() => updateQty(item.menuItemId, -1)}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="w-6 text-center text-sm font-medium">
                            {item.quantity}
                          </span>
                          <Button
                            type="button"
                            variant="outline"
                            size="icon-xs"
                            onClick={() => updateQty(item.menuItemId, 1)}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon-xs"
                            onClick={() => removeDraftItem(item.menuItemId)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setCreateOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              form="order-form"
              disabled={draftItems.length === 0}
            >
              Create Order
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Order Dialog */}
      <Dialog
        open={!!viewingOrder}
        onOpenChange={(open) => !open && setViewingOrder(null)}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              Order #{viewingOrder?.id.slice(-4)} — Table {viewingOrder?.tableNumber}
            </DialogTitle>
            <DialogDescription>
              {viewingOrder &&
                new Date(viewingOrder.createdAt).toLocaleString()}
            </DialogDescription>
          </DialogHeader>
          {viewingOrder && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Status</span>
                <StatusBadge status={viewingOrder.status} />
              </div>
              <div className="space-y-2 rounded-lg border p-3">
                {viewingOrder.items.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between text-sm"
                  >
                    <div>
                      <div className="font-medium">{item.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {currency}
                        {item.price.toFixed(2)} × {item.quantity}
                      </div>
                    </div>
                    <div className="font-semibold">
                      {currency}
                      {(item.price * item.quantity).toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
              <div className="space-y-1 rounded-lg bg-muted/40 p-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>
                    {currency}
                    {viewingOrder.total.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tax</span>
                  <span>
                    {currency}
                    {viewingOrder.tax.toFixed(2)}
                  </span>
                </div>
                {viewingOrder.discount > 0 && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Discount</span>
                    <span>
                      -{currency}
                      {viewingOrder.discount.toFixed(2)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between border-t pt-1 font-bold">
                  <span>Total</span>
                  <span>
                    {currency}
                    {viewingOrder.finalTotal.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            {viewingOrder && viewingOrder.status !== "served" && (
              <Button
                onClick={() => {
                  advanceStatus(viewingOrder);
                  setViewingOrder(null);
                }}
              >
                <ChevronRight className="mr-1 h-4 w-4" />
                Advance Status
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title="Delete Order"
        description="Are you sure you want to delete this order? This cannot be undone."
        confirmText="Delete"
        variant="destructive"
        onConfirm={handleDelete}
      />
    </div>
  );
}

// Lightweight inline form field for numbers
function FormFieldLite({
  label,
  name,
  type = "text",
  value,
  onChange,
}: {
  label: string;
  name: string;
  type?: string;
  value: string | number;
  onChange: (value: number) => void;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={name}>{label}</Label>
      <Input
        id={name}
        type={type}
        value={value}
        onChange={(e) => onChange(+e.target.value || 0)}
        min={0}
        step="0.01"
      />
    </div>
  );
}
