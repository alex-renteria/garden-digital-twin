import { useState } from 'react'
import { format } from 'date-fns'
import { supabase } from '../lib/supabase'
import type { Plot, CropType, PlantingDetail } from '../types'

interface Props {
  plot: Plot
  zoneName: string
  cropTypes: CropType[]
  activePlanting: PlantingDetail | null
  onClose: () => void
  onSave: () => Promise<void>
}

export default function PlantingModal({
  plot, zoneName, cropTypes, activePlanting, onClose, onSave,
}: Props) {
  const today = format(new Date(), 'yyyy-MM-dd')
  const [cropTypeId, setCropTypeId] = useState(cropTypes[0]?.id.toString() ?? '')
  const [plantedOn, setPlantedOn] = useState(today)
  const [saving, setSaving] = useState(false)

  async function handleLog() {
    if (!cropTypeId) return
    setSaving(true)
    await supabase.from('garden_plantings').insert({
      plot_id: plot.id,
      crop_type_id: parseInt(cropTypeId),
      planted_on: plantedOn,
      status: 'growing',
    })
    await onSave()
  }

  async function handleMarkHarvested() {
    if (!activePlanting) return
    setSaving(true)
    await supabase
      .from('garden_plantings')
      .update({ status: 'harvested', harvested_on: today })
      .eq('id', activePlanting.id)
    await onSave()
  }

  async function handleMarkRemoved() {
    if (!activePlanting) return
    setSaving(true)
    await supabase
      .from('garden_plantings')
      .update({ status: 'removed' })
      .eq('id', activePlanting.id)
    await onSave()
  }

  const selectedCrop = cropTypes.find(c => c.id.toString() === cropTypeId)

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{zoneName} — Plot {plot.label}</h3>
          <button className="modal-close" onClick={onClose} aria-label="Close">✕</button>
        </div>

        {activePlanting ? (
          <div className="modal-body">
            <div className="planting-info">
              <div className="info-row">
                <span className="info-label">Crop</span>
                <span className="info-value">{activePlanting.crop_name}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Planted</span>
                <span className="info-value">
                  {format(new Date(activePlanting.planted_on + 'T00:00:00'), 'MMMM d, yyyy')}
                </span>
              </div>
              <div className="info-row">
                <span className="info-label">Expected Harvest</span>
                <span className="info-value">
                  {format(activePlanting.expected_harvest, 'MMMM d, yyyy')}
                  <span className="days-note"> ({activePlanting.days_to_harvest} days)</span>
                </span>
              </div>
              {activePlanting.notes && (
                <div className="info-row">
                  <span className="info-label">Notes</span>
                  <span className="info-value">{activePlanting.notes}</span>
                </div>
              )}
            </div>
            <div className="modal-actions">
              <button className="btn btn-primary" onClick={handleMarkHarvested} disabled={saving}>
                Mark Harvested
              </button>
              <button className="btn btn-ghost" onClick={handleMarkRemoved} disabled={saving}>
                Remove Planting
              </button>
            </div>
          </div>
        ) : (
          <div className="modal-body">
            <p className="modal-subtitle">Log a new planting for this plot.</p>
            <div className="form-group">
              <label className="form-label" htmlFor="crop-select">Crop</label>
              <select
                id="crop-select"
                className="form-select"
                value={cropTypeId}
                onChange={e => setCropTypeId(e.target.value)}
              >
                {cropTypes.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            {selectedCrop && (
              <p className="crop-hint">
                Harvest in <strong>{selectedCrop.days_to_harvest} days</strong>
                {selectedCrop.notes ? ` · ${selectedCrop.notes}` : ''}
              </p>
            )}
            <div className="form-group">
              <label className="form-label" htmlFor="planted-on">Planted On</label>
              <input
                id="planted-on"
                type="date"
                className="form-input"
                value={plantedOn}
                onChange={e => setPlantedOn(e.target.value)}
              />
            </div>
            <div className="modal-actions">
              <button
                className="btn btn-primary"
                onClick={handleLog}
                disabled={saving || !cropTypeId}
              >
                Log Planting
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
