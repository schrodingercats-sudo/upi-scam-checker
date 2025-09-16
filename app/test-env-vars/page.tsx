'use client';

import React, { useEffect, useState } from 'react';

export default function TestEnvVars() {
  const [envVars, setEnvVars] = useState<{[key: string]: string | undefined}>({});

  useEffect(() => {
    // This will run on the client side
    setEnvVars({
      NEXT_PUBLIC_VOICEGENIE_CAMPAIGN_ID: process.env.NEXT_PUBLIC_VOICEGENIE_CAMPAIGN_ID,
      NODE_ENV: process.env.NODE_ENV,
    });
  }, []);

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <h1>Environment Variables Test</h1>
      <p>NEXT_PUBLIC_* variables are accessible on the client side:</p>
      <ul>
        <li>NEXT_PUBLIC_VOICEGENIE_CAMPAIGN_ID: {envVars.NEXT_PUBLIC_VOICEGENIE_CAMPAIGN_ID || 'undefined'}</li>
        <li>NODE_ENV: {envVars.NODE_ENV || 'undefined'}</li>
      </ul>
    </div>
  );
}