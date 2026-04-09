"use client";

import AnimationLink from "@/components/Animation/AnimationLink";
import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { usePathname } from "next/navigation";

import styles from "./Header.module.css";

const Header = ({ site }) => {
  const { theme, setTheme } = useTheme();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [now, setNow] = useState(new Date());
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setNow(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  const hours24 = now.getHours();
  const minutes = String(now.getMinutes()).padStart(2, "0");

  const period = hours24 >= 12 ? "pm" : "am";
  const hours12 = String(hours24 % 12 || 12).padStart(2, "0");

  const date = `${year}—${month}—${day}`;
  const time = `${hours12}:${minutes} ${period}`;

  const isActiveRoute = (basePath) => pathname === basePath || pathname?.startsWith(`${basePath}/`);
  const isArchiveRoute = isActiveRoute("/archive");

  const handleChangeColumns = () => {
    if (typeof window === "undefined") return;
    window.dispatchEvent(new CustomEvent("archive:change-columns"));
  };

  return (
    <header className={styles.header}>
      <div className={styles.mobileMeta}>
        <AnimationLink className={styles.homeLink} link="/">
          <strong>{site.title}</strong>
        </AnimationLink>{" "}
        / {date} / {time}
      </div>

      <div className={styles.desktopNav}>
        <AnimationLink className={styles.homeLink} link="/">
          <strong>{site.title}</strong>
        </AnimationLink>{" "}
        / {date} / {time} /{" "}
        <AnimationLink className={isActiveRoute("/projects") ? styles.activeNavLink : undefined} link="/projects">
          Projects
        </AnimationLink>{" "}
        /{" "}
        <AnimationLink className={isActiveRoute("/about") ? styles.activeNavLink : undefined} link="/about">
          About
        </AnimationLink>{" "}
        /{" "}
        <AnimationLink className={isActiveRoute("/archive") ? styles.activeNavLink : undefined} link="/archive">
          Archive
        </AnimationLink>{" "}
        {isArchiveRoute && (
          <>
            <span>• Columns [</span>
            <button type="button" onClick={handleChangeColumns}>
              Change
            </button>
            <span>]</span>{" "}
          </>
        )}
        /{" "}
        {mounted && (
          <>
            <button onClick={() => setTheme("light")} className={theme === "light" ? "active" : ""} type="button">
              Light
            </button>
            —
            <button onClick={() => setTheme("dark")} className={theme === "dark" ? "active" : ""} type="button">
              Dark
            </button>
          </>
        )}
      </div>

      <button type="button" className={styles.mobileMenuButton} onClick={() => setIsMobileMenuOpen((value) => !value)}>
        {isMobileMenuOpen ? "Close" : "Menu"}
      </button>

      {isMobileMenuOpen ? (
        <nav className={styles.mobileMenuOverlay}>
          <div className={styles.mobileMenuLine}>
            <AnimationLink className={isActiveRoute("/projects") ? styles.activeNavLink : undefined} link="/projects">
              Projects
            </AnimationLink>
            <span className={styles.mobileMenuSuffix}>&nbsp;/</span>
          </div>
          <div className={styles.mobileMenuLine}>
            <AnimationLink className={isActiveRoute("/about") ? styles.activeNavLink : undefined} link="/about">
              About
            </AnimationLink>
            <span className={styles.mobileMenuSuffix}>&nbsp;/</span>
          </div>
          {isArchiveRoute ? (
            <div className={styles.mobileMenuLine}>
              <AnimationLink className={styles.activeNavLink} link="/archive">
                Archive
              </AnimationLink>
              <span className={styles.mobileMenuSuffix}>&nbsp;• Columns [</span>
              <button type="button" onClick={handleChangeColumns}>
                Change
              </button>
              <span className={styles.mobileMenuSuffix}>]</span>
            </div>
          ) : (
            <div className={styles.mobileMenuLine}>
              <AnimationLink className={isActiveRoute("/archive") ? styles.activeNavLink : undefined} link="/archive">
                Archive
              </AnimationLink>
              <span className={styles.mobileMenuSuffix}>&nbsp;/</span>
            </div>
          )}
          {mounted && (
            <div className={styles.mobileThemeRow}>
              <button onClick={() => setTheme("light")} className={theme === "light" ? "active" : ""} type="button">
                Light
              </button>
              <span>&nbsp;-&nbsp;</span>
              <button onClick={() => setTheme("dark")} className={theme === "dark" ? "active" : ""} type="button">
                Dark
              </button>
              <span>&nbsp;/</span>
            </div>
          )}
        </nav>
      ) : null}
    </header>
  );
};

export default Header;
