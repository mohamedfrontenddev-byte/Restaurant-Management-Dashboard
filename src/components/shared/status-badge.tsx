import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type {
  TableStatus,
  OrderStatus,
} from "@/lib/types";

interface StatusBadgeProps {
  status: TableStatus | OrderStatus;
  className?: string;
}

const tableStatusMap: Record<TableStatus, { label: string; classes: string }> = {
  available: {
    label: "Available",
    classes: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200",
  },
  occupied: {
    label: "Occupied",
    classes: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-200",
  },
  reserved: {
    label: "Reserved",
    classes: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200",
  },
  cleaning: {
    label: "Cleaning",
    classes: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200",
  },
};

const orderStatusMap: Record<OrderStatus, { label: string; classes: string }> = {
  pending: {
    label: "Pending",
    classes: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 border-yellow-200",
  },
  cooking: {
    label: "Cooking",
    classes: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 border-orange-200",
  },
  ready: {
    label: "Ready",
    classes: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200",
  },
  served: {
    label: "Served",
    classes: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200",
  },
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config =
    status in tableStatusMap
      ? tableStatusMap[status as TableStatus]
      : orderStatusMap[status as OrderStatus];

  return (
    <Badge
      variant="outline"
      className={cn("border font-medium", config.classes, className)}
    >
      {config.label}
    </Badge>
  );
}
