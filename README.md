# Noobs in Combat

## Run locally

Because the game loads `game-data.json`, open it through a local web server instead of opening `index.html` directly.

From this folder, run:

```powershell
py -m http.server 8000
```

Then open <http://localhost:8000>. Press Ctrl+C in the terminal to stop the server.

## Project files

- `index.html` contains the game screens and layout.
- `styles.css` contains the visual styles.
- `game.js` contains the game logic.
- `game-data.json` contains unit, squad, and level data.
- `bootstrap.js` loads the JSON before starting the game.
- `.github/workflows/pages.yml` publishes the game to GitHub Pages when `main` changes.

## Publish the website

In the repository's **Settings → Pages**, set **Build and deployment → Source** to **GitHub Actions**. After that, each push to `main` deploys the playable game to <https://fivedextor.github.io/void_conquerer/>.
