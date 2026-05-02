export interface Zone {
  id: number
  name: string
}

export interface Plot {
  id: number
  zone_id: number
  label: string
}

export interface CropType {
  id: number
  name: string
  days_to_harvest: number
  notes: string | null
}

export interface RawPlanting {
  id: number
  plot_id: number
  crop_type_id: number
  planted_on: string
  harvested_on: string | null
  status: 'growing' | 'harvested' | 'removed'
  garden_plots: {
    id: number
    label: string
    zone_id: number
    garden_zones: { id: number; name: string }
  }
  garden_crop_types: {
    id: number
    name: string
    days_to_harvest: number
    notes: string | null
  }
}

export interface PlantingDetail {
  id: number
  plot_id: number
  plot_label: string
  zone_id: number
  zone_name: string
  crop_name: string
  crop_type_id: number
  days_to_harvest: number
  notes: string | null
  planted_on: string
  expected_harvest: Date
  harvested_on: string | null
  status: 'growing' | 'harvested' | 'removed'
}
