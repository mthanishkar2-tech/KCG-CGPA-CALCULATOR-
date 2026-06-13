import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";

export const metadata: Metadata = {
  title: "KCG Pulse",
  description: "Track your academic heartbeat.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased bg-background text-foreground transition-colors duration-300">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
