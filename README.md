# Veiling site

Een real-time veilingplatform gebouwd met een moderne stack. Denk aan eBay, maar dan beter.

---

## Tech Stack

| Laag         | Technologieën                                                                 |
|--------------|-------------------------------------------------------------------------------|
| **Frontend** | React 19, Next.js 16, Material UI, Framer Motion, TailwindCSS, TypeScript, ESLint |
| **Backend**  | C# / .NET 9, SignalR (real-time), Entity Framework Core, FluentValidation, Swagger |
| **Database** | PostgreSQL 16                                                                |

---

## Benodigdheden

Zorg dat je het volgende hebt geinstalleerd:

- **Node.js** (LTS aangeraden) — [nodejs.org](https://nodejs.org)
- **.NET SDK 9** — [dotnet.microsoft.com](https://dotnet.microsoft.com/en-us/download)
- **PostgreSQL 16** — ergens draaiend (lokaal, Docker, cloud, maakt niet uit)

---

## Omgevingsvariabelen

Je moet een paar `.env` bestanden aanmaken. Duurt niet lang.

### Backend (`/backend/.env`)

Maak een bestand genaamd `.env` in de `backend` map met het volgende:

```env
ConnectionStrings__DefaultConnection=Host=localhost;Database=veilingai;Username=postgres;Password=jouwwachtwoord
Jwt__Key=jouw-super-geheime-jwt-key
Jwt__Issuer=VeilingAI
Jwt__Audience=VeilingAIUsers
FRONTEND_URL=http://localhost:3000
ADMIN_PASSWORD=jouw-admin-wachtwoord
```

> **Let op:** Het `ConnectionStrings__DefaultConnection` formaat gebruikt dubbele underscores (`__`) omdat .NET zo omgevingsvariabelen mapt naar configuratie keys. Klassiek .NET gedoe.

### Frontend (`/frontend/.env.local`)

Maak een bestand genaamd `.env.local` in de `frontend` map:

```env
NEXT_PUBLIC_BACKEND_LINK=http://localhost:5000
```

---

## Project Draaien

### 1. Clone de repo

```bash
git clone https://github.com/spinynuggie/VeilingAIWebApplicatieRealNotFake.git
cd VeilingAIWebApplicatieRealNotFake
```

### 2. Start de Backend

```bash
cd backend
dotnet restore   # Haalt alle NuGet packages op
dotnet run       # Start de API server
```

De backend draait nu op `http://localhost:5000` (of welke poort .NET ook kiest, check de terminal output).

Swagger docs zijn beschikbaar op `/swagger` als je de API wilt verkennen.

### 3. Start de Frontend

Open een nieuwe terminal:

```bash
cd frontend
npm install      # Installeert alle dependencies
npm run dev      # Start de Next.js dev server
```

De frontend draait nu op `http://localhost:3000`.

---

## Testen Draaien

De backend heeft een test project met unit tests:

```bash
cd backend.Test
dotnet test
```

---

## Productie Build

### Frontend

```bash
cd frontend
npm run build    # Maakt een geoptimaliseerde productie build
npm run start    # Serveert de productie build lokaal
```

### Backend

```bash
cd backend
dotnet publish -c Release -o ./publish
```

De gecompileerde output staat in `./publish`. Je kan het draaien met `dotnet backend.dll` vanuit die map.

---

## Opmerkingen

- **SignalR** regelt real-time veiling updates, denk aan biedingen en countdowns.
- **Admin account**: Bij de eerste run maakt de backend een admin gebruiker aan met email `admin@example.com` en het wachtwoord dat je hebt ingesteld in `ADMIN_PASSWORD`.
- **Migraties**: EF Core migraties draaien automatisch bij startup, dus de database structuur zet zichzelf op.

---

## Dat was het

Als er iets kapot gaat heb je waarschijnlijk een omgevingsvariabele vergeten. Check die `.env` bestanden nog een keer.
