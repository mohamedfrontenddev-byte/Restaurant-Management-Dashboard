"use client";

import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import {
  Plus,
  Pencil,
  Trash2,
  Package,
  AlertTriangle,
  TrendingUp,
  Search,
  Boxes,
} from "lucide-react";
import { useInventory } from "@/lib/app-providers";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { SearchInput } from "@/components/shared/search-input";
import { FormField } from "@/components/shared/form-field";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
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
import { cn } from "@/lib/utils";
import type { InventoryItem } from "@/lib/types";

const inventorySchema = z.object({
  name: z.string().min(2, "Name is required"),
  quantity: z.coerce.number().min(0, "Quantity cannot be negative"),
  unit: z.string().min(1, "Unit is required"),
  minThreshold: z.coerce.number().min(0, "Threshold cannot be negative"),
  supplier: z.string().optional(),
});

type InventoryFormValues = z.infer<typeof inventorySchema>;

const COMMON_UNITS = ["kg", "g", "L", "ml", "pieces", "cases", "bottles", "boxes"];

export default function InventoryPage() {
  const { items, addItem, updateItem, removeItem } = useInventory();
  const [search, setSearch] = useState("");
  const [showLowOnly, setShowLowOnly] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<InventoryItem | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const form = useForm<InventoryFormValues>({
    resolver: zodResolver(inventorySchema),
    defaultValues: {
      name: "",
      quantity: 0,
      unit: "kg",
      minThreshold: 0,
      supplier: "",
    },
  });

  const filtered = useMemo(() => {
    return items
      .filter((i) => {
        if (showLowOnly && i.quantity > i.minThreshold) return false;
        if (search) {
          const q = search.toLowerCase();
          return (
            i.name.toLowerCase().includes(q) ||
            i.unit.toLowerCase().includes(q) ||
            i.supplier?.toLowerCase().includes(q)
          );
        }
        return true;
      })
      .sort((a, b) => {
        // Sort by low stock first
        const aLow = a.quantity <= a.minThreshold ? 0 : 1;
        const bLow = b.quantity <= b.minThreshold ? 0 : 1;
        if (aLow !== bLow) return aLow - bLow;
        return a.name.localeCompare(b.name);
      });
  }, [items, search, showLowOnly]);

  const stats = useMemo(() => {
    const total = items.length;
    const low = items.filter((i) => i.quantity <= i.minThreshold).length;
    const out = items.filter((i) => i.quantity === 0).length;
    const totalValue = items.reduce((s, i) => s + i.quantity, 0);
    return { total, low, out, totalValue };
  }, [items]);

  const openAdd = () => {
    setEditing(null);
    form.reset({
      name: "",
      quantity: 0,
      unit: "kg",
      minThreshold: 0,
      supplier: "",
    });
    setDialogOpen(true);
  };

  const openEdit = (item: InventoryItem) => {
    setEditing(item);
    form.reset({
      name: item.name,
      quantity: item.quantity,
      unit: item.unit,
      minThreshold: item.minThreshold,
      supplier: item.supplier ?? "",
    });
    setDialogOpen(true);
  };

  const onSubmit = (values: InventoryFormValues) => {
    if (editing) {
      updateItem(editing.id, {
        ...values,
        supplier: values.supplier || undefined,
      });
      toast.success("Inventory item updated");
    } else {
      const newItem: InventoryItem = {
        id: `i-${Date.now()}`,
        ...values,
        supplier: values.supplier || undefined,
        lastUpdated: new Date().toISOString(),
      };
      addItem(newItem);
      toast.success("Inventory item added");
    }
    setDialogOpen(false);
  };

  // Quick quantity adjust
  const quickAdjust = (item: InventoryItem, delta: number) => {
    const newQty = Math.max(0, item.quantity + delta);
    updateItem(item.id, { quantity: newQty });
  };

  const handleDelete = () => {
    if (deleteId) {
      removeItem(deleteId);
      toast.success("Item deleted");
      setDeleteId(null);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Inventory"
        description="Track stock levels and supplies"
        actions={
          <Button onClick={openAdd}>
            <Plus className="mr-1 h-4 w-4" />
            Add Item
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs text-muted-foreground">Total Items</div>
                <div className="text-2xl font-bold">{stats.total}</div>
              </div>
              <Boxes className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs text-muted-foreground">Low Stock</div>
                <div className="text-2xl font-bold text-amber-600">
                  {stats.low}
                </div>
              </div>
              <AlertTriangle className="h-8 w-8 text-amber-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs text-muted-foreground">Out of Stock</div>
                <div className="text-2xl font-bold text-red-600">{stats.out}</div>
              </div>
              <Package className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs text-muted-foreground">Total Units</div>
                <div className="text-2xl font-bold">
                  {stats.totalValue.toFixed(0)}
                </div>
              </div>
              <TrendingUp className="h-8 w-8 text-emerald-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {stats.low > 0 && (
        <Card className="border-amber-200 bg-amber-50/50 dark:bg-amber-950/20 dark:border-amber-900/50">
          <CardContent className="flex items-start gap-3 p-4">
            <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5 shrink-0" />
            <div className="flex-1">
              <h3 className="font-semibold text-amber-900 dark:text-amber-300">
                Low stock alert
              </h3>
              <p className="text-sm text-amber-800 dark:text-amber-400">
                {stats.low} item{stats.low === 1 ? "" : "s"} at or below minimum
                threshold.{" "}
                <button
                  onClick={() => setShowLowOnly(true)}
                  className="font-medium underline"
                >
                  View only low stock
                </button>
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Search by name, unit, supplier..."
          className="sm:max-w-sm"
        />
        <Button
          variant={showLowOnly ? "default" : "outline"}
          size="sm"
          onClick={() => setShowLowOnly((v) => !v)}
        >
          <AlertTriangle className="mr-1 h-4 w-4" />
          {showLowOnly ? "Show All" : "Show Low Stock Only"}
        </Button>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={<Package className="h-6 w-6" />}
          title="No inventory items"
          description={
            search || showLowOnly
              ? "Try adjusting your filters."
              : "Add your first inventory item to get started."
          }
          action={
            !search &&
            !showLowOnly && (
              <Button onClick={openAdd}>
                <Plus className="mr-1 h-4 w-4" />
                Add Item
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
                  <TableHead>Item</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Supplier</TableHead>
                  <TableHead>Last Updated</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((item) => {
                  const isLow = item.quantity <= item.minThreshold;
                  const isOut = item.quantity === 0;
                  return (
                    <TableRow
                      key={item.id}
                      className={cn(isLow && "bg-amber-50/50 dark:bg-amber-950/10")}
                    >
                      <TableCell>
                        <div className="font-medium">{item.name}</div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1">
                            <Button
                              variant="outline"
                              size="icon-xs"
                              onClick={() => quickAdjust(item, -1)}
                              disabled={item.quantity === 0}
                            >
                              −
                            </Button>
                            <span className="w-16 text-center font-medium">
                              {item.quantity} {item.unit}
                            </span>
                            <Button
                              variant="outline"
                              size="icon-xs"
                              onClick={() => quickAdjust(item, 1)}
                            >
                              +
                            </Button>
                          </div>
                        </div>
                        <div className="mt-1 text-xs text-muted-foreground">
                          Min: {item.minThreshold} {item.unit}
                        </div>
                      </TableCell>
                      <TableCell>
                        {isOut ? (
                          <Badge
                            variant="outline"
                            className="bg-red-100 text-red-700 border-red-200"
                          >
                            Out of stock
                          </Badge>
                        ) : isLow ? (
                          <Badge
                            variant="outline"
                            className="bg-amber-100 text-amber-700 border-amber-200"
                          >
                            <AlertTriangle className="mr-1 h-3 w-3" />
                            Low
                          </Badge>
                        ) : (
                          <Badge
                            variant="outline"
                            className="bg-emerald-100 text-emerald-700 border-emerald-200"
                          >
                            In stock
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {item.supplier || "—"}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(item.lastUpdated).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => openEdit(item)}
                          >
                            <Pencil className="h-4 w-4" />
                            <span className="sr-only">Edit</span>
                          </Button>
                          <Button
                            variant="destructive"
                            size="icon-sm"
                            onClick={() => setDeleteId(item.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">Delete</span>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      <Dialog
        open={dialogOpen}
        onOpenChange={(open) => {
          if (!open) form.reset();
          setDialogOpen(open);
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editing ? "Edit Inventory Item" : "Add Inventory Item"}
            </DialogTitle>
            <DialogDescription>
              {editing
                ? "Update the details of this inventory item."
                : "Add a new item to the inventory."}
            </DialogDescription>
          </DialogHeader>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-3"
          >
            <FormField
              control={form.control}
              name="name"
              label="Name"
              placeholder="Tomato Sauce"
              required
            />
            <div className="grid grid-cols-2 gap-3">
              <FormField
                control={form.control}
                name="quantity"
                label="Quantity"
                type="number"
                placeholder="0"
                required
              />
              <div className="space-y-1.5">
                <Label htmlFor="unit" className="flex items-center gap-1">
                  Unit<span className="text-destructive">*</span>
                </Label>
                <Input
                  id="unit"
                  list="units"
                  placeholder="kg"
                  className="h-8"
                  {...form.register("unit")}
                />
                <datalist id="units">
                  {COMMON_UNITS.map((u) => (
                    <option key={u} value={u} />
                  ))}
                </datalist>
              </div>
            </div>
            <FormField
              control={form.control}
              name="minThreshold"
              label="Minimum Threshold"
              type="number"
              placeholder="0"
              description="Alert when quantity goes at or below this value"
              required
            />
            <FormField
              control={form.control}
              name="supplier"
              label="Supplier"
              placeholder="Fresh Foods Inc."
            />
            <DialogFooter className="-mx-4 -mb-4 mt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit">
                {editing ? "Save Changes" : "Add Item"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title="Delete Inventory Item"
        description="Are you sure you want to delete this item? This cannot be undone."
        confirmText="Delete"
        variant="destructive"
        onConfirm={handleDelete}
      />
    </div>
  );
}
