"use client";

import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import {
  User,
  Mail,
  Phone,
  Shield,
  Camera,
  Save,
} from "lucide-react";
import { useProfile } from "@/lib/app-providers";
import { PageHeader } from "@/components/shared/page-header";
import { FormField } from "@/components/shared/form-field";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { LoadingState } from "@/components/shared/loading-state";

const profileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(5, "Phone is required"),
  role: z.string().min(1, "Role is required"),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export default function ProfilePage() {
  const { profile, updateProfile } = useProfile();
  const [avatar, setAvatar] = useState<string | undefined>(undefined);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setAvatar(profile?.avatar);
  }, [profile?.avatar]);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: profile?.name ?? "",
      email: profile?.email ?? "",
      phone: profile?.phone ?? "",
      role: profile?.role ?? "",
    },
  });

  useEffect(() => {
    if (profile) {
      form.reset({
        name: profile.name,
        email: profile.email,
        phone: profile.phone ?? "",
        role: profile.role,
      });
    }
  }, [profile, form]);

  if (!profile) {
    return <LoadingState message="Loading profile..." />;
  }

  const onSubmit = (values: ProfileFormValues) => {
    updateProfile(values);
    toast.success("Profile updated");
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Image must be under 2MB");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setAvatar(result);
      updateProfile({ avatar: result });
      toast.success("Profile picture updated");
    };
    reader.readAsDataURL(file);
  };

  const triggerFilePicker = () => {
    fileInputRef.current?.click();
  };

  const removeAvatar = () => {
    setAvatar(undefined);
    updateProfile({ avatar: undefined });
    toast.success("Profile picture removed");
  };

  const initials = profile.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Profile"
        description="Manage your account information"
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Profile Picture</CardTitle>
            <CardDescription>Update your photo</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-4">
            <Avatar size="lg" className="h-24 w-24">
              {avatar ? <AvatarImage src={avatar} alt={profile.name} /> : null}
              <AvatarFallback className="text-2xl bg-orange-100 text-orange-700">
                {initials || <User className="h-10 w-10" />}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col gap-2 w-full">
              <Button
                variant="outline"
                className="w-full"
                type="button"
                onClick={triggerFilePicker}
              >
                <Camera className="mr-1 h-4 w-4" />
                Change Photo
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarChange}
              />
              {avatar && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={removeAvatar}
                  className="w-full"
                >
                  Remove
                </Button>
              )}
            </div>
            <p className="text-xs text-muted-foreground text-center">
              JPG, PNG or GIF. Max size 2MB.
            </p>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
            <CardDescription>
              Update your account details
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-4"
            >
              <div className="flex flex-wrap items-center gap-2 pb-2">
                <Badge variant="secondary" className="capitalize">
                  <Shield className="mr-1 h-3 w-3" />
                  {profile.role}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  ID: {profile.id}
                </Badge>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="name"
                  label="Full Name"
                  placeholder="Your name"
                  required
                />
                <FormField
                  control={form.control}
                  name="email"
                  label="Email"
                  type="email"
                  placeholder="you@email.com"
                  required
                />
                <FormField
                  control={form.control}
                  name="phone"
                  label="Phone"
                  placeholder="+1 555-0000"
                />
                <FormField
                  control={form.control}
                  name="role"
                  label="Role"
                  placeholder="Manager"
                  required
                />
              </div>
              <div className="flex justify-end">
                <Button type="submit">
                  <Save className="mr-1 h-4 w-4" />
                  Save Changes
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Account Overview</CardTitle>
          <CardDescription>
            Read-only summary of your account activity
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-100 text-blue-700">
                <User className="h-4 w-4" />
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Account ID</div>
                <div className="text-sm font-medium">{profile.id}</div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                <Mail className="h-4 w-4" />
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Email</div>
                <div className="text-sm font-medium truncate">
                  {profile.email}
                </div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-orange-100 text-orange-700">
                <Phone className="h-4 w-4" />
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Phone</div>
                <div className="text-sm font-medium">
                  {profile.phone || "—"}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
