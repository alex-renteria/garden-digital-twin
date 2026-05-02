import { useState, useEffect, useCallback } from 'react'
import { addDays, parseISO } from 'date-fns'
import { supabase } from './lib/supabase'
import type { Zone, Plot, CropType, RawPlanting, PlantingDetail } from './types'
import PlotMap from './components/PlotMap'
import HarvestCalendar from './components/HarvestCalendar'
import PlantingModal from './components/PlantingModal'

type Tab = 'map' | 'calendar'

function toDetail(p: RawPlanting): PlantingDetail {
  return {
    id: p.id,
    plot_id: p.plot_id,
    plot_label: p.garden_plots.label,
    zone_id: p.garden_plots.zone_id,
    zone_name: p.garden_plots.garden_zones.name,
    crop_name: p.garden_crop_types.name,
    crop_type_id: p.crop_type_id,
    days_to_harvest: p.garden_crop_types.days_to_harvest,
    notes: p.garden_crop_types.notes,
    planted_on: p.planted_on,
    expected_harvest: addDays(parseISO(p.planted_on), p.garden_crop_types.days_to_harvest),
    harvested_on: p.harvested_on,
    status: p.status,
  }
}

export default function App() {
  const [tab, setTab] = useState<Tab>('map')
  const [zones, setZones] = useState<Zone[]>([])
  const [plots, setPlots] = useState<Plot[]>([])
  const [cropTypes, setCropTypes] = useState<CropType[]>([])
  const [plantings, setPlantings] = useState<PlantingDetail[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedPlot, setSelectedPlot] = useState<Plot | null>(null)

  const fetchAll = useCallback(async () => {
    const [zRes, pRes, cRes, plRes] = await Promise.all([
      supabase.from('garden_zones').select('*').order('id'),
      supabase.from('garden_plots').select('*').order('zone_id, label'),
      supabase.from('garden_crop_types').select('*').order('name'),
      supabase.from('garden_plantings').select(`
        id, plot_id, crop_type_id, planted_on, harvested_on, status,
        garden_plots ( id, label, zone_id, garden_zones ( id, name ) ),
        garden_crop_types ( id, name, days_to_harvest, notes )
      `),
    ])
    if (zRes.data) setZones(zRes.data)
    if (pRes.data) setPlots(pRes.data)
    if (cRes.data) setCropTypes(cRes.data)
    if (plRes.data) setPlantings((plRes.data as unknown as RawPlanting[]).map(toDetail))
    setLoading(false)
  }, [])

  useEffect(() => { fetchAll() }, [fetchAll])

  const handleModalSave = useCallback(async () => {
    setSelectedPlot(null)
    await fetchAll()
  }, [fetchAll])

  if (loading) {
    return <div className="loading-screen"><p>Loading garden…</p></div>
  }

  const activePlanting = selectedPlot
    ? plantings.find(p => p.plot_id === selectedPlot.id && p.status === 'growing') ?? null
    : null

  const selectedZoneName = selectedPlot
    ? zones.find(z => z.id === selectedPlot.zone_id)?.name ?? ''
    : ''

  return (
    <div className="app">
      <header className="header">
        <div className="header-inner">
          <span className="logo">🌱 Community Garden</span>
          <nav className="tabs">
            <button
              className={`tab${tab === 'map' ? ' active' : ''}`}
              onClick={() => setTab('map')}
            >
              Plot Map
            </button>
            <button
              className={`tab${tab === 'calendar' ? ' active' : ''}`}
              onClick={() => setTab('calendar')}
            >
              Harvest Calendar
            </button>
          </nav>
        </div>
      </header>

      <main className="main">
        {tab === 'map' && (
          <PlotMap
            zones={zones}
            plots={plots}
            plantings={plantings}
            onPlotClick={setSelectedPlot}
          />
        )}
        {tab === 'calendar' && (
          <HarvestCalendar plantings={plantings} />
        )}
      </main>

      {selectedPlot && (
        <PlantingModal
          plot={selectedPlot}
          zoneName={selectedZoneName}
          cropTypes={cropTypes}
          activePlanting={activePlanting}
          onClose={() => setSelectedPlot(null)}
          onSave={handleModalSave}
        />
      )}
    </div>
  )
}
