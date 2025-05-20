<?php
header('Content-Type: application/json');
ini_set('display_errors', 1);
error_reporting(E_ALL);

require 'conexion.php'; // Aquí se define $pdo

// Leer el cuerpo de la solicitud JSON crudo
$inputJSON = file_get_contents('php://input');
$input = json_decode($inputJSON, true);

// Verificar si el ID existe en el JSON recibido
if (!isset($input['id'])) {
    echo json_encode(['success' => false, 'message' => 'ID no proporcionado']);
    exit;
}

$id = intval($input['id']);

try {
    $stmt = $pdo->prepare("DELETE FROM registro WHERE ID = ?");
    $stmt->execute([$id]);

    echo json_encode(['success' => true]);
} catch (PDOException $e) {
    echo json_encode(['success' => false, 'message' => 'Error al eliminar usuario: ' . $e->getMessage()]);
}
