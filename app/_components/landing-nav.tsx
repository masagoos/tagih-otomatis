"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
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
    <div
      className={`${styles.page} ${styles.navMobile} ${open ? styles.navMobileOpen : ""}`}
    >
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

      <div className={styles.navMobileFooter}>
        <div className={styles.navMobileBrand}>
          <span className={styles.logoMark}>
            <Image src="/logo-masagoos.png" alt="Masagoos Studio" width={40} height={40} />
          </span>
          <span>TagihOtomatis</span>
        </div>
        <p>Penagihan lebih rapi. Pembayaran lebih cepat.</p>
        <p>Telp/WA: 0813-999-4651</p>
        <a href="https://www.tagihotomatis.id" onClick={() => setOpen(false)}>
          www.tagihotomatis.id
        </a>
        <p className={styles.navMobileCredit}>Presented by Masagoos Studio &copy; 2026</p>
      </div>
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
