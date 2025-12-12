// Root layout for metadata and other global settings
// The actual layout with locale support is in [locale]/layout.tsx
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Bike Store",
  description: "Bike Store E-commerce Application",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
