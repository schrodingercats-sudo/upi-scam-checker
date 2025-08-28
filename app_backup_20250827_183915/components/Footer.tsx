import React from "react";

export default function Footer(): React.ReactElement {
  return (
    <footer className="w-full bg-slate-50">
      <div className="mx-auto w-full max-w-7xl px-4 py-10">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <p className="text-xs text-slate-600">© {new Date().getFullYear()} UPI Guard. All rights reserved.</p>
          <nav className="flex items-center gap-4">
            <a href="#features" className="text-xs text-slate-600 hover:text-slate-900">Features</a>
            <a href="#how" className="text-xs text-slate-600 hover:text-slate-900">How it works</a>
            <a href="#api" className="text-xs text-slate-600 hover:text-slate-900">API</a>
          </nav>
        </div>
      </div>
    </footer>
  );
}
