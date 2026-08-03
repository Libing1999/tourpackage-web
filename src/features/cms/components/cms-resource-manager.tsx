"use client";

import { useState, type ReactNode } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Pencil, Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Spinner } from "@/components/common/spinner";
import { AdminListState, AdminPageHeader, AdminTable } from "@/features/admin/components/admin-page";
import { useProfileQuery } from "@/features/auth/hooks/use-auth";
import { canManageContent } from "@/features/auth/permissions";
import { MediaPicker } from "@/features/media/components/media-picker";
import { getErrorMessage, getFieldErrors } from "@/utils/errors";

export type FieldType = "text" | "textarea" | "number" | "checkbox" | "select" | "image";

export interface CmsField<T> {
  name: keyof T & string;
  label: string;
  type?: FieldType;
  options?: readonly { value: string; label: string }[];
  placeholder?: string;
  /** Rendered half-width so short fields can share a row. */
  half?: boolean;
  rows?: number;
}

export interface CmsColumn<T> {
  header: string;
  render: (row: T) => ReactNode;
  className?: string;
}

interface CmsResourceManagerProps<T extends { id: string }> {
  title: string;
  description: string;
  /** Singular noun used in buttons and confirmations ("banner", "FAQ"). */
  noun: string;
  queryKey: readonly unknown[];
  list: () => Promise<T[]>;
  save: (id: string | undefined, payload: Omit<T, "id">) => Promise<T>;
  remove: (id: string) => Promise<unknown>;
  fields: CmsField<T>[];
  columns: CmsColumn<T>[];
  emptyRow: Omit<T, "id">;
  /** How to describe a row in a delete confirmation. */
  describe: (row: T) => string;
  /** Extra controls for this resource, rendered between the page heading and
   * the table — the gallery's reorder strip is the one user of this. */
  afterHeader?: ReactNode;
}

/**
 * One list-and-dialog screen, driven by a field description.
 *
 * <p>All six CMS resources are the same screen with different fields — six
 * hand-written copies would be ~1,500 lines that drift apart the first time
 * one of them gets a fix. The trade-off is that a resource needing genuinely
 * custom editing (rich text, image pickers) would outgrow this and want its
 * own component; none of them do yet.
 */
export function CmsResourceManager<T extends { id: string }>({
  title,
  description,
  noun,
  queryKey,
  list,
  save,
  remove,
  fields,
  columns,
  emptyRow,
  describe,
  afterHeader,
}: CmsResourceManagerProps<T>) {
  const { data: admin } = useProfileQuery();
  const canManage = canManageContent(admin?.role);
  const queryClient = useQueryClient();

  const { data, isPending, isError } = useQuery({ queryKey, queryFn: list });

  const invalidate = () => queryClient.invalidateQueries({ queryKey });

  const saveMutation = useMutation({
    mutationFn: ({ id, payload }: { id?: string; payload: Omit<T, "id"> }) => save(id, payload),
    onSuccess: invalidate,
  });
  const removeMutation = useMutation({ mutationFn: remove, onSuccess: invalidate });

  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | undefined>();
  const [form, setForm] = useState<Record<string, unknown>>(emptyRow as Record<string, unknown>);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const openCreate = () => {
    setEditingId(undefined);
    setForm(emptyRow as Record<string, unknown>);
    setErrors({});
    setOpen(true);
  };

  const openEdit = (row: T) => {
    // Only the declared fields are copied — the id and any server-managed
    // timestamps stay out of the payload.
    const next: Record<string, unknown> = { ...(emptyRow as Record<string, unknown>) };
    for (const field of fields) {
      next[field.name] = (row as Record<string, unknown>)[field.name];
    }
    setEditingId(row.id);
    setForm(next);
    setErrors({});
    setOpen(true);
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    saveMutation.mutate(
      { id: editingId, payload: form as Omit<T, "id"> },
      {
        onSuccess: () => {
          toast.success(editingId ? `${title} updated` : `${noun} created`);
          setOpen(false);
        },
        onError: (error) => {
          const fieldErrors = getFieldErrors(error);
          if (fieldErrors) {
            setErrors(fieldErrors);
            return;
          }
          toast.error(getErrorMessage(error));
        },
      }
    );
  };

  return (
    <>
      <AdminPageHeader
        title={title}
        description={description}
        action={
          canManage ? (
            <Button onClick={openCreate}>
              <Plus /> New {noun}
            </Button>
          ) : null
        }
      />

      {afterHeader}

      <AdminListState
        isPending={isPending}
        isError={isError}
        isEmpty={!data || data.length === 0}
        emptyMessage={`No ${noun}s yet.`}
      >
        <AdminTable
          head={
            <>
              {columns.map((c) => (
                <th key={c.header} className={c.className}>
                  {c.header}
                </th>
              ))}
              {canManage ? <th className="text-right">Actions</th> : null}
            </>
          }
        >
          {data?.map((row) => (
            <tr key={row.id} className="align-top hover:bg-muted/40">
              {columns.map((c) => (
                <td key={c.header} className={c.className}>
                  {c.render(row)}
                </td>
              ))}
              {canManage ? (
                <td>
                  <div className="flex items-center justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      aria-label={`Edit ${describe(row)}`}
                      onClick={() => openEdit(row)}
                    >
                      <Pencil />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      aria-label={`Delete ${describe(row)}`}
                      disabled={removeMutation.isPending}
                      onClick={() => {
                        if (!confirm(`Delete "${describe(row)}"?`)) return;
                        removeMutation.mutate(row.id, {
                          onSuccess: () => toast.success(`${noun} deleted`),
                          onError: (error) => toast.error(getErrorMessage(error)),
                        });
                      }}
                    >
                      <Trash2 className="text-destructive" />
                    </Button>
                  </div>
                </td>
              ) : null}
            </tr>
          ))}
        </AdminTable>
      </AdminListState>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingId ? `Edit ${noun}` : `New ${noun}`}
            </DialogTitle>
            <DialogDescription>{description}</DialogDescription>
          </DialogHeader>

          <form onSubmit={submit} noValidate className="flex flex-col gap-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {fields.map((field) => {
                const id = `cms-${field.name}`;
                const value = form[field.name];
                const error = errors[field.name];
                const span = field.half ? "" : "sm:col-span-2";

                return (
                  <div key={field.name} className={`flex flex-col gap-1.5 ${span}`}>
                    {field.type !== "checkbox" ? <Label htmlFor={id}>{field.label}</Label> : null}

                    {field.type === "textarea" ? (
                      <Textarea
                        id={id}
                        rows={field.rows ?? 4}
                        placeholder={field.placeholder}
                        value={(value as string) ?? ""}
                        onChange={(e) => setForm({ ...form, [field.name]: e.target.value })}
                        aria-invalid={!!error}
                      />
                    ) : field.type === "checkbox" ? (
                      <div className="flex items-center gap-2.5 pt-6">
                        <Checkbox
                          id={id}
                          checked={Boolean(value)}
                          onCheckedChange={(checked) =>
                            setForm({ ...form, [field.name]: checked === true })
                          }
                        />
                        <Label htmlFor={id} className="font-normal">
                          {field.label}
                        </Label>
                      </div>
                    ) : field.type === "image" ? (
                      <MediaPicker
                        id={id}
                        value={(value as string) ?? ""}
                        placeholder={field.placeholder}
                        onChange={(url) => setForm({ ...form, [field.name]: url })}
                      />
                    ) : field.type === "select" ? (
                      <Select
                        value={(value as string) ?? ""}
                        onValueChange={(v) => setForm({ ...form, [field.name]: v as string })}
                      >
                        <SelectTrigger className="w-full" aria-label={field.label}>
                          <SelectValue placeholder={field.label}>
                            {(v: string | null) =>
                              field.options?.find((o) => o.value === v)?.label ?? field.label
                            }
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          {field.options?.map((o) => (
                            <SelectItem key={o.value} value={o.value}>
                              {o.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <Input
                        id={id}
                        type={field.type === "number" ? "number" : "text"}
                        placeholder={field.placeholder}
                        value={(value as string | number) ?? ""}
                        onChange={(e) =>
                          setForm({
                            ...form,
                            [field.name]:
                              field.type === "number" ? Number(e.target.value) : e.target.value,
                          })
                        }
                        aria-invalid={!!error}
                      />
                    )}

                    {error ? <p className="text-sm text-destructive">{error}</p> : null}
                  </div>
                );
              })}
            </div>

            <div className="mt-2 flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={saveMutation.isPending}>
                {saveMutation.isPending ? <Spinner /> : null}
                {editingId ? "Save changes" : "Create"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
