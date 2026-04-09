CREATE DATABASE IF NOT EXISTS webprog_foglalkoztatas
CHARACTER SET utf8mb4
COLLATE utf8mb4_hungarian_ci;

USE webprog_foglalkoztatas;

DROP TABLE IF EXISTS foglalkozasok;
DROP TABLE IF EXISTS lakosok;
DROP TABLE IF EXISTS megyek;
DROP TABLE IF EXISTS regiok;

CREATE TABLE regiok (
    regiokod INT NOT NULL,
    regionev VARCHAR(100) NOT NULL,
    PRIMARY KEY (regiokod)
);

CREATE TABLE megyek (
    megyekod INT NOT NULL,
    regiokod INT NOT NULL,
    megyenev VARCHAR(100) NOT NULL,
    PRIMARY KEY (megyekod),
    CONSTRAINT fk_megyek_regiok FOREIGN KEY (regiokod) REFERENCES regiok(regiokod)
        ON UPDATE CASCADE ON DELETE RESTRICT
);

CREATE TABLE lakosok (
    megyekod INT NOT NULL,
    lakosszam INT NOT NULL,
    PRIMARY KEY (megyekod),
    CONSTRAINT fk_lakosok_megyek FOREIGN KEY (megyekod) REFERENCES megyek(megyekod)
        ON UPDATE CASCADE ON DELETE CASCADE
);

CREATE TABLE foglalkozasok (
    fkod INT NOT NULL AUTO_INCREMENT,
    megyekod INT NOT NULL,
    mezogazdasag INT NOT NULL,
    ipar INT NOT NULL,
    szolgaltatas INT NOT NULL,
    PRIMARY KEY (fkod),
    UNIQUE KEY uq_foglalkozasok_megyekod (megyekod),
    CONSTRAINT fk_foglalkozasok_megyek FOREIGN KEY (megyekod) REFERENCES megyek(megyekod)
        ON UPDATE CASCADE ON DELETE CASCADE
);
