# SnapBooth Live Slideshow

A free, offline Windows slideshow for photo booth events. It watches a folder continuously, detects new photos, displays each new photo immediately, then returns to the normal slideshow rotation.

## Portable Windows app

The current app is packaged as a self-contained portable Windows EXE. End users do **not** need to install Node.js, npm, Adobe AIR, or a browser runtime.

Download the latest GitHub Actions artifact named:

`SnapBooth-Live-Slideshow-Portable`

Inside it is a file similar to:

`SnapBooth-Live-Slideshow-Portable-1.1.0.exe`

Copy that EXE anywhere on the booth PC and run it.

## Features

- Watches a Windows folder in real time
- Shows newly created photos immediately
- Returns to normal slideshow playback afterward
- Portable single-file Windows EXE
- No separate Node.js install for end users
- Completely offline while running
- Fullscreen mode
- Selectable display / second-monitor support
- Chronological or random playback
- Adjustable normal slide duration
- Adjustable new-photo display duration
- Watch subfolders option
- Event title and subtitle overlay
- JPG, JPEG, PNG, GIF, and WebP support
- ESC returns to Settings
- No Adobe AIR and no subscription

## Using it with dslrBooth

1. Run `SnapBooth-Live-Slideshow-Portable-1.1.0.exe`.
2. Click **Browse** beside Photo Folder.
3. Select the dslrBooth event/output folder containing the images you want shown.
4. Choose the monitor/TV/projector under Display.
5. Set normal photo duration and new-photo duration.
6. Click **Start Slideshow**.

When dslrBooth writes a new supported image into the watched folder, the app waits until the file has finished writing, then displays it immediately.

## Building the portable EXE

Developers can build locally with Node.js:

```powershell
npm install
npm run build:portable
```

The finished EXE appears under `dist/`.

A GitHub Actions workflow also builds the Windows portable EXE automatically whenever the Electron app source changes on `main`.

## Source layout

- `electron/main.js` — Windows app, folder watcher, settings, display control
- `electron/preload.js` — secure renderer bridge
- `ui/settings.html` — graphical settings screen
- `ui/slideshow.html` — slideshow screen
- `.github/workflows/build-portable.yml` — automatic Windows portable build

The older browser/server prototype files remain in the repository for reference but are no longer used by the portable application.
