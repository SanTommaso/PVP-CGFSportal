# PVP/CGFS Portal Demo Module

Modulo standalone React + Vite per visionare il portale operativo CGFS/PVP prima dell'integrazione su `pratovolleyproject.com`.

## Avvio

```powershell
npm install
npm run dev
```

La demo usa dati mock in memoria con `VITE_DATA_SOURCE=mock`, quindi non richiede database attivo.

Se il browser viene ricaricato su `/cgfs` o `/pvp/dashboard`, Vite serve comunque l'app React e il router interno ricostruisce lo stato da `localStorage`.

## Database pluggabile

Il contratto dati vive in `src/data/dataClient.js`.

- `mockAdapter`: attivo di default e usato dalla demo.
- `prismaAdapter`: predisposto come punto di collegamento per un backend/API relazionale.
- `prisma/schema.prisma`: schema relazionale base con SQLite.

Per collegare il database in una fase successiva:

```powershell
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
```

Poi esporre le query Prisma da un backend/API e impostare `VITE_DATA_SOURCE=prisma`.
