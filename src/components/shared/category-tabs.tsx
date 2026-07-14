"use client";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

interface CategoryTabsProps<T extends string> {
  value: T | "all";
  onValueChange: (value: T | "all") => void;
  options: { value: T | "all"; label: string }[];
  className?: string;
}

export function CategoryTabs<T extends string>({
  value,
  onValueChange,
  options,
  className,
}: CategoryTabsProps<T>) {
  return (
    <Tabs
      value={value}
      onValueChange={(v) => onValueChange(v as T | "all")}
      className={cn("w-full", className)}
    >
      <TabsList variant="line" className="flex flex-wrap h-auto">
        {options.map((opt) => (
          <TabsTrigger
            key={opt.value}
            value={opt.value}
            className="px-3 py-2 text-sm"
          >
            {opt.label}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}
