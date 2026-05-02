import { differenceInDays, format } from 'date-fns'
import type { PlantingDetail } from '../types'

interface Props {
  plantings: PlantingDetail[]
}

function badgeClass(days: number): string {
  if (days < 0) return 'badge overdue'
  if (days <= 7) return 'badge soon'
  return 'badge upcoming'
}

function badgeLabel(days: number): string {
  if (days < 0) return `${Math.abs(days)}d overdue`
  if (days === 0) return 'Today!'
  return `in ${days}d`
}

export default function HarvestCalendar({ plantings }: Props) {
  const growing = plantings
    .filter(p => p.status === 'growing')
    .sort((a, b) => a.expected_harvest.getTime() - b.expected_harvest.getTime())

  if (growing.length === 0) {
    return <p className="empty-state">No active plantings yet.</p>
  }

  return (
    <div className="calendar">
      <h2 className="calendar-title">Upcoming Harvests</h2>
      <div className="calendar-table-wrap">
        <table className="calendar-table">
          <thead>
            <tr>
              <th>Crop</th>
              <th>Zone</th>
              <th>Plot</th>
              <th>Planted</th>
              <th>Expected Harvest</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {growing.map(p => {
              const days = differenceInDays(p.expected_harvest, new Date())
              return (
                <tr key={p.id}>
                  <td className="crop-name">{p.crop_name}</td>
                  <td>{p.zone_name}</td>
                  <td className="mono">{p.plot_label}</td>
                  <td className="mono">{format(new Date(p.planted_on + 'T00:00:00'), 'MMM d')}</td>
                  <td className="mono">{format(p.expected_harvest, 'MMM d, yyyy')}</td>
                  <td><span className={badgeClass(days)}>{badgeLabel(days)}</span></td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
