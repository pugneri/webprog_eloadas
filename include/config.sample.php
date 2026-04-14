<?php
declare(strict_types=1);

$db_host = "localhost";
$db_name = "webprog_foglalkoztatas";
$db_user = "root";
$db_pass = "";

try {
    $dbh = new PDO(
        "mysql:host={$db_host};dbname={$db_name};charset=utf8mb4",
        $db_user,
        $db_pass,
        [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
        ]
    );
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => "Adatbázis kapcsolódási hiba: " . $e->getMessage()
    ]);
    exit;
}