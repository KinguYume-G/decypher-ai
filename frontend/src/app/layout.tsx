import type { Metadata } from "next";
import { Toaster } from "react-hot-toast";
import "./globals.css";

export const metadata: Metadata = {
  title: "Decypher AI | Intelligence Platform",
  description: "AI-powered startup opportunity intelligence — Corporate Modern",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="light">
      <head>
        {/* Geist (primary) + JetBrains Mono (data labels) + Material Symbols */}
        <link
          href="https://fonts.googleapis.com/css2?family=Geist:wght@100..900&family=JetBrains+Mono:wght@100..800&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-background text-on-background min-h-screen font-body-md overflow-x-hidden selection:bg-secondary/20 selection:text-secondary">
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: "#ffffff",
              color: "#191c1e",
              border: "1px solid rgba(198,198,205,0.5)",
              boxShadow: "0px 4px 20px rgba(0,0,0,0.08)",
            },
          }}
        />
      </body>
    </html>
  );
}
