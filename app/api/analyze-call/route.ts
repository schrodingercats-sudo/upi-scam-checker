export const runtime = 'nodejs'
import { NextRequest, NextResponse } from 'next/server'
import { promisify } from 'util'
import { exec } from 'child_process'
import fs from 'fs'
import path from 'path'

const execAsync = promisify(exec)

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData()
    const file = form.get('file') as File | null
    if (!file) {
      return NextResponse.json({ error: 'file is required' }, { status: 400 })
    }

    const arrayBuffer = await file.arrayBuffer()
    const bytes = new Uint8Array(arrayBuffer)
    const tmpDir = path.join(process.cwd(), 'tmp')
    if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true })
    const tmpPath = path.join(tmpDir, `upload_${Date.now()}.wav`)
    fs.writeFileSync(tmpPath, bytes)

    const py = `
import json
from engine.call_analyzer import analyze_call_file
print(json.dumps(analyze_call_file(${JSON.stringify(tmpPath)}), ensure_ascii=False))
`
    const pyPath = path.join(tmpDir, `call_${Date.now()}.py`)
    fs.writeFileSync(pyPath, py)
    const { stdout } = await execAsync(`python ${pyPath}`)
    fs.unlinkSync(pyPath)
    fs.unlinkSync(tmpPath)
    const result = JSON.parse(stdout.trim())
    return NextResponse.json(result)
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Internal error' }, { status: 500 })
  }
}


