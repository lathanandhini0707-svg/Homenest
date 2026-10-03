# HomeNest Full-Stack Backend

This package keeps the existing HomeNest HTML/CSS/JavaScript UI and its data structure. The backend stores the complete HomeNest data object in SQLite, so existing collections/records are not split, renamed, or discarded.

## Run

1. Install Node.js 18+.
2. Open a terminal in this folder.
3. Run `npm install`.
4. Run `npm start`.
5. Open `http://localhost:3000`.

## Data behavior

- The existing browser `localStorage` remains as an offline fallback.
- When the backend is available, HomeNest automatically syncs the complete data object to SQLite.
- If the backend has no data yet, the current browser data is uploaded automatically.
- If browser data is newer, it is uploaded; if the backend is newer, it is restored into the browser.
- Photos/documents already represented in HomeNest data are preserved in the same data object.
- SQLite database file: `data/homenest.sqlite`.
- API: `GET /api/data`, `PUT /api/data`, `GET /api/health`, `GET /api/backup`.

## Important

This is a self-hosted/local backend. It is not an internet-facing multi-user security system. For public deployment, add authentication, HTTPS, encrypted secrets, access control and object storage for sensitive documents before exposing it to the internet.
