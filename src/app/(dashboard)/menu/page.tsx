"use client";

import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, BookOpen } from "lucide-react";
import { useMenu } from "@/lib/app-providers";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { SearchInput } from "@/components/shared/search-input";
import { CategoryTabs } from "@/components/shared/category-tabs";
import { FormField } from "@/components/shared/form-field";
import { FormSelect } from "@/components/shared/form-select";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { formResolver } from "@/components/shared/zod-resolver";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { MenuItem, MenuCategory } from "@/lib/types";

const CATEGORIES: MenuCategory[] = [
  "Pizza",
  "Burger",
  "Drinks",
  "Desserts",
  "Pasta",
];

const CATEGORY_FILTERS = [
  { value: "all", label: "All" },
  ...CATEGORIES.map((c) => ({ value: c, label: c })),
];

const menuSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  description: z.string().min(2, "Description is required"),
  price: z.coerce.number().positive("Price must be greater than 0"),
  category: z.enum(["Pizza", "Burger", "Drinks", "Desserts", "Pasta"]),
  isAvailable: z.boolean(),
});

type MenuFormValues = z.infer<typeof menuSchema>;

export default function MenuPage() {
  const { items, addItem, updateItem, removeItem } = useMenu();
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<"all" | MenuCategory>("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const form = useForm<MenuFormValues>({
    resolver: formResolver<MenuFormValues>(menuSchema),
    defaultValues: {
      name: "",
      description: "",
      price: 0,
      category: "Pizza",
      isAvailable: true,
    },
  });

  const filtered = useMemo(() => {
    return items.filter((item) => {
      if (categoryFilter !== "all" && item.category !== categoryFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        return (
          item.name.toLowerCase().includes(q) ||
          item.description.toLowerCase().includes(q) ||
          item.category.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [items, search, categoryFilter]);

  const openAddDialog = () => {
    setEditingItem(null);
    form.reset({
      name: "",
      description: "",
      price: 0,
      category: "Pizza",
      isAvailable: true,
    });
    setDialogOpen(true);
  };

  const openEditDialog = (item: MenuItem) => {
    setEditingItem(item);
    form.reset({
      name: item.name,
      description: item.description,
      price: item.price,
      category: item.category,
      isAvailable: item.isAvailable,
    });
    setDialogOpen(true);
  };

  const onSubmit = (values: MenuFormValues) => {
    if (editingItem) {
      updateItem(editingItem.id, values);
      toast.success("Menu item updated");
    } else {
      const newItem: MenuItem = {
        id: `m-${Date.now()}`,
        ...values,
      };
      addItem(newItem);
      toast.success("Menu item added");
    }
    setDialogOpen(false);
  };

  const handleDelete = () => {
    if (deleteId) {
      removeItem(deleteId);
      toast.success("Menu item deleted");
      setDeleteId(null);
    }
  };

  const itemToDelete = items.find((i) => i.id === deleteId);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Menu"
        description="Manage your restaurant menu items"
        actions={
          <Button onClick={openAddDialog}>
            <Plus className="mr-1 h-4 w-4" />
            Add Item
          </Button>
        }
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Search menu items..."
          className="sm:max-w-sm"
        />
        <CategoryTabs
          value={categoryFilter}
          onValueChange={(v) => setCategoryFilter(v as "all" | MenuCategory)}
          options={CATEGORY_FILTERS}
        />
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={<BookOpen className="h-6 w-6" />}
          title="No menu items"
          description={
            search || categoryFilter !== "all"
              ? "Try adjusting your filters."
              : "Get started by adding your first menu item."
          }
          action={
            !search &&
            categoryFilter === "all" && (
              <Button onClick={openAddDialog}>
                <Plus className="mr-1 h-4 w-4" />
                Add Item
              </Button>
            )
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((item) => (
            <Card key={item.id} className="flex flex-col">
              <CardHeader>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <CardTitle className="text-base">{item.name}</CardTitle>
                    <CardDescription className="line-clamp-2 mt-1">
                      {item.description}
                    </CardDescription>
                  </div>
                  <Badge variant="secondary">{item.category}</Badge>
                </div>
              </CardHeader>
              <CardContent className="flex flex-1 flex-col justify-between gap-3">
                <div className="flex items-center justify-between">
                  <span className="text-xl font-bold text-orange-600">
                    ${item.price.toFixed(2)}
                  </span>
                  <Badge
                    variant={item.isAvailable ? "default" : "outline"}
                    className={
                      item.isAvailable
                        ? "bg-emerald-100 text-emerald-700 border-emerald-200"
                        : "bg-zinc-100 text-zinc-600 border-zinc-200"
                    }
                  >
                    {item.isAvailable ? "Available" : "Unavailable"}
                  </Badge>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => openEditDialog(item)}
                  >
                    <Pencil className="mr-1 h-3.5 w-3.5" />
                    Edit
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => setDeleteId(item.id)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    <span className="sr-only">Delete</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
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
              {editingItem ? "Edit Menu Item" : "Add New Menu Item"}
            </DialogTitle>
            <DialogDescription>
              {editingItem
                ? "Update the details of this menu item."
                : "Fill in the details to add a new menu item."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
            <FormField
              control={form.control}
              name="name"
              label="Name"
              placeholder="Margherita Pizza"
              required
            />
            <FormField
              control={form.control}
              name="description"
              label="Description"
              placeholder="Classic Italian pizza with tomato and mozzarella"
              as="textarea"
              rows={2}
              required
            />
            <div className="grid grid-cols-2 gap-3">
              <FormField
                control={form.control}
                name="price"
                label="Price"
                type="number"
                placeholder="0.00"
                required
              />
              <FormSelect
                control={form.control}
                name="category"
                label="Category"
                options={CATEGORIES.map((c) => ({ value: c, label: c }))}
                required
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isAvailable"
                className="h-4 w-4 rounded border-input text-orange-600 focus:ring-orange-500"
                {...form.register("isAvailable")}
              />
              <Label htmlFor="isAvailable">Available for ordering</Label>
            </div>
            <DialogFooter className="-mx-4 -mb-4 mt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit">
                {editingItem ? "Save Changes" : "Add Item"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title="Delete Menu Item"
        description={
          itemToDelete
            ? `Are you sure you want to delete "${itemToDelete.name}"? This action cannot be undone.`
            : ""
        }
        confirmText="Delete"
        variant="destructive"
        onConfirm={handleDelete}
      />
    </div>
  );
}
