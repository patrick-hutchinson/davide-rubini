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

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setNow(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  const hours24 = now.getHours();
  const minutes = String(now.getMinutes()).padStart(2, "0");

  const period = hours24 >= 12 ? "pm" : "am";
  const hours12 = String(hours24 % 12 || 12).padStart(2, "0");

  const date = `${year} - ${month} - ${day}`;
  const time = `${hours12}:${minutes} ${period}`;

  const isActiveRoute = (basePath) => pathname === basePath || pathname?.startsWith(`${basePath}/`);
  const isArchiveRoute = isActiveRoute("/archive");

  const handleChangeColumns = () => {
    if (typeof window === "undefined") return;
    window.dispatchEvent(new CustomEvent("archive:change-columns"));
  };

  return (
    <header className={styles.header}>
      <AnimationLink className={styles.homeLink} link="/">
        <strong>{site.title}</strong>
      </AnimationLink>{" "}
      / {date} / {time} /{" "}
      <AnimationLink className={isActiveRoute("/projects") ? styles.activeNavLink : undefined} link="/projects">
        Projects
      </AnimationLink>{" "}
      / <AnimationLink className={isActiveRoute("/about") ? styles.activeNavLink : undefined} link="/about">
        About
      </AnimationLink>{" "}
      / <AnimationLink className={isActiveRoute("/archive") ? styles.activeNavLink : undefined} link="/archive">
        Archive
      </AnimationLink>{" "}
      {isArchiveRoute && (
        <>
          / <span>• Columns [</span>
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
          </button>{" "}
          -{" "}
          <button onClick={() => setTheme("dark")} className={theme === "dark" ? "active" : ""} type="button">
            Dark
          </button>
        </>
      )}
    </header>
  );
};

export default Header;
