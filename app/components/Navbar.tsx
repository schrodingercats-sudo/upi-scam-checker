"use client";

import React, { useEffect, useRef, useState } from "react";
import { Icon } from "@iconify/react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

const navLinks: { label: string; href: string }[] = [
  { label: "Features", href: "#features" },
  { label: "How it works", href: "#how" },
  { label: "API", href: "#api" },
  { label: "Support", href: "/support" },
];

export default function Navbar(): React.ReactElement {
  const [open, setOpen] = useState(false);
  const [contrast, setContrast] = useState<"light" | "dark">("light"); // light text on dark bg by default (hero)
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const handler = () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => {
        const probeY = 80; // px from top where navbar sits visually
        const sections = Array.from(
          document.querySelectorAll<HTMLElement>("section[data-nav-contrast]")
        );
        let current: HTMLElement | null = null;
        for (const s of sections) {
          const rect = s.getBoundingClientRect();
          if (rect.top <= probeY && rect.bottom >= probeY) {
            current = s;
            break;
          }
        }
        const c = (current?.dataset.navContrast as "light" | "dark") || "light";
        setContrast(c);
      });
    };

    handler();
    window.addEventListener("scroll", handler, { passive: true });
    window.addEventListener("resize", handler);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      window.removeEventListener("scroll", handler);
      window.removeEventListener("resize", handler);
    };
  }, []);

  const onLight = contrast === "light"; // light text

  return (
    <div className="fixed inset-x-0 top-0 z-50">
      <div className="mx-auto w-full max-w-7xl px-4">
        <motion.div
          initial={false}
          animate={{
            backgroundColor: onLight ? "rgba(255,255,255,0)" : "rgba(255,255,255,0.85)",
            borderColor: onLight ? "rgba(255,255,255,0.18)" : "rgba(226,232,240,0.8)",
            boxShadow: onLight ? "0 0 0 0 rgba(0,0,0,0)" : "0 1px 8px rgba(15, 23, 42, 0.08)",
          }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className={
            "mt-3 rounded-full border backdrop-blur supports-[backdrop-filter]:backdrop-blur " +
            (onLight ? "bg-transparent" : "")
          }
        >
          <div className="flex h-16 items-center justify-between px-4">
            <Link href="/" className="group inline-flex items-center gap-2">
              <span
                className={
                  "flex h-9 w-9 items-center justify-center rounded-full " +
                  (onLight ? "bg-white/15 text-white" : "bg-indigo-600 text-white")
                }
              >
                <Icon icon="material-symbols:shield" width={20} height={20} />
              </span>
              <span
                className={
                  "text-sm font-medium tracking-tight transition-colors " +
                  (onLight ? "text-white" : "text-slate-800")
                }
              >
                UPI Guard
              </span>
            </Link>

            <div className="hidden items-center gap-6 md:flex">
              {navLinks.map((l) => (
                l.href.startsWith('/') ? (
                  <Link
                    key={l.href}
                    href={l.href}
                    className={
                      "text-sm transition-colors " +
                      (onLight
                        ? "text-white/80 hover:text-white"
                        : "text-slate-600 hover:text-slate-900")
                    }
                  >
                    {l.label}
                  </Link>
                ) : (
                  <a
                    key={l.href}
                    href={l.href}
                    className={
                      "text-sm transition-colors " +
                      (onLight
                        ? "text-white/80 hover:text-white"
                        : "text-slate-600 hover:text-slate-900")
                    }
                  >
                    {l.label}
                  </a>
                )
              ))}
              <a
                href="#"
                className={
                  "rounded-full px-4 py-2 text-xs font-medium transition-colors " +
                  (onLight
                    ? "bg-white text-indigo-700 hover:bg-indigo-50"
                    : "bg-indigo-600 text-white hover:bg-indigo-700")
                }
              >
                Get the app
              </a>
            </div>

            <button
              aria-label="Open Menu"
              className={
                "flex h-10 w-10 items-center justify-center rounded-full md:hidden " +
                (onLight
                  ? "bg-white/15 text-white"
                  : "bg-slate-100 text-slate-800")
              }
              onClick={() => setOpen((v) => !v)}
            >
              <Icon icon={open ? "mdi:close" : "mdi:menu"} width={20} height={20} />
            </button>
          </div>
        </motion.div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="mx-auto w-full max-w-7xl px-4"
          >
            <div
              className={
                "mt-2 overflow-hidden rounded-2xl border shadow-sm backdrop-blur " +
                (onLight
                  ? "border-white/20 bg-white/10"
                  : "border-slate-200 bg-white")
              }
            >
              <div className="flex flex-col gap-2 p-4">
                {navLinks.map((l) => (
                  l.href.startsWith('/') ? (
                    <Link
                      key={l.href}
                      href={l.href}
                      onClick={() => setOpen(false)}
                      className={
                        "rounded-lg px-3 py-3 text-sm transition-colors " +
                        (onLight
                          ? "text-white/90 hover:text-white hover:bg-white/10"
                          : "text-slate-700 hover:text-slate-900 hover:bg-slate-50")
                      }
                    >
                      {l.label}
                    </Link>
                  ) : (
                    <a
                      key={l.href}
                      href={l.href}
                      onClick={() => setOpen(false)}
                      className={
                        "rounded-lg px-3 py-3 text-sm transition-colors " +
                        (onLight
                          ? "text-white/90 hover:text-white hover:bg-white/10"
                          : "text-slate-700 hover:text-slate-900 hover:bg-slate-50")
                      }
                    >
                      {l.label}
                    </a>
                  )
                ))}
                <a
                  href="#"
                  onClick={() => setOpen(false)}
                  className={
                    "mt-2 rounded-full px-4 py-2 text-center text-xs font-medium " +
                    (onLight
                      ? "bg-white text-indigo-700 hover:bg-indigo-50"
                      : "bg-indigo-600 text-white hover:bg-indigo-700")
                  }
                >
                  Get the app
                </a>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}