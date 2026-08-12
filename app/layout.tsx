import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CampusGo — Smart University Transport",
  description: "Live university bus tracking, smart stops and class-aware reminders by LUMINODE.",
  icons: { icon: "/favicon.svg", shortcut: "/favicon.svg" },
  metadataBase: new URL("https://campusgo.pages.dev"),
  openGraph: {
    title: "CampusGo — Your campus. Right on time.",
    description: "Smart university transport by LUMINODE.",
    images: [{ url: "/og.png", width: 1680, height: 945 }],
  },
  twitter: { card: "summary_large_image", images: ["/og.png"] },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="ar"><body>{children}</body></html>;
}
