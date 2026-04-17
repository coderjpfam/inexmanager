import { FinanceProvider } from "@/components/main/finance-provider";
import { MainAuthGate } from "@/components/main/main-auth-gate";
import { MainShell } from "@/components/main/main-shell";
import { JetBrains_Mono, Sora } from "next/font/google";
import "./main.css";

const sora = Sora({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-sora-main",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-main-mono",
});

export default function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <FinanceProvider>
      <div
        className={`${sora.variable} ${jetbrainsMono.variable} ${sora.className}`}
      >
        <MainAuthGate>
          <MainShell>{children}</MainShell>
        </MainAuthGate>
      </div>
    </FinanceProvider>
  );
}
