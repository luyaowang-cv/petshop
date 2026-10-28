"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "react-hot-toast";
import dayjs from "dayjs";
import "dayjs/locale/zh-cn";

// 设置 Day.js 默认语言为中文
dayjs.locale("zh-cn");

export function ProvidersWrapper({ children }: { children: React.ReactNode }) {
  const client = new QueryClient();

  return (
    <QueryClientProvider client={client}>
      <Toaster
        position="top-right"
        toastOptions={{
          className: "bg-base-300 text-base-content",
          success: {
            iconTheme: {
              primary: "hsl(var(--su))",
              secondary: "hsl(var(--suc))",
            },
          },
          error: {
            iconTheme: {
              primary: "hsl(var(--er))",
              secondary: "hsl(var(--erc))",
            },
          },
        }}
      />
      {children}
    </QueryClientProvider>
  );
}
