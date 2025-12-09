DO $$
DECLARE
  gid1 integer;
  gid2 integer;
  gid3 integer;
  vk1 integer;
  vk2 integer;
  vk3 integer;
  vm1 integer;
  v1 integer;
  v2 integer;
  v3 integer;
BEGIN
  -- Clear some tables (be careful: this deletes data)
  PERFORM pg_advisory_xact_lock(1);
  TRUNCATE TABLE "Aankoop" RESTART IDENTITY CASCADE;
  TRUNCATE TABLE "product_gegevens" RESTART IDENTITY CASCADE;
  TRUNCATE TABLE "veiling" RESTART IDENTITY CASCADE;
  TRUNCATE TABLE "veiling_meester" RESTART IDENTITY CASCADE;
  TRUNCATE TABLE "verkoper" RESTART IDENTITY CASCADE;
  TRUNCATE TABLE "refresh_tokens" RESTART IDENTITY CASCADE;
  TRUNCATE TABLE "gebruiker" RESTART IDENTITY CASCADE;

  -- Insert gebruikers
  INSERT INTO "gebruiker" ("Emailadres","Naam","Wachtwoord","Straat","Huisnummer","Postcode","Woonplaats",role)
  VALUES
    ('alice@example.com','Alice','changeme','Bloemstraat','1','1234AB','Amsterdam','KOPER'),
    ('bob@example.com','Bob','changeme','Rozenlaan','2','2345BC','Rotterdam','VERKOPER'),
    ('carol@example.com','Carol','changeme','Tulpenweg','3','3456CD','Den Haag','VEILINGMEESTER');

  -- Note: RETURNING into single variable stores only the last row; instead fetch ids by selecting
  SELECT "GebruikerId" FROM "gebruiker" ORDER BY "GebruikerId" LIMIT 1 OFFSET 0 INTO gid1;
  SELECT "GebruikerId" FROM "gebruiker" ORDER BY "GebruikerId" LIMIT 1 OFFSET 1 INTO gid2;
  SELECT "GebruikerId" FROM "gebruiker" ORDER BY "GebruikerId" LIMIT 1 OFFSET 2 INTO gid3;

  -- Insert verkopers
  INSERT INTO "verkoper" ("Adresgegevens","Bedrijfsgegevens","FinancieleGegevens","KvkNummer")
  VALUES
    ('Adres 1','Bedrijf A','IBAN:NL00BANK0001','KVK12345'),
    ('Adres 2','Bedrijf B','IBAN:NL00BANK0002','KVK23456'),
    ('Adres 3','Bedrijf C','IBAN:NL00BANK0003','KVK34567');

  SELECT "VerkoperId" FROM "verkoper" ORDER BY "VerkoperId" LIMIT 1 OFFSET 0 INTO vk1;
  SELECT "VerkoperId" FROM "verkoper" ORDER BY "VerkoperId" LIMIT 1 OFFSET 1 INTO vk2;
  SELECT "VerkoperId" FROM "verkoper" ORDER BY "VerkoperId" LIMIT 1 OFFSET 2 INTO vk3;

  -- Insert veiling_meester linking to gebruiker (use gid3 as veilingmeester)
  INSERT INTO "veiling_meester" ("GebruikerId") VALUES (gid3) RETURNING "MeesterId" INTO vm1;

  -- Insert veilingen
  INSERT INTO "veiling" ("Naam","Beschrijving","Starttijd","Eindtijd","Image","VeilingMeesterId") VALUES
    ('Bloemenveiling A','Dagelijkse bloemenveiling A',0,86400,'/images/veilA.jpg', vm1),
    ('Bloemenveiling B','Speciaal voor rozen',0,172800,'/images/veilB.jpg', vm1),
    ('Bloemenveiling C','Zomerse selectie',0,259200,'/images/veilC.jpg', vm1);

  SELECT "VeilingId" FROM "veiling" ORDER BY "VeilingId" LIMIT 1 OFFSET 0 INTO v1;
  SELECT "VeilingId" FROM "veiling" ORDER BY "VeilingId" LIMIT 1 OFFSET 1 INTO v2;
  SELECT "VeilingId" FROM "veiling" ORDER BY "VeilingId" LIMIT 1 OFFSET 2 INTO v3;

  -- Insert producten
  INSERT INTO "product_gegevens" ("Fotos","ProductNaam","ProductBeschrijving","Hoeveelheid","StartPrijs","EindPrijs","Huidigeprijs","VeilingId","VerkoperId") VALUES
    ('["https://picsum.photos/seed/bloom/600/400"]','Mooi Bloempje','Een mooi bloempje',10,10.00,0.00,10.00,v1,vk1),
    ('["https://picsum.photos/seed/rose/600/400"]','Roze Roos','Een klassieker',12,15.50,0.00,15.50,v1,vk2),
    ('["https://picsum.photos/seed/sunflower/600/400"]','Zonnebloem','Grote vrolijke bloem',5,7.25,0.00,7.25,v2,vk1),
    ('["https://picsum.photos/seed/tulip/600/400"]','Tulpmix','Mix van tulpen',30,5.00,0.00,5.00,v2,vk3),
    ('["https://picsum.photos/seed/lily/600/400"]','Witte Lelie','Frisse witte lelie',8,12.00,0.00,12.00,v3,vk2),
    ('["https://picsum.photos/seed/daffodil/600/400"]','Narcis','Lente speciaal',20,3.50,0.00,3.50,v3,vk3);

  -- Insert sample aankopen
  INSERT INTO "Aankoop" ("AanKoopHoeveelheid","GebruikerId","IsBetaald","Prijs","ProductId") VALUES
    (2, gid1, true, 20.00, 1),
    (1, gid2, false, 15.50, 2);

END
$$;
