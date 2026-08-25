# Backend (optional)

The app works fully without this. Run it only if you want one history shared
across several devices instead of per-browser storage.

```bash
./run --server     # from the repository root: MongoDB + API + app
```

Or on its own:

```bash
cp .env.example .env
npm run dev
```

## Endpoints

| Method | Path | Notes |
| --- | --- | --- |
| `GET` | `/api/health` | Status and database connection state |
| `GET` | `/api/summary?day=YYYY-MM-DD` | Target, meals, totals and remaining in one call |
| `GET` | `/api/meals?day=` | Meals for a day, oldest first |
| `POST` | `/api/meals` | Add a meal; calories are computed from the macros |
| `PATCH` | `/api/meals/:id` | Partial edit; calories are recomputed |
| `DELETE` | `/api/meals/:id` | Delete one meal |
| `DELETE` | `/api/meals?day=` | Clear one day — `day` is required, so this cannot wipe everything |
| `GET` | `/api/daily-targets?day=` | The goal in force, falling back to the most recent earlier one |
| `PUT` | `/api/daily-targets` | Create or update a day's goal |
| `DELETE` | `/api/daily-targets?day=` | Remove a day's goal |

Validation failures return `400` with per-field messages:

```json
{ "error": "Invalid request", "fields": { "protein": "cannot be negative" } }
```

## Notes

- Days are `YYYY-MM-DD` strings supplied by the client, so a meal is filed under
  the date the user was actually living in.
- Consumed totals are never stored, only summed from meals on read.
- Client-supplied `calories` on a meal is ignored and recomputed from the macros.
- `npm test` runs the unit tests and needs no database.
