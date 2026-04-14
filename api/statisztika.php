<?php
require_once "config.php";

try {
    $stmt = $dbh->query("
        SELECT 
            m.megyekod,
            m.megyenev,
            m.regiokod,
            r.regionev,
            COALESCE(l.lakosszam, 0) AS lakosszam,
            COALESCE(f.fkod, 0) AS fkod,
            COALESCE(f.mezogazdasag, 0) AS mezogazdasag,
            COALESCE(f.ipar, 0) AS ipar,
            COALESCE(f.szolgaltatas, 0) AS szolgaltatas
        FROM megyek m
        LEFT JOIN regiok r ON m.regiokod = r.regiokod
        LEFT JOIN lakosok l ON l.megyekod = m.megyekod
        LEFT JOIN foglalkozasok f ON f.megyekod = m.megyekod
        ORDER BY m.megyenev
    ");

    echo json_encode([
        "success" => true,
        "data" => $stmt->fetchAll(PDO::FETCH_ASSOC)
    ]);
} catch (PDOException $e) {
    echo json_encode([
        "success" => false,
        "message" => "Adatbázis hiba: " . $e->getMessage()
    ]);
}
?>
