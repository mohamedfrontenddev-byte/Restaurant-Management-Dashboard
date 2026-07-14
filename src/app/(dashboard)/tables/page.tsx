"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { useTables } from "@/lib/app-providers";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { SearchInput } from "@/components/shared/search-input";
import { StatusBadge } from "@/components/shared/status-badge";
import { CategoryTabs } from "@/components/shared/category-tabs";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Armchair, Users, MapPin, CheckCircle2 } from "lucide-react";
import type { TableStatus, Table } from "@/lib/types";

const STATUS_OPTIONS: { value: TableStatus; label: string }[] = [
  { value: "available", label: "Available" },
  { value: "occupied", label: "Occupied" },
  { value: "reserved", label: "Reserved" },
  { value: "cleaning", label: "Cleaning" },
];

const STATUS_FILTERS = [
  { value: "all", label: "All" },
  { value: "available", label: "Available" },
  { value: "occupied", label: "Occupied" },
  { value: "reserved", label: "Reserved" },
  { value: "cleaning", label: "Cleaning" },
];

export default function TablesPage() {
  const { tables, updateTable } = useTables();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | TableStatus>("all");
  const [editingTable, setEditingTable] = useState<Table | null>(null);
  const [newStatus, setNewStatus] = useState<TableStatus>("available");

  const filteredTables = useMemo(() => {
    return tables
      .filter((t) => {
        if (statusFilter !== "all" && t.status !== statusFilter) return false;
        if (search) {
          const q = search.toLowerCase();
          return (
            t.number.toString().includes(q) ||
            t.capacity.toString().includes(q) ||
            t.location?.toLowerCase().includes(q)
          );
        }
        return true;
      })
      .sort((a, b) => a.number - b.number);
  }, [tables, search, statusFilter]);

  const counts = useMemo(() => {
    return {
      total: tables.length,
      available: tables.filter((t) => t.status === "available").length,
      occupied: tables.filter((t) => t.status === "occupied").length,
      reserved: tables.filter((t) => t.status === "reserved").length,
      cleaning: tables.filter((t) => t.status === "cleaning").length,
    };
  }, [tables]);

  const openEditDialog = (table: Table) => {
    setEditingTable(table);
    setNewStatus(table.status);
  };

  const handleSaveStatus = () => {
    if (!editingTable) return;
    if (editingTable.status === newStatus) {
      toast.info("Status is unchanged");
      setEditingTable(null);
      return;
    }
    updateTable(editingTable.id, { status: newStatus });
    toast.success(`Table ${editingTable.number} status updated to ${newStatus}`);
    setEditingTable(null);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Tables"
        description="Manage and monitor restaurant tables"
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardContent className="p-4">
            <div className="text-xs text-muted-foreground">Total</div>
            <div className="text-2xl font-bold">{counts.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-xs text-muted-foreground">Available</div>
            <div className="text-2xl font-bold text-emerald-600">
              {counts.available}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-xs text-muted-foreground">Occupied</div>
            <div className="text-2xl font-bold text-red-600">
              {counts.occupied}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-xs text-muted-foreground">Reserved</div>
            <div className="text-2xl font-bold text-blue-600">
              {counts.reserved}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-xs text-muted-foreground">Cleaning</div>
            <div className="text-2xl font-bold text-amber-600">
              {counts.cleaning}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Search by table number, capacity or location..."
          className="sm:max-w-sm"
        />
        <CategoryTabs
          value={statusFilter}
          onValueChange={(v) => setStatusFilter(v as "all" | TableStatus)}
          options={STATUS_FILTERS}
        />
      </div>

      {filteredTables.length === 0 ? (
        <EmptyState
          icon={<Armchair className="h-6 w-6" />}
          title="No tables found"
          description="Try adjusting your search or status filter."
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {filteredTables.map((table) => (
            <Card
              key={table.id}
              className="hover:shadow-md transition-shadow"
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">Table {table.number}</CardTitle>
                    <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                      <Users className="h-3 w-3" />
                      <span>{table.capacity} seats</span>
                    </div>
                    {table.location && (
                      <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                        <MapPin className="h-3 w-3" />
                        <span>{table.location}</span>
                      </div>
                    )}
                  </div>
                  <StatusBadge status={table.status} />
                </div>
              </CardHeader>
              <CardContent>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => openEditDialog(table)}
                >
                  Change Status
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog
        open={!!editingTable}
        onOpenChange={(open) => !open && setEditingTable(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Change Status — Table {editingTable?.number}
            </DialogTitle>
            <DialogDescription>
              Update the current status of this table.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-1.5">
            <Label>Status</Label>
            <Select
              value={newStatus}
              onValueChange={(v) => setNewStatus(v as TableStatus)}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingTable(null)}>
              Cancel
            </Button>
            <Button onClick={handleSaveStatus}>
              <CheckCircle2 className="mr-1 h-4 w-4" />
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
