"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Lock, Save } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/common/spinner";
import { useProfileQuery } from "@/features/auth/hooks/use-auth";
import { canManageSettings } from "@/features/auth/permissions";
import { getErrorMessage } from "@/utils/errors";
import { useAdminSettings, useUpdateSettings } from "../hooks/use-admin";

/** Turns `contact_email` into `Contact email` — the keys are the schema's, and
 * a settings screen shouldn't make an admin read snake_case. */
function humanize(key: string) {
  const spaced = key.replace(/_/g, " ");
  return spaced.charAt(0).toUpperCase() + spaced.slice(1);
}

export function SettingsContent() {
  const { data: admin } = useProfileQuery();
  const canEdit = canManageSettings(admin?.role);

  const { data: settings, isPending, isError } = useAdminSettings();
  const update = useUpdateSettings();

  const [values, setValues] = useState<Record<string, string>>({});

  // Seeded from the server response rather than held as the source of truth,
  // so a save that comes back changed (or a refetch) wins over stale input.
  useEffect(() => {
    if (settings) {
      setValues(Object.fromEntries(settings.map((s) => [s.key, s.value ?? ""])));
    }
  }, [settings]);

  if (isPending) {
    return (
      <>
        <AdminSettingsHeader canEdit={canEdit} />
        <div className="flex flex-col gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-40 rounded-xl" />
          ))}
        </div>
      </>
    );
  }

  if (isError || !settings) {
    return (
      <>
        <AdminSettingsHeader canEdit={canEdit} />
        <p className="rounded-xl border border-destructive/30 bg-destructive/5 p-6 text-center text-sm text-destructive">
          Couldn&apos;t load settings. Please try again.
        </p>
      </>
    );
  }

  const groups = Array.from(new Set(settings.map((s) => s.groupName)));

  // Only what actually changed is sent — the API applies a partial map, so
  // there's no reason to resend every field on every save.
  const changed = Object.fromEntries(
    Object.entries(values).filter(
      ([key, value]) => (settings.find((s) => s.key === key)?.value ?? "") !== value
    )
  );
  const hasChanges = Object.keys(changed).length > 0;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    update.mutate(changed, {
      onSuccess: () => toast.success("Settings saved"),
      onError: (error) => toast.error(getErrorMessage(error)),
    });
  };

  return (
    <form onSubmit={submit}>
      <AdminSettingsHeader
        canEdit={canEdit}
        action={
          canEdit ? (
            <Button type="submit" disabled={!hasChanges || update.isPending}>
              {update.isPending ? <Spinner /> : <Save />}
              Save changes
            </Button>
          ) : null
        }
      />

      <div className="flex flex-col gap-4">
        {groups.map((group) => (
          <Card key={group}>
            <CardContent className="p-5">
              <h2 className="mb-4 text-sm font-semibold text-foreground capitalize">
                {group.toLowerCase()}
              </h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {settings
                  .filter((s) => s.groupName === group)
                  .map((setting) => (
                    <div key={setting.id} className="flex flex-col gap-1.5">
                      <Label htmlFor={setting.key} className="flex items-center gap-2">
                        {humanize(setting.key)}
                        {!setting.isPublic ? (
                          <Badge variant="outline" className="gap-1 text-[10px]">
                            <Lock className="size-2.5" /> Private
                          </Badge>
                        ) : null}
                      </Label>
                      <Input
                        id={setting.key}
                        value={values[setting.key] ?? ""}
                        disabled={!canEdit}
                        onChange={(e) => setValues({ ...values, [setting.key]: e.target.value })}
                      />
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </form>
  );
}

function AdminSettingsHeader({ canEdit, action }: { canEdit: boolean; action?: React.ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
      <div>
        <h1 className="text-xl font-semibold text-foreground sm:text-2xl">Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {canEdit
            ? "Site-wide configuration. Public settings appear on the marketing site."
            : "Read-only — your role can view settings but not change them."}
        </p>
      </div>
      {action}
    </div>
  );
}
