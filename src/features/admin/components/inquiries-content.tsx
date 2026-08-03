"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Search } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Pagination } from "@/components/common/pagination";
import { useProfileQuery } from "@/features/auth/hooks/use-auth";
import { canManageOperations } from "@/features/auth/permissions";
import { getErrorMessage } from "@/utils/errors";
import { formatDate } from "@/utils/format";
import { cn } from "@/lib/utils";
import { useAdminInquiries, useUpdateInquiryStatus } from "../hooks/use-admin";
import type { InquiryStatus } from "../types";
import { AdminListState, AdminPageHeader, AdminTable } from "./admin-page";
import { StatusSelect } from "./status-select";

const STATUSES: InquiryStatus[] = ["NEW", "IN_PROGRESS", "RESOLVED", "CLOSED"];
const LABELS: Record<InquiryStatus, string> = {
  NEW: "New",
  IN_PROGRESS: "In progress",
  RESOLVED: "Resolved",
  CLOSED: "Closed",
};
const BADGE_CLASSES: Record<InquiryStatus, string> = {
  NEW: "bg-amber-100 text-amber-900 dark:bg-amber-500/15 dark:text-amber-300",
  IN_PROGRESS: "bg-sky-100 text-sky-900 dark:bg-sky-500/15 dark:text-sky-300",
  RESOLVED: "bg-emerald-100 text-emerald-900 dark:bg-emerald-500/15 dark:text-emerald-300",
  CLOSED: "bg-muted text-muted-foreground",
};

export function InquiriesContent() {
  const { data: admin } = useProfileQuery();
  const canManage = canManageOperations(admin?.role);

  const [status, setStatus] = useState<InquiryStatus | undefined>();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);

  const { data, isPending, isError } = useAdminInquiries({
    status,
    search: search || undefined,
    page,
    size: 15,
  });
  const updateStatus = useUpdateInquiryStatus();

  return (
    <>
      <AdminPageHeader title="Inquiries" description="Messages from the contact page." />

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(0);
            }}
            placeholder="Search by name or email…"
            className="h-9 pl-8"
            aria-label="Search inquiries"
          />
        </div>
        <StatusSelect
          value={status}
          options={STATUSES}
          labels={LABELS}
          anyLabel="All statuses"
          ariaLabel="Filter by status"
          onChange={(v) => {
            setStatus(v);
            setPage(0);
          }}
        />
      </div>

      <AdminListState
        isPending={isPending}
        isError={isError}
        isEmpty={!data || data.content.length === 0}
        emptyMessage="No inquiries match these filters."
      >
        <AdminTable
          head={
            <>
              <th>From</th>
              <th>Message</th>
              <th>Trip</th>
              <th>Received</th>
              <th>Status</th>
            </>
          }
        >
          {data?.content.map((inquiry) => (
            <tr key={inquiry.id} className="hover:bg-muted/40 align-top">
              <td>
                <p className="font-medium text-foreground">{inquiry.name}</p>
                <p className="text-xs text-muted-foreground">{inquiry.email}</p>
                {inquiry.phone ? (
                  <p className="text-xs text-muted-foreground">{inquiry.phone}</p>
                ) : null}
              </td>
              <td className="max-w-sm">
                <p className="line-clamp-3 text-muted-foreground">{inquiry.message}</p>
              </td>
              <td className="text-xs text-muted-foreground">
                {inquiry.packageTitle ? (
                  <Badge variant="outline" className="mb-1">
                    {inquiry.packageTitle}
                  </Badge>
                ) : null}
                {inquiry.travelDate ? <p>{formatDate(inquiry.travelDate)}</p> : null}
                {inquiry.partySize ? <p>{inquiry.partySize} travellers</p> : null}
                {!inquiry.packageTitle && !inquiry.travelDate && !inquiry.partySize ? "—" : null}
              </td>
              <td className="whitespace-nowrap text-muted-foreground">{formatDate(inquiry.createdAt)}</td>
              <td>
                {canManage ? (
                  <StatusSelect
                    value={inquiry.status}
                    options={STATUSES}
                    labels={LABELS}
                    ariaLabel={`Change status for ${inquiry.name}`}
                    className="w-[150px]"
                    disabled={updateStatus.isPending}
                    onChange={(next) =>
                      next &&
                      next !== inquiry.status &&
                      updateStatus.mutate(
                        { id: inquiry.id, status: next },
                        {
                          onSuccess: () => toast.success(`Marked ${LABELS[next].toLowerCase()}`),
                          onError: (error) => toast.error(getErrorMessage(error)),
                        }
                      )
                    }
                  />
                ) : (
                  <Badge className={cn(BADGE_CLASSES[inquiry.status])}>{LABELS[inquiry.status]}</Badge>
                )}
              </td>
            </tr>
          ))}
        </AdminTable>

        {data ? (
          <Pagination page={data.page} totalPages={data.totalPages} onPageChange={setPage} className="mt-5" />
        ) : null}
      </AdminListState>
    </>
  );
}
