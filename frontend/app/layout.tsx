import type { Metadata } from "next";
import { Manrope, DM_Sans } from "next/font/google";
import { AuthProvider } from "@/src/context/auth-context";
import { QueryProvider } from "@/src/providers/query-provider";
import "./globals.css";

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
  description: "Plataforma que conecta estudiantes y egresados del departamento del Cesar con empresas que buscan perfiles calificados para proyectos, microtrabajos y contrataciones formales.",
};

export default function RootLayout({ children }: Readonly<{children: React.ReactNode }>) {
  return (
    <html lang="es" className={`${manrope.variable} ${dmSans.variable}`}>
      <body className="min-h-full flex flex-col">
        <AuthProvider>
          <QueryProvider>{children}</QueryProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
