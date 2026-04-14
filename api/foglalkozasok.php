<?php
declare(strict_types=1);

header("Content-Type: application/json; charset=UTF-8");
require_once __DIR__ . '/../include/config.inc.php';

$method = $_SERVER["REQUEST_METHOD"];

function getJsonInput() {
    $input = file_get_contents("php://input");
    return json_decode($input, true) ?? [];
}

function requestData(string $method): array {
    if ($method === 'POST' && !empty($_POST)) {
        return $_POST;
    }
    return getJsonInput();
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

    $data = requestData($method);
    $action = $data['action'] ?? null;
    if ($method === 'POST' && $action === 'update') {
        $method = 'PUT';
    } elseif ($method === 'POST' && $action === 'delete') {
        $method = 'DELETE';
    } elseif ($method === 'POST') {
        $method = 'POST';
    }

    if ($method === "POST") {
        if (!isset($data["megyekod"], $data["mezogazdasag"], $data["ipar"], $data["szolgaltatas"])) {
            echo json_encode(["success" => false, "message" => "Hiányzó adatok."]);
            exit;
        }

        $countyCheck = $dbh->prepare("SELECT COUNT(*) FROM megyek WHERE megyekod = ?");
        $countyCheck->execute([(int)$data["megyekod"]]);
        if ($countyCheck->fetchColumn() == 0) {
            echo json_encode(["success" => false, "message" => "A kiválasztott megye nem létezik."]);
            exit;
        }

        $dupCheck = $dbh->prepare("SELECT COUNT(*) FROM foglalkozasok WHERE megyekod = ?");
        $dupCheck->execute([(int)$data["megyekod"]]);
        if ($dupCheck->fetchColumn() > 0) {
            echo json_encode(["success" => false, "message" => "Ehhez a megyéhez már tartozik foglalkoztatási rekord."]);
            exit;
        }

        $stmt = $dbh->prepare("INSERT INTO foglalkozasok (megyekod, mezogazdasag, ipar, szolgaltatas) VALUES (?, ?, ?, ?)");
        $stmt->execute([
            (int)$data["megyekod"],
            (int)$data["mezogazdasag"],
            (int)$data["ipar"],
            (int)$data["szolgaltatas"]
        ]);

        echo json_encode(["success" => true, "message" => "Az új foglalkoztatási rekord sikeresen hozzáadva."]);
        exit;
    }

    if ($method === "PUT") {
        if (!isset($data["fkod"], $data["megyekod"], $data["mezogazdasag"], $data["ipar"], $data["szolgaltatas"])) {
            echo json_encode(["success" => false, "message" => "Hiányzó adatok a módosításhoz."]);
            exit;
        }

        $countyCheck = $dbh->prepare("SELECT COUNT(*) FROM megyek WHERE megyekod = ?");
        $countyCheck->execute([(int)$data["megyekod"]]);
        if ($countyCheck->fetchColumn() == 0) {
            echo json_encode(["success" => false, "message" => "A kiválasztott megye nem létezik."]);
            exit;
        }

        $dupCheck = $dbh->prepare("SELECT COUNT(*) FROM foglalkozasok WHERE megyekod = ? AND fkod <> ?");
        $dupCheck->execute([(int)$data["megyekod"], (int)$data["fkod"]]);
        if ($dupCheck->fetchColumn() > 0) {
            echo json_encode(["success" => false, "message" => "Ehhez a megyéhez már másik foglalkoztatási rekord tartozik."]);
            exit;
        }

        $stmt = $dbh->prepare("UPDATE foglalkozasok SET megyekod = ?, mezogazdasag = ?, ipar = ?, szolgaltatas = ? WHERE fkod = ?");
        $stmt->execute([
            (int)$data["megyekod"],
            (int)$data["mezogazdasag"],
            (int)$data["ipar"],
            (int)$data["szolgaltatas"],
            (int)$data["fkod"]
        ]);

        echo json_encode(["success" => true, "message" => "A rekord sikeresen módosítva lett."]);
        exit;
    }

    if ($method === "DELETE") {
        if (!isset($data["fkod"])) {
            echo json_encode(["success" => false, "message" => "Hiányzó azonosító a törléshez."]);
            exit;
        }

        $stmt = $dbh->prepare("DELETE FROM foglalkozasok WHERE fkod = ?");
        $stmt->execute([(int)$data["fkod"]]);
        echo json_encode(["success" => true, "message" => "A rekord sikeresen törölve lett."]);
        exit;
    }

    echo json_encode(["success" => false, "message" => "Nem támogatott HTTP metódus."]);
} catch (PDOException $e) {
    echo json_encode(["success" => false, "message" => "Adatbázis hiba: " . $e->getMessage()]);
}
?>
