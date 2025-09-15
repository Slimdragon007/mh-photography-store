import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Michael Haslim Photography - Fine Art Landscapes",
  description: "Discover breathtaking landscape photography by Michael Haslim. Fine art prints capturing the raw beauty of nature's most dramatic moments.",
  keywords: ["landscape photography", "fine art prints", "nature photography", "Michael Haslim", "wall art", "Big Sur", "California landscapes"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
