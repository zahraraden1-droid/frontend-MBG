'use client'

import { useEffect, useState } from 'react'

export default function usePolling(fn, intervalMs = 5000, deps = []) {
  const [data, setData] = useState(null)
  const [error, setError] = useState(null)
  const [updatedAt, setUpdatedAt] = useState(null)

  useEffect(() => {
    let active = true
    let timer = null

    const tick = async () => {
      try {
        const result = await fn()
        if (!active) return
        setData(result)
        setUpdatedAt(Date.now())
        setError(null)
      } catch (e) {
        if (active) setError(e)
      }
    }

    tick()
    timer = setInterval(tick, intervalMs)
    return () => {
      active = false
      if (timer) clearInterval(timer)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)

  return { data, error, updatedAt }
}