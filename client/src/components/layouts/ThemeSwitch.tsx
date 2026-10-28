"use client";

import { Switch } from "antd";
import { MoonOutlined, SunOutlined } from "@ant-design/icons";
import { useThemeContext } from "@/theme/ThemeProvider";

export function ThemeSwitch() {
  try {
    const { theme, toggleTheme } = useThemeContext();

    return (
      <Switch
        checked={theme === "dark"}
        onChange={toggleTheme}
        checkedChildren={<MoonOutlined />}
        unCheckedChildren={<SunOutlined />}
      />
    );
  } catch (error) {
    // 如果不在 ThemeProvider 中，返回一个禁用的开关
    return (
      <Switch
        disabled
        checkedChildren={<MoonOutlined />}
        unCheckedChildren={<SunOutlined />}
      />
    );
  }
}
