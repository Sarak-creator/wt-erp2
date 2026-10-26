import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "សហគ្រាសផលិតទឹកបរិសុទ្ធ | Pure Water Factory ERP & POS",
  description: "Enterprise Pure Drinking Water Manufacturing, Bottle Deposit Tracking, Route Logistics, POS & Cost Accounting System",
  manifest: "/manifest.json",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="km" className="h-full antialiased">
      <body className="min-h-full flex flex-col font-sans bg-slate-50 text-slate-900 selection:bg-blue-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}
