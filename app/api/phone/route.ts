export const runtime = 'nodejs'
import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

type RegistryEntry = {
  reports: number
  scam_reports: number
  suspicious_reports: number
  safe_reports: number
  last_seen: string | null
  samples: string[]
}

const DATA_DIR = path.join(process.cwd(), 'data')
const REGISTRY_PATH = path.join(DATA_DIR, 'phone_registry.json')

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true })
}

function loadRegistry(): Record<string, RegistryEntry> {
  ensureDataDir()
  if (!fs.existsSync(REGISTRY_PATH)) return {}
  try {
    const raw = fs.readFileSync(REGISTRY_PATH, 'utf-8')
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

function saveRegistry(reg: Record<string, RegistryEntry>) {
  ensureDataDir()
  fs.writeFileSync(REGISTRY_PATH, JSON.stringify(reg, null, 2), 'utf-8')
}

export async function POST(req: NextRequest) {
  try {
    const { phone, action, classification, message } = await req.json()
    if (!phone || typeof phone !== 'string') {
      return NextResponse.json({ error: 'phone is required' }, { status: 400 })
    }

    const reg = loadRegistry()

    if (action === 'track') {
      const key = phone
      const entry: RegistryEntry = reg[key] || {
        reports: 0,
        scam_reports: 0,
        suspicious_reports: 0,
        safe_reports: 0,
        last_seen: null,
        samples: []
      }
      entry.reports += 1
      const cat = String(classification || 'Suspicious').toLowerCase()
      if (cat === 'scam') entry.scam_reports += 1
      else if (cat === 'suspicious') entry.suspicious_reports += 1
      else entry.safe_reports += 1
      entry.last_seen = new Date().toISOString()
      if (message && typeof message === 'string') {
        const sample = message.trim()
        if (sample && !entry.samples.includes(sample)) {
          entry.samples = (entry.samples.concat(sample)).slice(-5)
        }
      }
      reg[key] = entry
      saveRegistry(reg)
      return NextResponse.json({ ok: true })
    }

    if (action === 'complaint') {
      const entry = reg[phone]
      if (!entry) return NextResponse.json({ complaint: 'No records found for this number.' })
      const lines = [
        'CYBER CRIME COMPLAINT - PHONE NUMBER FRAUD',
        `Number: ${phone}`,
        `Total Reports: ${entry.reports}`,
        `Scam Reports: ${entry.scam_reports}`,
        `Suspicious Reports: ${entry.suspicious_reports}`,
        `Safe Reports: ${entry.safe_reports}`,
        `Last Seen: ${entry.last_seen}`,
        'Samples:',
        ...entry.samples.map((s, i) => `  ${i + 1}. ${s.slice(0, 200)}`),
        'Recommended Action: Block number and submit to cybercrime.gov.in portal.'
      ]
      return NextResponse.json({ complaint: lines.join('\n') })
    }

    if (action === 'scan') {
      const details = await scanExternal(phone)
      return NextResponse.json({ details })
    }

    // default summary; return zeroed entry so UI has consistent data
    const entry = reg[phone] || {
      reports: 0,
      scam_reports: 0,
      suspicious_reports: 0,
      safe_reports: 0,
      last_seen: null,
      samples: [] as string[]
    }
    return NextResponse.json(entry)
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Internal error' }, { status: 500 })
  }
}

async function scanExternal(phone: string): Promise<any> {
  // Try Truecaller if token provided (may require valid mobile token)
  const truecallerToken = process.env.TRUECALLER_TOKEN
  if (truecallerToken) {
    try {
      const url = `https://search5.truecaller.com/v2/search?countryCode=IN&type=4&phone=${encodeURIComponent(phone)}&q=${encodeURIComponent(phone)}`
      const res = await fetch(url, {
        headers: {
          Authorization: `Bearer ${truecallerToken}`,
          'User-Agent': 'Mozilla/5.0',
          Accept: 'application/json'
        }
      })
      if (res.ok) {
        const data = await res.json()
        const first = (data && (data.data || data).length) ? (data.data || data)[0] : null
        if (first) {
          return {
            provider: 'truecaller',
            name: first.name || first.value || '',
            carrier: first.carrier || '',
            country: first.countryCode || 'IN',
            location: first.city || first.address || '',
            spamScore: first.score || first.spamScore || undefined,
            tags: first.tags || first.searchTags || [],
            raw: first
          }
        }
      }
    } catch {}
  }

  // Try Numverify (apilayer) if key provided
  const numverifyKey = process.env.NUMVERIFY_KEY
  if (numverifyKey) {
    try {
      const res = await fetch(`http://apilayer.net/api/validate?access_key=${numverifyKey}&number=${encodeURIComponent(phone)}&format=1`)
      if (res.ok) {
        const nv = await res.json()
        return {
          provider: 'numverify',
          valid: nv.valid,
          international: nv.international_format,
          country: nv.country_name,
          countryCode: nv.country_code,
          location: nv.location,
          carrier: nv.carrier,
          lineType: nv.line_type,
          raw: nv
        }
      }
    } catch {}
  }

  // Try AbstractAPI Phone if key provided
  const abstractKey = process.env.ABSTRACTAPI_PHONE_KEY
  if (abstractKey) {
    try {
      const res = await fetch(`https://phonevalidation.abstractapi.com/v1/?api_key=${abstractKey}&phone=${encodeURIComponent(phone)}`)
      if (res.ok) {
        const ap = await res.json()
        return {
          provider: 'abstractapi',
          valid: ap.valid,
          international: ap.format?.international,
          country: ap.country?.name,
          countryCode: ap.country?.code,
          location: ap.location,
          carrier: ap.carrier,
          lineType: ap.type,
          raw: ap
        }
      }
    } catch {}
  }

  return { provider: 'none', note: 'No external phone data provider configured.' }
}
