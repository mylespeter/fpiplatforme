import type { Metadata } from "next";
import "./globals.css";
import Navigation from "@/components/Navigation";
import { AuthProvider } from "@/context/AuthContext";
import { PushNotificationProvider } from '@/context/PushNotificationContext'
import PushNotificationButton from '@/components/PushNotificationButton'
import { ToastContainer } from '@/components/ui/Toast'


export const metadata: Metadata = {
  title: "FPI Platform",
  description: "System de gestion hotelier via IoT",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
       <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#1a56db" />
      </head>
      <body className={` antialiased`}>
        <AuthProvider>
              <PushNotificationProvider>

    {/* <PushNotificationButton /> */}
          <main>{children}</main>
            <ToastContainer />
              </PushNotificationProvider>
        </AuthProvider>
      </body>
    </html>
  );
}