"use client";

import React from "react";
import { motion } from "framer-motion";

export default function ApiSection(): React.ReactElement {
  const example = `POST /v1/analyze\nContent-Type: application/json\n\n{\n  \"text\": \"UPI: Your account will be blocked. Pay at http://pay-secure.example.co\"\n}`;

  return (
    <section id="api" data-nav-contrast="dark" className="relative w-full bg-white">
      <div className="mx-auto w-full max-w-7xl px-4 py-20">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-2xl font-medium tracking-tight text-slate-900">Simple REST API</h2>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            Rate limits: 10 req/min per IP for guests, 60 req/min when authenticated.
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.4 }}
          className="mx-auto mt-10 max-w-3xl overflow-hidden rounded-2xl border border-slate-200 bg-slate-50"
        >
          <div className="border-b border-slate-200 bg-white px-4 py-3">
            <p className="text-xs text-slate-600">Example request</p>
          </div>
          <pre className="overflow-auto p-4 text-xs leading-relaxed text-slate-800">
            <code>{example}</code>
          </pre>
        </motion.div>
      </div>
    </section>
  );
}