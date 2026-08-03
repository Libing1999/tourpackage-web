"use client";

import Link from "next/link";
import { LogOut, Menu, UserRound } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { ThemeToggle } from "@/components/common/theme-toggle";
import { Logo } from "@/components/common/logo";
import { useLogout, useProfileQuery } from "@/features/auth/hooks/use-auth";
import { DashboardNav } from "./dashboard-nav";

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function DashboardTopbar() {
  const { data: admin } = useProfileQuery();
  const logout = useLogout();

  return (
    <header className="flex h-14 shrink-0 items-center gap-3 border-b bg-background px-4">
      <Sheet>
        <SheetTrigger render={<Button variant="ghost" size="icon" className="md:hidden" />}>
          <Menu className="size-4" />
          <span className="sr-only">Open navigation</span>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 p-0">
          <SheetHeader className="h-14 flex-row items-center border-b">
            <Logo />
            <SheetTitle className="sr-only">Navigation menu</SheetTitle>
          </SheetHeader>
          <div className="p-3">
            <DashboardNav />
          </div>
        </SheetContent>
      </Sheet>

      <div className="flex-1" />

      <ThemeToggle />

      {admin ? (
        <DropdownMenu>
          <DropdownMenuTrigger
            aria-label="Open user menu"
            render={<Button variant="ghost" className="gap-2 px-1.5" />}
          >
            <Avatar className="size-7">
              <AvatarImage src={admin.avatarUrl ?? undefined} alt={admin.fullName} />
              <AvatarFallback>{initials(admin.fullName)}</AvatarFallback>
            </Avatar>
            <span className="hidden text-sm font-medium sm:inline">{admin.fullName}</span>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <div className="flex flex-col gap-1 px-1.5 py-1.5 text-sm">
              <span className="font-medium">{admin.fullName}</span>
              <span className="truncate text-xs font-normal text-muted-foreground">{admin.email}</span>
              <Badge variant="secondary" className="mt-1 w-fit text-[10px]">
                {admin.role.replace("_", " ")}
              </Badge>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem render={<Link href="/profile" />}>
              <UserRound />
              Profile
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive" onClick={() => logout()}>
              <LogOut />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ) : null}
    </header>
  );
}
