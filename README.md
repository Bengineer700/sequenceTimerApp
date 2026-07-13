# Sequence — Practice Timer

A spoken-cue interval timer for yoga, exercise, and any sequence of timed tasks. Set up a list of named tasks, each with its own duration, add optional transition breaks, and let the app talk you through the whole routine hands-free.

It's a **Progressive Web App**: a single-page web app with no build step and no dependencies, installable to your phone's home screen and fully functional offline.

---

## Features

**Building a routine**
- Generate a batch of tasks at once (e.g. 15 tasks × 1 minute) with a default duration
- Add, rename, and remove individual tasks
- Give each task its own duration in minutes and seconds
- Optional transition period inserted between every task (e.g. 15 seconds to reposition)
- Reorder tasks by dragging the handle, or with the up/down arrows (arrows are the reliable method on touchscreens)
- Live total-time readout as you edit

**Running a session**
- Full-screen session view with a countdown ring, current task name, and time remaining
- Spoken cues announce each task and its duration, then the transition, repeating through the list
- Optional chime at each task change and a completion chime at the end
- Optional vibration cues on phones
- Pause / resume, skip forward, skip back, and stop controls

**Keeping the screen alive**
- By default the app holds a screen wake-lock during a session
- Optional "let the screen lock" mode plays silent background audio so the timer and cues keep running with the screen off, and exposes pause/skip on the lock screen via media controls (best on Android; see Limitations)

**Saving your work**
- Your working setup auto-saves as you edit and is restored when you reopen the app
- Save any number of named routines
- Export a routine to a `.json` file and import it on another device

**Appearance**
- Light theme: calm earth tones
- Dark theme: AMOLED-black background with neon accents and a digital-clock countdown font
- Follows your system light/dark preference by default; manual toggle remembers your choice

---

## Installing on a phone

The app must be served over HTTPS to be installable (see Deployment below). Once it's live at a URL:

1. Open the URL in Chrome on your Android phone.
2. Tap the in-app **Install this app** button when it appears, or use Chrome's menu → **Add to Home screen**.
3. Launch it from your home screen — it opens full-screen and works offline.

On iPhone, use Safari → Share → **Add to Home Screen**. iOS support for background audio and speech while locked is limited; the screen-awake default is the dependable path there.

---

## Deployment

The app is a set of static files, so any static host with HTTPS works. Two common options:

### GitHub Pages (with automatic versioning)

This repo includes a workflow at `.github/workflows/deploy.yml` that deploys on every push and stamps the commit hash into the service worker's cache version, so installed copies always update.

1. Push these files to a **public** GitHub repository.
2. In **Settings → Pages → Build and deployment**, set **Source** to **GitHub Actions**.
3. Push to `main` — the site goes live at `https://YOUR-USERNAME.github.io/REPO-NAME/` within a minute or two.

To get a root URL with no path (`https://YOUR-USERNAME.github.io`), name the repository exactly `YOUR-USERNAME.github.io`.

### Drag-and-drop hosts (Netlify Drop, Cloudflare Pages, Vercel)

Drag the unzipped folder onto the host and it returns an HTTPS URL. If you host this way, there's no build step to update the cache version, so **bump `CACHE_VERSION` in `sw.js` manually** (e.g. `sequence-v3` → `sequence-v4`) whenever you change a file, so installed apps pick up the update.

---

## How updates reach installed apps

The service worker serves the cached copy first for instant, offline loads. When `CACHE_VERSION` changes, the worker fetches the new files in the background and switches to them the next time the app is opened with a connection. This means a change usually appears one launch *after* it's deployed, not immediately. The GitHub Action handles the version change automatically; other hosts require the manual bump described above.

---

## Project structure

```
.
├── index.html              # The entire app: markup, styles, and logic
├── sw.js                   # Service worker: offline caching + update logic
├── manifest.webmanifest    # PWA metadata (name, icons, display mode)
├── icon-192.png            # App icons
├── icon-512.png
├── icon-maskable-512.png   # Maskable icon for adaptive Android shapes
├── apple-touch-icon.png    # iOS home-screen icon
├── favicon-32.png
└── .github/workflows/
    └── deploy.yml          # GitHub Pages deploy + cache-version stamping
```

There is no build step and no package manager. The only external resources are Google Fonts, which the service worker caches on first load so the app still renders correctly offline.

---

## Running locally

A service worker won't register from a `file://` path, so open the folder through a local server rather than double-clicking `index.html`:

```bash
# from inside the project folder
python3 -m http.server 8000
```

Then visit `http://localhost:8000`. `localhost` counts as a secure context, so install and offline features work there for testing.

---

## Data and privacy

All routines and settings are stored in your browser's local storage on the device where you use the app. Nothing is uploaded or synced to a server. To move routines between devices, use the **Export** and **Import** buttons.

---

## Limitations

- **Speech while locked:** In screen-lock mode, chimes and vibration are reliable, but spoken task names can pause on some phones until the screen is woken. If voice matters most, leave the screen-lock toggle off.
- **iOS:** Background timing and audio are suspended when an iPhone locks, regardless of the toggle. Keep the screen on during a session.
- **Touch reordering:** Drag-and-drop reordering generally doesn't respond to touch in mobile browsers; use the up/down arrows on phones.
- **Voices vary:** Available text-to-speech voices depend on the device and browser.
- **Background audio:** In screen-lock mode, starting a session may briefly duck or pause music playing from another app, since the phone treats the silent keep-alive track as a second audio source.
