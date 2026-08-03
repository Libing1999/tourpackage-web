"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Pencil, Plus, Star, Trash2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Spinner } from "@/components/common/spinner";
import { useProfileQuery } from "@/features/auth/hooks/use-auth";
import { canManageContent } from "@/features/auth/permissions";
import { getErrorMessage, getFieldErrors } from "@/utils/errors";
import { formatDate } from "@/utils/format";
import {
  useAdminTestimonials,
  useDeleteTestimonial,
  useSaveTestimonial,
} from "../hooks/use-admin";
import type { TestimonialAdmin } from "../types";
import { AdminListState, AdminPageHeader, AdminTable } from "./admin-page";

interface FormState {
  customerName: string;
  rating: number;
  message: string;
  isFeatured: boolean;
  isActive: boolean;
}

const EMPTY: FormState = {
  customerName: "",
  rating: 5,
  message: "",
  isFeatured: false,
  isActive: true,
};

export function TestimonialsContent() {
  const { data: admin } = useProfileQuery();
  const canManage = canManageContent(admin?.role);

  const { data, isPending, isError } = useAdminTestimonials();
  const save = useSaveTestimonial();
  const remove = useDeleteTestimonial();

  const [editing, setEditing] = useState<TestimonialAdmin | null>(null);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<FormState>(EMPTY);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY);
    setErrors({});
    setOpen(true);
  };

  const openEdit = (testimonial: TestimonialAdmin) => {
    setEditing(testimonial);
    setForm({
      customerName: testimonial.customerName,
      rating: testimonial.rating,
      message: testimonial.message,
      isFeatured: testimonial.isFeatured,
      isActive: testimonial.isActive,
    });
    setErrors({});
    setOpen(true);
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    save.mutate(
      {
        id: editing?.id,
        payload: {
          ...form,
          // Preserved rather than dropped: this form doesn't edit the country
          // or package links, and sending them as null would quietly unlink a
          // testimonial that was attached to a trip.
          customerCountryId: editing?.customerCountryId ?? null,
          packageId: editing?.packageId ?? null,
        },
      },
      {
        onSuccess: () => {
          toast.success(editing ? "Testimonial updated" : "Testimonial created");
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
        title="Testimonials"
        description="Customer reviews shown on the homepage."
        action={
          canManage ? (
            <Button onClick={openCreate}>
              <Plus /> New testimonial
            </Button>
          ) : null
        }
      />

      <AdminListState
        isPending={isPending}
        isError={isError}
        isEmpty={!data || data.length === 0}
        emptyMessage="No testimonials yet."
      >
        <AdminTable
          head={
            <>
              <th>Customer</th>
              <th>Rating</th>
              <th>Message</th>
              <th>Visibility</th>
              <th>Added</th>
              {canManage ? <th className="text-right">Actions</th> : null}
            </>
          }
        >
          {data?.map((testimonial) => (
            <tr key={testimonial.id} className="hover:bg-muted/40 align-top">
              <td>
                <p className="font-medium text-foreground">{testimonial.customerName}</p>
                {testimonial.customerCountryName ? (
                  <p className="text-xs text-muted-foreground">{testimonial.customerCountryName}</p>
                ) : null}
                {testimonial.packageTitle ? (
                  <p className="text-xs text-muted-foreground">{testimonial.packageTitle}</p>
                ) : null}
              </td>
              <td>
                <span className="flex items-center gap-1 whitespace-nowrap">
                  <Star className="size-3.5 fill-amber-400 text-amber-400" />
                  {testimonial.rating}
                </span>
              </td>
              <td className="max-w-sm">
                <p className="line-clamp-2 text-muted-foreground">{testimonial.message}</p>
              </td>
              <td>
                <div className="flex flex-wrap gap-1">
                  {testimonial.isFeatured ? <Badge variant="outline">Featured</Badge> : null}
                  <Badge
                    className={
                      testimonial.isActive
                        ? "bg-emerald-100 text-emerald-900 dark:bg-emerald-500/15 dark:text-emerald-300"
                        : "bg-muted text-muted-foreground"
                    }
                  >
                    {testimonial.isActive ? "Active" : "Hidden"}
                  </Badge>
                </div>
              </td>
              <td className="whitespace-nowrap text-muted-foreground">
                {formatDate(testimonial.createdAt)}
              </td>
              {canManage ? (
                <td>
                  <div className="flex items-center justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      aria-label={`Edit testimonial from ${testimonial.customerName}`}
                      onClick={() => openEdit(testimonial)}
                    >
                      <Pencil />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      aria-label={`Delete testimonial from ${testimonial.customerName}`}
                      disabled={remove.isPending}
                      onClick={() => {
                        if (!confirm(`Delete the testimonial from ${testimonial.customerName}?`)) return;
                        remove.mutate(testimonial.id, {
                          onSuccess: () => toast.success("Testimonial deleted"),
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
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit testimonial" : "New testimonial"}</DialogTitle>
            <DialogDescription>
              Featured testimonials appear on the homepage; hidden ones appear nowhere.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={submit} noValidate className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="t-name">Customer name</Label>
              <Input
                id="t-name"
                value={form.customerName}
                onChange={(e) => setForm({ ...form, customerName: e.target.value })}
                aria-invalid={!!errors.customerName}
              />
              {errors.customerName ? (
                <p className="text-sm text-destructive">{errors.customerName}</p>
              ) : null}
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="t-rating">Rating (1–5)</Label>
              <Input
                id="t-rating"
                type="number"
                min={1}
                max={5}
                value={form.rating}
                onChange={(e) => setForm({ ...form, rating: Number(e.target.value) })}
                aria-invalid={!!errors.rating}
              />
              {errors.rating ? <p className="text-sm text-destructive">{errors.rating}</p> : null}
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="t-message">Message</Label>
              <Textarea
                id="t-message"
                rows={4}
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                aria-invalid={!!errors.message}
              />
              {errors.message ? <p className="text-sm text-destructive">{errors.message}</p> : null}
            </div>

            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2.5">
                <Checkbox
                  id="t-featured"
                  checked={form.isFeatured}
                  onCheckedChange={(checked) => setForm({ ...form, isFeatured: checked === true })}
                />
                <Label htmlFor="t-featured" className="font-normal">
                  Show on homepage
                </Label>
              </div>
              <div className="flex items-center gap-2.5">
                <Checkbox
                  id="t-active"
                  checked={form.isActive}
                  onCheckedChange={(checked) => setForm({ ...form, isActive: checked === true })}
                />
                <Label htmlFor="t-active" className="font-normal">
                  Active
                </Label>
              </div>
            </div>

            <div className="mt-2 flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={save.isPending}>
                {save.isPending ? <Spinner /> : null}
                {editing ? "Save changes" : "Create"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
