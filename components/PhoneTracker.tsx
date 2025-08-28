"use client"
import { useState } from 'react'

interface PhoneSummary {
  reports?: number;
  scam_reports?: number;
  suspicious_reports?: number;
  safe_reports?: number;
  last_seen?: string;
  external?: {
    provider?: string;
    name?: string;
    carrier?: string;
    country?: string;
    location?: string;
    spamScore?: number;
  };
  samples?: string[];
}

export default function PhoneTracker() {
  const [phone, setPhone] = useState('')
  const [summary, setSummary] = useState<PhoneSummary | null>(null)
  const [loading, setLoading] = useState(false)
  const [complaint, setComplaint] = useState('')

  const fetchSummary = async () => {
    if (!phone) return
    setLoading(true)
    setComplaint('')
    try {
      const [res, scan] = await Promise.all([
        fetch('/api/phone', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ phone, action: 'summary' })
        }),
        fetch('/api/phone', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ phone, action: 'scan' })
        })
      ])
      const data = await res.json()
      const scanData = await scan.json()
      const merged = { ...(data || {}), external: scanData?.details }
      setSummary(merged)
    } finally {
      setLoading(false)
    }
  }

  const generateComplaint = async () => {
    if (!phone) return
    setLoading(true)
    try {
      const res = await fetch('/api/phone', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, action: 'complaint' })
      })
      const data = await res.json()
      setComplaint(data.complaint || '')
    } finally {
      setLoading(false)
    }
  }

  

  return (
    <div className="card">
      <h3 className="text-lg font-semibold mb-2">Track a Phone Number</h3>
      <p className="text-sm text-gray-600 mb-3">Check reputation and generate a complaint report.</p>
      <div className="flex gap-2 mb-3">
        <input
          className="input-field"
          placeholder="Enter phone number (e.g., +9198xxxxxxx)"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />
        <button className="btn-primary" onClick={fetchSummary} disabled={loading || !phone}>Lookup</button>
      </div>

      

      {summary && (
        <div className="bg-gray-50 border rounded p-3 text-sm">
          <div className="grid grid-cols-2 gap-2">
            <div><strong>Total Reports:</strong> {summary.reports || 0}</div>
            <div><strong>Scam Reports:</strong> {summary.scam_reports || 0}</div>
            <div><strong>Suspicious:</strong> {summary.suspicious_reports || 0}</div>
            <div><strong>Safe:</strong> {summary.safe_reports || 0}</div>
          </div>
          <div className="mt-2 text-xs text-gray-600"><strong>Last Seen:</strong> {summary.last_seen || 'N/A'}</div>
          {summary.external && (
            <div className="mt-3">
              <div className="font-medium mb-1">External Lookup:</div>
              <div className="text-xs text-gray-700">
                <div><strong>Provider:</strong> {summary.external.provider}</div>
                {summary.external.name && <div><strong>Name:</strong> {summary.external.name}</div>}
                {summary.external.carrier && <div><strong>Carrier:</strong> {summary.external.carrier}</div>}
                {summary.external.country && <div><strong>Country:</strong> {summary.external.country}</div>}
                {summary.external.location && <div><strong>Location:</strong> {summary.external.location}</div>}
                {typeof summary.external.spamScore !== 'undefined' && (
                  <div><strong>Spam Score:</strong> {summary.external.spamScore}</div>
                )}
              </div>
            </div>
          )}
          {summary.samples && summary.samples.length > 0 && (
            <div className="mt-2">
              <div className="font-medium mb-1">Recent Samples:</div>
              <ul className="list-disc ml-5">
                {summary.samples.map((s: string, idx: number) => (
                  <li key={idx}>{s}</li>
                ))}
              </ul>
            </div>
          )}
          <div className="mt-3 flex gap-2">
            <button className="btn-secondary" onClick={generateComplaint} disabled={loading}>Generate Complaint</button>
            <a className="btn-secondary" href="https://cybercrime.gov.in" target="_blank" rel="noreferrer">Open Cyber Crime Portal</a>
          </div>
        </div>
      )}

      {complaint && (
        <div className="mt-3">
          <h4 className="font-semibold mb-1">Complaint Draft</h4>
          <textarea className="input-field min-h-[140px]" readOnly value={complaint} />
        </div>
      )}
    </div>
  )
}
