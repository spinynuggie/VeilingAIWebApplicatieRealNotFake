# backend.Test — Test Coverage Documentation

This file documents the unit tests in `backend.Test/`. It provides a short description for each test file, lists the test methods, and notes important edge cases covered.

Notes:
- Tests are written with MSTest.
- EF Core InMemory provider is used to seed and exercise repository-backed logic.
- All tests avoid modifying production code; when external resources are required, tests exercise safe paths or use in-memory data.

---

## AankoopControllerTests.cs
Covers: buyer (aankoop) CRUD endpoints and authorization-related behaviour.
- GetMijnAankopen_ReturnsList — authenticated user returns their purchases.
- GetAankoop_ById_Found / NotFound — fetch single aankoop.
- PutAankoop_Update_ReturnsNoContent — update existing aankoop.
- PostAankoop_Creates_ReturnsCreatedAt — create aankoop and verify DB.
- DeleteAankoop_Existing/NotFound — deletion behaviour.

Edge cases: unauthorized states are simulated by manipulating ClaimsPrincipal; DB state is verified after writes.

## ProductGegevensControllerTests.cs
Covers: product CRUD, linking to veiling, list endpoints.
- GetProductGegevens_ReturnsAll
- GetProductGegevens_ById_Found / NotFound
- PostProductGegevens_Creates_ReturnsCreatedAt
- PutProductGegevens_Updates_ReturnsNoContent
- KoppelAanVeiling_ReturnsNoContent / NotFound
- DeleteProductGegevens_ReturnsNoContent / NotFound

Edge cases: CreatedAtAction returns an anonymous projection — tests reflectively inspect returned value.

## SearchControllerTests.cs
Covers: global search across products and auctions and specificatie search endpoints.
- Search_EmptyQuery_ReturnsEmptyList
- Search_ProductMatch_ReturnsMatchingProducts
- Search_AuctionMatch_ReturnsMatchingAuctions
- Search_MultipleMatches_ReturnsAllMatches
- Search_NoMatches_ReturnsEmptyList

Notes: Uses `SearchQueryDto` and asserts `SearchResultDto` entries (Type = "Product" or "Veiling").

## SpecificatiesControllerTests.cs
Covers: productspecificatie listing and creation.
- GetSpecificaties_ReturnsOk — verifies endpoint returns Ok + list of `SpecificatiesResponseDto`.
- CreateSpecificatie_WithValidDto_ReturnsCreated — posts `SpecificatiesCreateDto` and expects CreatedAtAction.

Important: DTOs in production use `naam`/`beschrijving` (lowercase) and model uses `SpecificatieId` and `Beschrijving`; tests were updated to match these names.

## LocatieControllerTests.cs
Covers: location listing and creation endpoints.
- GetLocaties_ReturnsAll
- CreateLocatie_WithValidDto_ReturnsCreated

Edge cases: null DTO handling and DB persistence checks.

## UploadControllerTests.cs
Covers: file upload endpoint behaviour.
- Upload_NullFile_ReturnsBadRequest
- Upload_ValidFile_ReturnsOk — verifies that a valid IFormFile is accepted and stored (test cleans up created files).

Notes: Uses in-memory IFormFile construction.

## PrijsHistorieControllerTests.cs
Covers: price-history endpoint safe-path behaviour without opening DB connections.
- GetHistory_BadRequest_WhenMissingProductNaam — exercises early validation path that returns BadRequest when required query param missing.

Notes: The production `PrijsHistorieService` requires a DB connection; tests intentionally exercise controller validation to avoid external dependencies.

## VeilingControllerTests.cs
Covers: auction CRUD endpoints.
- GetVeiling_ReturnsAll
- GetVeiling_ById_Found / NotFound
- PostVeiling_Creates_ReturnsCreatedAt
- PutVeiling_Updates_ReturnsNoContent
- DeleteVeiling_Existing / NotFound

Edge cases: verifies persistence in InMemory DB.

## VeilingMeesterControllerTests.cs
Covers: veilingmeester CRUD and deletion validation.
- PostVeilingMeester_Creates_ReturnsCreatedAt
- PutVeilingMeester_Updates_ReturnsNoContent
- DeleteVeilingMeester_BadRequest_WhenActiveAuctionsExist

Notes: seeds `Veiling` rows with future `Eindtijd` to test deletion blocking.

## VerkoperControllerTests.cs
Covers: verkoper endpoints including `me` routes and upsert behaviour.
- GetVerkopers_ReturnsAll
- GetVerkoper_ById_Found / NotFound
- GetMyVerkoper_Unauthorized / NotFound / Found
- UpsertMyVerkoper_Unauthorized / Creates / Updates
- UpdateMyVerkoper_Unauthorized / NotFound / NoContent
- PostVerkoper_Creates_ReturnsCreatedAt
- PutVerkoper_NotFound / Updates
- DeleteVerkoper_Existing / NotFound (and BadRequest when products exist)

Edge cases: authorization via ClaimsPrincipal; deletion blocked when products are present.

## GebruikerControllerTests.cs
Covers: registration, login, token refresh, role updates and current-user routes.
- PostGebruiker_Creates_ReturnsCreatedAt
- Register_CreatesAndReturnsAuth
- Login_Success_ReturnsOk / WrongPassword_ReturnsUnauthorized
- GetCurrentUser_Unauthorized / Success
- UpdateRole_Unauthorized / Forbid / BadRequest / Success
- DeleteGebruiker_Forbid / Success
- Refresh_Unauthorized_WhenNoCookie / Success_WhenValidRefreshToken

Notes: Uses `PasswordHasher` and a minimal `IConfiguration` with JWT keys for token generation. Cookies are simulated by setting Request headers.

## PasswordTests.cs
Unit tests for `PasswordHasher`:
- HashAndVerify_Succeeds
- Verify_InvalidHash_ReturnsFalse

## UploadControllerTests.cs
(See above)

## MSTestSettings.cs
MSTest configuration; no tests here.

## Test1.cs
Placeholder tests; may be removable. Contains trivial example/test.

---

If you want these docs embedded as XML comments above each test method instead (so they appear in IDE tooltips), I can add short XML doc comments to each test method. That would be a larger edit across ~20 files; I can do it next if you want.

Next steps I can take now
- Add XML doc comments to each test method (adds inline docs visible in IDE) — ask and I'll implement.
- Generate per-file Markdown files instead of a single `TESTS.md` (if you prefer one doc per test file).

Tell me which format you prefer (single markdown, per-file markdown, or inline XML comments) and I will proceed. I've also updated the todo list to record this documentation task as in-progress. If you'd like, I can now add inline XML comments; it will take a few small edits per test file.