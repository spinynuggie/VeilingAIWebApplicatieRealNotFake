<<<<<<< HEAD
# Dit heb je nodig voor ons project

## Installatie

1. Installeer Node.js (LTS) via [https://nodejs.org](https://nodejs.org)

2. Clone de repository:
   ```bash
   git clone https://github.com/spinynuggie/VeilingAIWebApplicatieRealNotFake.git
   cd VeilingAIWebApplicatieRealNotFake
   ```

3. Installeer dependencies:
   ```bash
   npm install
   ```

4. Installeer Material UI + fonts:
   ```bash
   npm install @mui/material @emotion/react @emotion/styled
   npm install @mui/icons-material
   npm install @fontsource/roboto
   ```

5. Start de development server:
   ```bash
   npm run dev
   ```

Open daarna de app in je browser via [http://localhost:5173](http://localhost:5173) (of de poort die in de terminal staat).
=======
# Project
Tutorial hoe je het project opzet
## Vereisten
- Node.js 18 of hoger `https://nodejs.org/en/download`
- .NET SDK 9.0.9 `https://dotnet.microsoft.com/en-us/download`
## Installatie
Voer onderstaande stappen uit in de map `frontend`:
```
npm install
npm install @mui/material @emotion/react @emotion/styled
npm install @fontsource/roboto
npm install @mui/icons-material
```

## Ontwikkelen
Start de ontwikkelserver:
```
npm run dev
```
Standaard draait Vite op `http://localhost:5173`.
## Productie build
Maak een geoptimaliseerde build:
```
npm run build
```
Preview van de build (optioneel):
```
npm run preview
```
## Nuttig om te weten
- Gemaakt met React + TypeScript en Vite.
- UI‑componenten via MUI.
- Broncode staat in `src/`.
## Scripts (overzicht)
- `npm run dev` – ontwikkelserver starten
- `npm run build` – productie build maken
- `npm run preview` – build lokaal bekijken
- `npm run lint` – code controleren
## Backend (optioneel, voor testing)
De backend staat in `../backend` en kan apart worden gestart met .NET. Voor lokaal testen kun je beide afzonderlijk draaien.
Draait standaard op `http://localhost:5173`.
>>>>>>> 8082bbc1e56ea6e1de22495e8604d443dad4befa
