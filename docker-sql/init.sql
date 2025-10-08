-- =============================================
-- Database: Veiling Systeem
-- =============================================

CREATE DATABASE IF NOT EXISTS veiling_systeem;
USE veiling_systeem;

-- =============================================
-- Tabel: gebruiker
-- =============================================
CREATE TABLE IF NOT EXISTS gebruiker (
    gebruiker_id INT AUTO_INCREMENT PRIMARY KEY,
    naam VARCHAR(100) NOT NULL,
    emailadres VARCHAR(150) UNIQUE NOT NULL,
    straat VARCHAR(100),
    huisnummer VARCHAR(10),
    postcode VARCHAR(10),
    woonplaats VARCHAR(100)
);

-- =============================================
-- Tabel: verkoper
-- =============================================
CREATE TABLE IF NOT EXISTS verkoper (
    verkoper_id INT AUTO_INCREMENT PRIMARY KEY,
    kvk_nummer VARCHAR(50),
    bedrijfsgegevens TEXT,
    adresgegevens TEXT,
    financiele_gegevens TEXT
);

-- =============================================
-- Tabel: product_gegevens
-- =============================================
CREATE TABLE IF NOT EXISTS product_gegevens (
    product_id INT AUTO_INCREMENT PRIMARY KEY,
    fotos TEXT,
    overige_productinformatie TEXT
);

-- =============================================
-- Tabel: veiling
-- =============================================
CREATE TABLE IF NOT EXISTS veiling (
    veiling_id INT AUTO_INCREMENT PRIMARY KEY,
    gebruiker_id INT NOT NULL,
    verkoper_id INT NOT NULL,
    product_id INT NOT NULL,
    product VARCHAR(255),
    begintijd DATETIME,
    eindtijd DATETIME,
    FOREIGN KEY (gebruiker_id) REFERENCES gebruiker(gebruiker_id),
    FOREIGN KEY (verkoper_id) REFERENCES verkoper(verkoper_id),
    FOREIGN KEY (product_id) REFERENCES product_gegevens(product_id)
);

-- =============================================
-- Tabel: veiling_meester
-- =============================================
CREATE TABLE IF NOT EXISTS veiling_meester (
    meester_id INT AUTO_INCREMENT PRIMARY KEY,
    gebruiker_id INT NOT NULL,
    FOREIGN KEY (gebruiker_id) REFERENCES gebruiker(gebruiker_id)
);

-- =============================================
-- VOORBEELDDATA
-- =============================================

-- Gebruikers
INSERT INTO gebruiker (naam, emailadres, straat, huisnummer, postcode, woonplaats)
VALUES 
('Jan de Boer', 'jan.deboer@example.com', 'Lindelaan', '12', '1234AB', 'Amsterdam'),
('Lisa van Dijk', 'lisa.vandijk@example.com', 'Kerkstraat', '45', '2345CD', 'Rotterdam'),
('Tom Jansen', 'tom.jansen@example.com', 'Stationsweg', '78', '3456EF', 'Utrecht');

-- Verkopers
INSERT INTO verkoper (kvk_nummer, bedrijfsgegevens, adresgegevens, financiele_gegevens)
VALUES
('12345678', 'Antiekhandel De Tijd BV', 'Marktstraat 10, Breda', 'NL00BANK0123456789'),
('87654321', 'Tech4U BV', 'Industrieweg 5, Eindhoven', 'NL91BANK0987654321');

-- Productgegevens
INSERT INTO product_gegevens (fotos, overige_productinformatie)
VALUES
('klok1.jpg, klok2.jpg', 'Antieke klok uit 1890, volledig werkend'),
('laptop1.jpg, laptop2.jpg', 'Gaming laptop, 16GB RAM, 1TB SSD'),
('fiets1.jpg', 'Vintage racefiets, goed onderhouden');

-- Veilingen
INSERT INTO veiling (gebruiker_id, verkoper_id, product_id, product, begintijd, eindtijd)
VALUES
(1, 1, 1, 'Antieke klok', '2025-10-08 09:00:00', '2025-10-10 18:00:00'),
(2, 2, 2, 'Gaming laptop', '2025-10-08 10:00:00', '2025-10-09 22:00:00'),
(3, 1, 3, 'Vintage racefiets', '2025-10-08 12:00:00', '2025-10-11 20:00:00');

-- Veilingmeesters
INSERT INTO veiling_meester (gebruiker_id)
VALUES
(1),
(2);

-- =============================================
-- KLAAR
-- =============================================
