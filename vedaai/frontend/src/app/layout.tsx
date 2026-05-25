import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "react-hot-toast";

export const metadata: Metadata = {
  title: "VedaAI – AI Assessment Creator",
  description: "Generate intelligent question papers with AI",
  icons: { icon: "/favicon.ico" },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: "#110D24",
              color: "#EDE9FF",
              border: "1px solid #2A1D55",
              fontFamily: "Sora, sans-serif",
              fontSize: "0.875rem",
            },
            success: {
              iconTheme: { primary: "#10B981", secondary: "#110D24" },
            },
            error: {
              iconTheme: { primary: "#EF4444", secondary: "#110D24" },
            },
          }}
        />
        {children}
      </body>
    </html>
  );
}
