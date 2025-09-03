import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import AdminSidebar from "@/components/navigation/AdminSidebar";
import MainNavbar from "@/components/navigation/MainNavbar";
import { AuthProvider } from "../context/AuthContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Jeb incubator",
  description: "Jeb incubator management platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased h-full overflow-hidden`}>
        <AuthProvider>
          <MainNavbar />
          <AdminSidebar />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
