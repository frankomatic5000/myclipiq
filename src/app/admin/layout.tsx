import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin — MyClipIQ",
  description: "User and role management panel",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
