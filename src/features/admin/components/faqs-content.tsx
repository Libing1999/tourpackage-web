"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Pencil, Plus, Trash2 } from "lucide-react";

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
import { useAdminFaqs, useDeleteFaq, useSaveFaq } from "../hooks/use-admin";
import type { FaqAdmin, FaqPayload } from "../types";
import { AdminListState, AdminPageHeader, AdminTable } from "./admin-page";

const EMPTY: FaqPayload = {
  question: "",
  answer: "",
  category: "General",
  displayOrder: 0,
  isActive: true,
};

export function FaqsContent() {
  const { data: admin } = useProfileQuery();
  const canManage = canManageContent(admin?.role);

  const { data, isPending, isError } = useAdminFaqs();
  const save = useSaveFaq();
  const remove = useDeleteFaq();

  const [editing, setEditing] = useState<FaqAdmin | null>(null);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<FaqPayload>(EMPTY);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY);
    setErrors({});
    setOpen(true);
  };

  const openEdit = (faq: FaqAdmin) => {
    setEditing(faq);
    setForm({
      question: faq.question,
      answer: faq.answer,
      category: faq.category,
      displayOrder: faq.displayOrder,
      isActive: faq.isActive,
    });
    setErrors({});
    setOpen(true);
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    save.mutate(
      { id: editing?.id, payload: form },
      {
        onSuccess: () => {
          toast.success(editing ? "FAQ updated" : "FAQ created");
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
        title="FAQs"
        description="Questions shown on the homepage, grouped by category."
        action={
          canManage ? (
            <Button onClick={openCreate}>
              <Plus /> New FAQ
            </Button>
          ) : null
        }
      />

      <AdminListState
        isPending={isPending}
        isError={isError}
        isEmpty={!data || data.length === 0}
        emptyMessage="No FAQs yet."
      >
        <AdminTable
          head={
            <>
              <th>Question</th>
              <th>Category</th>
              <th className="text-right">Order</th>
              <th>Status</th>
              {canManage ? <th className="text-right">Actions</th> : null}
            </>
          }
        >
          {data?.map((faq) => (
            <tr key={faq.id} className="hover:bg-muted/40 align-top">
              <td className="max-w-md">
                <p className="font-medium text-foreground">{faq.question}</p>
                <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">{faq.answer}</p>
              </td>
              <td>
                <Badge variant="outline">{faq.category}</Badge>
              </td>
              <td className="text-right text-muted-foreground">{faq.displayOrder}</td>
              <td>
                <Badge
                  className={
                    faq.isActive
                      ? "bg-emerald-100 text-emerald-900 dark:bg-emerald-500/15 dark:text-emerald-300"
                      : "bg-muted text-muted-foreground"
                  }
                >
                  {faq.isActive ? "Active" : "Hidden"}
                </Badge>
              </td>
              {canManage ? (
                <td>
                  <div className="flex items-center justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      aria-label={`Edit FAQ: ${faq.question}`}
                      onClick={() => openEdit(faq)}
                    >
                      <Pencil />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      aria-label={`Delete FAQ: ${faq.question}`}
                      disabled={remove.isPending}
                      onClick={() => {
                        if (!confirm("Delete this FAQ?")) return;
                        remove.mutate(faq.id, {
                          onSuccess: () => toast.success("FAQ deleted"),
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
            <DialogTitle>{editing ? "Edit FAQ" : "New FAQ"}</DialogTitle>
            <DialogDescription>
              FAQs are grouped by category and sorted by display order within each.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={submit} noValidate className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="f-question">Question</Label>
              <Input
                id="f-question"
                value={form.question}
                onChange={(e) => setForm({ ...form, question: e.target.value })}
                aria-invalid={!!errors.question}
              />
              {errors.question ? <p className="text-sm text-destructive">{errors.question}</p> : null}
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="f-answer">Answer</Label>
              <Textarea
                id="f-answer"
                rows={4}
                value={form.answer}
                onChange={(e) => setForm({ ...form, answer: e.target.value })}
                aria-invalid={!!errors.answer}
              />
              {errors.answer ? <p className="text-sm text-destructive">{errors.answer}</p> : null}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="f-category">Category</Label>
                <Input
                  id="f-category"
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  aria-invalid={!!errors.category}
                />
                {errors.category ? <p className="text-sm text-destructive">{errors.category}</p> : null}
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="f-order">Display order</Label>
                <Input
                  id="f-order"
                  type="number"
                  value={form.displayOrder}
                  onChange={(e) => setForm({ ...form, displayOrder: Number(e.target.value) })}
                />
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <Checkbox
                id="f-active"
                checked={form.isActive}
                onCheckedChange={(checked) => setForm({ ...form, isActive: checked === true })}
              />
              <Label htmlFor="f-active" className="font-normal">
                Active
              </Label>
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
