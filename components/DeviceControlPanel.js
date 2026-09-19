'use client'

import { useState } from 'react'
import usePolling from '../lib/usePolling'
import { api } from '../lib/api'

const KONTROL = {
  'smart-container': [
    { cmd: 'status', label: 'Minta status', input: false },
    { cmd: 'tare', label: 'Tare (nol-kan)', input: false },
    { cmd: 'set_scale_factor', label: 'Set faktor kalibrasi', input: true, placeholder: 'cth: 450', key: 'scaleFaktor' },
    { cmd: 'reboot', label: 'Reboot perangkat', input: false, danger: true }
  ],
  'maggot-chamber': [
    { cmd: 'status', label: 'Minta status', input: false },
    { cmd: 'tare', label: 'Tare (nol-kan)', input: false },
    { cmd: 'set_scale_factor', label: 'Set faktor kalibrasi', input: true, placeholder: 'cth: 450', key: 'scaleFaktor' },
    { cmd: 'set_r0', label: 'Set R0 MQ-135', input: true, placeholder: 'cth: 30', key: 'mq135R0' },
    { cmd: 'set_interval', label: 'Set interval kirim (detik)', input: true, placeholder: 'cth: 60' },
    { cmd: 'reboot', label: 'Reboot perangkat', input: false, danger: true }
  ]
}

export default function DeviceControlPanel() {
  const { data: devices } = usePolling(() => api.get('/devices'), 3000, [])
  const [inputs, setInputs] = useState({})
  const [feedback, setFeedback] = useState({})

  if (!devices) return null

  const kirim = async (device, kontrol) => {
    let value
    if (kontrol.input) {
      value = Number(inputs[`${device.id}.${kontrol.cmd}`])
      if (!value || isNaN(value)) {
        setFeedback((f) => ({ ...f, [device.id]: 'Isi nilai terlebih dahulu' }))
        return
      }
      if (kontrol.cmd === 'set_interval') value = value * 1000 // UI dalam detik, firmware dalam ms
    }
    try {
      const res = await api.post(`/devices/${device.id}/cmd`, kontrol.input ? { cmd: kontrol.cmd, value } : { cmd: kontrol.cmd })
      setFeedback((f) => ({ ...f, [device.id]: res.terkirim ? `Perintah "${kontrol.cmd}" terkirim` : res.pesan }))
    } catch (e) {
      setFeedback((f) => ({ ...f, [device.id]: e.message }))
    }
  }

  const warnaTombol = (kontrol) => {
    if (kontrol.danger) return 'bg-alert text-white'
    if (kontrol.input) return 'bg-accent text-white'
    return 'bg-primary text-white'
  }

  return (
    <div className="space-y-4">
      <h3 className="font-display text-lg">Kontrol &amp; kalibrasi remote</h3>
      {devices.map((device) => (
        <div key={device.id} className="hairline rounded-md p-5 bg-surface">
          <h4 className="font-display mb-3">
            {device.nama} <span className="text-xs text-primarylight font-body">({device.id})</span>
          </h4>
          <div className="grid sm:grid-cols-2 gap-3">
            {KONTROL[device.id].map((kontrol) => (
              <div key={kontrol.cmd} className="flex items-end gap-2">
                {kontrol.input ? (
                  <label className="flex-1 block">
                    <span className="text-xs text-primarylight">{kontrol.label}</span>
                    <input
                      type="number"
                      step="any"
                      defaultValue={device.calibration?.[kontrol.key]}
                      placeholder={kontrol.placeholder}
                      onChange={(e) => setInputs((s) => ({ ...s, [`${device.id}.${kontrol.cmd}`]: e.target.value }))}
                      className="w-full mt-1 px-3 py-2 text-sm border border-line rounded-md bg-white"
                    />
                  </label>
                ) : (
                  <span className="flex-1 self-center text-sm text-primarylight">{kontrol.label}</span>
                )}
                <button
                  onClick={() => kirim(device, kontrol)}
                  className={`px-3 py-2 rounded-md text-sm disabled:opacity-50 ${warnaTombol(kontrol)}`}
                >
                  Kirim
                </button>
              </div>
            ))}
          </div>
          {feedback[device.id] && (
            <p className="mt-3 text-xs text-primarylight">→ {feedback[device.id]}</p>
          )}
          {device.cmdResult && (
            <div className="mt-3 border-t border-line pt-2 text-xs">
              <p className="text-primarylight">Respon terakhir:</p>
              <p className={device.cmdResult.ok ? 'text-green-700' : 'text-alert'}>
                {device.cmdResult.cmd} · {device.cmdResult.ok ? 'OK' : 'GAGAL'}
                {device.cmdResult.catatan ? ` · ${device.cmdResult.catatan}` : ''}
              </p>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}