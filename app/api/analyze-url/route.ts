import { NextResponse } from "next/server";

function looksPhishy(host: string): boolean {
  const s = host.toLowerCase();
  return /secure|verify|kyc|update|bank|pay|gift|free/.test(s) && s.split(".").length > 2;
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const url: string = (body?.url ?? "").toString();
    if (!url) return NextResponse.json({ error: "Missing url" }, { status: 400 });
    let host = "";
    try {
      host = new URL(url).host;
    } catch {
      return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
    }

    const suspicious = looksPhishy(host);
    const result = {
      label: suspicious ? "Suspicious" : "Safe",
      confidence: suspicious ? 0.78 : 0.4,
      redFlags: suspicious ? ["Phishy hostname patterns detected"] : [],
      advice: suspicious
        ? "Avoid opening this link. Check with the official website."
        : "No obvious threats detected.",
      riskLevel: suspicious ? "Medium" : "Low",
    } as const;

    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: "Unable to analyze URL" }, { status: 500 });
  }
}


