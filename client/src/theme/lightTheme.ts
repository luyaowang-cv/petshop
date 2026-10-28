import type { ThemeConfig } from "antd";

export const lightTheme: ThemeConfig = {
  token: {
    // 主色调：蓝色系
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

    // 背景色（柔和舒适）
    colorBgLayout: "#f0f2f5",
    colorBgContainer: "#ffffff",
    colorBgElevated: "#ffffff",

    // 文本颜色
    colorText: "rgba(0, 0, 0, 0.88)",
    colorTextSecondary: "rgba(0, 0, 0, 0.65)",
    colorTextTertiary: "rgba(0, 0, 0, 0.45)",
    colorTextQuaternary: "rgba(0, 0, 0, 0.25)",
  },
  components: {
    Layout: {
      headerBg: "#ffffff",
      headerHeight: 64,
      headerPadding: "0 24px",
      siderBg: "#ffffff",
      bodyBg: "#f0f2f5",
    },
    Menu: {
      itemBg: "transparent",
      itemSelectedBg: "#e6f7ff",
      itemSelectedColor: "#1890ff",
      itemHoverBg: "#f5f5f5",
      itemHoverColor: "#1890ff",
      itemActiveBg: "#e6f7ff",
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
      boxShadowTertiary:
        "0 1px 2px 0 rgba(0, 0, 0, 0.03), 0 1px 6px -1px rgba(0, 0, 0, 0.02), 0 2px 4px 0 rgba(0, 0, 0, 0.02)",
    },
    Table: {
      borderRadius: 8,
      headerBg: "#fafafa",
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
