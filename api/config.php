<?php
header("Content-Type: application/json; charset=UTF-8");

$host = "localhost";
$dbname = "webprog_foglalkoztatas";
$username = "root";
$password = "";

try {
    $dbh = new PDO(
        "mysql:host=$host;dbname=$dbname;charset=utf8mb4",
        $username,
        $password,
        array(PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION)
    );
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => "Adatbázis kapcsolódási hiba: " . $e->getMessage()
    ]);
    exit;
}
?>
