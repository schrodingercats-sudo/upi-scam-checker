"use client";

import React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Icon } from "@iconify/react";

export default function Hero(): React.ReactElement {
  const reduceMotion = useReducedMotion();

  const initialFade = reduceMotion ? false : { opacity: 0, y: 8 };
  const animateIn = reduceMotion ? undefined : { opacity: 1, y: 0 };
  const fast = { duration: 0.25, ease: "easeOut" } as const;

  return (
    <section
      id="home"
      data-nav-contrast="light"
      className="relative flex w-full items-center justify-center"
      style={{
        backgroundImage:
          "linear-gradient(111.4deg, rgba(7,7,9,1) 6.5%, rgba(27,24,113,1) 93.2%)",
      }}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(255,255,255,0.08),transparent_45%),radial-gradient(ellipse_at_bottom_right,rgba(255,255,255,0.06),transparent_45%)]" />
      <div className="relative z-10 mx-auto flex min-h-[90vh] w-full max-w-7xl flex-col items-center px-4 pt-28 text-center">
        <motion.div
          initial={initialFade}
          animate={animateIn}
          transition={fast}
          className="flex items-center gap-3 flex-wrap justify-center"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-white/80">
            <Icon icon="material-symbols:shield" width={18} height={18} />
            <span className="text-xs">Privacy-first, on-device by default</span>
          </div>
          
          <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1.5">
            <Icon icon="logos:google-gemini" width={16} height={16} className="text-white/80" />
            <span className="text-xs text-white/70">Gemini AI</span>
          </div>
          
          <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1.5">
            <span className="text-xs font-bold text-white/80">DS</span>
            <span className="text-xs text-white/70">DeepSeek-R1</span>
          </div>
        </motion.div>

        <motion.h1
          initial={initialFade}
          animate={animateIn}
          transition={fast}
          className="mt-6 text-[clamp(28px,6vw,48px)] font-medium leading-tight tracking-tight text-white"
        >
          Stop fake UPI SMS and suspicious links before they trick you
        </motion.h1>

        <motion.p
          initial={initialFade}
          animate={animateIn}
          transition={fast}
          className="mt-4 max-w-2xl text-balance text-sm leading-6 text-white/80"
        >
          Detect scam messages in real time using DLT sender checks, domain intelligence, and a
          lightweight rule + ML scoring engine. Works on Android and iOS.
        </motion.p>

        <motion.div
          initial={initialFade}
          animate={animateIn}
          transition={fast}
          className="mt-8 flex flex-col items-center gap-3 sm:flex-row"
        >
          <a
            href="#"
            className="inline-flex items-center justify-center rounded-full bg-white px-5 py-2 text-sm font-medium text-indigo-700 transition-colors hover:bg-indigo-50"
          >
            Get the app
          </a>
          <a
            href="/try"
            className="inline-flex items-center justify-center gap-2 rounded-full border border-white/20 bg-white/5 px-5 py-2 text-sm text-white/90 transition-colors hover:bg-white/10"
          >
            <Icon icon="material-symbols:api" width={18} height={18} />
            Try now
          </a>
        </motion.div>

        <motion.div
          initial={initialFade}
          animate={animateIn}
          transition={fast}
          className="mt-10 grid w-full max-w-4xl grid-cols-2 gap-3 sm:grid-cols-4"
        >
          {[
            { label: "No READ_SMS", icon: "material-symbols:wifi-off" },
            { label: "DLT sender checks", icon: "material-symbols:bolt" },
            { label: "Link scanner", icon: "material-symbols:link" },
            { label: "Hybrid scoring", icon: "material-symbols:speed" },
          ].map((i) => (
            <div
              key={i.label}
              className="flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/80"
            >
              <Icon icon={i.icon} width={16} height={16} />
              <span>{i.label}</span>
            </div>
          ))}
        </motion.div>

        <motion.div
          initial={initialFade}
          animate={animateIn}
          transition={fast}
          className="mt-12 w-full px-3 sm:px-4"
        >
          <VideoCard />
        </motion.div>
      </div>
    </section>
  );
}

function VideoCard(): React.ReactElement {
  const videoRef = React.useRef<HTMLVideoElement | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    const onError = () => setError("Video unavailable. Place ad.mp4 in public/.");
    v.addEventListener("error", onError);
    return () => {
      v.removeEventListener("error", onError);
    };
  }, []);

  return (
    <div
      className="relative mx-auto w-full max-w-4xl overflow-hidden rounded-3xl bg-[radial-gradient(1200px_600px_at_50%_-20%,rgba(255,255,255,0.12),transparent),linear-gradient(111.4deg,rgba(255,255,255,0.08),rgba(255,255,255,0.04))] p-[1px]"
      style={{ boxShadow: "0 10px 30px rgba(0,0,0,0.25)" }}
    >
      <div className="relative aspect-video h-full w-full overflow-hidden rounded-[calc(1.5rem-1px)] border border-white/10 bg-black/40">
        <video
          ref={videoRef}
          className="absolute inset-0 h-full w-full select-none object-contain bg-black"
          controls
          controlsList="nodownload noremoteplayback"
          disablePictureInPicture
          // allow sound by default
          muted={false}
          loop
          playsInline
          preload="metadata"
        >
          <source src="/api/video" type="video/mp4" />
        </video>

        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/20 px-4 text-center text-sm text-white/80">
            {error}
          </div>
        )}

        <div className="pointer-events-none absolute inset-0 rounded-[calc(1.5rem-1px)] ring-1 ring-white/10" />
      </div>
    </div>
  );
}