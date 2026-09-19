'use client'

import usePolling from '../lib/usePolling'
import { api } from '../lib/api'

function fmtAgo(iso) {
  if (!iso) return 'belum pernah terhubung'
  const diff = Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 1000))
  if (diff < 5) return 'baru saja'
  if (diff < 60) return `${diff} detik lalu`
  if (diff < 3600) return `${Math.floor(diff / 60)} menit lalu`
  return new Date(iso).toLocaleString('id-ID', { hour12: false })
}

export default function DeviceStatusPanel() {
  const { data: devices, error } = usePolling(() => api.get('/devices'), 3000, [])

  if (!devices && !error) {
    return <div className="hairline rounded-md p-5 bg-surface text-sm text-primarylight">Memuat status perangkat...</div>
  }
  if (!devices) {
    return <div className="hairline rounded-md p-5 bg-surface text-sm text-alert">Gagal mengambil status perangkat.</div>
  }

  return (
    <div className="grid md:grid-cols-2 gap-4">
      {devices.map((device) => (
        <div key={device.id} className="hairline rounded-md p-5 bg-surface">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-display text-lg">{device.nama}</h3>
            <span className={`inline-flex items-center gap-2 text-xs ${device.online ? 'text-green-700' : 'text-alert'}`}>
              <span className={`inline-block h-2.5 w-2.5 rounded-full ${device.online ? 'bg-green-500 animate-pulse' : 'bg-alert'}`} />
              {device.online ? 'Online' : 'Offline'}
            </span>
          </div>
          <p className="text-xs text-primarylight mb-1">Status · {fmtAgo(device.lastSeen)}</p>
          <dl className="text-sm space-y-1">
            <div className="flex justify-between">
              <dt className="text-primarylight">Tipe</dt>
              <dd>{device.tipe}</dd>
            </div>
            {Object.entries(device.calibration || {}).map(([key, value]) => (
              <div key={key} className="flex justify-between">
                <dt className="text-primarylight">{key}</dt>
                <dd className="font-mono">{value}</dd>
              </div>
            ))}
            {device.statusPesan && device.statusPesan.heartbeat !== undefined && (
              <div className="flex justify-between">
                <dt className="text-primarylight">Berat saat ini</dt>
                <dd className="font-mono">{device.statusPesan.beratKg} kg</dd>
              </div>
            )}
          </dl>
        </div>
      ))}
    </div>
  )
}