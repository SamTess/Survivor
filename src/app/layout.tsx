import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/navigation/Navbar";
import { AuthProvider } from "../context/AuthContext";
import { Toaster } from "@/components/ui/sonner";
import { ChatLauncher } from "@/components/chat/ChatLauncher";
import { TooltipProvider } from "@/components/ui/tooltip";


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
      <body
        className={` antialiased min-h-screen overflow-hidden`}
      >
        <TooltipProvider>
          <AuthProvider>
            <Navbar />
            {children}
            <Toaster />
            <ChatLauncher />
          </AuthProvider>
        </TooltipProvider>
      </body>
    </html>
  );
}
