import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Återställ",
  description: "Möt dig där du faktiskt är.",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Återställ",
  },
};

export const viewport: Viewport = {
  themeColor: "#15171C",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="sv" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
