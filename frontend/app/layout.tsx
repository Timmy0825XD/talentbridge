import type { Metadata } from "next";
import { Manrope, DM_Sans } from "next/font/google";
import { AuthProvider } from "@/src/context/auth-context";
import { QueryProvider } from "@/src/providers/query-provider";
import "./globals.css";
import 'primereact/resources/themes/lara-light-green/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import ToastProvider from "@/src/providers/ToastProvider";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});
 
const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "TalentBridge — Conecta el talento universitario del Cesar",
  description: "Plataforma que conecta estudiantes y egresados...",
};

export default function RootLayout({ children }: Readonly<{children: React.ReactNode }>) {
  return (
    <html lang="es" className={`${manrope.variable} ${dmSans.variable}`}>
      <body className="min-h-full flex flex-col">
        <AuthProvider>
          <QueryProvider>{children} <ToastProvider /></QueryProvider>
        </AuthProvider>
      </body>
    </html>
  );
}