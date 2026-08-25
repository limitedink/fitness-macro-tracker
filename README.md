<div align="center">

# Fitness Macro Tracker

**Log what you eat. See how it lands against a target you set once.**

No accounts, no sign-up, no server required — your data stays in your browser.

[![CI](https://github.com/limitedink/fitness-macro-tracker/actions/workflows/ci.yml/badge.svg)](https://github.com/limitedink/fitness-macro-tracker/actions/workflows/ci.yml)
[![Deploy](https://github.com/limitedink/fitness-macro-tracker/actions/workflows/deploy.yml/badge.svg)](https://github.com/limitedink/fitness-macro-tracker/actions/workflows/deploy.yml)
![React 19](https://img.shields.io/badge/React-19-14b8a6)
![Vite](https://img.shields.io/badge/Vite-6-6366f1)

[**Try it →**](https://limitedink.github.io/fitness-macro-tracker/)

</div>

---

## Quick start

```bash
git clone https://github.com/limitedink/fitness-macro-tracker.git
cd fitness-macro-tracker
./run
```

That is the whole setup. It installs dependencies on first run and opens the app
at <http://localhost:5173>. Node.js 20+ is the only prerequisite.

| Command | What it does |
| --- | --- |
| `./run` | Start the app — data stays in your browser |
| `./run --server` | Start with the optional API and MongoDB |
| `./run --test` | Run every test |
| `./run --build` | Build a static site into `frontend/dist` |

## What it does

**Set a target once.** Enter grams directly, or open *calculate from bodyweight*
and let it work them out at the usual g/kg prescriptions:

| Macro | Range | Default | At 80 kg |
| --- | --- | --- | --- |
| Protein | 1.6–3 g/kg | 2.35 | 188 g |
| Carbs | 1–4.5 g/kg | 3 | 240 g |
| Fat | 0.5–1 g/kg | 0.75 | 60 g |

The calculator fills the gram fields in rather than locking them, so you can
still adjust anything before saving, and it remembers your weight for next time.

**Log meals by their macros.** Calories are derived, never typed — 4 cal per gram
of protein, 4 for carbs, 9 for fat. Every figure is shown in calories and
kilojoules side by side.

**Watch the day fill up.** A calorie ring and three macro bars show what is left,
turning red once you go past a target rather than quietly stopping at full.

**Move between days.** Targets carry forward automatically: set one and every
later day inherits it until you set a different one.

**Dark and light,** following your system by default, with a toggle that sticks.

## Where your data lives

By default, in **your browser's local storage**. Nothing is sent anywhere, the
app works offline, and a static host serves it perfectly well.

- **⋮ → Export data** saves a JSON backup.
- **⋮ → Import data** restores it, or moves your history to another browser or machine.

If you want one history shared across devices, there is an optional REST API in
[`backend/`](backend) backed by MongoDB:

```bash
./run --server
```

That starts MongoDB in Docker on port **27018** — deliberately not the default
27017, so an existing MongoDB on your machine is left alone — plus the API on
`:5001` and the app on `:5173`. To use a MongoDB you already run, set
`MONGODB_URI` in `backend/.env`. See [`backend/README.md`](backend/README.md) for
the endpoints.

## Publishing it

`frontend/dist` is a plain static site with no backend dependency, so it can go
on any host. The included workflow publishes it to GitHub Pages on every push to
`main` — enable it once under **Settings → Pages → Source → GitHub Actions**.

## Design notes

A few decisions that are worth knowing before changing anything:

**Calories are always derived from macros.** A meal cannot disagree with itself,
and the server recomputes them even if a client sends its own figure.

**Daily totals are summed from meals on every read.** Nothing stores a running
total, so no counter can drift away from the meals that produced it.

**Days are plain `YYYY-MM-DD` strings** taken from your own device, not timestamp
ranges interpreted on a server. A meal logged at 11pm stays on the day you ate it.

**A calorie goal may disagree with its own macro grams.** People round their
numbers, so the app shows you the difference instead of refusing to save.

**Energy is labelled "cal", not "kcal".** The "Calorie" on a nutrition label is
one kilocalorie; mixing both spellings into a food app reads as two different
numbers. Kilojoules are shown alongside as the SI unit — 1 cal = 4.184 kJ.

## Layout

```text
run                       one script for everything
frontend/                 React 19 + Vite + MUI 7 — works standalone
  src/lib/localStore.js     browser-storage data layer
  src/lib/api.js            picks local storage or the REST API
  src/components/           ring, bars, cards, dialogs
backend/                  optional Express 5 + MongoDB API (ESM, Zod-validated)
.github/workflows/        CI on every push, Pages deploy from main
```

## Tests

```bash
./run --test
```

46 tests covering macro, bodyweight and energy-unit conversion, date handling,
request validation, the browser-storage data layer, and the app's main flows
rendered end to end.

## License

[MIT](LICENSE)
