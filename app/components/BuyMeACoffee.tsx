"use client";

import { Icon } from "@iconify/react";

export default function BuyMeACoffee() {
  return (
    <div className="fixed bottom-4 right-4 z-40 pointer-events-auto">
      <a
        href="https://www.buymeacoffee.com/kirakun_"
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 rounded-full bg-[#BD5FFF] px-4 py-2 text-sm font-medium text-white shadow-lg hover:bg-[#A44FFF] transition-colors"
      >
        <Icon icon="simple-icons:buymeacoffee" className="w-5 h-5" />
        <span>Buy me a coffee</span>
      </a>
    </div>
  );
}
