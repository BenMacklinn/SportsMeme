# SportsMeme

Live Techmeme-style sports news prototype.

## What it does

- Fetches live sports RSS feeds from ESPN, CBS Sports, and The Guardian
- Normalizes stories into one format on the server
- Clusters related coverage into a front page
- Renders a reverse-chronological river view
- Exposes feed health so partial outages are visible instead of silent

## Files

- `server.js`: static server, RSS fetcher, normalization, clustering, ranking
- `index.html`: app shell
- `styles.css`: presentation
- `app.js`: frontend state and rendering

## Run it

```bash
npm start
```

Then open `http://127.0.0.1:4173`.

## Notes

- The backend caches feed results for 5 minutes to avoid hammering publishers.
- Clustering is heuristic, based on title token overlap and source diversity.
- If one or more feeds fail, the UI surfaces that instead of pretending the data is complete.
