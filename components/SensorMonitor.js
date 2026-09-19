'use client'

import { useEffect, useState } from 'react'
import { api } from '../lib/api'

function fmtTime(ts) {
  if (!ts) return ''
  return new Date(ts).toLocaleTimeString('id-ID', { hour12: false })
}

export default function SensorMonitor() {
  const [data, setData] = useState(null)
  const [err, setErr] = useState(false)
  const [lastUpdate, setLastUpdate] = useState(null)

  useEffect(() => {
    let active = true
    const load = async () => {
      try {
        const res = await api.get('/admin-sekolah/monitoring')
        if (!active) return
        setData(res)
        setErr(false)
        setLastUpdate(new Date())
      } catch (e) {
        if (active) setErr(true)
      }
    }
    load()
    const id = setInterval(load, 5000)
    return () => {
      active = false
      clearInterval(id)
    }
  }, [])

  if (!data && !err) {
    return <div className="hairline rounded-md p-5 bg-surface text-sm text-primarylight">Memuat sensor...</div>
  }
  if (!data) {
    return <div className="hairline rounded-md p-5 bg-surface text-sm text-alert">Gagal mengambil data sensor.</div>
  }

  const items = [
    { label: 'Suhu bilik', value: data.suhuBilikC, unit: '°C' },
    { label: 'Kelembaban', value: data.kelembabanPersen, unit: '%' },
    { label: 'Kadar amonia', value: data.kadarAmoniaPpm, unit: 'ppm' },
    { label: 'Estimasi berat maggot', value: data.estimasiBeratMaggotKg, unit: 'kg' }
  ]

  return (
    <div className="hairline rounded-md p-5 bg-surface">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display text-lg">Monitoring real time</h3>
        <div className="flex items-center gap-2 text-xs text-primarylight">
          <span className={`inline-block h-2 w-2 rounded-full ${err ? 'bg-alert' : 'bg-green-500 animate-pulse'}`} />
          {err ? 'tidak terhubung' : `LIVE · ${fmtTime(lastUpdate)}`}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        {items.map((item) => (
          <div key={item.label} className="border-l-2 border-accent pl-3">
            <p className="text-xs text-primarylight">{item.label}</p>
            <p className="text-xl font-display">
              {item.value} <span className="text-sm font-body">{item.unit}</span>
            </p>
          </div>
        ))}
      </div>
      {data.aman !== undefined && (
        <div className={`mt-4 text-sm ${data.aman ? 'text-green-700' : 'text-alert'}`}>
          <span className="pill">{data.aman ? 'Kondisi aman' : 'Perlu perhatian'}</span>
          {data.rekomendasi ? <span className="ml-3 text-primarylight">{data.rekomendasi}</span> : null}
        </div>
      )}
    </div>
  )
}