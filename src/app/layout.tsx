import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "sonner";
import { Outfit } from "next/font/google";
import { env } from "@/lib/env";
import "./globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  weight: ["300", "400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "WayFind",
  description: "WayFind CRM",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider publishableKey={env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}>
      <html lang="en" className={outfit.variable}>
        <body>
          {children}
          <Toaster
            closeButton
            duration={3500}
            position="bottom-right"
            richColors
            visibleToasts={3}
            toastOptions={{
              className: "rounded-lg border shadow-sm",
            }}
          />
        </body>
      </html>
    </ClerkProvider>
  );
}
