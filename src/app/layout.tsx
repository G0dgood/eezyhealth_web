import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { NotificationProvider } from "@/contexts/NotificationContext";
import { Toaster } from "sonner";
import NewProvider from "./utils/provider";
import { ReduxProvider } from "@/providers/ReduxProvider";
import { AuthProvider } from "@/contexts/AuthContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "eezyhealth",
  description: "Healthcare Management System",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <NewProvider>
          <AuthProvider>
            <ReduxProvider>
              <ThemeProvider>
                <NotificationProvider>
                  {children}
                  <Toaster
                    position="top-right"
                    richColors
                    closeButton
                    duration={4000}
                  />
                </NotificationProvider>
              </ThemeProvider>
            </ReduxProvider>
          </AuthProvider>
        </NewProvider>
      </body>
    </html>
  );
}
