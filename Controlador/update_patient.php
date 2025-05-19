<?php
session_start();
require_once 'conexion.php';

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['success' => false, 'message' => 'Método no permitido']);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);
$patientId = $input['id'] ?? 0;
$field = $input['field'] ?? '';
$value = $input['value'] ?? 0;

if (!in_array($field, ['Atendido', 'Historial_Clinico']) || !is_numeric($patientId)) {
    echo json_encode(['success' => false, 'message' => 'Datos inválidos']);
    exit;
}

try {
    $stmt = $pdo->prepare("UPDATE pacientes SET $field = ? WHERE ID = ?");
    $stmt->execute([$value, $patientId]);
    echo json_encode(['success' => true]);
} catch (PDOException $e) {
    echo json_encode(['success' => false, 'message' => 'Error: ' . $e->getMessage()]);
}
?>