"use client";

import { useEffect } from 'react';
import { Icon } from "@iconify/react";

export default function BuyMeACoffee() {
  useEffect(() => {
    // Check if script already exists
    if (document.querySelector('script[data-name="BMC-Widget"]')) {
      return;
    }

    // Add the Buy Me a Coffee script
    const script = document.createElement('script');
    script.setAttribute('data-name', 'BMC-Widget');
    script.setAttribute('data-cfasync', 'false');
    script.src = 'https://cdnjs.buymeacoffee.com/1.0.0/widget.prod.min.js';
    script.setAttribute('data-id', 'kirakun_');
    script.setAttribute('data-description', 'Support me on Buy me a coffee!');
    script.setAttribute('data-message', 'THANKS FOR THE PAYMENT MEANS A LOT TO ME');
    script.setAttribute('data-color', '#BD5FFF');
    script.setAttribute('data-position', 'Right');
    script.setAttribute('data-x_margin', '18');
    script.setAttribute('data-y_margin', '18');
    
    // Add error handling
    script.onerror = () => {
      console.error('Failed to load Buy Me a Coffee widget');
    };
    
    script.onload = () => {
      console.log('Buy Me a Coffee widget loaded successfully');
    };
    
    document.head.appendChild(script);

    // Cleanup function to remove the script when component unmounts
    return () => {
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
    };
  }, []);

  return (
    <div className="fixed bottom-4 right-4 z-50">
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
