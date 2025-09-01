import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  // Return the backend URL for the frontend to use
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';
  
  return NextResponse.json({
    backendUrl: backendUrl,
    status: 'ok'
  });
}