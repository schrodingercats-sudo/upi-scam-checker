"use client";

import React from "react";
import { motion } from "framer-motion";
import { Icon } from "@iconify/react";

const steps = [
  {
    title: "Share or paste the SMS",
    desc: "On Android, enable notification listener or share from Messages. On iOS, use the Share Sheet or paste.",
    icon: "material-symbols:sms",
  },
  {
    title: "We analyze safely",
    desc: "On-device rules check DLT sender patterns and links. Optional online reputation checks can be enabled.",
    icon: "material-symbols:shield",
  },
  {
    title: "Get a clear verdict",
    desc: "Scores map to Safe, Suspicious, or Scam with guidance to act. No data selling. No tracking.",
    icon: "material-symbols:speed",
  },
];

export default function HowItWorks(): React.ReactElement {
  return (
    <section id="how" data-nav-contrast="dark" className="relative w-full bg-slate-50">
      <div className="mx-auto w-full max-w-7xl px-4 py-20">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-2xl font-medium tracking-tight text-slate-900">How it works</h2>
          <p className="mt-3 text-sm leading-6 text-slate-600">Three simple steps to stay safe.</p>
        </div>

        <ol className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {steps.map((s, i) => (
            <motion.li
              key={s.title}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.35, delay: i * 0.05 }}
              className="relative rounded-2xl border border-slate-200 bg-white p-6"
            >
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 flex-none items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                  <Icon icon={s.icon} width={22} height={22} />
                </div>
                <div>
                  <p className="text-xs text-slate-500">Step {i + 1}</p>
                  <h3 className="mt-1 text-sm font-medium text-slate-900">{s.title}</h3>
                  <p className="mt-2 text-xs leading-5 text-slate-600">{s.desc}</p>
                </div>
              </div>
            </motion.li>
          ))}
        </ol>
      </div>
    </section>
  );
}