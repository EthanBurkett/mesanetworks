import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
// @ts-ignore
import "./globals.css";
import { ThemeProvider } from "next-themes";
import ReactQueryProvider from "@/providers/QueryProvider";
import { AuthProvider } from "@/contexts";
import { Toaster } from "sonner";
import "@/lib/init-background-jobs"; // Initialize background jobs

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Mesa Networks - Professional Network Infrastructure Solutions",
  description:
    "Expert installation of structured cabling, wireless access points, security cameras, network racks, and switches across Texas.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ReactQueryProvider>
          <AuthProvider>
            <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
              {children}
            </ThemeProvider>
          </AuthProvider>
          <Toaster />
        </ReactQueryProvider>
      </body>
    </html>
  );
}
