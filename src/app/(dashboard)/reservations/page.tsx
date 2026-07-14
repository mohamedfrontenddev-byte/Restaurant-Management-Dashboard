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
  CalendarDays,
  Search,
  Users,
  Clock,
  Phone,
  MapPin,
} from "lucide-react";
import { useReservations, useTables } from "@/lib/app-providers";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { SearchInput } from "@/components/shared/search-input";
import { FormField } from "@/components/shared/form-field";
import { FormSelect } from "@/components/shared/form-select";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Reservation } from "@/lib/types";

const reservationSchema = z.object({
  customerName: z.string().min(2, "Customer name is required"),
  phone: z.string().min(5, "Phone number is required"),
  tableId: z.string().min(1, "Please select a table"),
  date: z.string().min(1, "Date is required"),
  time: z.string().min(1, "Time is required"),
  guests: z.coerce.number().int().positive("Must be at least 1 guest"),
  notes: z.string().optional(),
});

type ReservationFormValues = z.infer<typeof reservationSchema>;

function todayISO() {
  return new Date().toISOString().split("T")[0];
}

export default function ReservationsPage() {
  const { reservations, addReservation, updateReservation, removeReservation } = useReservations();
  const { tables } = useTables();
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Reservation | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const form = useForm<ReservationFormValues>({
    resolver: zodResolver(reservationSchema),
    defaultValues: {
      customerName: "",
      phone: "",
      tableId: "",
      date: todayISO(),
      time: "19:00",
      guests: 2,
      notes: "",
    },
  });

  const filtered = useMemo(() => {
    return reservations
      .filter((r) => {
        if (!search) return true;
        const q = search.toLowerCase();
        return (
          r.customerName.toLowerCase().includes(q) ||
          r.phone.toLowerCase().includes(q) ||
          r.tableNumber.toString().includes(q) ||
          r.notes?.toLowerCase().includes(q)
        );
      })
      .sort((a, b) => {
        if (a.date === b.date) return a.time.localeCompare(b.time);
        return a.date.localeCompare(b.date);
      });
  }, [reservations, search]);

  const todayReservations = useMemo(
    () => filtered.filter((r) => r.date === todayISO()),
    [filtered]
  );

  const upcomingReservations = useMemo(
    () => filtered.filter((r) => r.date > todayISO()),
    [filtered]
  );

  const openAdd = () => {
    setEditing(null);
    form.reset({
      customerName: "",
      phone: "",
      tableId: "",
      date: todayISO(),
      time: "19:00",
      guests: 2,
      notes: "",
    });
    setDialogOpen(true);
  };

  const openEdit = (r: Reservation) => {
    setEditing(r);
    form.reset({
      customerName: r.customerName,
      phone: r.phone,
      tableId: r.tableId,
      date: r.date,
      time: r.time,
      guests: r.guests,
      notes: r.notes ?? "",
    });
    setDialogOpen(true);
  };

  const onSubmit = (values: ReservationFormValues) => {
    const table = tables.find((t) => t.id === values.tableId);
    if (!table) {
      toast.error("Invalid table");
      return;
    }
    if (editing) {
      updateReservation(editing.id, { ...values, tableNumber: table.number });
      toast.success("Reservation updated");
    } else {
      const newRes: Reservation = {
        id: `r-${Date.now()}`,
        ...values,
        tableNumber: table.number,
        notes: values.notes || undefined,
      };
      addReservation(newRes);
      toast.success("Reservation added");
    }
    setDialogOpen(false);
  };

  const handleDelete = () => {
    if (deleteId) {
      removeReservation(deleteId);
      toast.success("Reservation deleted");
      setDeleteId(null);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Reservations"
        description="Manage customer reservations"
        actions={
          <Button onClick={openAdd}>
            <Plus className="mr-1 h-4 w-4" />
            New Reservation
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="p-4">
            <div className="text-xs text-muted-foreground">Total</div>
            <div className="text-2xl font-bold">{filtered.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-xs text-muted-foreground">Today</div>
            <div className="text-2xl font-bold text-orange-600">
              {todayReservations.length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-xs text-muted-foreground">Upcoming</div>
            <div className="text-2xl font-bold text-blue-600">
              {upcomingReservations.length}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="max-w-sm">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Search by name, phone, table..."
        />
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={<CalendarDays className="h-6 w-6" />}
          title="No reservations"
          description={
            search
              ? "No reservations match your search."
              : "Add your first reservation to get started."
          }
          action={
            !search && (
              <Button onClick={openAdd}>
                <Plus className="mr-1 h-4 w-4" />
                New Reservation
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
                  <TableHead>Customer</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Table</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>Guests</TableHead>
                  <TableHead>Notes</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((r) => {
                  const isToday = r.date === todayISO();
                  return (
                    <TableRow key={r.id}>
                      <TableCell className="font-medium">
                        {r.customerName}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm">
                          <Phone className="h-3 w-3 text-muted-foreground" />
                          {r.phone}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">Table {r.tableNumber}</Badge>
                      </TableCell>
                      <TableCell>
                        <span
                          className={
                            isToday
                              ? "font-semibold text-orange-600"
                              : "text-sm"
                          }
                        >
                          {new Date(r.date).toLocaleDateString()}
                          {isToday && (
                            <Badge
                              variant="default"
                              className="ml-2 bg-orange-500"
                            >
                              Today
                            </Badge>
                          )}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm">
                          <Clock className="h-3 w-3 text-muted-foreground" />
                          {r.time}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm">
                          <Users className="h-3 w-3 text-muted-foreground" />
                          {r.guests}
                        </div>
                      </TableCell>
                      <TableCell className="max-w-[200px]">
                        <span className="text-xs text-muted-foreground line-clamp-1">
                          {r.notes || "—"}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => openEdit(r)}
                          >
                            <Pencil className="h-4 w-4" />
                            <span className="sr-only">Edit</span>
                          </Button>
                          <Button
                            variant="destructive"
                            size="icon-sm"
                            onClick={() => setDeleteId(r.id)}
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
              {editing ? "Edit Reservation" : "New Reservation"}
            </DialogTitle>
            <DialogDescription>
              {editing
                ? "Update the reservation details."
                : "Fill in the details to add a new reservation."}
            </DialogDescription>
          </DialogHeader>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-3"
            id="reservation-form"
          >
            <FormField
              control={form.control}
              name="customerName"
              label="Customer Name"
              placeholder="John Doe"
              required
            />
            <FormField
              control={form.control}
              name="phone"
              label="Phone"
              placeholder="+1 555-0000"
              required
            />
            <div className="grid grid-cols-2 gap-3">
              <FormField
                control={form.control}
                name="date"
                label="Date"
                type="date"
                required
              />
              <FormField
                control={form.control}
                name="time"
                label="Time"
                type="time"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <FormField
                control={form.control}
                name="guests"
                label="Guests"
                type="number"
                placeholder="2"
                required
              />
              <FormSelect
                control={form.control}
                name="tableId"
                label="Table"
                placeholder="Select a table"
                options={tables.map((t) => ({
                  value: t.id,
                  label: `Table ${t.number} (${t.capacity}p)`,
                }))}
                required
              />
            </div>
            <FormField
              control={form.control}
              name="notes"
              label="Notes"
              placeholder="Special requests, dietary restrictions..."
              as="textarea"
              rows={2}
            />
            <DialogFooter className="-mx-4 -mb-4 mt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" form="reservation-form">
                {editing ? "Save Changes" : "Add Reservation"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title="Delete Reservation"
        description="Are you sure you want to delete this reservation? This cannot be undone."
        confirmText="Delete"
        variant="destructive"
        onConfirm={handleDelete}
      />
    </div>
  );
}
