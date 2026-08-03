"use client";

import { useState } from "react";
import { toast } from "sonner";
import { UserMinus } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Pagination } from "@/components/common/pagination";
import { useProfileQuery } from "@/features/auth/hooks/use-auth";
import { canManageContent } from "@/features/auth/permissions";
import { getErrorMessage } from "@/utils/errors";
import { formatDate } from "@/utils/format";
import { useAdminSubscribers, useUnsubscribe } from "../hooks/use-admin";
import { AdminListState, AdminPageHeader, AdminTable } from "./admin-page";
import { StatusSelect } from "./status-select";

type Filter = "active" | "inactive";
const FILTERS: Filter[] = ["active", "inactive"];
const LABELS: Record<Filter, string> = { active: "Subscribed", inactive: "Unsubscribed" };

export function NewsletterContent() {
  const { data: admin } = useProfileQuery();
  const canManage = canManageContent(admin?.role);

  const [filter, setFilter] = useState<Filter | undefined>();
  const [page, setPage] = useState(0);

  const { data, isPending, isError } = useAdminSubscribers({
    active: filter === undefined ? undefined : filter === "active",
    page,
    size: 20,
  });
  const unsubscribe = useUnsubscribe();

  return (
    <>
      <AdminPageHeader
        title="Newsletter"
        description="People who signed up for travel deals."
        action={
          <StatusSelect
            value={filter}
            options={FILTERS}
            labels={LABELS}
            anyLabel="Everyone"
            ariaLabel="Filter subscribers"
            onChange={(v) => {
              setFilter(v);
              setPage(0);
            }}
          />
        }
      />

      <AdminListState
        isPending={isPending}
        isError={isError}
        isEmpty={!data || data.content.length === 0}
        emptyMessage="No subscribers match this filter."
      >
        <AdminTable
          head={
            <>
              <th>Email</th>
              <th>Status</th>
              <th>Subscribed</th>
              <th>Unsubscribed</th>
              {canManage ? <th className="text-right">Actions</th> : null}
            </>
          }
        >
          {data?.content.map((subscriber) => (
            <tr key={subscriber.id} className="hover:bg-muted/40">
              <td className="font-medium text-foreground">{subscriber.email}</td>
              <td>
                <Badge
                  className={
                    subscriber.isActive
                      ? "bg-emerald-100 text-emerald-900 dark:bg-emerald-500/15 dark:text-emerald-300"
                      : "bg-muted text-muted-foreground"
                  }
                >
                  {subscriber.isActive ? "Subscribed" : "Unsubscribed"}
                </Badge>
              </td>
              <td className="whitespace-nowrap text-muted-foreground">
                {formatDate(subscriber.subscribedAt)}
              </td>
              <td className="whitespace-nowrap text-muted-foreground">
                {subscriber.unsubscribedAt ? formatDate(subscriber.unsubscribedAt) : "—"}
              </td>
              {canManage ? (
                <td className="text-right">
                  {subscriber.isActive ? (
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={unsubscribe.isPending}
                      onClick={() =>
                        unsubscribe.mutate(subscriber.id, {
                          onSuccess: () => toast.success("Subscriber unsubscribed"),
                          onError: (error) => toast.error(getErrorMessage(error)),
                        })
                      }
                    >
                      <UserMinus /> Unsubscribe
                    </Button>
                  ) : null}
                </td>
              ) : null}
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
