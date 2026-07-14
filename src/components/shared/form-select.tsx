"use client";

import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { Controller } from "react-hook-form";

interface SelectOption {
  value: string;
  label: string;
}

interface FormSelectProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  control: any;
  name: string;
  label: string;
  placeholder?: string;
  options: SelectOption[];
  description?: string;
  required?: boolean;
  className?: string;
  disabled?: boolean;
}

export function FormSelect({
  control,
  name,
  label,
  placeholder = "Select an option",
  options,
  description,
  required,
  className,
  disabled,
}: FormSelectProps) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <div className={cn("space-y-1.5", className)}>
          <Label className="flex items-center gap-1">
            {label}
            {required && <span className="text-destructive">*</span>}
          </Label>
          <Select
            value={(field.value as string | undefined) ?? ""}
            onValueChange={field.onChange}
            disabled={disabled}
          >
            <SelectTrigger
              className={cn(
                "w-full",
                fieldState.error && "border-destructive ring-destructive/20"
              )}
            >
              <SelectValue placeholder={placeholder} />
            </SelectTrigger>
            <SelectContent>
              {options.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {description && !fieldState.error && (
            <p className="text-xs text-muted-foreground">{description}</p>
          )}
          {fieldState.error && (
            <p className="text-xs text-destructive">{fieldState.error.message}</p>
          )}
        </div>
      )}
    />
  );
}
