import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Sidebar from "./components/Sidebar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "MyClipIQ — AI Content Intelligence",
  description: "Transform raw video into optimized social media content",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-surface-950 text-surface-100 min-h-screen`}>
        <Sidebar />
        {children}
      </body>
    </html>
  );
}
