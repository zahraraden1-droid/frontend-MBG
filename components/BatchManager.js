'use client'

import { useEffect, useState } from 'react'
import { api } from '../lib/api'

const FASE_LABEL = {
  'Inkubasi': 'Inkubasi',
  'Larva Aktif': 'Larva aktif',
  'Menjelang Prepupa/Matang': 'Menjelang prepupa/matang',
  'Siap Panen': 'Siap panen'
}

export default function BatchManager() {
  const [siklus, setSiklus] = useState(null)
  const [form, setForm] = useState({ batchKode: '', tanggalMulai: '', beratTelurGram: '', biayaBeli: '', catatan: '' })
  const [submitting, setSubmitting] = useState(false)
  const [panenId, setPanenId] = useState(null)

  useEffect(() => {
    api.get('/admin-sekolah/batches/status-siklus').then(setSiklus).catch(() => {})
  }, [])

  const semuaBatch = siklus?.semuaBatch || []
  const batchAktif = siklus?.batchAktif || null
  const peringatan = siklus?.peringatan || { perluPesanTelurBaru: false, umurHari: 0, alasan: null }

  async function handleSubmit(e) {
    e.preventDefault()
    setSubmitting(true)
    try {
      await api.post('/admin-sekolah/batches', form)
      setForm({ batchKode: '', tanggalMulai: '', beratTelurGram: '', biayaBeli: '', catatan: '' })
      const fresh = await api.get('/admin-sekolah/batches/status-siklus')
      setSiklus(fresh)
    } catch (err) {
      alert(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  async function handlePanen(id) {
    if (!window.confirm('Tandai batch ini selesai panen?')) return
    setPanenId(id)
    try {
      await api.put(`/admin-sekolah/batches/${id}/panen`, {})
      const fresh = await api.get('/admin-sekolah/batches/status-siklus')
      setSiklus(fresh)
    } catch (err) {
      alert(err.message)
    } finally {
      setPanenId(null)
    }
  }

  return (
    <div className="space-y-6">
      <div className="hairline rounded-md p-5 bg-surface">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display text-lg">Buat batch maggot baru</h3>
        </div>
        <form onSubmit={handleSubmit} className="grid md:grid-cols-5 gap-3 mb-4">
          <input
            type="text"
            required
            placeholder="Kode batch (mis. B-001)"
            value={form.batchKode}
            onChange={(e) => setForm({ ...form, batchKode: e.target.value })}
            className="hairline rounded-sm p-2"
          />
          <input
            type="date"
            required
            value={form.tanggalMulai}
            onChange={(e) => setForm({ ...form, tanggalMulai: e.target.value })}
            className="hairline rounded-sm p-2"
          />
          <input
            type="number"
            required
            placeholder="Berat telur (gram)"
            value={form.beratTelurGram}
            onChange={(e) => setForm({ ...form, beratTelurGram: e.target.value })}
            className="hairline rounded-sm p-2"
          />
          <input
            type="number"
            placeholder="Biaya beli (Rp)"
            value={form.biayaBeli}
            onChange={(e) => setForm({ ...form, biayaBeli: e.target.value })}
            className="hairline rounded-sm p-2"
          />
          <input
            type="text"
            placeholder="Catatan"
            value={form.catatan}
            onChange={(e) => setForm({ ...form, catatan: e.target.value })}
            className="hairline rounded-sm p-2"
          />
          <button
            type="submit"
            disabled={submitting}
            className="md:col-span-5 bg-primary text-white rounded-sm py-2 disabled:opacity-50"
          >
            {submitting ? 'Menyimpan...' : 'Buat batch'}
          </button>
        </form>
      </div>

      <div className="hairline rounded-md p-5 bg-surface">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display text-lg">Status siklus maggot</h3>
          {peringatan.perluPesanTelurBaru && (
            <span className="pill bg-accent/10 text-accent">Perlu pesan telur baru</span>
          )}
        </div>

        {peringatan.alasan && (
          <p className="text-sm text-accent mb-4">{peringatan.alasan}</p>
        )}

        {batchAktif ? (
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="border-l-2 border-accent pl-3">
              <p className="text-xs text-primarylight">Batch aktif</p>
              <p className="text-xl font-display">{batchAktif.batchKode}</p>
            </div>
            <div className="border-l-2 border-accent pl-3">
              <p className="text-xs text-primarylight">Umur</p>
              <p className="text-xl font-display">{siklus?.peringatan?.umurHari ?? batchAktif.umurHari} hari</p>
            </div>
            <div className="border-l-2 border-accent pl-3">
              <p className="text-xs text-primarylight">Fase</p>
              <p className="text-xl font-display">{FASE_LABEL[batchAktif.fase] || batchAktif.fase}</p>
            </div>
            <div className="border-l-2 border-accent pl-3">
              <p className="text-xs text-primarylight">Status</p>
              <p className="text-xl font-display">{batchAktif.status}</p>
            </div>
          </div>
        ) : (
          <p className="text-sm text-primarylight mb-6">Belum ada batch aktif. Buat batch baru di atas.</p>
        )}

        <table className="w-full text-sm">
          <thead>
            <tr className="text-left border-b border-line text-primarylight">
              <th className="py-2">Kode</th>
              <th>Mulai</th>
              <th>Telur</th>
              <th>Umur</th>
              <th>Fase</th>
              <th>Status</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {semuaBatch.map((b) => (
              <tr key={b.id} className="border-b border-line">
                <td className="py-2">{b.batchKode}</td>
                <td>{b.tanggalMulai}</td>
                <td>{b.beratTelurGram} g</td>
                <td>{b.umurHari} hari</td>
                <td>{FASE_LABEL[b.fase] || b.fase}</td>
                <td>{b.status}</td>
                <td>
                  {b.status !== 'selesai_panen' && (
                    <button
                      onClick={() => handlePanen(b.id)}
                      disabled={panenId === b.id}
                      className="bg-primary text-white rounded-sm px-3 py-1 text-xs disabled:opacity-50"
                    >
                      {panenId === b.id ? 'Memproses...' : 'Panen'}
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}