"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/common/spinner";
import { getErrorMessage, getFieldErrors } from "@/utils/errors";
import { useUpdateProfileMutation } from "../hooks/use-auth";
import { updateProfileSchema, type UpdateProfileFormValues } from "../schemas";
import type { AdminProfile } from "../types";

export function ProfileForm({ admin }: { admin: AdminProfile }) {
  const updateProfileMutation = useUpdateProfileMutation();

  const form = useForm<UpdateProfileFormValues>({
    resolver: zodResolver(updateProfileSchema),
    values: {
      fullName: admin.fullName,
      phone: admin.phone ?? "",
      avatarUrl: admin.avatarUrl ?? "",
    },
  });

  const onSubmit = form.handleSubmit((values) => {
    updateProfileMutation.mutate(
      {
        fullName: values.fullName,
        phone: values.phone || undefined,
        avatarUrl: values.avatarUrl || undefined,
      },
      {
        onSuccess: () => toast.success("Profile updated"),
        onError: (error) => {
          const fieldErrors = getFieldErrors(error);
          if (fieldErrors) {
            for (const [field, message] of Object.entries(fieldErrors)) {
              if (field === "fullName" || field === "phone" || field === "avatarUrl") {
                form.setError(field, { message });
              }
            }
            return;
          }
          toast.error(getErrorMessage(error));
        },
      }
    );
  });

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="email">Email</Label>
        <Input id="email" value={admin.email} disabled readOnly />
        <p className="text-xs text-muted-foreground">Email cannot be changed here.</p>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="fullName">Full name</Label>
        <Input
          id="fullName"
          autoComplete="name"
          aria-invalid={!!form.formState.errors.fullName}
          {...form.register("fullName")}
        />
        {form.formState.errors.fullName ? (
          <p className="text-sm text-destructive">{form.formState.errors.fullName.message}</p>
        ) : null}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="phone">Phone</Label>
        <Input
          id="phone"
          type="tel"
          autoComplete="tel"
          placeholder="+1 555 123 4567"
          aria-invalid={!!form.formState.errors.phone}
          {...form.register("phone")}
        />
        {form.formState.errors.phone ? (
          <p className="text-sm text-destructive">{form.formState.errors.phone.message}</p>
        ) : null}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="avatarUrl">Avatar URL</Label>
        <Input
          id="avatarUrl"
          type="url"
          placeholder="https://example.com/avatar.jpg"
          aria-invalid={!!form.formState.errors.avatarUrl}
          {...form.register("avatarUrl")}
        />
        {form.formState.errors.avatarUrl ? (
          <p className="text-sm text-destructive">{form.formState.errors.avatarUrl.message}</p>
        ) : null}
      </div>

      <Button
        type="submit"
        className="w-fit"
        disabled={updateProfileMutation.isPending || !form.formState.isDirty}
      >
        {updateProfileMutation.isPending ? <Spinner /> : null}
        Save changes
      </Button>
    </form>
  );
}
