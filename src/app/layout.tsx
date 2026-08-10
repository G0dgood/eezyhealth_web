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

import AppointmentReminderListener from "@/components/AppointmentReminderListener";

const inter = Inter({ subsets: ["latin"] });


export const metadata: Metadata = {
 title: "eezyhealth",
 description: "Healthcare Management System",
 icons: {
  icon: [{ url: "/logodark.svg", type: "image/svg+xml" }],
  shortcut: "/logodark.svg",
  apple: "/logodark.svg",
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
           <AppointmentReminderListener />
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
