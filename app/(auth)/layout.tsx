import { Sora } from "next/font/google";
import "./auth.css";

const sora = Sora({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-auth-sora",
});

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div
      className={`${sora.variable} ${sora.className} auth-shell min-h-screen`}
    >
      {children}
    </div>
  );
}
