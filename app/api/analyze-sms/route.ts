export const runtime = 'nodejs'
import { NextRequest, NextResponse } from 'next/server'
import { exec } from 'child_process'
import { promisify } from 'util'
import fs from 'fs'

const execAsync = promisify(exec)

async function analyzeInPython(text: string, phone?: string, url?: string) {
  const py = `
import json
from engine.analyzer import analyze_message

res = analyze_message(${JSON.stringify(text)}, ${JSON.stringify(phone || '')}, ${JSON.stringify(url || '')})
print(json.dumps(res, ensure_ascii=False))
`
  const tmp = 'tmp_analyze.py'
  fs.writeFileSync(tmp, py)
  const { stdout } = await execAsync(`python ${tmp}`)
  fs.unlinkSync(tmp)
  return JSON.parse(stdout.trim())
}

export async function POST(request: NextRequest) {
  try {
    const { text, phone, url } = await request.json()
    if (!text && !phone && !url) {
      return NextResponse.json({ error: 'Provide at least one of: text, phone, url' }, { status: 400 })
    }
    const result = await analyzeInPython(text || '', phone, url)
    return NextResponse.json(result)
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Internal error' }, { status: 500 })
  }
}
