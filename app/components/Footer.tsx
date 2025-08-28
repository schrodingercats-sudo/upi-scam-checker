import React from "react";

export default function Footer(): React.ReactElement {
  return (
    <footer className="w-full border-t border-white/10 bg-transparent">
      <div className="mx-auto w-full max-w-7xl px-4 py-6">
        <div className="flex items-center justify-center">
          <p className="text-xs text-white/50">© {new Date().getFullYear()} UPI Guard</p>
        </div>
      </div>
    </footer>
  );
}
