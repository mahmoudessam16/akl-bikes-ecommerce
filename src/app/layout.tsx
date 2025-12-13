import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AKL Bicycles - عقل للدراجات الهوائية",
  description: "Bike Store E-commerce Application",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
