'use client'

import DeviceStatusPanel from '../../../components/DeviceStatusPanel'
import DeviceControlPanel from '../../../components/DeviceControlPanel'
import MaintenanceModeToggle from '../../../components/MaintenanceModeToggle'

export default function PerangkatPage() {
  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl">Perangkat IoT</h1>
      <MaintenanceModeToggle />
      <DeviceStatusPanel />
      <DeviceControlPanel />
    </div>
  )
}