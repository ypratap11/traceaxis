import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TraceAxis",
  description: "Incident replay for robotics teams."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
