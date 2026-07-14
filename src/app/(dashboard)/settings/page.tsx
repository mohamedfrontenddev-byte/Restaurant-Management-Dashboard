"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import {
  Save,
  Palette,
  Building2,
  Percent,
  Clock,
  ImageIcon,
  RefreshCw,
} from "lucide-react";
import { useSettings, useTables } from "@/lib/app-providers";
import { PageHeader } from "@/components/shared/page-header";
import { LoadingState } from "@/components/shared/loading-state";
import { FormField } from "@/components/shared/form-field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

const settingsSchema = z.object({
  name: z.string().min(2, "Restaurant name is required"),
  address: z.string().optional(),
  phone: z.string().optional(),
  primaryColor: z.string().min(1, "Color is required"),
  taxRate: z.coerce.number().min(0).max(100, "Tax cannot exceed 100%"),
  currency: z.string().min(1, "Currency is required").max(5),
  openingTime: z.string().min(1, "Opening time is required"),
  closingTime: z.string().min(1, "Closing time is required"),
});

type SettingsFormValues = z.infer<typeof settingsSchema>;

const PRESET_COLORS = [
  { name: "Orange", value: "#f97316" },
  { name: "Red", value: "#ef4444" },
  { name: "Rose", value: "#f43f5e" },
  { name: "Amber", value: "#f59e0b" },
  { name: "Green", value: "#22c55e" },
  { name: "Teal", value: "#14b8a6" },
  { name: "Blue", value: "#3b82f6" },
  { name: "Indigo", value: "#6366f1" },
  { name: "Purple", value: "#a855f7" },
  { name: "Slate", value: "#475569" },
];

export default function SettingsPage() {
  const { settings, updateSettings } = useSettings();
  const { tables } = useTables();

  const form = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      name: "",
      address: "",
      phone: "",
      primaryColor: "#f97316",
      taxRate: 8,
      currency: "$",
      openingTime: "09:00",
      closingTime: "23:00",
    },
  });

  useEffect(() => {
    if (settings) {
      form.reset({
        name: settings.name,
        address: settings.address ?? "",
        phone: settings.phone ?? "",
        primaryColor: settings.primaryColor,
        taxRate: settings.taxRate,
        currency: settings.currency,
        openingTime: settings.openingHours.open,
        closingTime: settings.openingHours.close,
      });
    }
  }, [settings, form]);

  if (!settings) {
    return <LoadingState message="Loading settings..." />;
  }

  const onSubmit = (values: SettingsFormValues) => {
    updateSettings({
      name: values.name,
      address: values.address,
      phone: values.phone,
      primaryColor: values.primaryColor,
      taxRate: values.taxRate,
      currency: values.currency,
      openingHours: {
        open: values.openingTime,
        close: values.closingTime,
      },
    });
    toast.success("Settings saved");
  };

  const handleReset = () => {
    if (
      !window.confirm(
        "This will reset all settings, profile, and mock data to defaults. Continue?"
      )
    ) {
      return;
    }
    if (typeof window !== "undefined") {
      [
        "rms_tables",
        "rms_menu",
        "rms_orders",
        "rms_reservations",
        "rms_inventory",
        "rms_profile",
        "rms_settings",
        "rms_initialized",
      ].forEach((k) => localStorage.removeItem(k));
      window.location.reload();
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Settings"
        description="Configure your restaurant preferences"
      />

      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-6"
      >
        {/* Restaurant Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              Restaurant Information
            </CardTitle>
            <CardDescription>
              Basic details about your restaurant
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="name"
                label="Restaurant Name"
                placeholder="Gourmet Bistro"
                required
              />
              <FormField
                control={form.control}
                name="currency"
                label="Currency Symbol"
                placeholder="$"
                required
              />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="phone"
                label="Phone"
                placeholder="+1 555-RESTAURANT"
              />
              <FormField
                control={form.control}
                name="address"
                label="Address"
                placeholder="123 Main Street, City"
              />
            </div>
          </CardContent>
        </Card>

        {/* Logo */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ImageIcon className="h-4 w-4" />
              Logo
            </CardTitle>
            <CardDescription>
              Restaurant logo (UI only)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div
                className="flex h-20 w-20 items-center justify-center rounded-lg border-2 border-dashed bg-muted/40"
                style={{ borderColor: form.watch("primaryColor") }}
              >
                <Building2
                  className="h-10 w-10"
                  style={{ color: form.watch("primaryColor") }}
                />
              </div>
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">
                  The logo is currently a placeholder icon styled with your
                  primary color. You can configure the color below.
                </p>
                <Badge variant="outline" className="mt-2">
                  UI Placeholder
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Theme Color */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="h-4 w-4" />
              Brand Color
            </CardTitle>
            <CardDescription>
              Choose the primary accent color for the dashboard
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-1.5">
              <Label>Color</Label>
              <div className="flex flex-wrap items-center gap-2">
                {PRESET_COLORS.map((color) => {
                  const selected = form.watch("primaryColor") === color.value;
                  return (
                    <button
                      key={color.value}
                      type="button"
                      onClick={() =>
                        form.setValue("primaryColor", color.value)
                      }
                      className="group flex flex-col items-center gap-1"
                      title={color.name}
                    >
                      <div
                        className="h-10 w-10 rounded-lg border-2 transition-all hover:scale-110"
                        style={{
                          backgroundColor: color.value,
                          borderColor: selected ? "#000" : "transparent",
                        }}
                      />
                      <span className="text-xs text-muted-foreground">
                        {color.name}
                      </span>
                    </button>
                  );
                })}
                <div className="ml-2 flex items-center gap-2">
                  <Input
                    type="color"
                    value={form.watch("primaryColor")}
                    onChange={(e) =>
                      form.setValue("primaryColor", e.target.value)
                    }
                    className="h-10 w-14 cursor-pointer p-1"
                  />
                  <Input
                    type="text"
                    value={form.watch("primaryColor")}
                    onChange={(e) =>
                      form.setValue("primaryColor", e.target.value)
                    }
                    className="h-10 w-28 font-mono"
                    placeholder="#f97316"
                  />
                </div>
              </div>
            </div>
            <div className="rounded-lg border p-3">
              <div className="text-xs text-muted-foreground mb-2">Preview</div>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  size="sm"
                  style={{
                    backgroundColor: form.watch("primaryColor"),
                    color: "white",
                  }}
                >
                  Primary Button
                </Button>
                <div
                  className="h-8 w-8 rounded-full"
                  style={{ backgroundColor: form.watch("primaryColor") }}
                />
                <span
                  className="text-sm font-semibold"
                  style={{ color: form.watch("primaryColor") }}
                >
                  Accent Text
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tax & Hours */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Percent className="h-4 w-4" />
              Tax & Currency
            </CardTitle>
            <CardDescription>
              Tax rate and operating hours
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="taxRate"
              label="Default Tax Rate (%)"
              type="number"
              placeholder="8"
              description="Applied to all new orders"
              required
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Operating Hours
            </CardTitle>
            <CardDescription>
              Daily opening and closing times
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="openingTime"
                label="Opening Time"
                type="time"
                required
              />
              <FormField
                control={form.control}
                name="closingTime"
                label="Closing Time"
                type="time"
                required
              />
            </div>
          </CardContent>
        </Card>

        {/* Save Bar */}
        <div className="sticky bottom-4 z-10 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button type="submit">
            <Save className="mr-1 h-4 w-4" />
            Save Settings
          </Button>
        </div>
      </form>

      <Separator />

      <Card>
        <CardHeader>
          <CardTitle className="text-destructive">Danger Zone</CardTitle>
          <CardDescription>
            Reset all data to factory defaults
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm">
                This will clear all local data and reload the app with mock
                data. This action cannot be undone.
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {tables.length} tables currently in the system
              </p>
            </div>
            <Button
              type="button"
              variant="destructive"
              onClick={handleReset}
            >
              <RefreshCw className="mr-1 h-4 w-4" />
              Reset All Data
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
