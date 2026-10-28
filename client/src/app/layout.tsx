import { ProvidersWrapper } from "./ProvidersWrapper";
import { AntdRegistry } from "@ant-design/nextjs-registry";
import { ThemeProvider } from "@/theme/ThemeProvider";
import "./globals.css";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <head>
        <title>吉宠宠物</title>
        <meta content="width=device-width, initial-scale=1" name="viewport" />
        <meta name="description" content="宠物店管理系统 - 让宠物护理更简单" />
        <link
          rel="icon"
          href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%2210 0 100 100%22><text y=%22.90em%22 font-size=%2290%22>🐾</text></svg>"
        ></link>
      </head>

      <body>
        <AntdRegistry>
          <ThemeProvider>
            <ProvidersWrapper>{children}</ProvidersWrapper>
          </ThemeProvider>
        </AntdRegistry>
      </body>
    </html>
  );
}
