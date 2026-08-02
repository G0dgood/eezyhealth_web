import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { NotificationProvider } from "@/contexts/NotificationContext";
import { BadgeProvider } from "@/contexts/BadgeContext";
import { Toaster } from "sonner";
import NewProvider from "./utils/provider";
import { ReduxProvider } from "@/providers/ReduxProvider";
import { AuthProvider } from "@/contexts/AuthContext";
import { SocketProvider } from "@/contexts/SocketContext";

const inter = Inter({ subsets: ["latin"] });

const faviconPath = process.env.NEXT_PUBLIC_FAVICON_PATH || "/favicon.ico";

export const metadata: Metadata = {
 title: "eezyhealth",
 description: "Healthcare Management System",
 icons: {
  icon: [
   { url: "/logowhite.svg", type: "image/svg+xml" },
   { url: faviconPath, sizes: "any" }
  ],
  shortcut: faviconPath,
  apple: "/logowhite.svg",
 },
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
      <SocketProvider>
       <ReduxProvider>
        <ThemeProvider>
         <BadgeProvider>
          <NotificationProvider>
           {children}
           <Toaster
            position="top-right"
            richColors
            closeButton
            duration={4000}
            toastOptions={{
             style: {
              fontSize: "10px",
             },
             className: "text-xs",
            }}
           />
          </NotificationProvider>
         </BadgeProvider>
        </ThemeProvider>
       </ReduxProvider>
      </SocketProvider>
     </AuthProvider>
    </NewProvider>
   </body>
  </html>
 );
}
