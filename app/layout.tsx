import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://edenlife.example.com"),
  title: "Eden Life | FiveM QBCore Roleplay",
  description: "Servidor de roleplay FiveM QBCore con whitelist, normas, tienda y comunidad de Discord.",
  openGraph: {
    title: "Eden Life",
    description: "Haz tu whitelist, revisa las normas y entra al universo de Eden Life.",
    type: "website"
  }
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
