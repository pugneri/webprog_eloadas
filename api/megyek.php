<?php
require_once "config.php";

try {
    $stmt = $dbh->query("SELECT m.megyekod, m.megyenev, m.regiokod, r.regionev FROM megyek m LEFT JOIN regiok r ON m.regiokod = r.regiokod ORDER BY m.megyenev");
    $data = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        "success" => true,
        "data" => $data
    ]);
} catch (PDOException $e) {
    echo json_encode([
        "success" => false,
        "message" => "Adatbázis hiba: " . $e->getMessage()
    ]);
}
?>
