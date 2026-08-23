"use client";

import { useState } from "react";
import styles from "../page.module.css";

type FaqEntry = { q: string; a: string };

export default function LandingFaq({ items }: { items: FaqEntry[] }) {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <div className={styles.faqWrap}>
      {items.map((item, i) => {
        const isOpen = openIndex === i;
        return (
          <div
            key={item.q}
            className={`${styles.faqItem} ${isOpen ? styles.faqItemOpen : ""}`}
          >
            <button
              type="button"
              className={styles.faqQ}
              aria-expanded={isOpen}
              onClick={() => setOpenIndex(isOpen ? -1 : i)}
            >
              {item.q}
              <svg className={styles.icon} viewBox="0 0 24 24">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
            </button>
            <div className={styles.faqA}>
              <div>
                <p>{item.a}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
