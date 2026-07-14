"use client";

import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { Controller } from "react-hook-form";

// The Control type from react-hook-form is complex (includes input/output variants
// from the resolver). Using a permissive shape lets callers pass any concrete form
// without fighting Resolver generics — runtime is unchanged.
interface LooseControl {
  // The shape that react-hook-form's Controller needs.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  _options?: any;
}

interface FormFieldProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  control: any;
  name: string;
  label: string;
  placeholder?: string;
  type?: string;
  description?: string;
  required?: boolean;
  className?: string;
  inputClassName?: string;
  as?: "input" | "textarea";
  rows?: number;
  disabled?: boolean;
}

export function FormField({
  control,
  name,
  label,
  placeholder,
  type = "text",
  description,
  required,
  className,
  inputClassName,
  as = "input",
  rows = 3,
  disabled,
}: FormFieldProps) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <div className={cn("space-y-1.5", className)}>
          <Label htmlFor={name} className="flex items-center gap-1">
            {label}
            {required && <span className="text-destructive">*</span>}
          </Label>
          {as === "textarea" ? (
            <textarea
              id={name}
              placeholder={placeholder}
              disabled={disabled}
              rows={rows}
              className={cn(
                "flex field-sizing-content min-h-16 w-full rounded-lg border border-input bg-transparent px-2.5 py-2 text-base transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 md:text-sm dark:bg-input/30 dark:disabled:bg-input/80 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40",
                fieldState.error && "border-destructive ring-destructive/20",
                inputClassName
              )}
              value={(field.value as string | undefined) ?? ""}
              onChange={field.onChange}
              onBlur={field.onBlur}
              name={field.name}
              ref={field.ref}
            />
          ) : (
            <input
              id={name}
              type={type}
              placeholder={placeholder}
              disabled={disabled}
              className={cn(
                "h-8 w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-1 text-base transition-colors outline-none file:inline-flex file:h-6 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 md:text-sm dark:bg-input/30 dark:disabled:bg-input/80 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40",
                fieldState.error && "border-destructive ring-destructive/20",
                inputClassName
              )}
              value={(field.value as string | number | undefined) ?? ""}
              onChange={field.onChange}
              onBlur={field.onBlur}
              name={field.name}
              ref={field.ref}
            />
          )}
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
