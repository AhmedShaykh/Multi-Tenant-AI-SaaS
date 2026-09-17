import { ThemeProvider } from "@/components/ThemeProvider";
import { Toaster } from "@/components/ui/sonner";
import { ClerkProvider } from "@clerk/nextjs";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Inter } from "next/font/google";
import { dark } from "@clerk/themes";
import type { Metadata } from "next";
import "./globals.css";
import { syncUserToDatabase } from "@/lib/sync-user";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"]
});

export const metadata: Metadata = {
  title: "Multi Tenant SAAS AI Application",
  description: "Multi Tenant SAAS AI Application"
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  await syncUserToDatabase();

  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} min-h-full flex flex-col font-sans`}
        suppressHydrationWarning
      >
        <ClerkProvider
          appearance={{
            theme: dark
          }}
        >
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem
            disableTransitionOnChange
          >
            <Navbar />
            <main className="flex-1">{children}</main>
            <Footer />
            <Toaster position="top-right" richColors />
          </ThemeProvider>
        </ClerkProvider>
      </body>
    </html>
  )
};