"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ProfileForm } from "@/features/auth/components/profile-form";
import { useProfileQuery } from "@/features/auth/hooks/use-auth";

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export default function ProfilePage() {
  const { data: admin, isPending } = useProfileQuery();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Profile</h1>
        <p className="text-muted-foreground">Manage your account information.</p>
      </div>

      {isPending || !admin ? (
        <Card>
          <CardHeader>
            <Skeleton className="h-16 w-16 rounded-full" />
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <Skeleton className="h-9 w-full" />
            <Skeleton className="h-9 w-full" />
            <Skeleton className="h-9 w-full" />
          </CardContent>
        </Card>
      ) : (
        <>
          <Card>
            <CardHeader className="flex-row items-center gap-4 space-y-0">
              <Avatar className="size-16">
                <AvatarImage src={admin.avatarUrl ?? undefined} alt={admin.fullName} />
                <AvatarFallback className="text-lg">{initials(admin.fullName)}</AvatarFallback>
              </Avatar>
              <div className="flex flex-col gap-1.5">
                <CardTitle className="text-lg">{admin.fullName}</CardTitle>
                <div className="flex flex-wrap items-center gap-1.5">
                  <Badge variant="secondary">{admin.role.replace("_", " ")}</Badge>
                  <Badge variant={admin.emailVerified ? "default" : "outline"}>
                    {admin.emailVerified ? "Email verified" : "Email unverified"}
                  </Badge>
                </div>
              </div>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Account details</CardTitle>
              <CardDescription>Update your name, phone, and avatar.</CardDescription>
            </CardHeader>
            <CardContent>
              <ProfileForm admin={admin} />
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
