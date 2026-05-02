import { differenceInDays } from 'date-fns'
import type { Zone, Plot, PlantingDetail } from '../types'

interface Props {
  zones: Zone[]
  plots: Plot[]
  plantings: PlantingDetail[]
  onPlotClick: (plot: Plot) => void
}

function cardClass(planting: PlantingDetail | undefined): string {
  if (!planting || planting.status === 'removed') return 'plot-card empty'
  if (planting.status === 'harvested') return 'plot-card harvested'
  const days = differenceInDays(planting.expected_harvest, new Date())
  if (days < 0) return 'plot-card overdue'
  if (days <= 7) return 'plot-card soon'
  return 'plot-card growing'
}

function daysLabel(planting: PlantingDetail): string {
  const days = differenceInDays(planting.expected_harvest, new Date())
  if (days < 0) return `${Math.abs(days)}d over`
  if (days === 0) return 'today!'
  return `${days}d left`
}

export default function PlotMap({ zones, plots, plantings, onPlotClick }: Props) {
  return (
    <div className="plot-map">
      {zones.map(zone => {
        const zonePlots = plots.filter(p => p.zone_id === zone.id)
        return (
          <section key={zone.id} className="zone-panel">
            <h2 className="zone-title">{zone.name}</h2>
            <div className="plot-grid">
              {zonePlots.map(plot => {
                const planting = plantings.find(
                  p => p.plot_id === plot.id && p.status === 'growing'
                )
                return (
                  <button
                    key={plot.id}
                    className={cardClass(planting)}
                    onClick={() => onPlotClick(plot)}
                    title={planting
                      ? `${planting.crop_name} · ${daysLabel(planting)}`
                      : 'Empty — click to log a planting'}
                  >
                    <span className="plot-label">{plot.label}</span>
                    {planting ? (
                      <>
                        <span className="plot-crop">{planting.crop_name}</span>
                        <span className="plot-days">{daysLabel(planting)}</span>
                      </>
                    ) : (
                      <span className="plot-empty">empty</span>
                    )}
                  </button>
                )
              })}
            </div>
          </section>
        )
      })}
    </div>
  )
}
