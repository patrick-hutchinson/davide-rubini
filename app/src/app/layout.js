import { getSite } from "@/lib/sanity/fetch";

import { DeviceProvider } from "@/context/DeviceContext";
import { ThemeProvider } from "@/context/ThemeProvider";

import ScrollRestorationController from "@/controllers/ScrollRestorationController";

import Header from "@/components/Header/Header";

import "./globals.css";

const fallbackSite = {
  title: "Davide Rubibi",
  description: "",
  linkColors: {
    linkColorLight: "#0050ff",
    linkColorDark: "#7aa7ff",
  },
  themeColorsLight: {
    fontColorLight: "#000000",
    backgroundColorLight: "#ffffff",
  },
  themeColorsDark: {
    fontColorDark: "#fbfbfb",
    backgroundColorDark: "#121212",
  },
  placeholderType: "low_res_image",
  defaultTheme: "system",
};

const buildSanityImageUrl = (baseUrl, width, height = width) => {
  if (!baseUrl) return null;
  const separator = baseUrl.includes("?") ? "&" : "?";
  return `${baseUrl}${separator}w=${width}&h=${height}&fit=crop&auto=format`;
};

export async function generateMetadata() {
  let site = fallbackSite;

  try {
    const fetched = await getSite();
    if (fetched) site = fetched;
  } catch {
    site = fallbackSite;
  }

  const resolvedTitle = site?.title || fallbackSite.title;
  const resolvedDescription = site?.description || fallbackSite.description;
  const resolvedOwner = site?.owner || undefined;

  const faviconBaseUrl = site?.favicon?.asset?.url;
  const sanityIcons = faviconBaseUrl
    ? [
        { url: buildSanityImageUrl(faviconBaseUrl, 16), sizes: "16x16", type: "image/png" },
        { url: buildSanityImageUrl(faviconBaseUrl, 32), sizes: "32x32", type: "image/png" },
        { url: buildSanityImageUrl(faviconBaseUrl, 192), sizes: "192x192", type: "image/png" },
        { url: buildSanityImageUrl(faviconBaseUrl, 512), sizes: "512x512", type: "image/png" },
      ]
    : null;

  return {
    title: resolvedTitle,
    description: resolvedDescription,
    applicationName: resolvedTitle,
    creator: resolvedOwner,
    icons: {
      icon: sanityIcons || [
        { url: "/icons/favicon/favicon.ico" },
        { url: "/icons/favicon/favicon-16x16.png", sizes: "16x16", type: "image/png" },
        { url: "/icons/favicon/favicon-32x32.png", sizes: "32x32", type: "image/png" },
        { url: "/icons/favicon/android-chrome-192x192.png", sizes: "192x192", type: "image/png" },
        { url: "/icons/favicon/android-chrome-512x512.png", sizes: "512x512", type: "image/png" },
      ],
      apple: faviconBaseUrl
        ? [{ url: buildSanityImageUrl(faviconBaseUrl, 180), sizes: "180x180", type: "image/png" }]
        : undefined,
      shortcut: faviconBaseUrl ? buildSanityImageUrl(faviconBaseUrl, 32) : "/icons/favicon/favicon.ico",
    },
    openGraph: {
      title: resolvedTitle,
      description: resolvedDescription,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: resolvedTitle,
      description: resolvedDescription,
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

  const resolvedDefaultTheme =
    site?.defaultTheme === "light" || site?.defaultTheme === "dark" || site?.defaultTheme === "system"
      ? site.defaultTheme
      : fallbackSite.defaultTheme;
  const resolvedPlaceholderType =
    site?.placeholderType === "solid_color" || site?.placeholderType === "low_res_image"
      ? site.placeholderType
      : fallbackSite.placeholderType;

  const resolvedLinkColorLight = site?.linkColors?.linkColorLight || fallbackSite.linkColors.linkColorLight;
  const resolvedLinkColorDark = site?.linkColors?.linkColorDark || fallbackSite.linkColors.linkColorDark;
  const resolvedForegroundLight =
    site?.themeColorsLight?.fontColorLight || fallbackSite.themeColorsLight.fontColorLight;
  const resolvedBackgroundLight =
    site?.themeColorsLight?.backgroundColorLight || fallbackSite.themeColorsLight.backgroundColorLight;
  const resolvedForegroundDark = site?.themeColorsDark?.fontColorDark || fallbackSite.themeColorsDark.fontColorDark;
  const resolvedBackgroundDark =
    site?.themeColorsDark?.backgroundColorDark || fallbackSite.themeColorsDark.backgroundColorDark;

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://cdn.sanity.io" crossOrigin="" />
        <link rel="dns-prefetch" href="https://cdn.sanity.io" />
        <link rel="preconnect" href="https://image.mux.com" crossOrigin="" />
        <link rel="dns-prefetch" href="https://image.mux.com" />
      </head>
      <DeviceProvider>
        <ScrollRestorationController />
        <body
          data-placeholder-type={resolvedPlaceholderType}
          style={{
            "--link-color-light": resolvedLinkColorLight,
            "--link-color-dark": resolvedLinkColorDark,
            "--foreground-light": resolvedForegroundLight,
            "--background-light": resolvedBackgroundLight,
            "--foreground-dark": resolvedForegroundDark,
            "--background-dark": resolvedBackgroundDark,
          }}
        >
          <ThemeProvider attribute="class" defaultTheme={resolvedDefaultTheme} enableSystem disableTransitionOnChange>
            <Header site={site} />
            {children}
          </ThemeProvider>
        </body>
      </DeviceProvider>
    </html>
  );
}
