import { getSite } from "@/lib/sanity/fetch";

import { DeviceProvider } from "@/context/DeviceContext";
import { ViewportProvider } from "../context/ViewportContext";
import { ThemeProvider } from "@/context/ThemeProvider";

import { ViewTransitions } from "next-view-transitions";

import ScrollRestorationController from "@/controllers/ScrollRestorationController";

import Header from "@/components/Header/Header";

import "./globals.css";
import "./fonts.css";

const fallbackSite = {
  title: "Site",
  google_description: "",
};

export async function generateMetadata() {
  let site = fallbackSite;

  try {
    const fetched = await getSite();
    if (fetched) site = fetched;
  } catch {
    site = fallbackSite;
  }

  return {
    title: site.title,
    description: site.google_description,
    icons: {
      icon: [
        { url: "/icons/favicon/favicon.ico" },
        { url: "/icons/favicon/favicon-16x16.png", sizes: "16x16", type: "image/png" },
        { url: "/icons/favicon/favicon-32x32.png", sizes: "32x32", type: "image/png" },
        { url: "/icons/favicon/android-chrome-192x192.png", sizes: "192x192", type: "image/png" },
        { url: "/icons/favicon/android-chrome-512x512.png", sizes: "512x512", type: "image/png" },
      ],
      // apple: [{ url: "/icons/favicon/favicon-180x180.png" }],
      shortcut: "/icons/favicon/favicon.ico",
    },
    openGraph: {
      title: site.title,
      description: site.google_description,
      // images: [
      //   {
      //     url: "/icons/share.png", // <- your share image path
      //     width: 1200,
      //     height: 630,
      //     alt: site.title,
      //   },
      // ],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: site.title,
      description: site.google_description,
      // images: ["/icons/share.png"],
    },
  };
}

export const dynamic = "force-dynamic";

export default async function RootLayout({ children }) {
  let site = fallbackSite;

  try {
    const fetched = await getSite();
    if (fetched) site = fetched;
  } catch {
    site = fallbackSite;
  }

  return (
    <ViewTransitions>
      <html lang="en" suppressHydrationWarning>
        <head>
          <link rel="preconnect" href="https://cdn.sanity.io" crossOrigin="" />
          <link rel="dns-prefetch" href="https://cdn.sanity.io" />
          <link rel="preconnect" href="https://image.mux.com" crossOrigin="" />
          <link rel="dns-prefetch" href="https://image.mux.com" />
        </head>
        <DeviceProvider>
          <ViewportProvider>
            <ScrollRestorationController />
            <body>
              <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
                <Header site={site} />
                {children}
              </ThemeProvider>
            </body>
          </ViewportProvider>
        </DeviceProvider>
      </html>
    </ViewTransitions>
  );
}
