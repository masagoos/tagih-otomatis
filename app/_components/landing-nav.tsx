"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import styles from "../page.module.css";

const LINKS = [
  { href: "#produk", label: "Produk" },
  { href: "#cara-kerja", label: "Cara Kerja" },
  { href: "#harga", label: "Harga" },
  { href: "#faq", label: "FAQ" },
];

export default function LandingNav() {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const panel = (
    <div className={`${styles.navMobile} ${open ? styles.navMobileOpen : ""}`}>
      {LINKS.map((link) => (
        <a key={link.href} href={link.href} onClick={() => setOpen(false)}>
          {link.label}
        </a>
      ))}
      <a href="/login" onClick={() => setOpen(false)}>
        Masuk
      </a>
      <a
        href="/login"
        className={`${styles.btn} ${styles.btnPrimary}`}
        onClick={() => setOpen(false)}
      >
        Coba Gratis
      </a>
    </div>
  );

  return (
    <>
      <button
        type="button"
        className={styles.navToggle}
        aria-label="Buka menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        <svg className={styles.icon} viewBox="0 0 24 24">
          <line x1="4" y1="7" x2="20" y2="7" />
          <line x1="4" y1="12" x2="20" y2="12" />
          <line x1="4" y1="17" x2="20" y2="17" />
        </svg>
      </button>
      {mounted ? createPortal(panel, document.body) : panel}
    </>
  );
}
