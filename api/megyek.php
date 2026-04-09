<?php
declare(strict_types=1);

header("Content-Type: application/json; charset=UTF-8");
require_once __DIR__ . '/../include/config.inc.php';

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
