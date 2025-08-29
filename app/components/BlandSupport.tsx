"use client";

import React from "react";
import { Icon } from "@iconify/react";

export default function BlandSupport(): React.ReactElement {
  const [open, setOpen] = React.useState(false);
  const [phone, setPhone] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [status, setStatus] = React.useState<string | null>(null);
  const [errorDetail, setErrorDetail] = React.useState<any>(null);

  async function startCall(): Promise<void> {
    if (!phone.trim()) {
      setStatus("Enter phone number");
      return;
    }
    try {
      setLoading(true);
      setStatus(null);
      const res = await fetch("/api/bland-call", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone_number: phone.trim(),
          voice: "June",
          wait_for_greeting: false,
          record: true,
          answered_by_enabled: true,
          noise_cancellation: false,
          interruption_threshold: 100,
          block_interruptions: false,
          max_duration: 12,
          model: "base",
          language: "en",
          background_track: "none",
          endpoint: "https://api.bland.ai",
          voicemail_action: "hangup",
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        console.error("/api/bland-call error:", data);
        setErrorDetail(data);
        const msg = typeof data?.error === "string" ? data.error : "Failed to start call";
        setStatus(`${msg}${data?.status ? ` (status ${data.status})` : ""}`);
        return;
      }
      setStatus("Call started. Keep your phone nearby.");
      setErrorDetail(null);
    } catch (e) {
      setStatus("Network error. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <div className="fixed right-4 bottom-16 z-[60] pointer-events-auto">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="inline-flex items-center gap-2 rounded-full bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-lg hover:bg-indigo-700 transition-colors"
        >
          <Icon icon="mdi:headset" className="w-5 h-5" />
          <span>AI agent customer support</span>
        </button>
      </div>

      {open && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => !loading && setOpen(false)} />
          <div className="relative z-[71] w-full max-w-sm rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur">
            <div className="mb-2 flex items-center gap-2 text-white">
              <Icon icon="mdi:headset" className="w-5 h-5" />
              <div className="text-sm font-medium">Connect with our AI agent</div>
            </div>
            <label className="mb-1 block text-xs text-white/70">Phone number (with country code)</label>
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="e.g. +91 98xxxxxx"
              className="w-full rounded-xl border border-white/15 bg-white/10 px-3 py-2 text-sm text-white placeholder:text-white/40 outline-none focus:border-white/25"
            />
            {status && (
              <div className="mt-2 text-xs text-white/80">{status}</div>
            )}
            {errorDetail && (
              <pre className="mt-2 max-h-32 overflow-auto rounded-lg border border-white/10 bg-black/30 p-2 text-[11px] text-white/80">{JSON.stringify(errorDetail, null, 2)}</pre>
            )}
            <div className="mt-3 flex items-center justify-end gap-2">
              <button
                type="button"
                disabled={loading}
                onClick={() => setOpen(false)}
                className="rounded-full px-3 py-2 text-xs text-white/80 hover:bg-white/10"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={startCall}
                disabled={loading}
                className="inline-flex items-center gap-2 rounded-full bg-indigo-600 px-3 py-2 text-xs font-medium text-white hover:bg-indigo-700 disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <Icon icon="eos-icons:three-dots-loading" className="w-4 h-4" />
                    <span>Starting…</span>
                  </>
                ) : (
                  <>
                    <Icon icon="mdi:phone" className="w-4 h-4" />
                    <span>Call me now</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}


