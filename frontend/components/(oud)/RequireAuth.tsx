"use client";

import React, { Suspense, useEffect, useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import type { Role } from "@/types/user";
import { useAuth } from "../AuthProvider";

type RequireAuthProps = {
  roles?: Role[];
  children: React.ReactNode;
};

function RequireAuthInner({ roles, children }: RequireAuthProps) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (loading || checked) {
      return;
    }

    if (!user) {
      const search = searchParams.toString();
      const nextPath = search ? `${pathname}?${search}` : pathname;
      const url = `/login?next=${encodeURIComponent(nextPath)}`;
      router.push(url);
      return;
    }

    if (roles && roles.length > 0 && !roles.includes(user.role)) {
      setChecked(true);
      return;
    }

    setChecked(true);
  }, [checked, loading, pathname, router, searchParams, roles, user]);

  if (loading || !checked) {
    return null;
  }

  if (!user) {
    return null;
  }

  if (roles && roles.length > 0 && !roles.includes(user.role)) {
    return <div>Geen toegang</div>;
  }

  return <>{children}</>;
}

export default function RequireAuth(props: RequireAuthProps) {
  return (
    <Suspense fallback={null}>
      <RequireAuthInner {...props} />
    </Suspense>
  );
}
