# SportsMeme

Static prototype of a Techmeme-style sports news aggregator.

## What it includes

- A front page that clusters related sports coverage into one lead story with additional source links
- A river view that shows every story in reverse chronological order
- Browser-side ranking based on recency, source depth, source authority, and a simple buzz signal
- League filters for quickly narrowing the board

## Files

- `index.html`: app shell
- `styles.css`: newspaper-inspired sports layout
- `app.js`: seed article data, clustering, ranking, and rendering

## Run it

Open `index.html` directly in a browser, or serve the folder with a static file server:

```bash
python3 -m http.server 4173
```

Then visit `http://localhost:4173`.

## Next step to make it real

Replace the hard-coded `articles` array in `app.js` with:

1. RSS/API ingestion from a curated sports source list
2. Normalized article extraction
3. Event clustering using title embeddings or entity-based matching
4. Persistent ranking inputs such as source reliability, engagement, and freshness decay
