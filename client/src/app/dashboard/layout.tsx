"use client";

import { useEffect, useState } from "react";
import { redirect } from "next/navigation";
import { useSessionStore } from "src/stores/session";
import { DashboardLayout as NewDashboardLayout } from "@/components/layouts/DashboardLayout";
import { Spin } from "antd";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [hydrated, setHydrated] = useState(false);
  const isUserLoggedIn = useSessionStore((state) => state.isLoggedIn);

  useEffect(() => {
    setHydrated(true);
  }, []);

  if (!hydrated) {
    // Returns null on first render, so the client and server match
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Spin size="large" tip="加载中..." />
      </div>
    );
  }

  if (!isUserLoggedIn) {
    redirect("/login");
  }

  return <NewDashboardLayout>{children}</NewDashboardLayout>;
}
