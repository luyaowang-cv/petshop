"use client";

import React, { createContext, useContext } from "react";
import { ConfigProvider } from "antd";
import zhCN from "antd/locale/zh_CN";
import { lightTheme, darkTheme } from "./index";
import { useTheme, ThemeMode } from "@/hooks/useTheme";

interface ThemeContextType {
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { theme, setTheme, toggleTheme, mounted } = useTheme();

  // 避免服务端渲染和客户端渲染不一致
  if (!mounted) {
    return (
      <ConfigProvider locale={zhCN} theme={lightTheme}>
        {children}
      </ConfigProvider>
    );
  }

  const currentTheme = theme === "dark" ? darkTheme : lightTheme;

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      <ConfigProvider locale={zhCN} theme={currentTheme}>
        {children}
      </ConfigProvider>
    </ThemeContext.Provider>
  );
}

export function useThemeContext() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useThemeContext must be used within a ThemeProvider");
  }
  return context;
}
