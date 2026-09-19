'use client'

import { useEffect, useState } from 'react'
import { api } from '../lib/api'

export default function MaintenanceModeToggle() {
  const [aktif, setAktif] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    api.get('/iot/maintenance-mode').then((r) => setAktif(!!r.aktif)).catch(() => {})
  }, [])

  const toggle = async () => {
    setLoading(true)
    try {
      const r = await api.post('/iot/maintenance-mode', { aktif: !aktif })
      setAktif(!!r.aktif)
    } catch (e) {
      alert(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="hairline rounded-md p-5 bg-surface flex items-center justify-between">
      <div>
        <h3 className="font-display text-lg">Mode pemeliharaan</h3>
        <p className="text-xs text-primarylight">
          Saat aktif, perangkat menghentikan pengiriman data dan menunggu instruksi berikutnya.
        </p>
      </div>
      <button
        onClick={toggle}
        disabled={loading}
        className={`px-4 py-2 rounded-md text-sm font-body ${aktif ? 'bg-alert text-white' : 'bg-primary text-white'} disabled:opacity-50`}
      >
        {loading ? '...' : aktif ? 'Matikan' : 'Aktifkan'}
      </button>
    </div>
  )
}