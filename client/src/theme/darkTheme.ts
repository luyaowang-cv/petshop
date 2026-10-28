import type { ThemeConfig } from "antd";
import { theme } from "antd";

export const darkTheme: ThemeConfig = {
  algorithm: theme.darkAlgorithm,
  token: {
    // 主色调：蓝色系（保持一致）
    colorPrimary: "#1890ff",
    colorSuccess: "#52c41a",
    colorWarning: "#faad14",
    colorError: "#ff4d4f",
    colorInfo: "#1890ff",
    colorLink: "#1890ff",

    // 圆角设计（温馨可爱风格）
    borderRadius: 8,
    borderRadiusLG: 12,
    borderRadiusSM: 6,

    // 字体
    fontSize: 14,
    fontSizeHeading1: 38,
    fontSizeHeading2: 30,
    fontSizeHeading3: 24,
    fontSizeHeading4: 20,
    fontSizeHeading5: 16,

    // 布局
    padding: 16,
    margin: 16,

    // 背景色（深蓝色而非纯黑，保持温馨感）
    colorBgLayout: "#141414",
    colorBgContainer: "#1f1f1f",
    colorBgElevated: "#2a2a2a",

    // 文本颜色
    colorText: "rgba(255, 255, 255, 0.85)",
    colorTextSecondary: "rgba(255, 255, 255, 0.65)",
    colorTextTertiary: "rgba(255, 255, 255, 0.45)",
    colorTextQuaternary: "rgba(255, 255, 255, 0.25)",

    // 边框颜色
    colorBorder: "#434343",
    colorBorderSecondary: "#303030",
  },
  components: {
    Layout: {
      headerBg: "#1f1f1f",
      headerHeight: 64,
      headerPadding: "0 24px",
      siderBg: "#1f1f1f",
      bodyBg: "#141414",
    },
    Menu: {
      itemBg: "transparent",
      itemSelectedBg: "#111a2c",
      itemSelectedColor: "#1890ff",
      itemHoverBg: "#2a2a2a",
      itemHoverColor: "#1890ff",
      itemActiveBg: "#111a2c",
      itemBorderRadius: 8,
    },
    Button: {
      borderRadius: 8,
      controlHeight: 40,
      controlHeightLG: 48,
      controlHeightSM: 32,
      fontWeight: 500,
    },
    Input: {
      borderRadius: 8,
      controlHeight: 40,
      controlHeightLG: 48,
      controlHeightSM: 32,
    },
    Card: {
      borderRadius: 12,
    },
    Table: {
      borderRadius: 8,
      headerBg: "#2a2a2a",
    },
    Modal: {
      borderRadius: 12,
    },
    Drawer: {
      borderRadius: 12,
    },
    Select: {
      borderRadius: 8,
      controlHeight: 40,
    },
    DatePicker: {
      borderRadius: 8,
      controlHeight: 40,
    },
  },
};
