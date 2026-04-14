<?php
require_once "config.php";

$method = $_SERVER["REQUEST_METHOD"];

function getJsonInput() {
    $input = file_get_contents("php://input");
    return json_decode($input, true);
}

try {
    if ($method === "GET") {
        $stmt = $dbh->query("SELECT l.megyekod, l.lakosszam, m.megyenev FROM lakosok l LEFT JOIN megyek m ON l.megyekod = m.megyekod ORDER BY l.megyekod");
        $data = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode(["success" => true, "data" => $data]);
        exit;
    }

    if ($method === "POST") {
        $data = getJsonInput();
        if (!isset($data["megyekod"], $data["lakosszam"])) {
            echo json_encode(["success" => false, "message" => "Hiányzó adatok."]);
            exit;
        }

        $checkStmt = $dbh->prepare("SELECT COUNT(*) FROM lakosok WHERE megyekod = ?");
        $checkStmt->execute([$data["megyekod"]]);
        if ($checkStmt->fetchColumn() > 0) {
            echo json_encode(["success" => false, "message" => "Ehhez a megyekódhoz már tartozik rekord."]);
            exit;
        }

        $countyCheckStmt = $dbh->prepare("SELECT COUNT(*) FROM megyek WHERE megyekod = ?");
        $countyCheckStmt->execute([$data["megyekod"]]);
        if ($countyCheckStmt->fetchColumn() == 0) {
            echo json_encode(["success" => false, "message" => "A megadott megyekód nem létezik a megyek táblában."]);
            exit;
        }

        $stmt = $dbh->prepare("INSERT INTO lakosok (megyekod, lakosszam) VALUES (?, ?)");
        $stmt->execute([$data["megyekod"], $data["lakosszam"]]);

        echo json_encode(["success" => true, "message" => "Az új lakossági rekord sikeresen hozzáadva."]);
        exit;
    }

    if ($method === "PUT") {
        $data = getJsonInput();
        if (!isset($data["originalMegyekod"], $data["megyekod"], $data["lakosszam"])) {
            echo json_encode(["success" => false, "message" => "Hiányzó adatok a módosításhoz."]);
            exit;
        }

        if ((int)$data["originalMegyekod"] !== (int)$data["megyekod"]) {
            $checkStmt = $dbh->prepare("SELECT COUNT(*) FROM lakosok WHERE megyekod = ?");
            $checkStmt->execute([$data["megyekod"]]);
            if ($checkStmt->fetchColumn() > 0) {
                echo json_encode(["success" => false, "message" => "A megadott új megyekód már szerepel a lakosok táblában."]);
                exit;
            }

            $countyCheckStmt = $dbh->prepare("SELECT COUNT(*) FROM megyek WHERE megyekod = ?");
            $countyCheckStmt->execute([$data["megyekod"]]);
            if ($countyCheckStmt->fetchColumn() == 0) {
                echo json_encode(["success" => false, "message" => "A megadott új megyekód nem létezik a megyek táblában."]);
                exit;
            }
        }

        $stmt = $dbh->prepare("UPDATE lakosok SET megyekod = ?, lakosszam = ? WHERE megyekod = ?");
        $stmt->execute([$data["megyekod"], $data["lakosszam"], $data["originalMegyekod"]]);

        echo json_encode(["success" => true, "message" => "A lakossági rekord sikeresen módosítva lett."]);
        exit;
    }

    if ($method === "DELETE") {
        $data = getJsonInput();
        if (!isset($data["megyekod"])) {
            echo json_encode(["success" => false, "message" => "Hiányzó megyekód a törléshez."]);
            exit;
        }

        $stmt = $dbh->prepare("DELETE FROM lakosok WHERE megyekod = ?");
        $stmt->execute([$data["megyekod"]]);
        echo json_encode(["success" => true, "message" => "A rekord sikeresen törölve lett."]);
        exit;
    }

    echo json_encode(["success" => false, "message" => "Nem támogatott HTTP metódus."]);
} catch (PDOException $e) {
    echo json_encode(["success" => false, "message" => "Adatbázis hiba: " . $e->getMessage()]);
}
?>
