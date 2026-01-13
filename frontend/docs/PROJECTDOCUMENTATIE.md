# Projectdocumentatie – VeilingAI

Deze documentatie beschrijft de volledige structuur van het VeilingAI project: frontend, backend, services, componenten en deployment.

---

## Inhoudsopgave

1. [Project Overzicht](#project-overzicht)
2. [Technologie Stack](#technologie-stack)
3. [Frontend](#frontend)
   - [Componenten](#componenten)
   - [Features](#features)
   - [Services](#services)
   - [Types](#types)
   - [Routes (App)](#routes-app)
4. [Backend](#backend)
   - [Controllers](#controllers)
   - [DTOs](#dtos)
   - [Models](#models)
5. [Deployment](#deployment)
6. [Omgevingsvariabelen](#omgevingsvariabelen)

---

## Project Overzicht

VeilingAI is een real-time veilingplatform gebouwd met:
- **Frontend**: Next.js 16 (App Router) + React 19 + MUI
- **Backend**: ASP.NET Core 9 + Entity Framework + PostgreSQL
- **Real-time**: SignalR voor live biedingen

---

## Technologie Stack

| Laag       | Technologie                          |
|------------|--------------------------------------|
| Frontend   | Next.js 16, React 19, MUI 7, Framer Motion |
| Backend    | ASP.NET Core 9, Entity Framework 9  |
| Database   | PostgreSQL 16                        |
| Real-time  | SignalR                              |
| Deployment | Docker, Vercel (frontend)           |

---

## Frontend

### Componenten

Locatie: `frontend/components/`

| Component               | Beschrijving                                                                 |
|-------------------------|------------------------------------------------------------------------------|
| `AuthProvider.tsx`      | React Context voor authenticatie (login/logout/user state).                 |
| `AuthSplitLayout.tsx`   | Layout component met gesplitste weergave voor login/registratie pagina's.   |
| `Background.tsx`        | Decoratieve achtergrond component.                                          |
| `Box.tsx`               | Herbruikbare container met styling.                                         |
| `Buttons/Button.tsx`    | Primaire knop component.                                                    |
| `FloraLogo.tsx`         | Logo component met verschillende groottes.                                  |
| `PriceHistoryDialog.tsx`| Modal voor weergave van prijsgeschiedenis.                                  |
| `PriceHistoryModal.tsx` | Alternatieve prijsgeschiedenis modal.                                       |
| `SearchBar.tsx`         | Zoekbalk voor producten en veilingen.                                       |
| `TextField.tsx`         | Gestylede tekstinvoer.                                                      |
| `VeilingDisplay.tsx`    | Overzicht van actieve veilingen.                                            |
| `VeilingKlok.tsx`       | Real-time veilingklok met prijsdaling en biedfunctie.                       |

#### Legacy Componenten (`components/(oud)/`)

| Component                    | Beschrijving                                      |
|------------------------------|---------------------------------------------------|
| `EditableField.tsx`          | Bewerkbaar tekstveld.                             |
| `GebruikerDisplay.tsx`       | Weergave van gebruikersgegevens.                  |
| `ProductDisplay.tsx`         | Lijst van producten.                              |
| `ProductSearchBar.tsx`       | Zoekbalk specifiek voor producten.                |
| `RequireAuth.tsx`            | HOC die authenticatie afdwingt.                   |
| `SingleProduct.tsx`          | Weergave van één product.                         |
| `VeilingKlok.tsx`            | Oudere versie van de veilingklok.                 |
| `VeilingListSimple.tsx`      | Eenvoudige lijst van veilingen.                   |

---

### Features

Locatie: `frontend/features/`

| Feature                 | Beschrijving                                                     |
|-------------------------|------------------------------------------------------------------|
| `ProductCard.tsx`       | Kaart voor productweergave met afbeelding, prijs, specificaties. |
| `SpecificatiesCard.tsx` | Kaart voor weergave van productspecificaties.                    |
| `UniversalSelect.tsx`   | Herbruikbare dropdown voor specificaties, locaties, etc.         |
| `UserInfoCard.tsx`      | Kaart met gebruikersinformatie.                                  |
| `(NavBar)/AppNavBar`    | Hoofdnavigatiebalk.                                              |
| `LocatieBeheer/`        | Formulieren voor locatiebeheer.                                  |

---

### Services

Locatie: `frontend/services/`

| Service                   | Beschrijving                                                     |
|---------------------------|------------------------------------------------------------------|
| `auctionRealtime.ts`      | SignalR connectie voor real-time biedingen en prijsupdates.      |
| `authService.ts`          | Login, logout, registratie, token refresh.                       |
| `gebruikerService.ts`     | CRUD operaties voor gebruikers.                                  |
| `locatieService.ts`       | Ophalen en beheren van locaties.                                 |
| `productService.ts`       | Ophalen, aanmaken en bijwerken van producten.                    |
| `searchService.ts`        | Zoekfunctionaliteit.                                             |
| `specificatiesService.ts` | Beheer van productspecificaties.                                 |
| `veilingService.ts`       | CRUD operaties voor veilingen.                                   |
| `verkoperService.ts`      | Beheer van verkopersgegevens.                                    |

---

### Types

Locatie: `frontend/types/`

| Type                | Beschrijving                              |
|---------------------|-------------------------------------------|
| `gebruiker.ts`      | Gebruiker interface.                      |
| `product.ts`        | Product, CreateProductInput, etc.         |
| `search.ts`         | Zoekresultaat types.                      |
| `specificaties.ts`  | Specificatie types.                       |
| `types.ts`          | Algemene types.                           |
| `user.ts`           | User types (auth).                        |
| `veiling.ts`        | Veiling interface.                        |

---

### Routes (App)

Locatie: `frontend/app/`

| Route Groep          | Pagina's                                              |
|----------------------|-------------------------------------------------------|
| `(Aanbieder)`        | createProduct, myProducts, sales, verkopen            |
| `(Algemeen)`         | landing, privacy, voorwaarden, toegankelijkheid       |
| `(admin)`            | admin dashboard                                       |
| `(authenticatie)`    | login, register                                       |
| `(klant)`            | klantProfile, mijn-biedingen, watchlist               |
| `(veilingmeester)`   | veilingAanmaken, veilingDashboard, dashboard          |
| `veiling/[veiling]`  | Dynamische veilingpagina met real-time klok           |
| `product/[product]`  | Dynamische productpagina                              |
| `docs/`              | Interne componentdocumentatie (30 pagina's)           |

---

## Backend

### Controllers

Locatie: `backend/Controllers/`

| Controller                  | Endpoint Prefix            | Beschrijving                                         |
|-----------------------------|----------------------------|------------------------------------------------------|
| `AankoopController.cs`      | `/api/Aankoop`             | Beheer van aankopen/bestellingen.                    |
| `GebruikerController.cs`    | `/api/Gebruiker`           | Registratie, login, profielbeheer.                   |
| `LocatieController.cs`      | `/api/Locatie`             | CRUD voor veilinglocaties.                           |
| `PrijsHistorieController.cs`| `/api/PrijsHistorie`       | Ophalen van prijsgeschiedenis.                       |
| `ProductGegevensController.cs`| `/api/ProductGegevens`   | CRUD voor producten.                                 |
| `SearchController.cs`       | `/api/Search`              | Zoekfunctionaliteit.                                 |
| `SpecificatiesController.cs`| `/api/Specificaties`       | Beheer van specificaties.                            |
| `UploadController.cs`       | `/api/Upload`              | Bestand uploads (afbeeldingen).                      |
| `VeilingController.cs`      | `/api/Veiling`             | CRUD voor veilingen.                                 |
| `VeilingMeesterController.cs`| `/api/VeilingMeester`     | Beheer van veilingmeesters.                          |
| `VerkoperController.cs`     | `/api/Verkoper`            | Beheer van verkopers en hun producten.               |

---

### DTOs

Locatie: `backend/Dtos/`

| DTO                            | Gebruik                                      |
|--------------------------------|----------------------------------------------|
| `AankoopCreateDto.cs`          | Nieuwe aankoop registreren.                  |
| `AankoopResponseDto.cs`        | Aankoop gegevens retourneren.                |
| `AankoopUpdateDto.cs`          | Aankoop bijwerken.                           |
| `AuthResponseDto.cs`           | Login response (tokens).                     |
| `GebruikerCreateDto.cs`        | Nieuwe gebruiker aanmaken.                   |
| `GebruikerResponseDto.cs`      | Gebruikergegevens retourneren.               |
| `GebruikerUpdate.cs`           | Gebruiker bijwerken.                         |
| `LocatieCreateDto.cs`          | Locatie aanmaken.                            |
| `LocatieResponseDto.cs`        | Locatie retourneren.                         |
| `LoginRequestDto.cs`           | Login request.                               |
| `ProductGegevensCreateUpdateDto.cs` | Product aanmaken/bijwerken.             |
| `ProductGegevensResponseDto.cs`| Product retourneren.                         |
| `ProductVeilingUpdateDto.cs`   | Product aan veiling koppelen.                |
| `RegisterRequestDto.cs`        | Registratie request.                         |
| `RoleUpdateDto.cs`             | Rol wijzigen.                                |
| `SearchQuearyDto.cs`           | Zoekquery.                                   |
| `SearchResultDto.cs`           | Zoekresultaat.                               |
| `SpecificatiesCreateDto.cs`    | Specificatie aanmaken.                       |
| `SpecificatiesResponseDto.cs`  | Specificatie retourneren.                    |
| `VeilingDto.cs`                | Veiling aanmaken/bijwerken.                  |
| `VeilingMeesterDto.cs`         | Veilingmeester gegevens.                     |
| `VerkoperDto.cs`               | Verkoper gegevens.                           |
| `VerkoperSalesDto.cs`          | Verkoper verkoopcijfers.                     |

---

### Models

Locatie: `backend/Models/`

| Model                  | Tabel                | Beschrijving                          |
|------------------------|----------------------|---------------------------------------|
| `Aankoop.cs`           | `aankoop`            | Aankooptransactie.                    |
| `Gebruiker.cs`         | `gebruiker`          | Gebruikersaccount.                    |
| `Locatie.cs`           | `locatie`            | Veilinglocatie.                       |
| `ProductGegevens.cs`   | `product_gegevens`   | Productinformatie.                    |
| `ProductSpecificatie.cs`| `product_specificatie`| Koppeltabel product-specificatie.   |
| `RefreshToken.cs`      | `refresh_tokens`     | JWT refresh tokens.                   |
| `Specificaties.cs`     | `specificaties`      | Productspecificaties.                 |
| `Veiling.cs`           | `veiling`            | Veilinginformatie.                    |
| `VeilingMeester.cs`    | `veiling_meester`    | Veilingmeester account.               |
| `Verkoper.cs`          | `verkoper`           | Verkoper (bedrijf).                   |

---

## Deployment

### Docker Compose

Bestand: `docker-compose.yml`

```yaml
services:
  db:
    image: postgres:16-alpine
    volumes:
      - postgres_data:/var/lib/postgresql/data
  
  app:
    image: rayantjedo/veiling-backend:latest
    volumes:
      - backend_uploads:/app/wwwroot/uploads
    depends_on:
      - db

volumes:
  postgres_data:
  backend_uploads:
```

### Deploy Script

Bestand: `deploy.sh`

1. Bouwt de backend Docker image.
2. Pusht naar Docker Hub (`rayantjedo/veiling-backend`).
3. Instructies voor Plesk deployment.

---

## Omgevingsvariabelen

### Frontend (`frontend/.env.local`)

| Variabele                    | Beschrijving                     |
|------------------------------|----------------------------------|
| `NEXT_PUBLIC_BACKEND_LINK`   | URL naar de backend API.         |

### Backend (`backend/.env` / Docker)

| Variabele                          | Beschrijving                            |
|------------------------------------|-----------------------------------------|
| `ConnectionStrings__DefaultConnection` | PostgreSQL connectie string.       |
| `Jwt__Key`                         | Geheime sleutel voor JWT tokens.        |
| `Jwt__Issuer`                      | JWT issuer.                             |
| `Jwt__Audience`                    | JWT audience.                           |
| `FRONTEND_URL`                     | Toegestane CORS origin.                 |

---

## Contact

Voor vragen over deze documentatie, neem contact op met het ontwikkelteam.
