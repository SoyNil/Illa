<?php
header('Content-Type: application/json');
require_once 'conexion.php';

try {
    // Consulta para obtener usuarios con Ocupacion 0 o 1
    $sql = "SELECT ID, Nombre FROM registro";
    $stmt = $pdo->prepare($sql);
    $stmt->execute();

    $usuarios = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode($usuarios);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Error en la consulta: ' . $e->getMessage()
    ]);
} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Excepción: ' . $e->getMessage()
    ]);
}
?>
