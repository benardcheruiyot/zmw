# MoMo Loan Flow Clone (Zambia)

React and Node clone of the MoMo instant loan application flow for Zambia.

## Apps

- `client/`: Vite + React frontend that clones the single deployed page and its internal step screens.
- `server/`: Express + Socket.IO backend that mirrors the same event contract used by the frontend.

## Run locally

```bash
npm install
npm run dev
```

The frontend runs on `http://localhost:5173` and the backend runs on `http://localhost:4000`.

## Build

```bash
npm run build
```

## Notes

- The deployed target exposes one public route at `/`; the later user-visible screens are internal step states, not separate URLs.
- The backend verification flow is simulated locally because the deployed service does not expose its original server implementation.
- Country dialing code is Zambia (`+260`) with a 9-digit local number input.
- Loan amount range is `ZMW 5,000` to `ZMW 45,000`.