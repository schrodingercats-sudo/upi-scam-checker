"use client";

import React from "react";
import { Icon } from "@iconify/react";
import { motion } from "framer-motion";

type Feature = {
  title: string;
  description: string;
  icon: string;
};

const features: Feature[] = [
  {
    title: "Real-time SMS analysis",
    description:
      "Share to app or use notification listener on Android to flag risky UPI messages instantly.",
    icon: "material-symbols:sms",
  },
  {
    title: "DLT sender ID logic",
    description:
      "Validate registered headers and patterns to spot spoofed or unregistered senders.",
    icon: "material-symbols:shield",
  },
  {
    title: "Suspicious link detector",
    description:
      "Catches lookalike domains, punycode tricks, and shorteners commonly abused in scams.",
    icon: "material-symbols:link",
  },
  {
    title: "Privacy-first by default",
    description:
      "All checks are offline first. Optional online reputation checks live behind a flag.",
    icon: "material-symbols:lock",
  },
  {
    title: "Clean REST API",
    description:
      "FastAPI backend with sensible rates. Try /v1/analyze with simple JSON payloads.",
    icon: "material-symbols:api",
  },
  {
    title: "Hybrid scoring engine",
    description:
      "Rule + ML thresholds: Safe <40, Suspicious 40–69, Scam ≥70 for clear decisions.",
    icon: "material-symbols:speed",
  },
];

export default function Features(): React.ReactElement {
  return (
    <section id="features" data-nav-contrast="dark" className="relative w-full bg-white">
      <div className="mx-auto w-full max-w-7xl px-4 py-20">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-2xl font-medium tracking-tight text-slate-900">Why it works</h2>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            Designed to catch real-world scams without sacrificing privacy or performance.
          </p>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f, idx) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.35, delay: idx * 0.03 }}
              className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 flex-none items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                  <Icon icon={f.icon} width={22} height={22} />
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-medium text-slate-900">{f.title}</h3>
                  <p className="mt-2 text-xs leading-5 text-slate-600">{f.description}</p>
                </div>
              </div>

              <div className="pointer-events-none absolute -right-6 -top-6 h-20 w-20 rounded-full bg-indigo-100 opacity-0 transition-opacity duration-300 group-hover:opacity-60" />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}