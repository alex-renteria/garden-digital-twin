# Garden Digital Twin

A plot tracking app for our community garden — see what's growing, when to harvest, and log new plantings.

## Running locally

```bash
npm run dev
```

Opens at http://localhost:5173

## What's inside

- **Plot Map** — 3 zones (North Side, South Side, Tree Side), each with 15 plots color-coded by harvest urgency
- **Harvest Calendar** — all active plantings sorted by expected harvest date
- Click any plot to log a new planting or mark it harvested/removed

## Stack

- React + TypeScript + Vite
- Supabase (database + API)

## Environment

Requires a `.env.local` file with your Supabase credentials (not committed to git).
