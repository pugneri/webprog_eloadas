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
        $stmt = $dbh->query("SELECT l.megyekod, l.lakosszam, m.megyenev FROM lakosok l LEFT JOIN megyek m ON l.megyekod = m.megyekod ORDER BY l.megyekod");
        $data = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode(["success" => true, "data" => $data]);
        exit;
    }

    $data = requestData($method);
    $action = $data['action'] ?? null;
    if ($method === 'POST' && $action === 'update') {
        $method = 'PUT';
    } elseif ($method === 'POST' && $action === 'delete') {
        $method = 'DELETE';
    }

    if ($method === "POST") {
        if (!isset($data["megyekod"], $data["lakosszam"])) {
            echo json_encode(["success" => false, "message" => "Hiányzó adatok."]);
            exit;
        }

        $checkStmt = $dbh->prepare("SELECT COUNT(*) FROM lakosok WHERE megyekod = ?");
        $checkStmt->execute([(int)$data["megyekod"]]);
        if ($checkStmt->fetchColumn() > 0) {
            echo json_encode(["success" => false, "message" => "Ehhez a megyekódhoz már tartozik rekord."]);
            exit;
        }

        $countyCheckStmt = $dbh->prepare("SELECT COUNT(*) FROM megyek WHERE megyekod = ?");
        $countyCheckStmt->execute([(int)$data["megyekod"]]);
        if ($countyCheckStmt->fetchColumn() == 0) {
            echo json_encode(["success" => false, "message" => "A megadott megyekód nem létezik a megyek táblában."]);
            exit;
        }

        $stmt = $dbh->prepare("INSERT INTO lakosok (megyekod, lakosszam) VALUES (?, ?)");
        $stmt->execute([(int)$data["megyekod"], (int)$data["lakosszam"]]);

        echo json_encode(["success" => true, "message" => "Az új lakossági rekord sikeresen hozzáadva."]);
        exit;
    }

    if ($method === "PUT") {
        if (!isset($data["originalMegyekod"], $data["megyekod"], $data["lakosszam"])) {
            echo json_encode(["success" => false, "message" => "Hiányzó adatok a módosításhoz."]);
            exit;
        }

        if ((int)$data["originalMegyekod"] !== (int)$data["megyekod"]) {
            $checkStmt = $dbh->prepare("SELECT COUNT(*) FROM lakosok WHERE megyekod = ?");
            $checkStmt->execute([(int)$data["megyekod"]]);
            if ($checkStmt->fetchColumn() > 0) {
                echo json_encode(["success" => false, "message" => "A megadott új megyekód már szerepel a lakosok táblában."]);
                exit;
            }

            $countyCheckStmt = $dbh->prepare("SELECT COUNT(*) FROM megyek WHERE megyekod = ?");
            $countyCheckStmt->execute([(int)$data["megyekod"]]);
            if ($countyCheckStmt->fetchColumn() == 0) {
                echo json_encode(["success" => false, "message" => "A megadott új megyekód nem létezik a megyek táblában."]);
                exit;
            }
        }

        $stmt = $dbh->prepare("UPDATE lakosok SET megyekod = ?, lakosszam = ? WHERE megyekod = ?");
        $stmt->execute([(int)$data["megyekod"], (int)$data["lakosszam"], (int)$data["originalMegyekod"]]);

        echo json_encode(["success" => true, "message" => "A lakossági rekord sikeresen módosítva lett."]);
        exit;
    }

    if ($method === "DELETE") {
        if (!isset($data["megyekod"])) {
            echo json_encode(["success" => false, "message" => "Hiányzó megyekód a törléshez."]);
            exit;
        }

        $stmt = $dbh->prepare("DELETE FROM lakosok WHERE megyekod = ?");
        $stmt->execute([(int)$data["megyekod"]]);
        echo json_encode(["success" => true, "message" => "A rekord sikeresen törölve lett."]);
        exit;
    }

    echo json_encode(["success" => false, "message" => "Nem támogatott HTTP metódus."]);
} catch (PDOException $e) {
    echo json_encode(["success" => false, "message" => "Adatbázis hiba: " . $e->getMessage()]);
}
?>
