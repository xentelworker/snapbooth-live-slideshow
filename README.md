# SnapBooth Live Slideshow

A free, offline Windows slideshow for photo booth events. It watches a folder continuously, detects new photos, displays each new photo immediately, then returns to the normal slideshow rotation.

## Features

- Watches a Windows folder in real time
- Shows new photos immediately
- Fullscreen browser display
- Works well on a second monitor, TV, or projector
- Chronological or shuffle playback
- Adjustable slide duration, new-photo duration, and fade time
- JPG, JPEG, PNG, GIF, and WebP support
- Recursive folder watching
- Event title/subtitle overlay
- Runs completely offline after initial setup
- No Adobe AIR and no subscription

## Windows setup

1. Install the current **Node.js LTS** from https://nodejs.org/ if it is not already installed.
2. Download or clone this repository.
3. Open `config.json` and set `watchFolder` to your dslrBooth output folder. Example:

```json
"watchFolder": "C:\\Users\\Billy\\Pictures\\dslrBooth\\My Event"
```

4. Double-click `start.bat`.
5. On the first run, required packages are installed automatically.
6. The slideshow opens at `http://127.0.0.1:8787`.
7. Move the browser to your second screen and press **F** or click **Fullscreen**.

## dslrBooth workflow

Point `watchFolder` at the folder where dslrBooth saves the finished photos you want displayed. When a new supported image is written there, SnapBooth Live detects it after the file finishes writing and puts it on screen immediately.

## Configuration

Edit `config.json` before starting the app:

```json
{
  "watchFolder": "./photos",
  "port": 8787,
  "slideDurationMs": 7000,
  "newPhotoDurationMs": 10000,
  "transitionMs": 900,
  "playback": "chronological",
  "recursive": true,
  "showNewPhotoBadge": true,
  "title": "SnapBooth Live",
  "subtitle": "Live Event Slideshow",
  "fit": "contain",
  "background": "#000000"
}
```

`playback` can be `chronological` or `shuffle`.

`fit` can be `contain` to show the whole photo or `cover` to fill the screen and crop edges.

## Keyboard shortcuts

- **F** - fullscreen
- **Right Arrow** - next photo
- **Space** - pause/resume

## Default photo folder

If you leave `watchFolder` as `./photos`, the app automatically creates a `photos` folder beside `server.js`. Drop images into it to test the slideshow.

## Stop the app

Close the slideshow browser and press **Ctrl+C** in the SnapBooth Live console window.

## License

This project is intended as a simple event-display utility. Add a license file before redistributing it publicly if you want to establish explicit reuse terms.
