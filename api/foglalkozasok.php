<?php
require_once "config.php";

$method = $_SERVER["REQUEST_METHOD"];

function getJsonInput() {
    $input = file_get_contents("php://input");
    return json_decode($input, true) ?? [];
}

try {
    if ($method === "GET") {
        $stmt = $dbh->query("
            SELECT 
                f.fkod,
                f.megyekod,
                m.megyenev,
                f.mezogazdasag,
                f.ipar,
                f.szolgaltatas
            FROM foglalkozasok f
            INNER JOIN megyek m ON m.megyekod = f.megyekod
            ORDER BY m.megyenev
        ");

        echo json_encode([
            "success" => true,
            "data" => $stmt->fetchAll(PDO::FETCH_ASSOC)
        ]);
        exit;
    }

    if ($method === "POST") {
        $data = getJsonInput();

        if (!isset($data["megyekod"], $data["mezogazdasag"], $data["ipar"], $data["szolgaltatas"])) {
            echo json_encode(["success" => false, "message" => "Hiányzó adatok."]);
            exit;
        }

        $countyCheck = $dbh->prepare("SELECT COUNT(*) FROM megyek WHERE megyekod = ?");
        $countyCheck->execute([$data["megyekod"]]);
        if ($countyCheck->fetchColumn() == 0) {
            echo json_encode(["success" => false, "message" => "A kiválasztott megye nem létezik."]);
            exit;
        }

        $dupCheck = $dbh->prepare("SELECT COUNT(*) FROM foglalkozasok WHERE megyekod = ?");
        $dupCheck->execute([$data["megyekod"]]);
        if ($dupCheck->fetchColumn() > 0) {
            echo json_encode(["success" => false, "message" => "Ehhez a megyéhez már tartozik foglalkoztatási rekord."]);
            exit;
        }

        $stmt = $dbh->prepare("INSERT INTO foglalkozasok (megyekod, mezogazdasag, ipar, szolgaltatas) VALUES (?, ?, ?, ?)");
        $stmt->execute([
            $data["megyekod"],
            $data["mezogazdasag"],
            $data["ipar"],
            $data["szolgaltatas"]
        ]);

        echo json_encode(["success" => true, "message" => "Az új foglalkoztatási rekord sikeresen hozzáadva."]);
        exit;
    }

    if ($method === "PUT") {
        $data = getJsonInput();

        if (!isset($data["fkod"], $data["megyekod"], $data["mezogazdasag"], $data["ipar"], $data["szolgaltatas"])) {
            echo json_encode(["success" => false, "message" => "Hiányzó adatok a módosításhoz."]);
            exit;
        }

        $countyCheck = $dbh->prepare("SELECT COUNT(*) FROM megyek WHERE megyekod = ?");
        $countyCheck->execute([$data["megyekod"]]);
        if ($countyCheck->fetchColumn() == 0) {
            echo json_encode(["success" => false, "message" => "A kiválasztott megye nem létezik."]);
            exit;
        }

        $dupCheck = $dbh->prepare("SELECT COUNT(*) FROM foglalkozasok WHERE megyekod = ? AND fkod <> ?");
        $dupCheck->execute([$data["megyekod"], $data["fkod"]]);
        if ($dupCheck->fetchColumn() > 0) {
            echo json_encode(["success" => false, "message" => "Ehhez a megyéhez már másik foglalkoztatási rekord tartozik."]);
            exit;
        }

        $stmt = $dbh->prepare("UPDATE foglalkozasok SET megyekod = ?, mezogazdasag = ?, ipar = ?, szolgaltatas = ? WHERE fkod = ?");
        $stmt->execute([
            $data["megyekod"],
            $data["mezogazdasag"],
            $data["ipar"],
            $data["szolgaltatas"],
            $data["fkod"]
        ]);

        echo json_encode(["success" => true, "message" => "A rekord sikeresen módosítva lett."]);
        exit;
    }

    if ($method === "DELETE") {
        $data = getJsonInput();
        if (!isset($data["fkod"])) {
            echo json_encode(["success" => false, "message" => "Hiányzó azonosító a törléshez."]);
            exit;
        }

        $stmt = $dbh->prepare("DELETE FROM foglalkozasok WHERE fkod = ?");
        $stmt->execute([$data["fkod"]]);
        echo json_encode(["success" => true, "message" => "A rekord sikeresen törölve lett."]);
        exit;
    }

    echo json_encode(["success" => false, "message" => "Nem támogatott HTTP metódus."]);
} catch (PDOException $e) {
    echo json_encode(["success" => false, "message" => "Adatbázis hiba: " . $e->getMessage()]);
}
?>
