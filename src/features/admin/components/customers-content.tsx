"use client";

import { useState } from "react";
import { Search } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Pagination } from "@/components/common/pagination";
import { formatCurrency, formatDate } from "@/utils/format";
import { useAdminCustomers } from "../hooks/use-admin";
import { AdminListState, AdminPageHeader, AdminTable } from "./admin-page";

export function CustomersContent() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);

  const { data, isPending, isError } = useAdminCustomers({ search: search || undefined, page, size: 15 });

  return (
    <>
      <AdminPageHeader
        title="Customers"
        description="Everyone who has booked. Customer records are created by the booking flow, not here."
      />

      <div className="relative mb-4">
        <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(0);
          }}
          placeholder="Search by name or email…"
          className="h-9 pl-8"
          aria-label="Search customers"
        />
      </div>

      <AdminListState
        isPending={isPending}
        isError={isError}
        isEmpty={!data || data.content.length === 0}
        emptyMessage="No customers yet."
      >
        <AdminTable
          head={
            <>
              <th>Customer</th>
              <th>Phone</th>
              <th className="text-right">Bookings</th>
              <th className="text-right">Total spent</th>
              <th>Joined</th>
            </>
          }
        >
          {data?.content.map((customer) => (
            <tr key={customer.id} className="hover:bg-muted/40">
              <td>
                <p className="font-medium text-foreground">{customer.fullName}</p>
                <p className="text-xs text-muted-foreground">{customer.email}</p>
              </td>
              <td className="text-muted-foreground">{customer.phone ?? "—"}</td>
              <td className="text-right">{customer.bookingCount}</td>
              <td className="text-right font-medium whitespace-nowrap">
                {formatCurrency(customer.totalSpent, "USD")}
              </td>
              <td className="whitespace-nowrap text-muted-foreground">{formatDate(customer.createdAt)}</td>
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
